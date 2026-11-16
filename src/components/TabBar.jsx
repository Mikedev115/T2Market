import Icon from './Icon.jsx';

// Bottom tab bar (mobile). A single pill slides to the active tab with a springy easing.
export default function TabBar({ tabs, active }) {
  return (
    <nav className="tabbar" aria-label="เมนูหลัก" style={{ '--n': tabs.length, '--i': Math.max(active, 0) }}>
      <span className={`tab-pill ${active < 0 ? 'hide' : ''}`} />
      {tabs.map((t, i) => (
        <button key={t.key} className={`tab ${i === active ? 'active' : ''}`} onClick={t.onClick}>
          <span className="tab-ic">
            <Icon name={t.icon} />
            {t.badge > 0 && <em className="tab-badge">{t.badge}</em>}
          </span>
          <span className="tab-label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
