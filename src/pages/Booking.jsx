import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../data.jsx';
import { today } from '../lib/format.js';
import PublicShell from '../components/PublicShell.jsx';
import Photo from '../components/Photo.jsx';

export const TOPICS = [['hive', 'ชันโรง', 'hive'], ['goat', 'แพะ', 'goat'], ['nursery', 'เรือนเพาะชำ', 'nursery'], ['product', 'ผลิตภัณฑ์แปรรูป', 'soap']];
const yymmdd = (d) => d.replaceAll('-', '').slice(2);

export default function Booking() {
  const { db, create } = useData();
  const nav = useNavigate();
  const [f, setF] = useState({ org: '', contact: '', phone: '', visitDate: '', people: '', topics: ['hive'], note: '' });
  const [err, setErr] = useState('');
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const toggle = (k) => set('topics', f.topics.includes(k) ? f.topics.filter((x) => x !== k) : [...f.topics, k]);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const submit = async (e) => {
    e.preventDefault();
    if (!f.org.trim()) return setErr('กรุณากรอกชื่อหน่วยงาน / คณะ');
    if (!f.contact.trim()) return setErr('กรุณากรอกชื่อผู้ประสานงาน');
    if (f.phone.replace(/\D/g, '').length < 9) return setErr('กรุณากรอกเบอร์โทรให้ถูกต้อง');
    if (!f.visitDate) return setErr('กรุณาเลือกวันที่ต้องการเข้าชม');
    if (!(Number(f.people) > 0)) return setErr('กรุณาระบุจำนวนผู้เข้าชม');
    if (!f.topics.length) return setErr('กรุณาเลือกหัวข้อที่สนใจอย่างน้อย 1 หัวข้อ');
    const no = `BK-${yymmdd(today())}-${String(db.bookings.filter((o) => o.date === today()).length + 1).padStart(2, '0')}`;
    const row = await create('bookings', { no, date: today(), ...f, people: Number(f.people), status: 'pending' });
    nav(`/done/booking/${row.id}`);
  };

  return (
    <PublicShell>
      <div className="flow narrow">
        <Link to="/" className="crumb">← กลับหน้าแรก</Link>
        <div className="flow-banner"><Photo name="visit" /><div><h1>จองศึกษาดูงาน</h1><p>เรียนรู้ชันโรง แพะ เรือนเพาะชำ และการแปรรูปกับเกษตรกรตัวจริง</p></div></div>
        <form onSubmit={submit} className="flow-card">
          <div className="form-grid">
            <label className="field wide"><span>ชื่อหน่วยงาน / คณะ <i>*</i></span><input value={f.org} onChange={(e) => set('org', e.target.value)} /></label>
            <label className="field"><span>ผู้ประสานงาน <i>*</i></span><input value={f.contact} onChange={(e) => set('contact', e.target.value)} /></label>
            <label className="field"><span>เบอร์โทร <i>*</i></span><input value={f.phone} inputMode="tel" onChange={(e) => set('phone', e.target.value)} /></label>
            <label className="field"><span>วันที่ต้องการเข้าชม <i>*</i></span><input type="date" min={tomorrow} value={f.visitDate} onChange={(e) => set('visitDate', e.target.value)} /></label>
            <label className="field"><span>จำนวนผู้เข้าชม (คน) <i>*</i></span><input type="number" min="1" inputMode="numeric" value={f.people} onChange={(e) => set('people', e.target.value)} /></label>
            <div className="field wide"><span>หัวข้อที่สนใจ</span>
              <div className="topic-grid">
                {TOPICS.map(([k, l, ph]) => (
                  <button type="button" key={k} className={`topic ${f.topics.includes(k) ? 'on' : ''}`} onClick={() => toggle(k)}>
                    <Photo name={ph} /><span>{f.topics.includes(k) ? '✓ ' : ''}{l}</span>
                  </button>
                ))}
              </div>
            </div>
            <label className="field wide"><span>หมายเหตุ</span><textarea rows={3} value={f.note} onChange={(e) => set('note', e.target.value)} /></label>
          </div>
          {err && <div className="form-err">{err}</div>}
          <button className="btn primary block lg" style={{ marginTop: 16 }}>ส่งคำขอจอง</button>
        </form>
      </div>
    </PublicShell>
  );
}
