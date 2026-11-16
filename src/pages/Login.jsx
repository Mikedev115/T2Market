import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import Illustration from '../components/Illustration.jsx';
import { useDemo } from '../components/ui.jsx';
import { enter } from '../lib/auth.js';

export default function Login() {
  const nav = useNavigate();
  const demo = useDemo();
  const [show, setShow] = useState(false);

  const go = () => { enter(); nav('/admin'); };
  return (
    <div className="login">
      <div className="login-art">
        <div className="login-brand">🌳 <b>Trees4All</b></div>
        <h2>ระบบรายงานผลการดำเนินงาน</h2>
        <p>วิสาหกิจชุมชนต้นไม้ของเรา รักษ์สันติสุข<br />ติดตามชันโรง แพะ ศึกษาดูงาน เรือนเพาะชำ และซื้อมาขายไป ในที่เดียว</p>
        <Illustration />
      </div>
      <div className="login-panel">
        <form className="login-card" onSubmit={(e) => { e.preventDefault(); demo('เข้าสู่ระบบด้วยบัญชีผู้ใช้ — กดปุ่ม "เข้าชมระบบ" เพื่อดูตัวอย่างได้เลย'); }}>
          <div className="login-logo">🌳</div>
          <h1>เข้าสู่ระบบ</h1>
          <p className="muted">สำหรับเจ้าหน้าที่ผู้ดูแลระบบหลังบ้าน</p>
          <label className="lf"><span>ชื่อผู้ใช้</span>
            <div className="lf-box"><Icon name="user" size={18} /><input placeholder="ชื่อผู้ใช้" autoComplete="username" /></div>
          </label>
          <label className="lf"><span>รหัสผ่าน</span>
            <div className="lf-box"><Icon name="lock" size={18} /><input type={show ? 'text' : 'password'} placeholder="รหัสผ่าน" autoComplete="current-password" />
              <button type="button" className="eye" onClick={() => setShow(!show)} aria-label="แสดงรหัสผ่าน"><Icon name="eye" size={18} /></button></div>
          </label>
          <div className="login-row">
            <label className="remember"><input type="checkbox" defaultChecked /> จดจำฉันไว้</label>
            <button type="button" className="link" onClick={() => demo('ลืมรหัสผ่าน')}>ลืมรหัสผ่าน?</button>
          </div>
          <button className="btn primary block lg">เข้าสู่ระบบ</button>
          <div className="or"><span>หรือ</span></div>
          <button type="button" className="btn block lg enter" onClick={go}><Icon name="eye" size={20} /> เข้าชมระบบ (เดโม)</button>
          <p className="muted small center">ไม่มีการสมัครสมาชิก · หากต้องการบัญชีโปรดติดต่อผู้ดูแลระบบ</p>
          <Link to="/" className="back">← กลับหน้าบ้าน</Link>
        </form>
      </div>
    </div>
  );
}
