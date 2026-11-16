import { useMemo, useState } from 'react';
import { useData } from '../data.jsx';
import { periods, buildQuarter, buildFinance, STATUS, MOU, dueDate, EVIDENCE, emptyReport } from '../lib/quarter.js';
import { num, baht, fmtDate, today } from '../lib/format.js';
import { Kpi, PageHead, Card, FormModal, useDemo } from '../components/ui.jsx';
import Chart, { Donut, Ring, CompareBars } from '../components/Chart.jsx';

const PRESETS = [
  ['day', '1 วัน'], ['month', '1 เดือน'], ['half', '6 เดือน'], ['year', '1 ปี'],
  ['all', 'ทั้งหมด'], ['quarter', 'งวด 3 เดือน'], ['custom', 'เลือกเอง'],
];
const iso = (d) => d.toISOString().slice(0, 10);
const shift = (end, months) => {
  const [y, m, d] = end.split('-').map(Number);
  const x = new Date(Date.UTC(y, m - 1 - months, d + 1));
  return iso(x);
};
const rangeText = (r) => (r.start === r.end ? fmtDate(r.start) : `${fmtDate(r.start)} – ${fmtDate(r.end)}`);
const daysTo = (d) => Math.round((new Date(d + 'T00:00:00') - new Date(today() + 'T00:00:00')) / 86400000);

export default function Report() {
  const { db, saveReport } = useData();
  const demo = useDemo();
  const plist = useMemo(() => periods(), []);
  const [mode, setMode] = useState('quarter');
  const [qNo, setQNo] = useState(1);
  const latest = [...db.hiveRounds, ...db.visits, ...db.seedBatches, ...db.seedSales, ...db.goatEvents, ...db.stockMoves, ...db.ledger].reduce((m, r) => (r.date > m ? r.date : m), today());
  const anchor = latest > today() ? latest : today();
  const [custom, setCustom] = useState({ start: MOU.start, end: anchor });
  const [edit, setEdit] = useState(null); // {kind:'head'} | {kind:'unit', key}

  const period = plist.find((p) => p.no === qNo);
  const range = {
    day: { start: anchor, end: anchor },
    month: { start: shift(anchor, 1), end: anchor },
    half: { start: shift(anchor, 6), end: anchor },
    year: { start: shift(anchor, 12), end: anchor },
    all: { start: MOU.start, end: anchor },
    quarter: period,
    custom,
  }[mode];
  const isQ = mode === 'quarter';
  const stored = isQ ? db.reports.find((r) => r.no === qNo) : null;
  const R = stored || emptyReport(qNo);
  const built = useMemo(() => buildQuarter(db, range, isQ ? R : null), [db, range.start, range.end, isQ, R]);
  const fin = useMemo(() => buildFinance(db, range, built), [db, range.start, range.end, built]);
  const due = isQ ? dueDate(period) : null;
  const left = due ? daysTo(due) : null;
  const scores = built.units.filter((u) => u.score !== null);
  const avgScore = scores.length ? scores.reduce((s, u) => s + u.score, 0) / scores.length : null;

  /* ---- edit forms ---- */
  const unitFields = (u) => [
    { key: 'status', label: 'สถานะงาน', type: 'select', options: Object.entries(STATUS).map(([value, label]) => ({ value, label })), default: 'onplan' },
    ...(['hive', 'goat'].includes(u.key) ? [{ key: 'farmers', label: 'ผู้เลี้ยงที่ดำเนินกิจกรรม — ผลจริง (ราย)', type: 'number', min: 0 }] : []),
    ...u.rows.map((r) => ({ key: `t_${r.key}`, label: `เป้าหมาย: ${r.label} (${r.unit})`, type: 'number' })),
    { key: 'activities', label: 'กิจกรรมที่ดำเนินการ ผลสำเร็จ และความแตกต่างจากแผน', type: 'textarea' },
    { key: 'problems', label: 'ปัญหา อุปสรรค ความเสี่ยง และแนวทางแก้ไข', type: 'textarea' },
    { key: 'next', label: 'กิจกรรมและเป้าหมายสำหรับงวด 3 เดือนถัดไป', type: 'textarea' },
  ];
  const unitInitial = (u) => {
    const d = R.units?.[u.key] || {};
    const o = { status: d.status || 'onplan', farmers: d.farmers ?? 0, activities: d.activities || '', problems: d.problems || '', next: d.next || '' };
    u.rows.forEach((r) => { o[`t_${r.key}`] = d.targets?.[r.key] ?? ''; });
    return o;
  };
  const saveUnit = (u) => async (v) => {
    const targets = {};
    u.rows.forEach((r) => { if (v[`t_${r.key}`] !== undefined) targets[r.key] = v[`t_${r.key}`]; });
    await saveReport(qNo, { ...R, units: { ...R.units, [u.key]: { status: v.status, farmers: v.farmers, activities: v.activities, problems: v.problems, next: v.next, targets } } });
  };
  const headFields = [
    { key: 'preparer', label: 'ผู้จัดทำรายงาน' }, { key: 'position', label: 'ตำแหน่ง' },
    { key: 'reviewer', label: 'ผู้ตรวจทาน' }, { key: 'reportDate', label: 'วันที่จัดทำรายงาน', type: 'date' },
    { key: 'summary', label: '1.1 ผลสำเร็จสำคัญของวิสาหกิจในงวดนี้', type: 'textarea' },
    { key: 'members', label: '1.2 จำนวนสมาชิก/เกษตรกรที่มีส่วนร่วมและได้รับประโยชน์ (ระบุวิธีนับ)', type: 'textarea' },
    { key: 'meeting', label: 'ผลการประชุมและมติสำคัญของคณะกรรมการ (ถ้ามี)', type: 'textarea' },
    { key: 'consult', label: '8 ประเด็นที่ต้องการคำปรึกษาหรือการสนับสนุนจาก RECOFTC', type: 'textarea' },
  ];

  const toggleEv = (k) => saveReport(qNo, { ...R, evidence: { ...(R.evidence || {}), [k]: !(R.evidence || {})[k] } });
  const evDone = EVIDENCE.filter(([k]) => R.evidence?.[k]).length;

  return (
    <>
      <PageHead icon="📑" title="รายงานผลการดำเนินงาน" desc={`${MOU.org} · ${MOU.project} · MOU ${MOU.partner} ${fmtDate(MOU.start)} – ${fmtDate(MOU.end)}`}>
        <button className="btn" onClick={() => demo('พิมพ์รายงาน')}>🖨 พิมพ์</button>
        <button className="btn primary" onClick={() => demo('ส่งออกรายงานตามแบบฟอร์ม RECOFTC (Word / PDF / Excel)')}>⬇ ส่งออก</button>
      </PageHead>

      {/* range picker */}
      <div className="range-bar">
        <div className="chips" role="tablist" aria-label="ช่วงเวลารายงาน">
          {PRESETS.map(([k, l]) => <button key={k} className={`chip ${mode === k ? 'on' : ''}`} onClick={() => setMode(k)}>{l}</button>)}
        </div>
        {mode === 'quarter' && (
          <select className="range-select" value={qNo} onChange={(e) => setQNo(Number(e.target.value))}>
            {plist.map((p) => <option key={p.no} value={p.no}>{p.no === 13 ? 'ปิดโครงการ' : `งวดที่ ${p.no}`} · {fmtDate(p.start)} – {fmtDate(p.end)}</option>)}
          </select>
        )}
        {mode === 'custom' && (
          <div className="range-custom">
            <label>จาก <input type="date" value={custom.start} max={custom.end} onChange={(e) => e.target.value && setCustom({ ...custom, start: e.target.value })} /></label>
            <label>ถึง <input type="date" value={custom.end} min={custom.start} onChange={(e) => e.target.value && setCustom({ ...custom, end: e.target.value })} /></label>
          </div>
        )}
        <div className="range-note">📅 ช่วงที่แสดง: <b>{rangeText(range)}</b>{!isQ && <span className="muted"> · ผลสะสมนับตั้งแต่เริ่ม MOU ({fmtDate(MOU.start)})</span>}</div>
      </div>

      {/* quarter header */}
      {isQ && (
        <Card className="q-head">
          <div className="q-grid">
            <div><small>งวดรายงาน</small><b>{qNo === 13 ? 'รายงานปิดโครงการ' : `งวดที่ ${qNo}`}</b></div>
            <div><small>กำหนดส่ง (เสนอ)</small><b>{fmtDate(due)}</b>
              <span className={`tag ${left < 0 ? 'red' : left <= 14 ? 'amber' : 'green'}`}>{left < 0 ? `เลยกำหนด ${-left} วัน` : left === 0 ? 'ครบกำหนดวันนี้' : `อีก ${left} วัน`}</span></div>
            <div><small>ผู้จัดทำ</small><b>{R.preparer || '—'}</b><span className="muted">{R.position}</span></div>
            <div><small>ผู้ตรวจทาน / วันที่จัดทำ</small><b>{R.reviewer || '—'}</b><span className="muted">{R.reportDate ? fmtDate(R.reportDate) : ''}</span></div>
          </div>
          <button className="btn sm" onClick={() => setEdit({ kind: 'head' })}>✎ แก้ไขข้อมูลรายงาน</button>
        </Card>
      )}

      {/* overview */}
      <div className="kpi-grid">
        <Kpi icon="💰" label="รายรับจากธุรกิจรวม" value={baht(fin.total.revenue)} tone="blue" />
        <Kpi icon="🧾" label="รายจ่ายรวม" value={baht(fin.total.expense)} tone="brown" />
        <Kpi icon={fin.total.net >= 0 ? '📈' : '📉'} label="ผลต่างสุทธิ" value={baht(fin.total.net)} tone={fin.total.net >= 0 ? 'green' : 'brown'} />
        {isQ && <Kpi icon="🎯" label="ความสำเร็จเทียบเป้าเฉลี่ย" value={avgScore === null ? '—' : `${avgScore.toFixed(0)}%`} sub="เฉพาะตัวชี้วัดที่ตั้งเป้าไว้" />}
        {!isQ && <Kpi icon="👥" label="ผู้เข้าร่วมศึกษาดูงาน" value={`${num(built.units[2].rows[1].actual)} คน`} />}
      </div>

      <div className="grid-2">
        <Card title="รายรับแยกตามหน่วยธุรกิจ">
          <Donut items={fin.units.map((u) => ({ label: u.title, value: u.revenue, color: u.color }))} centerValue={num(fin.total.revenue)} centerLabel="บาท" />
        </Card>
        <Card title="รายรับ เทียบ รายจ่าย รายหน่วย">
          <div className="duo">
            {(() => { const top = Math.max(...fin.units.flatMap((u) => [u.revenue, u.expense]), 1); return fin.units.map((u) => (
              <div key={u.key} className="duo-row">
                <span>{u.icon} {u.title}</span>
                <div className="duo-bars">
                  <i className="rev" style={{ width: `${(u.revenue / top) * 100}%` }}><em>{num(u.revenue)}</em></i>
                  <i className="exp" style={{ width: `${(u.expense / top) * 100}%` }}><em>{num(u.expense)}</em></i>
                </div>
              </div>)); })()}
            <div className="duo-key"><span><i className="rev" />รายรับ</span><span><i className="exp" />รายจ่าย</span></div>
          </div>
        </Card>
      </div>

      {/* 1. summary */}
      {isQ && (
        <Card title="1 บทสรุปความก้าวหน้าในรอบ 3 เดือน">
          <div className="status-row">
            {built.units.map((u) => (
              <div key={u.key} className={`status-pill ${u.status}`}><span>{u.icon}</span><b>{u.title}</b><small>{STATUS[u.status]}</small></div>
            ))}
          </div>
          <div className="text-grid">
            <div><h4>ผลสำเร็จสำคัญ</h4><p className="pre">{R.summary || <span className="muted">— ยังไม่ได้กรอก —</span>}</p></div>
            <div><h4>สมาชิก/เกษตรกรที่ได้รับประโยชน์</h4><p className="pre">{R.members || <span className="muted">—</span>}</p></div>
            <div><h4>ผลการประชุมและมติสำคัญ</h4><p className="pre">{R.meeting || <span className="muted">—</span>}</p></div>
            <div><h4>ประเด็นที่ต้องการคำปรึกษาจาก RECOFTC</h4><p className="pre">{R.consult || <span className="muted">—</span>}</p></div>
          </div>
        </Card>
      )}

      {/* per unit */}
      {built.units.map((u, i) => (
        <Card key={u.key} className="unit" title={<span className="unit-title"><span className="unit-ic" style={{ background: `${u.color}22` }}>{u.icon}</span>{i + 2} รายงานหน่วยธุรกิจ {u.title}</span>}
          right={isQ && <button className="btn sm" onClick={() => setEdit({ kind: 'unit', key: u.key })}>✎ แก้ไขเป้าหมาย / ข้อความ</button>}>
          <div className="unit-top">
            {isQ && <div className={`status-pill ${u.status}`}><b>{STATUS[u.status]}</b></div>}
            {isQ && u.score !== null && <div className="score"><Ring value={u.score} color={u.color} /><small>เทียบเป้า</small></div>}
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>ตัวชี้วัด</th>{isQ && <th className="right">เป้าหมาย</th>}<th className="right">ผลจริง</th>{isQ && <th className="right">%</th>}<th className="right">สะสมตั้งแต่เริ่ม MOU</th></tr></thead>
              <tbody>
                {u.rows.map((r) => (
                  <tr key={r.key}>
                    <td>{r.label} <small className="muted">({r.unit})</small></td>
                    {isQ && <td className="right">{r.target === undefined || r.target === '' ? '—' : num(r.target)}</td>}
                    <td className="right"><b>{num(r.actual)}</b></td>
                    {isQ && <td className="right">{r.pct === null ? '—' : <span className={`tag ${r.pct >= 100 ? 'green' : r.pct >= 50 ? 'amber' : 'red'}`}>{r.pct.toFixed(0)}%</span>}</td>}
                    <td className="right">{num(r.cum)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {isQ && u.rows.some((r) => r.target > 0) && (
            <div className="cmp-wrap"><h4>เป้าหมาย เทียบ ผลจริง</h4>
              <CompareBars color={u.color} rows={u.rows.filter((r) => r.target > 0 || r.actual > 0).map((r) => ({ label: r.label, unit: r.unit, target: r.target, actual: r.actual }))} />
            </div>
          )}
          {isQ && (
            <div className="text-grid three">
              <div><h4>กิจกรรมที่ดำเนินการ / ผลสำเร็จ</h4><p className="pre">{u.activities || <span className="muted">—</span>}</p></div>
              <div><h4>ปัญหา อุปสรรค และแนวทางแก้ไข</h4><p className="pre">{u.problems || <span className="muted">—</span>}</p></div>
              <div><h4>แผนงวดถัดไป</h4><p className="pre">{u.next || <span className="muted">—</span>}</p></div>
            </div>
          )}
        </Card>
      ))}

      {/* finance */}
      <Card title="รายงานการเงิน">
        <div className="grid-2 fin">
          <div>
            <h4>ตารางที่ 1 สรุปการใช้เงินสนับสนุน</h4>
            <table className="table fin-table"><tbody>
              <tr><td>เงินสนับสนุนที่ได้รับสะสม</td><td className="right"><b>{baht(fin.grant.received)}</b></td></tr>
              <tr><td>หัก ค่าใช้จ่ายจากเงินสนับสนุนสะสมก่อนงวดนี้</td><td className="right">{baht(fin.grant.before)}</td></tr>
              <tr><td>หัก ค่าใช้จ่ายจากเงินสนับสนุนในงวดนี้</td><td className="right">{baht(fin.grant.during)}</td></tr>
              <tr className="sum"><td>เงินสนับสนุนคงเหลือ</td><td className="right"><b>{baht(fin.grant.remaining)}</b></td></tr>
            </tbody></table>
          </div>
          <div>
            <h4>ตารางที่ 2 สรุปผลการเงินรายธุรกิจ</h4>
            <table className="table fin-table">
              <thead><tr><th>หน่วยธุรกิจ</th><th className="right">รายรับ</th><th className="right">รายจ่าย</th><th className="right">สุทธิ</th></tr></thead>
              <tbody>
                {fin.units.map((u) => <tr key={u.key}><td>{u.icon} {u.title}</td><td className="right">{num(u.revenue)}</td><td className="right">{num(u.expense)}</td><td className={`right ${u.net >= 0 ? 'up' : 'down'}`}>{num(u.net)}</td></tr>)}
                {fin.total.general > 0 && <tr><td>🏛️ ส่วนกลาง / อื่นๆ</td><td className="right">0</td><td className="right">{num(fin.total.general)}</td><td className="right down">{num(-fin.total.general)}</td></tr>}
                <tr className="sum"><td>รวม</td><td className="right">{num(fin.total.revenue)}</td><td className="right">{num(fin.total.expense)}</td><td className={`right ${fin.total.net >= 0 ? 'up' : 'down'}`}>{num(fin.total.net)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <p className="muted small">รายรับจากธุรกิจแยกจากเงินสนับสนุนของ RECOFTC (ไม่นับซ้ำ) · รายจ่ายมาจากทะเบียนรายรับ–รายจ่าย + ต้นทุนจัดกิจกรรมศึกษาดูงาน + การซื้อสินค้าเข้า (ซื้อมาขายไป)</p>
      </Card>

      {/* evidence */}
      {isQ && (
        <Card title={`หลักฐานสำหรับการตรวจสอบ (${evDone}/${EVIDENCE.length})`}>
          <p className="muted small">ไม่ต้องแนบใบเสร็จทุกใบพร้อมรายงาน แต่ต้องจัดเก็บและแสดงเมื่อ RECOFTC ร้องขอหรือสุ่มตรวจ (MOU ข้อ 3–4) · ข้อ 5–9 เป็นข้อเสนอเพิ่มเติม</p>
          <div className="ev-grid">
            {EVIDENCE.map(([k, label, why], i) => (
              <label key={k} className={`ev ${R.evidence?.[k] ? 'done' : ''}`}>
                <input type="checkbox" checked={!!R.evidence?.[k]} onChange={() => toggleEv(k)} />
                <span className="ev-box">{R.evidence?.[k] ? '✓' : ''}</span>
                <span><b>{i + 1}. {label}</b><small>{why}</small></span>
              </label>
            ))}
          </div>
        </Card>
      )}

      {edit?.kind === 'head' && (
        <FormModal title="ข้อมูลรายงาน" fields={headFields} initial={R} onClose={() => setEdit(null)}
          onSave={(v) => saveReport(qNo, { ...R, ...v })} />
      )}
      {edit?.kind === 'unit' && (() => { const u = built.units.find((x) => x.key === edit.key); return (
        <FormModal title={`${u.title} · แก้ไขเป้าหมาย / ข้อความ`} fields={unitFields(u)} initial={unitInitial(u)} onClose={() => setEdit(null)} onSave={saveUnit(u)} />); })()}
    </>
  );
}
