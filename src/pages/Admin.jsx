import { useState } from 'react';
import { NavLink, Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import TabBar from '../components/TabBar.jsx';
import { useData } from '../data.jsx';
import { isIn, leave } from '../lib/auth.js';

const NAV = [
  ['/admin', 'dashboard', 'ภาพรวม', 'ภาพรวม'],
  ['/admin/report', 'report', 'รายงาน', 'รายงานผลการดำเนินงาน'],
  ['/admin/orders', 'inbox', 'ออเดอร์', 'ออเดอร์ / การจอง'],
  ['/admin/hives', 'hive', 'ชันโรง', 'ชันโรง'],
  ['/admin/goats', 'paw', 'แพะ', 'แพะ'],
  ['/admin/visits', 'users', 'ดูงาน', 'ศึกษาดูงาน'],
  ['/admin/seedlings', 'sprout', 'เพาะชำ', 'เรือนเพาะชำ'],
  ['/admin/products', 'bag', 'สินค้า', 'สินค้า / ซื้อมาขายไป'],
  ['/admin/ledger', 'wallet', 'การเงิน', 'การเงิน'],
];
const TABS = ['/admin', '/admin/report', '/admin/hives', '/admin/seedlings'];

export default function AdminLayout() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const { db } = useData();
  const [sheet, setSheet] = useState(false);
  if (!isIn()) return <Navigate to="/login" replace />;
  const pending = db.orders.filter((o) => o.status === 'pending').length + db.bookings.filter((o) => o.status === 'pending').length;
  const logout = () => { leave(); nav('/login'); };
  const moreActive = !TABS.includes(pathname);
  const active = sheet || moreActive ? 4 : TABS.indexOf(pathname);

  const tabs = [
    ...TABS.map((to) => { const n = NAV.find((x) => x[0] === to); return { key: to, icon: n[1], label: n[2], onClick: () => { setSheet(false); nav(to); } }; }),
    { key: 'more', icon: 'more', label: 'เพิ่มเติม', badge: pending, onClick: () => setSheet(true) },
  ];

  return (
    <div className="admin">
      <aside className="side">
        <div className="side-brand">🌳 <div><b>Trees4All</b><small>ระบบหลังบ้าน</small></div></div>
        <nav>
          {NAV.map(([to, icon, , label]) => (
            <NavLink key={to} to={to} end={to === '/admin'} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon name={icon} size={20} />{label}{to === '/admin/orders' && pending > 0 && <em className="side-badge">{pending}</em>}
            </NavLink>
          ))}
        </nav>
        <button className="side-out" onClick={() => nav('/')}><Icon name="home" size={18} /> ดูหน้าบ้าน</button>
        <button className="side-out" onClick={logout}><Icon name="logout" size={18} /> ออกจากระบบ</button>
        <div className="side-foot">เดโม · ข้อมูลจำลอง<br />รีเฟรชหน้าจอ = รีเซ็ต</div>
      </aside>

      <main className="main" key={pathname}><Outlet /></main>

      <TabBar tabs={tabs} active={active} />

      {sheet && (
        <div className="sheet-wrap" onClick={() => setSheet(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-grip" />
            <div className="sheet-grid">
              {NAV.filter((n) => !TABS.includes(n[0])).map(([to, icon, , label]) => (
                <button key={to} className={pathname === to ? 'on' : ''} onClick={() => { setSheet(false); nav(to); }}>
                  <span><Icon name={icon} />{to === '/admin/orders' && pending > 0 && <em className="tab-badge">{pending}</em>}</span>{label}
                </button>
              ))}
              <button onClick={() => { setSheet(false); nav('/'); }}><span><Icon name="home" /></span>หน้าบ้าน</button>
              <button className="out" onClick={logout}><span><Icon name="logout" /></span>ออกจากระบบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
