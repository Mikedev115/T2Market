import { useState } from 'react';
import { useData } from '../data.jsx';
import { visitReport } from '../lib/calc.js';
import { num, baht, fmtDate, dm, today } from '../lib/format.js';
import { Kpi, PageHead, Card, DataTable, FormModal, PhotoStrip, useDemo } from '../components/ui.jsx';
import Chart from '../components/Chart.jsx';

const fields = [
  { key: 'date', label: 'วันที่รับงาน', type: 'date', required: true, default: today() },
  { key: 'org', label: 'ชื่อหน่วยงาน / คณะที่มาดูงาน', required: true, wide: true },
  { key: 'people', label: 'จำนวนคนที่มา', type: 'number', min: 0, required: true },
  { key: 'income', label: 'รายได้ค่าบริการ (บาท)', type: 'number', min: 0, default: 0 },
  { key: 'expense', label: 'ต้นทุนจัดกิจกรรม (บาท)', type: 'number', min: 0, default: 0 },
  { key: 'note', label: 'บันทึก / ผลตอบรับ', type: 'textarea' },
  { key: 'photos', label: 'รูปภาพ', type: 'photos' },
];

export default function Visits() {
  const { db, create, update, remove } = useData();
  const demo = useDemo();
  const [form, setForm] = useState(null);
  const { rows, totals } = visitReport(db.visits);
  const save = (d) => (form.id ? update('visits', form.id, d) : create('visits', d));
  const lbl = rows.map((r) => dm(r.date));

  const cols = [
    { label: 'ครั้งที่', render: (r) => rows.indexOf(r) + 1 },
    { label: 'วันที่', render: (r) => fmtDate(r.date) },
    { label: 'หน่วยงาน / คณะ', render: (r) => <b>{r.org}</b> },
    { label: 'จำนวนคน', align: 'right', render: (r) => num(r.people) },
    { label: 'คนสะสม', align: 'right', render: (r) => num(r.cumPeople) },
    { label: 'รายได้', align: 'right', render: (r) => baht(r.income) },
    { label: 'ต้นทุน', align: 'right', render: (r) => baht(r.expense) },
    { label: 'คงเหลือ', align: 'right', render: (r) => <span className={r.net >= 0 ? 'up' : 'down'}>{baht(r.net)}</span> },
    { label: 'รูป', render: (r) => <PhotoStrip photos={r.photos} /> },
  ];

  return (
    <>
      <PageHead icon="👥" title="ธุรกิจศึกษาดูงาน" desc="จำนวนครั้งที่รับงาน หน่วยงาน จำนวนคน รายได้ ต้นทุน และผลตอบรับ">
        <button className="btn" onClick={() => demo('ส่งออกรายงานศึกษาดูงาน (Excel / PDF)')}>⬇ ส่งออก</button>
        <button className="btn primary" onClick={() => setForm({})}>＋ เพิ่มรอบรับงาน</button>
      </PageHead>
      <div className="kpi-grid">
        <Kpi icon="📅" label="รับงานแล้ว" value={`${totals.count} ครั้ง`} />
        <Kpi icon="👥" label="ผู้มาดูงานสะสม" value={`${num(totals.people)} คน`} />
        <Kpi icon="⬇" label="รายได้รวม" value={baht(totals.income)} tone="blue" />
        <Kpi icon="⬆" label="ต้นทุนรวม" value={baht(totals.expense)} tone="brown" sub={`คงเหลือ ${baht(totals.net)}`} />
      </div>
      <div className="grid-2">
        <Card title="จำนวนคนแต่ละครั้ง"><Chart color="#16a34a" labels={lbl} values={rows.map((r) => r.people)} unit="คน" /></Card>
        <Card title="รายได้สุทธิแต่ละครั้ง"><Chart color="#2563eb" labels={lbl} values={rows.map((r) => r.net)} unit="บาท" /></Card>
      </div>
      <Card title="รายการรับงาน">
        <DataTable cols={cols} rows={rows} onEdit={setForm} onDelete={(r) => remove('visits', r.id)}
          foot={<tr><td colSpan={3}><b>รวม</b></td><td className="right"><b>{num(totals.people)}</b></td><td></td><td className="right"><b>{baht(totals.income)}</b></td><td className="right"><b>{baht(totals.expense)}</b></td><td className="right"><b>{baht(totals.net)}</b></td><td></td></tr>} />
      </Card>
      {form && <FormModal title={form.id ? 'แก้ไขรอบรับงาน' : 'เพิ่มรอบรับงาน'} fields={fields} initial={form} onSave={save} onClose={() => setForm(null)} />}
    </>
  );
}
