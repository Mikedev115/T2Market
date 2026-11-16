import { useState } from 'react';
import { useData } from '../data.jsx';
import { productReport } from '../lib/calc.js';
import { num, baht, fmtDate, today } from '../lib/format.js';
import { Kpi, PageHead, Card, DataTable, FormModal, useDemo } from '../components/ui.jsx';

const icons = ['🧼', '🍯', '🐝', '🌾', '🧴', '🕯️', '🍵', '🥛', '🎁'].map((i) => ({ value: i, label: i }));
const typeLabel = { in: 'รับเข้า', sale: 'ขายออก', adjust: 'ปรับสต๊อก' };
const kindLabel = { bee: ['ผลิตภัณฑ์ชันโรง', 'amber'], resale: ['ซื้อมาขายไป', 'blue'] };

export default function Products() {
  const { db, create, update, remove } = useData();
  const demo = useDemo();
  const [pForm, setPForm] = useState(null);
  const [mForm, setMForm] = useState(null);
  const { products, moves, totals } = productReport(db.products, db.stockMoves);

  const savePro = (d) => (pForm.id ? update('products', pForm.id, d) : create('products', d));
  const saveMove = (d) => (mForm.id ? update('stockMoves', mForm.id, d) : create('stockMoves', d));

  const pFields = [
    { key: 'name', label: 'ชื่อสินค้า', required: true, wide: true },
    { key: 'kind', label: 'ประเภทสินค้า', type: 'select', required: true, default: 'bee', wide: true,
      options: [{ value: 'bee', label: 'ผลิตภัณฑ์ชันโรง (สบู่ น้ำผึ้ง ฯลฯ) — นับเป็นรายได้ธุรกิจชันโรง' }, { value: 'resale', label: 'ซื้อมาขายไป — นับเป็นธุรกิจซื้อมาขายไป' }] },
    { key: 'unit', label: 'หน่วยนับ', required: true, default: 'ชิ้น' },
    { key: 'price', label: 'ราคาขาย (บาท)', type: 'number', min: 0, required: true },
    { key: 'icon', label: 'ไอคอน (ใช้เมื่อไม่มีรูป)', type: 'select', options: icons, default: '🎁' },
    { key: 'photos', label: 'รูปสินค้า (แสดงหน้าบ้าน)', type: 'photos' },
  ];
  const mFields = [
    { key: 'date', label: 'วันที่', type: 'date', required: true, default: today() },
    { key: 'productId', label: 'สินค้า', type: 'select', required: true, placeholder: 'เลือกสินค้า…',
      options: products.map((p) => ({ value: p.id, label: `${p.icon} ${p.name} · เหลือ ${p.stock}` })) },
    { key: 'type', label: 'ประเภท', type: 'select', required: true, default: 'sale',
      options: [{ value: 'in', label: 'รับเข้า (ผลิต/ซื้อเพิ่ม)' }, { value: 'sale', label: 'ขายออก (ตัดสต๊อก)' }, { value: 'adjust', label: 'ปรับสต๊อก (+/−)' }] },
    { key: 'qty', label: 'จำนวน', type: 'number', required: true, hint: 'ปรับสต๊อกใส่ติดลบได้' },
    { key: 'unitPrice', label: 'ราคาขายต่อหน่วย (บาท)', type: 'number', min: 0, default: 0, hint: 'ใช้เฉพาะ "ขายออก"' },
    { key: 'unitCost', label: 'ต้นทุนต่อหน่วย (บาท)', type: 'number', min: 0, default: 0, hint: 'ใช้เฉพาะ "รับเข้า"' },
    { key: 'note', label: 'บันทึก', type: 'textarea' },
  ];

  const stockFor = (productId, editing) => {
    const p = products.find((x) => x.id === productId);
    if (!p) return 0;
    let s = p.stock;
    if (editing && editing.productId === productId) s += editing.type === 'sale' ? editing.qty : editing.type === 'in' || editing.type === 'adjust' ? -editing.qty : 0;
    return s;
  };

  const pCols = [
    { label: 'สินค้า', render: (r) => <span className="p-name">{r.photos?.[0] ? <img className="p-thumb" src={r.photos[0]} alt="" /> : <span className="p-thumb ic">{r.icon}</span>}<b>{r.name}</b></span> },
    { label: 'ประเภท', render: (r) => <span className={`tag ${kindLabel[r.kind][1]}`}>{kindLabel[r.kind][0]}</span> },
    { label: 'ราคา', align: 'right', render: (r) => baht(r.price) },
    { label: 'รับเข้า', align: 'right', render: (r) => num(r.inQty) },
    { label: 'ยอดขายได้', align: 'right', render: (r) => num(r.sold) },
    { label: 'ยอดเงิน', align: 'right', render: (r) => baht(r.revenue) },
    { label: 'คงเหลือ', align: 'right', render: (r) => <span className={`tag ${r.stock <= 10 ? 'amber' : 'green'}`}>{num(r.stock)} {r.unit}</span> },
    { label: '', align: 'right', render: (r) => <button className="link" onClick={() => setMForm({ productId: r.id, type: 'sale', unitPrice: r.price })}>ตัดสต๊อก</button> },
  ];
  const mCols = [
    { label: 'วันที่', render: (r) => fmtDate(r.date) },
    { label: 'สินค้า', render: (r) => r.productName },
    { label: 'ประเภท', render: (r) => <span className={`tag ${r.type === 'sale' ? 'blue' : r.type === 'in' ? 'green' : 'amber'}`}>{typeLabel[r.type]}</span> },
    { label: 'จำนวน', align: 'right', render: (r) => `${num(r.qty)} ${r.unit}` },
    { label: 'ยอดเงิน', align: 'right', render: (r) => (r.type === 'sale' ? baht(r.qty * r.unitPrice) : r.type === 'in' && r.unitCost ? `ทุน ${baht(r.qty * r.unitCost)}` : '—') },
    { label: 'บันทึก', render: (r) => <span className="muted">{r.note || '—'}</span> },
  ];

  return (
    <>
      <PageHead icon="🛍️" title="สินค้า / ซื้อมาขายไป" desc="เพิ่มสินค้าได้เอง เช่น สบู่น้ำผึ้งชันโรง น้ำผึ้ง · ตัดสต๊อก ยอดขายได้ ยอดคงเหลือ ต้นทุน">
        <button className="btn" onClick={() => demo('ส่งออกรายงานสต๊อกสินค้า (Excel / PDF)')}>⬇ ส่งออก</button>
        <button className="btn" onClick={() => setPForm({})}>＋ เพิ่มสินค้าใหม่</button>
        <button className="btn primary" onClick={() => setMForm({})}>＋ บันทึกสต๊อก / ขาย</button>
      </PageHead>
      <div className="kpi-grid">
        <Kpi icon="🛍️" label="จำนวนสินค้า" value={products.length} />
        <Kpi icon="📦" label="ยอดขายได้ (หน่วย)" value={num(totals.sold)} tone="blue" />
        <Kpi icon="💰" label="ยอดเงินจากการขาย" value={baht(totals.revenue)} tone="blue" />
        <Kpi icon="🏷️" label="คงเหลือรวม" value={num(totals.stock)} tone="amber" />
      </div>
      <Card title="รายการสินค้า">
        <DataTable cols={pCols} rows={products} onEdit={setPForm}
          onDelete={async (r) => {
            if (moves.some((m) => m.productId === r.id)) return demo('สินค้านี้มีประวัติสต๊อกแล้ว ลบไม่ได้ (ลบประวัติก่อน)');
            await remove('products', r.id);
          }} />
      </Card>
      <Card title="ประวัติรับเข้า / ขายออก">
        <DataTable cols={mCols} rows={[...moves].reverse()} onEdit={setMForm} onDelete={(r) => remove('stockMoves', r.id)} />
      </Card>

      {pForm && <FormModal title={pForm.id ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'} fields={pFields} initial={pForm} onSave={savePro} onClose={() => setPForm(null)} />}
      {mForm && (
        <FormModal key={mForm.id ?? 'new'} title={mForm.id ? 'แก้ไขรายการสต๊อก' : 'บันทึกสต๊อก / ขาย'} fields={mFields} initial={mForm} onSave={saveMove} onClose={() => setMForm(null)}
          validate={(v) => {
            if (!v.productId) return 'กรุณาเลือกสินค้า';
            if (v.type !== 'adjust' && v.qty <= 0) return 'จำนวนต้องมากกว่า 0';
            const stock = stockFor(v.productId, mForm.id ? mForm : null);
            if (v.type === 'sale' && v.qty > stock) return `สต๊อกไม่พอ (เหลือ ${stock})`;
            if (v.type === 'adjust' && stock + v.qty < 0) return `ปรับแล้วสต๊อกติดลบ (เหลือ ${stock})`;
            return '';
          }} />
      )}
    </>
  );
}
