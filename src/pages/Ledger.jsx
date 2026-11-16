import { useState } from 'react';
import { useData } from '../data.jsx';
import { UNITS } from '../lib/quarter.js';
import { sum } from '../lib/calc.js';
import { num, baht, fmtDate, today } from '../lib/format.js';
import { Kpi, PageHead, Card, DataTable, FormModal, PhotoStrip, useDemo } from '../components/ui.jsx';
import { Donut } from '../components/Chart.jsx';

const unitOpts = [...UNITS.map((u) => ({ value: u.key, label: `${u.icon} ${u.title}` })), { value: 'general', label: '🏛️ ส่วนกลาง / อื่นๆ' }];
const unitName = (k) => UNITS.find((u) => u.key === k)?.title ?? 'ส่วนกลาง';
const colors = { hive: '#d97706', goat: '#8a5a33', visit: '#16a34a', nursery: '#0d9488', resale: '#2563eb', general: '#94a3b8' };

export default function Ledger() {
  const { db, create, update, remove } = useData();
  const demo = useDemo();
  const [form, setForm] = useState(null);
  const rows = [...db.ledger].sort((a, b) => (a.date < b.date ? 1 : -1));
  const received = sum(rows.filter((r) => r.type === 'grant'), (r) => r.amount);
  const spent = sum(rows.filter((r) => r.type === 'expense' && r.fromGrant), (r) => r.amount);
  const expense = sum(rows.filter((r) => r.type === 'expense'), (r) => r.amount);
  const save = (d) => (form.id ? update('ledger', form.id, d) : create('ledger', d));

  const fields = [
    { key: 'date', label: 'วันที่', type: 'date', required: true, default: today() },
    { key: 'type', label: 'ประเภท', type: 'select', required: true, default: 'expense', options: [{ value: 'expense', label: 'รายจ่าย' }, { value: 'grant', label: 'รับเงินสนับสนุน (RECOFTC)' }] },
    { key: 'unit', label: 'หน่วยธุรกิจ', type: 'select', required: true, default: 'general', options: unitOpts },
    { key: 'amount', label: 'จำนวนเงิน (บาท)', type: 'number', min: 0, required: true },
    { key: 'fromGrant', label: 'จ่ายจากเงินสนับสนุนหรือไม่', type: 'select', default: 'no', options: [{ value: 'yes', label: 'ใช่ — จ่ายจากเงินสนับสนุน' }, { value: 'no', label: 'ไม่ใช่ — จ่ายจากรายได้ธุรกิจ' }] },
    { key: 'desc', label: 'รายละเอียด', type: 'textarea' },
    { key: 'photos', label: 'หลักฐาน (ใบเสร็จ / สลิป)', type: 'photos' },
  ];
  const toForm = (r) => ({ ...r, fromGrant: r.fromGrant ? 'yes' : 'no' });
  const fromForm = (d) => ({ ...d, fromGrant: d.type === 'expense' && d.fromGrant === 'yes' });

  const cols = [
    { label: 'วันที่', render: (r) => fmtDate(r.date) },
    { label: 'ประเภท', render: (r) => r.type === 'grant' ? <span className="tag blue">รับเงินสนับสนุน</span> : <span className="tag red">รายจ่าย</span> },
    { label: 'หน่วย', render: (r) => unitName(r.unit) },
    { label: 'รายละเอียด', render: (r) => r.desc || '—' },
    { label: 'แหล่งเงิน', render: (r) => (r.type === 'expense' ? (r.fromGrant ? <span className="tag amber">เงินสนับสนุน</span> : <span className="tag green">รายได้ธุรกิจ</span>) : '—') },
    { label: 'จำนวนเงิน', align: 'right', render: (r) => <b className={r.type === 'grant' ? 'up' : 'down'}>{r.type === 'grant' ? '+' : '−'}{baht(r.amount)}</b> },
    { label: 'หลักฐาน', render: (r) => <PhotoStrip photos={r.photos} /> },
  ];
  const byUnit = [...UNITS.map((u) => u.key), 'general'].map((k) => ({ label: unitName(k), value: sum(rows.filter((r) => r.type === 'expense' && r.unit === k), (r) => r.amount), color: colors[k] })).filter((x) => x.value > 0);

  return (
    <>
      <PageHead icon="💳" title="การเงิน / ทะเบียนรายรับ–รายจ่าย" desc="ติดตามการใช้เงินสนับสนุน 300,000 บาท และรายจ่ายแยกตามหน่วยธุรกิจ (รายรับจากการขายดึงมาจากแต่ละโมดูลอัตโนมัติ)">
        <button className="btn" onClick={() => demo('ส่งออกทะเบียนรายรับ–รายจ่าย (Excel / PDF)')}>⬇ ส่งออก</button>
        <button className="btn primary" onClick={() => setForm({})}>＋ บันทึกรายการ</button>
      </PageHead>
      <div className="kpi-grid">
        <Kpi icon="🏦" label="เงินสนับสนุนที่ได้รับ" value={baht(received)} tone="blue" />
        <Kpi icon="📤" label="ใช้จากเงินสนับสนุนแล้ว" value={baht(spent)} tone="amber" sub={received ? `${((spent / received) * 100).toFixed(1)}% ของเงินสนับสนุน` : ''} />
        <Kpi icon="💼" label="เงินสนับสนุนคงเหลือ" value={baht(received - spent)} />
        <Kpi icon="🧾" label="รายจ่ายรวมทุกแหล่ง" value={baht(expense)} tone="brown" />
      </div>
      <div className="grid-2">
        <Card title="การใช้เงินสนับสนุน">
          <Donut size={170} items={[{ label: 'ใช้ไปแล้ว', value: spent, color: '#f59e0b' }, { label: 'คงเหลือ', value: Math.max(received - spent, 0), color: '#16a34a' }]}
            centerValue={received ? `${((spent / received) * 100).toFixed(0)}%` : '–'} centerLabel="ใช้ไปแล้ว" />
        </Card>
        <Card title="รายจ่ายแยกตามหน่วยธุรกิจ">
          <Donut size={170} items={byUnit} centerValue={num(expense)} centerLabel="บาท" />
        </Card>
      </div>
      <Card title="รายการทั้งหมด">
        <DataTable cols={cols} rows={rows} onEdit={(r) => setForm(toForm(r))} onDelete={(r) => remove('ledger', r.id)} />
      </Card>
      {form && <FormModal title={form.id ? 'แก้ไขรายการ' : 'บันทึกรายการ'} fields={fields} initial={form} onSave={(d) => save(fromForm(d))} onClose={() => setForm(null)} />}
    </>
  );
}
