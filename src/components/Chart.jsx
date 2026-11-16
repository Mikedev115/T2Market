import { useEffect, useId, useRef, useState } from 'react';

const fmt = (v) => (Number.isInteger(v) ? v.toLocaleString('th-TH') : v.toLocaleString('th-TH', { maximumFractionDigits: 1 }));

function useWidth() {
  const ref = useRef(null);
  const [w, setW] = useState(600);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const set = () => setW(Math.max(250, Math.round(el.clientWidth || 600)));
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

/* Bar / smooth-line chart. Draws at the real pixel width so text stays readable on phones. */
export default function Chart({ labels, values, type = 'bar', color = '#16a34a', unit = '', height = 220 }) {
  const gid = useId().replace(/:/g, '');
  const [ref, W] = useWidth();
  const [hover, setHover] = useState(null);
  if (!values.length) return <div className="empty">ยังไม่มีข้อมูล</div>;
  const small = W < 420;
  const H = small ? Math.min(height, 200) : height;
  const pl = small ? 34 : 42, pr = 10, pt = 26, pb = 30;
  const hi = Math.max(...values, 1), lo = Math.min(...values, 0);
  const mag = Math.pow(10, Math.floor(Math.log10(Math.max(hi, 1))));
  const max = Math.ceil((hi / mag) * 1.15 * 2) / 2 * mag || 1;
  const min = lo < 0 ? -Math.ceil((-lo / mag) * 1.15 * 2) / 2 * mag : 0;
  const step = (W - pl - pr) / values.length;
  const x = (i) => pl + (i + 0.5) * step;
  const y = (v) => pt + (1 - (v - min) / (max - min)) * (H - pt - pb);
  const bw = Math.min(44, step * 0.58);
  const every = Math.max(1, Math.ceil(46 / step));
  const ticks = [min, (min + max) / 2, max];
  let d = `M${x(0)},${y(values[0])}`;
  for (let i = 1; i < values.length; i++) {
    const mx = (x(i - 1) + x(i)) / 2;
    d += ` C${mx},${y(values[i - 1])} ${mx},${y(values[i])} ${x(i)},${y(values[i])}`;
  }
  const base = y(Math.max(min, 0));
  const tx = hover === null ? 0 : Math.min(Math.max(x(hover), 48), W - 48);
  const ty = hover === null ? 0 : Math.max(y(values[hover]) - 46, 2);
  return (
    <div ref={ref} className="chart-box">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="chart" role="img" onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id={`b${gid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} /><stop offset="1" stopColor={color} stopOpacity=".55" /></linearGradient>
          <linearGradient id={`a${gid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".35" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} stroke="#dfe9dc" strokeDasharray="3 5" />
            <text x={pl - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#6b8570">{fmt(t)}</text>
          </g>
        ))}
        {type === 'bar' && values.map((v, i) => (
          <rect key={i} className="bar" style={{ animationDelay: `${i * 60}ms` }} x={x(i) - bw / 2} y={Math.min(y(v), base)} width={bw} height={Math.abs(base - y(v))} rx="7"
            fill={`url(#b${gid})`} opacity={hover === null || hover === i ? 1 : 0.55} />
        ))}
        {type === 'line' && (
          <>
            <path d={`${d} L${x(values.length - 1)},${base} L${x(0)},${base} Z`} fill={`url(#a${gid})`} />
            <path d={d} className="line" pathLength="1" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
            {values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={hover === i ? 6.5 : step < 26 ? 3.2 : 4.5} fill="#fff" stroke={color} strokeWidth="2.4" />)}
          </>
        )}
        {type === 'bar' && step >= 34 && values.map((v, i) => (
          <text key={i} x={x(i)} y={y(v) - 7} textAnchor="middle" fontSize="11" fontWeight="600" fill="#14532d">{fmt(v)}</text>
        ))}
        {labels.map((l, i) => (i % every === 0 ? <text key={i} x={x(i)} y={H - 9} textAnchor="middle" fontSize="11" fill="#6b8570">{l}</text> : null))}
        {values.map((_, i) => (
          <rect key={i} x={pl + i * step} y={0} width={step} height={H} fill="transparent" onMouseEnter={() => setHover(i)} onTouchStart={() => setHover(i)} onClick={() => setHover(i)} />
        ))}
        {hover !== null && (
          <g pointerEvents="none">
            <rect x={tx - 46} y={ty} width="92" height="34" rx="9" fill="#14532d" />
            <text x={tx} y={ty + 15} textAnchor="middle" fontSize="10.5" fill="#bbf7d0">{labels[hover]}</text>
            <text x={tx} y={ty + 28} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">{fmt(values[hover])} {unit}</text>
          </g>
        )}
        {unit && <text x={W - pr} y={12} textAnchor="end" fontSize="11" fill="#6b8570">{unit}</text>}
      </svg>
    </div>
  );
}

/* Donut with legend. items: [{label, value, color}] */
export function Donut({ items, centerValue, centerLabel, size = 168 }) {
  const total = items.reduce((s, i) => s + i.value, 0);
  const r = 54, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="donut">
      <svg viewBox="0 0 140 140" width={size} height={size} role="img" className="donut-svg">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#eef3e8" strokeWidth="18" />
        {total > 0 && items.map((it, i) => {
          const len = (it.value / total) * c;
          const el = <circle key={i} cx="70" cy="70" r={r} fill="none" stroke={it.color} strokeWidth="18" strokeDasharray={`${Math.max(len - 2, 0)} ${c}`} strokeDashoffset={-acc} transform="rotate(-90 70 70)" className="seg" />;
          acc += len;
          return el;
        })}
        <text x="70" y="68" textAnchor="middle" fontSize="19" fontWeight="700" fill="#14532d">{centerValue}</text>
        <text x="70" y="85" textAnchor="middle" fontSize="9.5" fill="#6b8570">{centerLabel}</text>
      </svg>
      <ul className="legend">
        {items.map((it) => (<li key={it.label}><i style={{ background: it.color }} />{it.label}<b>{fmt(it.value)}</b></li>))}
      </ul>
    </div>
  );
}

/* Circular progress. */
export function Ring({ value, size = 64, color = '#16a34a', label }) {
  const v = Math.max(0, Math.min(100, value ?? 0));
  const r = 26, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} role="img" aria-label={label}>
      <circle cx="32" cy="32" r={r} fill="none" stroke="#e8f0e3" strokeWidth="7" />
      <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${(v / 100) * c} ${c}`} transform="rotate(-90 32 32)" className="seg" />
      <text x="32" y="37" textAnchor="middle" fontSize="15" fontWeight="700" fill="#14532d">{value === null || value === undefined ? '–' : `${Math.round(v)}%`}</text>
    </svg>
  );
}

/* Target vs actual horizontal bars (responsive HTML). */
export function CompareBars({ rows, color = '#16a34a' }) {
  return (
    <div className="cmp">
      {rows.map((r) => {
        const top = Math.max(r.target || 0, r.actual || 0, 1);
        return (
          <div key={r.label} className="cmp-row">
            <div className="cmp-top"><span>{r.label}</span><b>{fmt(r.actual)} <small>/ {r.target ? fmt(r.target) : '–'} {r.unit}</small></b></div>
            <div className="cmp-track">
              {r.target > 0 && <i className="cmp-target" style={{ width: `${(r.target / top) * 100}%` }} />}
              <i className="cmp-actual" style={{ width: `${((r.actual || 0) / top) * 100}%`, background: color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
