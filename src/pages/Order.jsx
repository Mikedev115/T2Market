import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useData } from '../data.jsx';
import { productReport, seedReport } from '../lib/calc.js';
import { num, baht, today } from '../lib/format.js';
import PublicShell from '../components/PublicShell.jsx';
import Photo from '../components/Photo.jsx';
import Icon from '../components/Icon.jsx';

const photoKey = (p) => (p.kind === 'resale' ? (/ข้าว/.test(p.name) ? 'rice' : /น้ำตาล|มะพร้าว/.test(p.name) ? 'sugar' : 'resale') : /สบู่/.test(p.name) ? 'soap' : 'honey');
const yymmdd = (d) => d.replaceAll('-', '').slice(2);

export default function Order() {
  const { db, create } = useData();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const items = useMemo(() => {
    const p = productReport(db.products, db.stockMoves).products.filter((x) => x.stock > 0)
      .map((x) => ({ key: `product:${x.id}`, kind: 'product', refId: x.id, name: x.name, unit: x.unit, price: x.price, max: x.stock, photo: photoKey(x), src: x.photos?.[0] }));
    const s = seedReport(db.seedBatches, db.seedSales).batches.filter((b) => b.available > 0)
      .map((b) => ({ key: `seed:${b.id}`, kind: 'seed', refId: b.id, name: `กล้า${b.species}`, unit: 'ต้น', price: b.price || 20, max: b.available, photo: 'nursery' }));
    return [...p, ...s];
  }, [db]);
  const pre = sp.get('item');
  const [qty, setQty] = useState(() => (pre && items.some((i) => i.key === pre) ? { [pre]: 1 } : {}));
  const [f, setF] = useState({ name: '', phone: '', delivery: 'pickup', address: '', note: '' });
  const [err, setErr] = useState('');
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const change = (it, d) => setQty((q) => { const n = Math.max(0, Math.min(it.max, (q[it.key] || 0) + d)); const o = { ...q }; if (n) o[it.key] = n; else delete o[it.key]; return o; });
  const lines = items.filter((i) => qty[i.key]);
  const total = lines.reduce((s, i) => s + i.price * qty[i.key], 0);

  const submit = async (e) => {
    e.preventDefault();
    if (!lines.length) return setErr('กรุณาเลือกสินค้าอย่างน้อย 1 รายการ');
    if (!f.name.trim()) return setErr('กรุณากรอกชื่อผู้สั่งซื้อ');
    if (f.phone.replace(/\D/g, '').length < 9) return setErr('กรุณากรอกเบอร์โทรให้ถูกต้อง');
    if (f.delivery === 'ship' && !f.address.trim()) return setErr('กรุณากรอกที่อยู่จัดส่ง');
    const no = `T4A-${yymmdd(today())}-${String(db.orders.filter((o) => o.date === today()).length + 1).padStart(2, '0')}`;
    const row = await create('orders', {
      no, date: today(), ...f, items: lines.map((i) => ({ kind: i.kind, refId: i.refId, name: i.name, unit: i.unit, qty: qty[i.key], price: i.price })), total, status: 'pending', applied: false,
    });
    nav(`/done/order/${row.id}`);
  };

  return (
    <PublicShell>
      <div className="flow">
        <Link to="/" className="crumb">← กลับหน้าแรก</Link>
        <h1>สั่งซื้อสินค้า</h1>
        <p className="muted">เลือกสินค้าและกรอกข้อมูล เจ้าหน้าที่จะติดต่อกลับเพื่อยืนยันและแจ้งการชำระเงิน</p>
        <form onSubmit={submit} className="flow-grid">
          <div className="flow-main">
            <div className="flow-card">
              <h2><span className="step">1</span> เลือกสินค้า</h2>
              <div className="pick-list">
                {items.map((it) => (
                  <div key={it.key} className={`pick ${qty[it.key] ? 'on' : ''}`}>
                    <div className="pick-img"><Photo name={it.photo} src={it.src} /></div>
                    <div className="pick-info"><b>{it.name}</b><small>{baht(it.price)} / {it.unit} · เหลือ {num(it.max)}</small></div>
                    <div className="stepper">
                      <button type="button" onClick={() => change(it, -1)} disabled={!qty[it.key]} aria-label="ลด">−</button>
                      <span>{qty[it.key] || 0}</span>
                      <button type="button" onClick={() => change(it, 1)} disabled={(qty[it.key] || 0) >= it.max} aria-label="เพิ่ม">＋</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flow-card">
              <h2><span className="step">2</span> ข้อมูลผู้สั่งซื้อ</h2>
              <div className="form-grid">
                <label className="field"><span>ชื่อ-นามสกุล <i>*</i></span><input value={f.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" /></label>
                <label className="field"><span>เบอร์โทร <i>*</i></span><input value={f.phone} inputMode="tel" onChange={(e) => set('phone', e.target.value)} autoComplete="tel" /></label>
                <div className="field wide"><span>การรับสินค้า</span>
                  <div className="seg2">
                    <button type="button" className={f.delivery === 'pickup' ? 'on' : ''} onClick={() => set('delivery', 'pickup')}>🏡 รับที่สวน</button>
                    <button type="button" className={f.delivery === 'ship' ? 'on' : ''} onClick={() => set('delivery', 'ship')}>📦 จัดส่ง</button>
                  </div>
                </div>
                {f.delivery === 'ship' && <label className="field wide"><span>ที่อยู่จัดส่ง <i>*</i></span><textarea rows={3} value={f.address} onChange={(e) => set('address', e.target.value)} /></label>}
                <label className="field wide"><span>หมายเหตุ</span><textarea rows={2} value={f.note} onChange={(e) => set('note', e.target.value)} /></label>
              </div>
            </div>
          </div>
          <aside className="flow-side">
            <div className="flow-card sticky">
              <h2>สรุปรายการ</h2>
              {lines.length === 0 ? <p className="muted">ยังไม่ได้เลือกสินค้า</p> : (
                <ul className="sum-list">{lines.map((i) => <li key={i.key}><span>{i.name} × {qty[i.key]}</span><b>{baht(i.price * qty[i.key])}</b></li>)}</ul>
              )}
              <div className="sum-total"><span>รวมทั้งสิ้น</span><b>{baht(total)}</b></div>
              {err && <div className="form-err">{err}</div>}
              <button className="btn primary block lg">ส่งคำสั่งซื้อ</button>
              <p className="muted small center">ยังไม่มีการชำระเงินในขั้นตอนนี้</p>
            </div>
          </aside>
        </form>
      </div>
    </PublicShell>
  );
}
