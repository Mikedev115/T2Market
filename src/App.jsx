import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import PublicSite from './pages/PublicSite.jsx';
import Login from './pages/Login.jsx';
import AdminLayout from './pages/Admin.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Report from './pages/Report.jsx';
import Hives from './pages/Hives.jsx';
import Visits from './pages/Visits.jsx';
import Seedlings from './pages/Seedlings.jsx';
import Goats from './pages/Goats.jsx';
import Products from './pages/Products.jsx';
import Ledger from './pages/Ledger.jsx';
import Orders from './pages/Orders.jsx';
import Order from './pages/Order.jsx';
import Booking from './pages/Booking.jsx';
import Done from './pages/Done.jsx';
import { isIn } from './lib/auth.js';

// Floating switch between the public site (หน้าบ้าน) and back office (หลังบ้าน).
function ModeSwitch() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  if (pathname === '/login') return null;
  const isAdmin = pathname.startsWith('/admin');
  return (
    <div className={`mode-switch ${isAdmin ? 'in-admin' : ''}`} role="tablist" aria-label="สลับโหมด">
      <button className={!isAdmin ? 'on' : ''} onClick={() => nav('/')}>🏡 หน้าบ้าน</button>
      <button className={isAdmin ? 'on' : ''} onClick={() => nav(isIn() ? '/admin' : '/login')}>🔧 หลังบ้าน</button>
    </div>
  );
}

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollTop />
      <ModeSwitch />
      <Routes>
        <Route path="/" element={<PublicSite />} />
        <Route path="/login" element={<Login />} />
        <Route path="/order" element={<Order />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/done/:type/:id" element={<Done />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="report" element={<Report />} />
          <Route path="hives" element={<Hives />} />
          <Route path="goats" element={<Goats />} />
          <Route path="visits" element={<Visits />} />
          <Route path="seedlings" element={<Seedlings />} />
          <Route path="products" element={<Products />} />
          <Route path="ledger" element={<Ledger />} />
          <Route path="orders" element={<Orders />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
