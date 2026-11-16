import { useState } from 'react';
import { useData } from '../data.jsx';
import { productReport, seedReport } from '../lib/calc.js';
import { baht, fmtDate, today } from '../lib/format.js';
import { PageHead, Card, FormModal, useDemo } from '../components/ui.jsx';
import Icon from '../components/Icon.jsx';
import { TOPICS } from './Booking.jsx';

const OS = { pending: ['รอยืนยัน', 'amber'], confirmed: ['ยืนยันแล้ว', 'blue'], done: ['เสร็จสิ้น', 'green'], cancelled: ['ยกเลิก', 'red'] };
const BS = { pending: ['รอยืนยัน', 'amber'], confirmed: ['นัดหมายแล้ว', 'blue'], done: ['เข้าชมแล้ว', 'green'], cancelled: ['ปฏิเสธ', 'red'] };

export default function Orders() {
  const { db, create, update } = useData();
  const demo = useDemo();
  const [tab, setTab] = useState('orders');
  const [finish, setFinish] = useState(null);
  const orders = [...db.orders].sort((a, b) => (a.no < b.no ? 1 : -1));
  const bookings = [...db.bookings].sort((a, b) => (a.no < b.no ? 1 : -1));
  const pO = orders.filter((o) => o.status === 'pending').length;
  const pB = bookings.filter((o) => o.status === 'pending').length;

  const confirmOrder = async (o) => {
    const prod = productReport(db.products, db.stockMoves).products;
    const seed = seedReport(db.seedBatches, db.seedSales).batches;
    for (const it of o.items) {
      const left = it.kind === 'product' ? prod.find((p) => p.id === it.refId)?.stock : seed.find((b) => b.id === it.refId)?.available;
      if ((left ?? 0) < it.qty) return demo(`สต๊อกไม่พอสำหรับ "${it.name}" (เหลือ ${left ?? 0}) — ยืนยันไม่ได้`);
    }
    for (const it of o.items) {
      if (it.kind === 'product') await create('stockMoves', { date: today(), productId: it.refId, type: 'sale', qty: it.qty, unitPrice: it.price, unitCost: 0, note: `ออเดอร์ ${o.no}` });
      else await create('seedSales', { date: today(), batchId: it.refId, kind: 'sale', qty: it.qty, unitPrice: it.price, buyer: `${o.name} (${o.no})` });
    }
    await update('orders', o.id, { status: 'confirmed', applied: true });
  };

  const finishFields = [
    { key: 'people', label: 'จำนวนผู้เข้าชมจริง (คน)', type: 'number', min: 1, required: true },
    { key: 'income', label: 'รายได้ค่าบริการ (บาท)', type: 'number', min: 0, default: 0 },
    { key: 'expense', label: 'ต้นทุนจัดกิจกรรม (บาท)', type: 'number', min: 0, default: 0 },
  ];

  const Btn = ({ children, onClick, kind = '' }) => <button className={`btn sm ${kind}`} onClick={onClick}>{children}</button>;

  return (
    <>
      <PageHead icon="📥" title="ออเดอร์ / การจอง" desc="คำสั่งซื้อและคำขอจองศึกษาดูงานที่ส่งมาจากหน้าบ้าน — ยืนยันแล้วระบบตัดสต๊อก / บันทึกลงรายงานให้อัตโนมัติ" />
      <div className="seg2 big">
        <button className={tab === 'orders' ? 'on' : ''} onClick={() => setTab('orders')}>ออเดอร์สินค้า {pO > 0 && <em>{pO}</em>}</button>
        <button className={tab === 'bookings' ? 'on' : ''} onClick={() => setTab('bookings')}>จองศึกษาดูงาน {pB > 0 && <em>{pB}</em>}</button>
      </div>

      {tab === 'orders' && (
        <div className="req-list">
          {orders.length === 0 && <Card><p className="empty">ยังไม่มีออเดอร์</p></Card>}
          {orders.map((o) => (
            <Card key={o.id} className="req">
              <div className="req-head"><b>{o.no}</b><span className={`tag ${OS[o.status][1]}`}>{OS[o.status][0]}</span><small className="muted">{fmtDate(o.date)}</small></div>
              <div className="req-who"><b>{o.name}</b><a href={`tel:${o.phone}`} className="link"><Icon name="phone" size={14} /> {o.phone}</a><span className="tag">{o.delivery === 'ship' ? '📦 จัดส่ง' : '🏡 รับที่สวน'}</span></div>
              {o.delivery === 'ship' && <p className="small muted">{o.address}</p>}
              <ul className="sum-list">{o.items.map((i, k) => <li key={k}><span>{i.name} × {i.qty} {i.unit}</span><b>{baht(i.qty * i.price)}</b></li>)}</ul>
              <div className="sum-total"><span>รวม</span><b>{baht(o.total)}</b></div>
              {o.note && <p className="small muted">📝 {o.note}</p>}
              <div className="req-actions">
                {o.status === 'pending' && <><Btn kind="primary" onClick={() => confirmOrder(o)}>✓ ยืนยัน + ตัดสต๊อก</Btn><Btn onClick={() => update('orders', o.id, { status: 'cancelled' })}>ยกเลิก</Btn></>}
                {o.status === 'confirmed' && <Btn kind="primary" onClick={() => update('orders', o.id, { status: 'done' })}>ส่งมอบแล้ว / เสร็จสิ้น</Btn>}
                {o.applied && <small className="muted">ตัดสต๊อกแล้ว</small>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'bookings' && (
        <div className="req-list">
          {bookings.length === 0 && <Card><p className="empty">ยังไม่มีการจอง</p></Card>}
          {bookings.map((b) => (
            <Card key={b.id} className="req">
              <div className="req-head"><b>{b.no}</b><span className={`tag ${BS[b.status][1]}`}>{BS[b.status][0]}</span><small className="muted">ส่งเมื่อ {fmtDate(b.date)}</small></div>
              <div className="req-who"><b>{b.org}</b><span className="muted">ผู้ประสานงาน {b.contact}</span><a href={`tel:${b.phone}`} className="link"><Icon name="phone" size={14} /> {b.phone}</a></div>
              <div className="req-meta"><span><Icon name="calendar" size={16} /> {fmtDate(b.visitDate)}</span><span><Icon name="users" size={16} /> {b.people} คน</span><span>{b.topics.map((k) => TOPICS.find((t) => t[0] === k)?.[1]).join(' · ')}</span></div>
              {b.note && <p className="small muted">📝 {b.note}</p>}
              <div className="req-actions">
                {b.status === 'pending' && <><Btn kind="primary" onClick={() => update('bookings', b.id, { status: 'confirmed' })}>✓ ยืนยันนัดหมาย</Btn><Btn onClick={() => update('bookings', b.id, { status: 'cancelled' })}>ปฏิเสธ</Btn></>}
                {b.status === 'confirmed' && <Btn kind="primary" onClick={() => setFinish(b)}>เข้าชมแล้ว → บันทึกลงรายงาน</Btn>}
                {b.status === 'done' && <small className="muted">บันทึกลงงานศึกษาดูงานแล้ว</small>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {finish && (
        <FormModal title={`บันทึกผล: ${finish.org}`} fields={finishFields} initial={{ people: finish.people }} onClose={() => setFinish(null)}
          onSave={async (v) => {
            await create('visits', { date: finish.visitDate <= today() ? finish.visitDate : today(), org: finish.org, people: v.people, income: v.income, expense: v.expense, note: `จากการจอง ${finish.no}`, photos: [] });
            await update('bookings', finish.id, { status: 'done' });
          }} />
      )}
    </>
  );
}
