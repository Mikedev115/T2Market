import { useState } from 'react';
import { useData } from '../data.jsx';
import { seedReport } from '../lib/calc.js';
import { num, baht, pct, fmtDate, today } from '../lib/format.js';
import { Kpi, PageHead, Card, DataTable, FormModal, PhotoStrip, useDemo } from '../components/ui.jsx';
import Chart from '../components/Chart.jsx';

const batchFields = [
  { key: 'date', label: 'วันที่เพาะ', type: 'date', required: true, default: today() },
  { key: 'species', label: 'ชนิดพันธุ์ไม้', required: true },
  { key: 'sown', label: 'จำนวนที่เพาะ (ต้น)', type: 'number', min: 0, required: true },
  { key: 'survived', label: 'จำนวนที่รอด (ต้น)', type: 'number', min: 0, required: true },
  { key: 'ready', label: 'พร้อมจำหน่าย (ต้น)', type: 'number', min: 0, default: 0 },
  { key: 'price', label: 'ราคาจำหน่ายต่อต้น (บาท)', type: 'number', min: 0, default: 20, hint: 'ใช้ตอนลูกค้าสั่งจองจากหน้าบ้าน' },
  { key: 'note', label: 'บันทึก', type: 'textarea' },
  { key: 'photos', label: 'รูปภาพ', type: 'photos' },
];

export default function Seedlings() {
  const { db, create, update, remove } = useData();
  const demo = useDemo();
  const [batchForm, setBatchForm] = useState(null);
  const [saleForm, setSaleForm] = useState(null);
  const { batches, sales, totals } = seedReport(db.seedBatches, db.seedSales);

  const saveBatch = (d) => (batchForm.id ? update('seedBatches', batchForm.id, d) : create('seedBatches', d));
  const saveSale = (d) => (saleForm.id ? update('seedSales', saleForm.id, { ...d, unitPrice: d.kind === 'give' ? 0 : d.unitPrice }) : create('seedSales', { ...d, unitPrice: d.kind === 'give' ? 0 : d.unitPrice }));
  const availFor = (batchId, editing) => {
    const b = batches.find((x) => x.id === batchId);
    return b ? b.available + (editing && editing.batchId === batchId ? editing.qty : 0) : 0;
  };

  const saleFields = [
    { key: 'date', label: 'วันที่', type: 'date', required: true, default: today() },
    { key: 'kind', label: 'ประเภท', type: 'select', required: true, default: 'sale', options: [{ value: 'sale', label: 'จำหน่าย' }, { value: 'give', label: 'แจก / ใช้ในกิจกรรม' }] },
    { key: 'batchId', label: 'ล็อตกล้าไม้', type: 'select', required: true, placeholder: 'เลือกล็อต…', wide: true,
      options: batches.map((b) => ({ value: b.id, label: `${b.species} (${fmtDate(b.date)}) · เหลือ ${b.available}` })) },
    { key: 'qty', label: 'จำนวน (ต้น)', type: 'number', min: 1, required: true },
    { key: 'unitPrice', label: 'ราคาต่อต้น (บาท)', type: 'number', min: 0, default: 0, hint: 'ไม่ต้องใส่ถ้าเป็นการแจก' },
    { key: 'buyer', label: 'ผู้ซื้อ / รายละเอียด', wide: true },
  ];

  const batchCols = [
    { label: 'วันที่เพาะ', render: (r) => fmtDate(r.date) },
    { label: 'ชนิดพันธุ์', render: (r) => <b>{r.species}</b> },
    { label: 'เพาะ', align: 'right', render: (r) => num(r.sown) },
    { label: 'รอด', align: 'right', render: (r) => num(r.survived) },
    { label: 'อัตรารอด', align: 'right', render: (r) => <span className="rate"><i style={{ width: `${r.rate}%` }} />{pct(r.rate)}</span> },
    { label: 'พร้อมขาย', align: 'right', render: (r) => num(r.ready) },
    { label: 'ขาย', align: 'right', render: (r) => num(r.sold) },
    { label: 'แจก/ใช้', align: 'right', render: (r) => num(r.given) },
    { label: 'คงเหลือ', align: 'right', render: (r) => <b>{num(r.available)}</b> },
    { label: 'รูป', render: (r) => <PhotoStrip photos={r.photos} /> },
  ];
  const saleCols = [
    { label: 'วันที่', render: (r) => fmtDate(r.date) },
    { label: 'ประเภท', render: (r) => r.kind === 'sale' ? <span className="tag green">จำหน่าย</span> : <span className="tag amber">แจก/ใช้</span> },
    { label: 'ชนิดพันธุ์', render: (r) => r.species },
    { label: 'จำนวน', align: 'right', render: (r) => num(r.qty) },
    { label: 'ราคา/ต้น', align: 'right', render: (r) => (r.kind === 'sale' ? baht(r.unitPrice) : '—') },
    { label: 'รวม', align: 'right', render: (r) => <b>{r.kind === 'sale' ? baht(r.total) : '—'}</b> },
    { label: 'ผู้ซื้อ / รายละเอียด', render: (r) => r.buyer || '—' },
  ];

  return (
    <>
      <PageHead icon="🌱" title="ธุรกิจเรือนเพาะชำ" desc="การเพาะ อัตราการรอดตาย ชนิดพันธุ์ กล้าไม้พร้อมจำหน่าย และการขาย/แจกแต่ละครั้ง">
        <button className="btn" onClick={() => demo('ส่งออกรายงานเรือนเพาะชำ (Excel / PDF)')}>⬇ ส่งออก</button>
        <button className="btn" onClick={() => setSaleForm({})}>＋ ขาย / แจก</button>
        <button className="btn primary" onClick={() => setBatchForm({})}>＋ เพิ่มล็อตเพาะ</button>
      </PageHead>
      <div className="kpi-grid">
        <Kpi icon="🌰" label="เพาะทั้งหมด" value={`${num(totals.sown)} ต้น`} />
        <Kpi icon="💚" label="อัตราการรอด" value={pct(totals.rate)} sub={`รอด ${num(totals.survived)} ต้น`} />
        <Kpi icon="🛒" label="พร้อมจำหน่าย (คงเหลือ)" value={`${num(totals.available)} ต้น`} sub={`ขาย ${num(totals.sold)} · แจก ${num(totals.given)}`} />
        <Kpi icon="💰" label="รายได้จากการขาย" value={baht(totals.revenue)} tone="blue" />
      </div>
      <Card title="ล็อตการเพาะ">
        <DataTable cols={batchCols} rows={batches} onEdit={setBatchForm}
          onDelete={async (r) => {
            if (sales.some((s) => s.batchId === r.id)) return demo('ล็อตนี้มีรายการขาย/แจกแล้ว ลบไม่ได้ (ลบรายการก่อน)');
            await remove('seedBatches', r.id);
          }} />
      </Card>
      <div className="grid-2">
        <Card title="อัตรารอดแต่ละล็อต (%)"><Chart color="#16a34a" labels={batches.map((b) => b.species)} values={batches.map((b) => +b.rate.toFixed(1))} unit="%" /></Card>
        <Card title="คงเหลือพร้อมขายแต่ละล็อต"><Chart color="#0d9488" labels={batches.map((b) => b.species)} values={batches.map((b) => b.available)} unit="ต้น" /></Card>
      </div>
      <Card title="ประวัติการขาย / แจก">
        <DataTable cols={saleCols} rows={sales} onEdit={setSaleForm} onDelete={(r) => remove('seedSales', r.id)} />
      </Card>

      {batchForm && (
        <FormModal title={batchForm.id ? 'แก้ไขล็อตเพาะ' : 'เพิ่มล็อตเพาะ'} fields={batchFields} initial={batchForm} onSave={saveBatch} onClose={() => setBatchForm(null)}
          validate={(v) => v.survived > v.sown ? 'จำนวนที่รอดต้องไม่เกินจำนวนที่เพาะ' : v.ready > v.survived ? 'พร้อมจำหน่ายต้องไม่เกินจำนวนที่รอด' : ''} />
      )}
      {saleForm && (
        <FormModal title={saleForm.id ? 'แก้ไขรายการ' : 'บันทึกการขาย / แจก'} fields={saleFields} initial={saleForm} onSave={saveSale} onClose={() => setSaleForm(null)}
          validate={(v) => v.qty > availFor(v.batchId, saleForm.id ? saleForm : null) ? `กล้าไม้คงเหลือไม่พอ (เหลือ ${availFor(v.batchId, saleForm.id ? saleForm : null)} ต้น)` : ''} />
      )}
    </>
  );
}
