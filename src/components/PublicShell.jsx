import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import TabBar from './TabBar.jsx';
import { isIn } from '../lib/auth.js';

const SECTIONS = ['top', 'activities', 'products', 'gallery'];

export function useGoSection() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  return (id) => {
    const run = () => (id === 'top' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    if (pathname !== '/') { nav('/'); setTimeout(run, 120); } else run();
  };
}

export default function PublicShell({ children }) {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const go = useGoSection();
  const [spy, setSpy] = useState(0);

  useEffect(() => {
    if (pathname !== '/') return undefined;
    const onScroll = () => {
      let cur = 0;
      SECTIONS.slice(1).forEach((id, i) => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < window.innerHeight * 0.45) cur = i + 1; });
      setSpy(cur);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  const tabs = [
    { key: 'top', icon: 'home', label: 'หน้าแรก', onClick: () => go('top') },
    { key: 'activities', icon: 'hive', label: 'กิจกรรม', onClick: () => go('activities') },
    { key: 'products', icon: 'bag', label: 'สินค้า', onClick: () => go('products') },
    { key: 'gallery', icon: 'image', label: 'ภาพ', onClick: () => go('gallery') },
    { key: 'admin', icon: 'lock', label: 'หลังบ้าน', onClick: () => nav(isIn() ? '/admin' : '/login') },
  ];

  return (
    <div className="public">
      <header className="pub-nav">
        <button className="brand" onClick={() => go('top')}>🌳 <b>Trees4All</b> <span>ต้นไม้ของเรา รักษ์สันติสุข</span></button>
        <nav>
          <button className="navlink" onClick={() => go('activities')}>กิจกรรม</button>
          <button className="navlink" onClick={() => go('products')}>สินค้า</button>
          <button className="navlink" onClick={() => go('gallery')}>ภาพกิจกรรม</button>
          <Link className="btn primary sm nowrap" to="/booking">จองศึกษาดูงาน</Link>
        </nav>
      </header>
      {children}
      <footer className="pub-foot">🌳 วิสาหกิจชุมชนต้นไม้ของเรา รักษ์สันติสุข · โครงการ Trees4All<br /><small>ตัวอย่างหน้าเว็บ (เดโม)</small></footer>
      <TabBar tabs={tabs} active={pathname === '/' ? spy : -1} />
    </div>
  );
}
