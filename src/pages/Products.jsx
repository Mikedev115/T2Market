import { useState } from 'react';
import { useData } from '../data.jsx';
import { productReport } from '../lib/calc.js';
import { num, baht, fmtDate, today } from '../lib/format.js';
import { Kpi, PageHead, Card, DataTable, FormModal, Modal, useDemo } from '../components/ui.jsx';

const icons = ['🧼', '🍯', '🐝', '🌾', '🧴', '🕯️', '🍵', '🥛', '🎁'].map((i) => ({ value: i, label: i }));
const typeLabel = { in: 'รับเข้า', sale: 'ขายออก', adjust: 'ปรับสต๊อก' };
const chLabel = { retail: 'ขายปลีก', wholesale: 'ขายส่ง' };
const kindLabel = { bee: ['ผลิตภัณฑ์ชันโรง', 'amber'], resale: ['ซื้อมาขายไป', 'blue'] };

// Daily sales entry: pick product + retail/wholesale + quantity -> price is filled and stock is deducted.
function SaleModal({ init, products, stockFor, onSave, onClose }) {
  const first = products.find((p) => p.id === init.productId) || products[0];
  const [v, setV] = useState({
    date: init.date ?? today(), productId: first?.id ?? '', channel: init.channel ?? 'retail',
    qty: init.qty ?? '', unitPrice: init.unitPrice ?? '', note: init.note ?? '',
  });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const p = products.find((x) => x.id === v.productId);
  const std = (pr, ch) => (ch === 'wholesale' ? pr?.priceWholesale : pr?.priceRetail) ?? 0;
  const price = v.unitPrice === '' ? std(p, v.channel) : Number(v.unitPrice);
  const stock = p ? stockFor(p.id, init.id ? init : null) : 0;
  const qty = Number(v.qty) || 0;
  const set = (patch) => setV((s) => ({ ...s, ...patch }));
  const submit = async (e) => {
    e.preventDefault();
    if (!p) return setErr('กรุณาเลือกสินค้า');
    if (qty <= 0) return setErr('จำนวนต้องมากกว่า 0');
    if (qty > stock) return setErr(`สต๊อกไม่พอ (เหลือ ${num(stock)} ${p.unit})`);
    setBusy(true);
    try { await onSave({ date: v.date, productId: p.id, type: 'sale', channel: v.channel, qty, unitPrice: price, unitCost: 0, note: v.note }); onClose(); } catch (ex) { setErr(ex.message); setBusy(false); }
  };
  return (
    <Modal title={init.id ? 'แก้ไขรายการขาย' : 'บันทึกการขาย (ตัดสต๊อก)'} onClose={onClose}>
      <form onSubmit={submit} className="form">
        <div className="form-grid">
          <label className="field"><span>วันที่ขาย</span><input type="date" value={v.date} onChange={(e) => set({ date: e.target.value })} /></label>
          <label className="field"><span>สินค้า</span>
            <select value={v.productId} onChange={(e) => set({ productId: e.target.value, unitPrice: '' })}>
              {products.map((x) => <option key={x.id} value={x.id}>{x.icon} {x.name}</option>)}
            </select>
          </label>
          <div className="field wide"><span>ช่องทางขาย</span>
            <div className="seg2">
              {['retail', 'wholesale'].map((c) => (
                <button type="button" key={c} className={v.channel === c ? 'on' : ''} onClick={() => set({ channel: c, unitPrice: '' })}>
                  {chLabel[c]} · {baht(std(p, c))}
                </button>
              ))}
            </div>
          </div>
          <label className="field"><span>จำนวนที่ขายวันนี้ ({p?.unit})</span><input type="number" min="1" step="any" value={v.qty} onChange={(e) => set({ qty: e.target.value })} autoFocus /></label>
          <label className="field"><span>ราคาต่อหน่วย (บาท)</span><input type="number" min="0" step="any" value={v.unitPrice === '' ? std(p, v.channel) : v.unitPrice} onChange={(e) => set({ unitPrice: e.target.value })} /></label>
          <label className="field wide"><span>บันทึก</span><textarea rows={2} value={v.note} onChange={(e) => set({ note: e.target.value })} /></label>
        </div>
        <div className="sale-sum">
          <span>สต๊อกก่อนขาย <b>{num(stock)}</b> {p?.unit}</span>
          <span>ยอดเงิน <b>{baht(qty * price)}</b></span>
          <span className={stock - qty < 0 ? 'down' : ''}>คงเหลือหลังขาย <b>{num(stock - qty)}</b> {p?.unit}</span>
        </div>
        {err && <div className="form-err">{err}</div>}
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>ยกเลิก</button>
          <button className="btn primary" disabled={busy}>{busy ? 'กำลังบันทึก…' : 'บันทึกการขาย'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Products() {
  const { db, create, update, remove } = useData();
  const demo = useDemo();
  const [pForm, setPForm] = useState(null);
  const [mForm, setMForm] = useState(null); // stock in / adjust
  const [sForm, setSForm] = useState(null); // sale
  const { products, moves, totals } = productReport(db.products, db.stockMoves);

  const savePro = (d) => (pForm.id ? update('products', pForm.id, d) : create('products', d));
  const saveMove = (d) => (mForm.id ? update('stockMoves', mForm.id, d) : create('stockMoves', d));
  const saveSale = (d) => (sForm.id ? update('stockMoves', sForm.id, d) : create('stockMoves', d));

  const pFields = [
    { key: 'name', label: 'ชื่อสินค้า', required: true, wide: true },
    { key: 'kind', label: 'ประเภทสินค้า', type: 'select', required: true, default: 'bee', wide: true,
      options: [{ value: 'bee', label: 'ผลิตภัณฑ์ชันโรง (สบู่ น้ำผึ้ง ฯลฯ) — นับเป็นรายได้ธุรกิจชันโรง' }, { value: 'resale', label: 'ซื้อมาขายไป — นับเป็นธุรกิจซื้อมาขายไป' }] },
    { key: 'unit', label: 'หน่วยนับ', required: true, default: 'ชิ้น' },
    { key: 'icon', label: 'ไอคอน', type: 'select', options: icons, default: '🎁' },
    { key: 'priceWholesale', label: 'ราคาขายส่ง (บาท/หน่วย)', type: 'number', min: 0, required: true },
    { key: 'priceRetail', label: 'ราคาขายปลีก (บาท/หน่วย)', type: 'number', min: 0, required: true },
  ];
  const mFields = [
    { key: 'date', label: 'วันที่', type: 'date', required: true, default: today() },
    { key: 'productId', label: 'สินค้า', type: 'select', required: true, placeholder: 'เลือกสินค้า…',
      options: products.map((p) => ({ value: p.id, label: `${p.icon} ${p.name} · เหลือ ${p.stock}` })) },
    { key: 'type', label: 'ประเภท', type: 'select', required: true, default: 'in',
      options: [{ value: 'in', label: 'รับเข้าสต๊อก (ผลิต/ซื้อเพิ่ม เช่น ผลิตสบู่ 500 ก้อน)' }, { value: 'adjust', label: 'ปรับสต๊อก (+/−) เช่น ชำรุด สูญหาย' }] },
    { key: 'qty', label: 'จำนวน', type: 'number', required: true, hint: 'ปรับสต๊อกใส่ติดลบได้' },
    { key: 'unitCost', label: 'ต้นทุนต่อหน่วย (บาท)', type: 'number', min: 0, default: 0, hint: 'ใช้เฉพาะ "รับเข้า"', showIf: (v) => v.type === 'in' },
    { key: 'note', label: 'บันทึก', type: 'textarea' },
  ];

  const stockFor = (productId, editing) => {
    const p = products.find((x) => x.id === productId);
    if (!p) return 0;
    let s = p.stock;
    if (editing && editing.productId === productId) s += editing.type === 'sale' ? editing.qty : editing.type === 'in' || editing.type === 'adjust' ? -editing.qty : 0;
    return s;
  };
  const editMove = (r) => (r.type === 'sale' ? setSForm(r) : setMForm(r));

  const pCols = [
    { label: 'สินค้า', render: (r) => <span className="p-name"><span className="p-thumb ic">{r.icon}</span><b>{r.name}</b></span> },
    { label: 'ประเภท', render: (r) => <span className={`tag ${kindLabel[r.kind][1]}`}>{kindLabel[r.kind][0]}</span> },
    { label: 'ราคาส่ง / ปลีก', align: 'right', render: (r) => `${baht(r.priceWholesale)} / ${baht(r.priceRetail)}` },
    { label: 'รับเข้ารวม', align: 'right', render: (r) => num(r.inQty) },
    { label: 'ขายปลีก', align: 'right', render: (r) => `${num(r.soldRetail)} · ${baht(r.revRetail)}` },
    { label: 'ขายส่ง', align: 'right', render: (r) => `${num(r.soldWholesale)} · ${baht(r.revWholesale)}` },
    { label: 'คงเหลือในสต๊อก', render: (r) => (
      <div className="stock-bar" title={`${r.stock} / ${r.inQty + r.adj}`}>
        <div><i style={{ width: `${Math.max(0, Math.min(100, (r.stock / Math.max(1, r.inQty + r.adj)) * 100))}%` }} className={r.stock <= 10 ? 'low' : ''} /></div>
        <b>{num(r.stock)}</b> <small>/ {num(r.inQty + r.adj)} {r.unit}</small>
      </div>) },
    { label: '', align: 'right', render: (r) => <button className="link" onClick={() => setSForm({ productId: r.id })}>บันทึกการขาย</button> },
  ];
  const mCols = [
    { label: 'วันที่', render: (r) => fmtDate(r.date) },
    { label: 'สินค้า', render: (r) => r.productName },
    { label: 'ประเภท', render: (r) => <span className={`tag ${r.type === 'sale' ? 'blue' : r.type === 'in' ? 'green' : 'amber'}`}>{typeLabel[r.type]}{r.type === 'sale' && r.channel ? ` · ${chLabel[r.channel]}` : ''}</span> },
    { label: 'จำนวน', align: 'right', render: (r) => `${r.type === 'sale' ? '−' : r.type === 'adjust' && r.qty < 0 ? '' : '+'}${num(r.qty)} ${r.unit}` },
    { label: 'ราคา/หน่วย', align: 'right', render: (r) => (r.type === 'sale' ? baht(r.unitPrice) : '—') },
    { label: 'ยอดเงิน', align: 'right', render: (r) => (r.type === 'sale' ? baht(r.qty * r.unitPrice) : r.type === 'in' && r.unitCost ? `ทุน ${baht(r.qty * r.unitCost)}` : '—') },
    { label: 'บันทึก', render: (r) => <span className="muted">{r.note || '—'}</span> },
  ];

  return (
    <>
      <PageHead icon="🛍️" title="สินค้า / สต๊อก" desc="บันทึกผลิต/รับเข้า แล้วบันทึกยอดขายประจำวัน (ปลีก/ส่ง) ระบบตัดสต๊อกให้อัตโนมัติ — ไม่ใช่หน้าร้านขายของ">
        <button className="btn" onClick={() => demo('ส่งออกรายงานสต๊อกสินค้า (Excel / PDF)')}>⬇ ส่งออก</button>
        <button className="btn" onClick={() => setPForm({})}>＋ เพิ่มสินค้าใหม่</button>
        <button className="btn" onClick={() => setMForm({})}>＋ รับเข้า / ปรับสต๊อก</button>
        <button className="btn primary" onClick={() => setSForm({})}>＋ บันทึกการขาย</button>
      </PageHead>
      <div className="kpi-grid">
        <Kpi icon="🛍️" label="จำนวนสินค้า" value={products.length} />
        <Kpi icon="📦" label="ยอดขายรวม (หน่วย)" value={num(totals.sold)} tone="blue" />
        <Kpi icon="💰" label="ยอดเงินจากการขาย" value={baht(totals.revenue)} tone="blue" />
        <Kpi icon="🏷️" label="คงเหลือในสต๊อกรวม" value={num(totals.stock)} tone="amber" />
      </div>
      <Card title="รายการสินค้า">
        <DataTable cols={pCols} rows={products} onEdit={setPForm}
          onDelete={async (r) => {
            if (moves.some((m) => m.productId === r.id)) return demo('สินค้านี้มีประวัติสต๊อกแล้ว ลบไม่ได้ (ลบประวัติก่อน)');
            await remove('products', r.id);
          }} />
      </Card>
      <Card title="ประวัติรับเข้า / ขายออก">
        <DataTable cols={mCols} rows={[...moves].reverse()} onEdit={editMove} onDelete={(r) => remove('stockMoves', r.id)} />
      </Card>

      {pForm && <FormModal title={pForm.id ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'} fields={pFields} initial={pForm} onSave={savePro} onClose={() => setPForm(null)} />}
      {sForm && <SaleModal key={sForm.id ?? 'new'} init={sForm} products={products} stockFor={stockFor} onSave={saveSale} onClose={() => setSForm(null)} />}
      {mForm && (
        <FormModal key={mForm.id ?? 'new'} title={mForm.id ? 'แก้ไขรายการสต๊อก' : 'รับเข้า / ปรับสต๊อก'} fields={mFields} initial={mForm} onSave={(d) => saveMove({ ...d, unitPrice: 0, channel: '' })} onClose={() => setMForm(null)}
          validate={(v) => {
            if (!v.productId) return 'กรุณาเลือกสินค้า';
            if (v.type === 'in' && v.qty <= 0) return 'จำนวนต้องมากกว่า 0';
            const stock = stockFor(v.productId, mForm.id ? mForm : null);
            if (v.type === 'adjust' && stock + v.qty < 0) return `ปรับแล้วสต๊อกติดลบ (เหลือ ${stock})`;
            return '';
          }} />
      )}
    </>
  );
}
