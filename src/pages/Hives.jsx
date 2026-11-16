import { useState } from 'react';
import { useData } from '../data.jsx';
import { hiveReport } from '../lib/calc.js';
import { num, baht, fmtDate, dm, today } from '../lib/format.js';
import { Kpi, PageHead, Card, DataTable, FormModal, PhotoStrip, useDemo } from '../components/ui.jsx';
import Chart from '../components/Chart.jsx';

// The plot location of a farm is stored as lat/lng numbers; the form takes one text field,
// so a coordinate pair copied from Google Maps can be pasted as is.
const coordText = (f) => (f.lat === '' || f.lat == null || f.lng === '' || f.lng == null ? '' : `${f.lat}, ${f.lng}`);
const hasCoord = (f) => f.lat !== '' && f.lat != null && f.lng !== '' && f.lng != null;
const parseCoord = (s) => {
  const p = String(s ?? '').split(',').map((x) => x.trim());
  if (p.length !== 2 || p.some((x) => !x || Number.isNaN(Number(x)))) return null;
  return { lat: Number(p[0]), lng: Number(p[1]) };
};
// blank = keep no location, null = text is not a coordinate pair
const coordValues = (s) => (String(s ?? '').trim() ? parseCoord(s) : { lat: '', lng: '' });
// Ask this device where it is: GPS on a phone, wifi location on a laptop.
const geoMessage = (err) => {
  if (err?.code === 1) return 'ยังไม่ได้อนุญาตให้ใช้ตำแหน่ง — กดอนุญาตในเบราว์เซอร์แล้วลองอีกครั้ง';
  if (err?.code === 3) return 'หาตำแหน่งไม่ทันเวลา — ลองอีกครั้ง หรือกรอกพิกัดเอง';
  return 'หาตำแหน่งไม่สำเร็จ — ลองอีกครั้ง หรือกรอกพิกัดเอง';
};
const locate = (setValue) => new Promise((resolve) => {
  if (!navigator.geolocation) return resolve('เบราว์เซอร์นี้หาตำแหน่งไม่ได้ — กรอกพิกัดเองได้');
  navigator.geolocation.getCurrentPosition(
    (pos) => { setValue(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`); resolve(''); },
    (err) => resolve(geoMessage(err)),
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
  );
});
const coordError = (s) => {
  if (!String(s ?? '').trim()) return '';
  const c = parseCoord(s);
  if (!c) return 'พิกัดต้องอยู่ในรูป ละติจูด, ลองจิจูด เช่น 17.840123, 101.234567';
  if (Math.abs(c.lat) > 90) return 'ละติจูดต้องอยู่ระหว่าง -90 ถึง 90';
  if (Math.abs(c.lng) > 180) return 'ลองจิจูดต้องอยู่ระหว่าง -180 ถึง 180';
  return '';
};

export default function Hives() {
  const { db, create, update, remove, saveSettings } = useData();
  const demo = useDemo();
  const [bonusForm, setBonusForm] = useState(null);
  const bonus = db.settings.hiveBonus || { targetKg: 10, bonus: 300 };
  const [farmForm, setFarmForm] = useState(null);
  const [form, setForm] = useState(null);
  const [sel, setSel] = useState('all'); // farmer filter
  const rep = hiveReport(db.hiveFarms, db.hiveRounds);
  const farm = db.hiveFarms.find((f) => f.id === sel);
  const shown = sel === 'all' ? rep.rows : rep.rows.filter((r) => r.farmerId === sel);
  const cur = (id) => rep.farms.find((f) => f.id === id)?.current ?? '';

  const farmFields = [
    { key: 'name', label: 'ชื่อเกษตรกร / ฟาร์ม', required: true, wide: true },
    { key: 'startHives', label: 'จำนวนรังตั้งต้น (รัง)', type: 'number', min: 0, required: true },
    { key: 'startDate', label: 'ข้อมูล ณ วันที่', type: 'date', required: true, default: today() },
    { key: 'coord', label: 'พิกัดแปลง (ละติจูด, ลองจิจูด)', wide: true,
      hint: 'ระบบหาตำแหน่งให้เองเมื่อเปิดฟอร์ม · แก้เป็นพิกัดจาก Google Maps ได้ถ้าต้องการ · เว้นว่างไว้ได้ถ้ายังไม่ระบุ',
      auto: farmForm?.id ? undefined : (setValue) => locate(setValue) },
    { key: 'note', label: 'บันทึก', type: 'textarea' },
  ];
  const fields = [
    { key: 'farmerId', label: 'เกษตรกร', type: 'select', required: true, placeholder: 'เลือกเกษตรกร…', default: farm?.id ?? '', wide: true,
      options: db.hiveFarms.map((f) => ({ value: f.id, label: f.name })), fill: (id) => ({ total: cur(id) }) },
    { key: 'date', label: 'วันที่เก็บน้ำผึ้ง', type: 'date', required: true, default: today() },
    { key: 'honeyKg', label: 'ปริมาณน้ำผึ้งที่เก็บได้ (กก.)', type: 'number', min: 0, required: true },
    { key: 'total', label: 'จำนวนรังตอนนี้ (รัง)', type: 'number', min: 0, required: true, default: farm ? cur(farm.id) : '', hint: 'นับรังทั้งหมดของฟาร์ม ณ วันที่เก็บ' },
    { key: 'honeySoldKg', label: 'น้ำผึ้งที่ขายสด (กก.) ถ้ามี', type: 'number', min: 0, default: 0 },
    { key: 'income', label: 'รายได้จากการขาย (บาท) ถ้ามี', type: 'number', min: 0, default: 0 },
    { key: 'note', label: 'บันทึก', type: 'textarea' },
    { key: 'photos', label: 'รูปภาพ', type: 'photos' },
  ];

  const farmInitial = (f) => ({ ...f, coord: coordText(f) });
  const saveFarm = (d) => {
    const { coord, ...rest } = d;
    const row = { ...rest, ...(coordValues(coord) ?? { lat: '', lng: '' }) };
    return farmForm.id ? update('hiveFarms', farmForm.id, row) : create('hiveFarms', row);
  };
  const save = (d) => (form.id ? update('hiveRounds', form.id, d) : create('hiveRounds', d));

  const cols = [
    ...(sel === 'all' ? [{ label: 'เกษตรกร', render: (r) => <b>{r.farmName}</b> }] : []),
    { label: 'เก็บครั้งที่', align: 'right', render: (r) => r.harvestNo },
    { label: 'วันที่', render: (r) => fmtDate(r.date) },
    { label: 'น้ำผึ้ง (กก.)', align: 'right', render: (r) => <b>{num(r.honeyKg)}</b> },
    { label: 'สะสมของฟาร์ม (กก.)', align: 'right', render: (r) => num(r.cumHoney) },
    { label: 'จำนวนรัง', align: 'right', render: (r) => <>{num(r.total)} <span className={r.change > 0 ? 'up' : r.change < 0 ? 'down' : 'muted'}>{r.change > 0 ? `▲${r.change}` : r.change < 0 ? `▼${-r.change}` : ''}</span></> },
    { label: 'ขายสด (กก.)', align: 'right', render: (r) => num(r.honeySoldKg) },
    { label: 'รายได้', align: 'right', render: (r) => baht(r.income) },
    { label: 'รูป', render: (r) => <PhotoStrip photos={r.photos} /> },
    { label: 'บันทึก', render: (r) => <span className="muted">{r.note || '—'}</span> },
  ];
  const t = rep.totals;
  const reached = (f) => f.honey >= bonus.targetKg;
  const winners = rep.farms.filter(reached).length;
  const bonusFields = [
    { key: 'targetKg', label: 'เก็บน้ำผึ้งรวมครบ (กก.)', type: 'number', min: 0, required: true },
    { key: 'bonus', label: 'โบนัสที่ได้รับ (บาท)', type: 'number', min: 0, required: true },
  ];
  const chartRows = shown.slice().reverse().reverse();
  const perFarmKg = rep.farms.filter((f) => sel === 'all' || f.id === sel);

  return (
    <>
      <PageHead icon="🐝" title="ธุรกิจชันโรง" desc="เกษตรกรแต่ละรายบันทึกข้อมูลฟาร์มของตัวเอง: รังตั้งต้น ณ วันที่ และการเก็บน้ำผึ้งแต่ละครั้ง">
        <button className="btn" onClick={() => demo('ส่งออกรายงานชันโรง (Excel / PDF)')}>⬇ ส่งออก</button>
        <button className="btn" onClick={() => setFarmForm({})}>＋ เพิ่มเกษตรกร</button>
        <button className="btn primary" onClick={() => (db.hiveFarms.length ? setForm({}) : setFarmForm({}))}>＋ บันทึกเก็บน้ำผึ้ง</button>
      </PageHead>

      <div className="kpi-grid">
        <Kpi icon="👨‍🌾" label="เกษตรกรที่ใช้งาน" value={`${num(t.farmers)} ราย`} />
        <Kpi icon="🐝" label="รังรวมปัจจุบัน" value={num(t.current)} tone="amber" sub={`ตั้งต้นรวม ${num(t.start)} รัง`} />
        <Kpi icon="🍯" label="น้ำผึ้งรวมสะสม" value={`${num(t.honey)} กก.`} tone="amber" sub={`เก็บแล้ว ${t.harvests} ครั้ง`} />
        <Kpi icon="💰" label="รายได้ขายน้ำผึ้งสด" value={baht(t.income)} tone="blue" sub={`ขายแล้ว ${num(t.honeySold)} กก.`} />
      </div>

      <Card title="🎁 โบนัสเก็บน้ำผึ้ง" right={<button className="link" onClick={() => setBonusForm(bonus)}>ตั้งค่าเงื่อนไข</button>}>
        <p>เกษตรกรที่เก็บน้ำผึ้งรวมครบ <b>{num(bonus.targetKg)} กก.</b> รับโบนัส <b>{baht(bonus.bonus)}</b> · ได้รับโบนัสแล้ว <b>{winners} ราย</b> (รวม {baht(winners * bonus.bonus)})</p>
      </Card>

      <Card title="เกษตรกรแต่ละราย" right={<small className="muted">แตะชื่อเพื่อดูเฉพาะฟาร์ม</small>}>
        <div className="chips">
          <button className={`chip ${sel === 'all' ? 'on' : ''}`} onClick={() => setSel('all')}>ทั้งหมด</button>
          {rep.farms.map((f) => <button key={f.id} className={`chip ${sel === f.id ? 'on' : ''}`} onClick={() => setSel(f.id)}>{f.name}</button>)}
        </div>
        <div className="farm-grid">
          {perFarmKg.map((f) => (
            <div key={f.id} className="farm-card">
              <div className="farm-head"><b>{f.name}</b>
                <span><button className="link" onClick={() => setFarmForm(farmInitial(f))}>แก้ไข</button>
                  <button className="link danger" onClick={() => (rep.rows.some((r) => r.farmerId === f.id) ? demo('เกษตรกรรายนี้มีบันทึกการเก็บน้ำผึ้งแล้ว ลบไม่ได้ (ลบบันทึกก่อน)') : remove('hiveFarms', f.id))}>ลบ</button></span>
              </div>
              <div className="farm-line"><span>รังตั้งต้น (ณ {fmtDate(f.startDate)})</span><b>{num(f.startHives)} รัง</b></div>
              <div className="farm-line"><span>พิกัดแปลง</span>
                {hasCoord(f)
                  ? <b>🗺 {f.lat}, {f.lng}</b>
                  : <small className="muted">ยังไม่ระบุ</small>}</div>
              <div className="farm-line"><span>รังปัจจุบัน</span><b>{num(f.current)} รัง</b></div>
              <div className="farm-line"><span>เก็บน้ำผึ้งแล้ว</span><b>{f.harvests} ครั้ง</b></div>
              <div className="farm-line total"><span>ปริมาณรวม</span><b>{num(f.honey)} กก.</b></div>
              <div className="stock-bar"><div><i style={{ width: `${Math.min(100, (f.honey / (bonus.targetKg || 1)) * 100)}%` }} /></div>
                {reached(f) ? <span className="tag green">🎉 ครบ {num(bonus.targetKg)} กก. ได้โบนัส {baht(bonus.bonus)}</span> : <small className="muted">อีก {num(+(bonus.targetKg - f.honey).toFixed(2))} กก. ครบโบนัส {baht(bonus.bonus)}</small>}</div>
              <button className="btn sm block" onClick={() => setForm({ farmerId: f.id, total: f.current })}>＋ บันทึกเก็บน้ำผึ้ง</button>
            </div>
          ))}
          {perFarmKg.length === 0 && <p className="empty">ยังไม่มีเกษตรกร กด "เพิ่มเกษตรกร" เพื่อเริ่ม</p>}
        </div>
      </Card>

      <div className="grid-2">
        <Card title="จำนวนรังรวมหลังแต่ละบันทึก"><Chart type="line" color="#d97706" labels={rep.timeline.map((r) => dm(r.date))} values={rep.timeline.map((r) => r.total)} unit="รัง" /></Card>
        <Card title="น้ำผึ้งรวมของแต่ละเกษตรกร"><Chart color="#f59e0b" labels={rep.farms.map((f) => f.name.replace(' (ตัวอย่าง)', ''))} values={rep.farms.map((f) => +f.honey.toFixed(2))} unit="กก." /></Card>
      </div>

      <Card title={farm ? `บันทึกการเก็บน้ำผึ้ง · ${farm.name}` : 'บันทึกการเก็บน้ำผึ้งทั้งหมด'}>
        <DataTable cols={cols} rows={[...chartRows].reverse()} onEdit={setForm} onDelete={(r) => remove('hiveRounds', r.id)} />
      </Card>

      {bonusForm && <FormModal title="ตั้งค่าโบนัสเก็บน้ำผึ้ง" fields={bonusFields} initial={bonusForm} onSave={(d) => saveSettings({ hiveBonus: d })} onClose={() => setBonusForm(null)} />}
      {farmForm && <FormModal title={farmForm.id ? 'แก้ไขข้อมูลเกษตรกร' : 'เพิ่มเกษตรกร (รังตั้งต้น)'} fields={farmFields} initial={farmInitial(farmForm)} onSave={saveFarm} onClose={() => setFarmForm(null)}
        validate={(v) => coordError(v.coord)} />}
      {form && <FormModal key={form.id ?? 'new'} title={form.id ? 'แก้ไขบันทึกเก็บน้ำผึ้ง' : 'บันทึกเก็บน้ำผึ้ง'} fields={fields} initial={form} onSave={save} onClose={() => setForm(null)}
        validate={(v) => (v.total <= 0 ? 'กรุณาใส่จำนวนรังตอนนี้' : v.honeySoldKg > v.honeyKg ? 'น้ำผึ้งที่ขายต้องไม่เกินที่เก็บได้' : '')} />}
    </>
  );
}
