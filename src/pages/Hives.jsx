import { useState } from 'react';
import { useData } from '../data.jsx';
import { hiveReport } from '../lib/calc.js';
import { num, baht, fmtDate, dm, today } from '../lib/format.js';
import { Kpi, PageHead, Card, DataTable, FormModal, PhotoStrip, useDemo } from '../components/ui.jsx';
import Chart from '../components/Chart.jsx';

const fields = [
  { key: 'date', label: 'วันที่ติดตาม', type: 'date', required: true, default: today() },
  { key: 'total', label: 'จำนวนรังทั้งหมด', type: 'number', min: 0, required: true },
  { key: 'newHives', label: 'รังที่ขยายใหม่', type: 'number', min: 0, default: 0 },
  { key: 'lost', label: 'รังที่สูญเสีย', type: 'number', min: 0, default: 0 },
  { key: 'honeyKg', label: 'น้ำผึ้งที่เก็บได้ (กก.)', type: 'number', min: 0, default: 0 },
  { key: 'honeySoldKg', label: 'น้ำผึ้งที่ขาย (กก.)', type: 'number', min: 0, default: 0 },
  { key: 'income', label: 'รายได้จากการขายน้ำผึ้ง (บาท)', type: 'number', min: 0, default: 0, wide: true },
  { key: 'note', label: 'บันทึก', type: 'textarea' },
  { key: 'photos', label: 'รูปภาพ', type: 'photos' },
];

export default function Hives() {
  const { db, create, update, remove } = useData();
  const demo = useDemo();
  const [form, setForm] = useState(null);
  const { rows, totals } = hiveReport(db.hiveRounds, db.settings.hiveOpening);
  const save = (d) => (form.id ? update('hiveRounds', form.id, d) : create('hiveRounds', d));
  const lbl = rows.map((r) => dm(r.date));

  const cols = [
    { label: 'รอบ', render: (r) => rows.indexOf(r) + 1 },
    { label: 'วันที่', render: (r) => fmtDate(r.date) },
    { label: 'จำนวนรัง', align: 'right', render: (r) => <b>{num(r.total)}</b> },
    { label: 'เปลี่ยนแปลง', align: 'right', render: (r) => <span className={r.change > 0 ? 'up' : r.change < 0 ? 'down' : 'muted'}>{r.change > 0 ? '▲ +' : r.change < 0 ? '▼ ' : ''}{r.change}</span> },
    { label: 'ขยายใหม่', align: 'right', render: (r) => num(r.newHives) },
    { label: 'สูญเสีย', align: 'right', render: (r) => num(r.lost) },
    { label: 'น้ำผึ้ง (กก.)', align: 'right', render: (r) => num(r.honeyKg) },
    { label: 'ขาย (กก.)', align: 'right', render: (r) => num(r.honeySoldKg) },
    { label: 'รายได้', align: 'right', render: (r) => baht(r.income) },
    { label: 'รูป', render: (r) => <PhotoStrip photos={r.photos} /> },
    { label: 'บันทึก', render: (r) => <span className="muted">{r.note || '—'}</span> },
  ];

  return (
    <>
      <PageHead icon="🐝" title="ธุรกิจชันโรง" desc="จำนวนรัง รังที่ขยายใหม่ การเปลี่ยนแปลงแต่ละรอบ และน้ำผึ้งที่เก็บได้ (กก.)">
        <button className="btn" onClick={() => demo('ส่งออกรายงานชันโรง (Excel / PDF)')}>⬇ ส่งออก</button>
        <button className="btn primary" onClick={() => setForm({})}>＋ เพิ่มรอบติดตาม</button>
      </PageHead>
      <div className="kpi-grid">
        <Kpi icon="🐝" label="รังปัจจุบัน" value={num(totals.current)} tone="amber" sub={`ตั้งต้น ${db.settings.hiveOpening.total} รัง`} />
        <Kpi icon="🪵" label="ขยายใหม่รวม" value={num(totals.newHives)} sub={`สูญเสียรวม ${num(totals.lost)}`} />
        <Kpi icon="🍯" label="น้ำผึ้งสะสม" value={`${num(totals.honey)} กก.`} tone="amber" sub={`ขายแล้ว ${num(totals.honeySold)} กก.`} />
        <Kpi icon="💰" label="รายได้ขายน้ำผึ้ง" value={baht(totals.income)} tone="blue" />
      </div>
      <div className="grid-2">
        <Card title="จำนวนรังแต่ละรอบ"><Chart type="line" color="#d97706" labels={lbl} values={rows.map((r) => r.total)} unit="รัง" /></Card>
        <Card title="น้ำผึ้งที่เก็บได้แต่ละรอบ"><Chart color="#f59e0b" labels={lbl} values={rows.map((r) => r.honeyKg)} unit="กก." /></Card>
      </div>
      <Card title="ผลการติดตามแต่ละรอบ">
        <DataTable cols={cols} rows={rows} onEdit={setForm} onDelete={(r) => remove('hiveRounds', r.id)} />
      </Card>
      {form && <FormModal title={form.id ? 'แก้ไขรอบติดตาม' : 'เพิ่มรอบติดตาม'} fields={fields} initial={form} onSave={save} onClose={() => setForm(null)} />}
    </>
  );
}
