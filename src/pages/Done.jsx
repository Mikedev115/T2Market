import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useData } from '../data.jsx';
import { baht, fmtDate } from '../lib/format.js';
import PublicShell from '../components/PublicShell.jsx';
import Icon from '../components/Icon.jsx';
import { enter } from '../lib/auth.js';
import { TOPICS } from './Booking.jsx';

export default function Done() {
  const { type, id } = useParams();
  const { db } = useData();
  const nav = useNavigate();
  const isOrder = type === 'order';
  const row = (isOrder ? db.orders : db.bookings).find((x) => x.id === id);
  if (!row) return <Navigate to="/" replace />;
  const steps = isOrder
    ? ['ส่งคำสั่งซื้อแล้ว', 'เจ้าหน้าที่ยืนยัน + ตัดสต๊อก (หลังบ้าน)', 'ชำระเงินและรับสินค้า']
    : ['ส่งคำขอจองแล้ว', 'เจ้าหน้าที่ยืนยันนัดหมาย (หลังบ้าน)', 'วันเข้าชม → บันทึกผลลงรายงาน'];
  const viewBack = () => { enter(); nav('/admin/orders'); };

  return (
    <PublicShell>
      <div className="flow narrow">
        <div className="flow-card done">
          <div className="done-ic"><Icon name="check" size={40} /></div>
          <h1>{isOrder ? 'ส่งคำสั่งซื้อเรียบร้อย' : 'ส่งคำขอจองเรียบร้อย'}</h1>
          <p className="muted">เลขที่อ้างอิง <b className="refno">{row.no}</b></p>
          <div className="done-sum">
            {isOrder ? (
              <>
                <ul className="sum-list">{row.items.map((i, k) => <li key={k}><span>{i.name} × {i.qty}</span><b>{baht(i.price * i.qty)}</b></li>)}</ul>
                <div className="sum-total"><span>รวมทั้งสิ้น</span><b>{baht(row.total)}</b></div>
                <p className="small muted">{row.delivery === 'ship' ? `จัดส่งที่ ${row.address}` : 'รับสินค้าที่สวน'} · ติดต่อ {row.name} {row.phone}</p>
              </>
            ) : (
              <ul className="sum-list">
                <li><span>หน่วยงาน</span><b>{row.org}</b></li>
                <li><span>วันที่เข้าชม</span><b>{fmtDate(row.visitDate)}</b></li>
                <li><span>จำนวน</span><b>{row.people} คน</b></li>
                <li><span>หัวข้อ</span><b>{row.topics.map((k) => TOPICS.find((t) => t[0] === k)?.[1]).join(', ')}</b></li>
              </ul>
            )}
          </div>
          <h3 className="next-h">ขั้นตอนต่อไป</h3>
          <ol className="timeline">{steps.map((s, i) => <li key={s} className={i === 0 ? 'done' : ''}><span>{i === 0 ? '✓' : i + 1}</span>{s}</li>)}</ol>
          <div className="done-actions">
            <Link className="btn lg" to="/">กลับหน้าแรก</Link>
            <button className="btn primary lg" onClick={viewBack}><Icon name="inbox" size={18} /> ดูฝั่งหลังบ้าน (เดโม)</button>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
