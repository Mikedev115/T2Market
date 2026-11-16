// Shared cartoon parts used by the hero illustration and the placeholder photo scenes.
export const Sun = ({ x = 330, y = 52, r = 24 }) => (
  <g><circle cx={x} cy={y} r={r * 2} fill="#fff6bf" opacity=".45" /><circle cx={x} cy={y} r={r * 1.4} fill="#ffe27a" opacity=".6" /><circle cx={x} cy={y} r={r} fill="#ffd23f" />
    <circle cx={x - r * .3} cy={y - r * .3} r={r * .35} fill="#fff" opacity=".35" /></g>
);
export const Cloud = ({ x, y, s = 1, o = 0.95 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <ellipse cx="0" cy="4" rx="32" ry="11" fill="#fff" /><ellipse cx="-16" cy="-4" rx="17" ry="13" fill="#fff" /><ellipse cx="9" cy="-9" rx="20" ry="15" fill="#fff" /><ellipse cx="22" cy="0" rx="14" ry="10" fill="#fff" />
  </g>
);
export const Hills = ({ c1 = '#a8dc7e', c2 = '#86c85f', y = 168 }) => (
  <g><path d={`M0 ${y} Q80 ${y - 62} 190 ${y - 14} T400 ${y - 26} V260 H0Z`} fill={c1} /><path d={`M0 ${y + 34} Q130 ${y - 8} 250 ${y + 22} T400 ${y + 8} V260 H0Z`} fill={c2} /></g>
);
export const Flower = ({ x, y, c = '#ff7aa8', s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 0v16" stroke="#3c9a4e" strokeWidth="2.4" strokeLinecap="round" /><path d="M0 12q-7-2-8-8 6 0 8 8z" fill="#4db862" />
    {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={5.5 * Math.cos((a * Math.PI) / 180)} cy={-5.5 * Math.sin((a * Math.PI) / 180)} r="3.6" fill={c} />)}
    <circle cx="0" cy="0" r="3" fill="#ffd23f" />
  </g>
);
export const Grass = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke="#4aa655" strokeWidth="2.4" strokeLinecap="round" fill="none"><path d="M0 0q-2-9-6-12M0 0q0-11 1-15M0 0q3-9 7-11" /></g>
);
export const Tree = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="2" rx="34" ry="6" fill="#000" opacity=".1" />
    <path d="M-9 0c3-26 2-48-3-68h24c-5 20-6 42-3 68z" fill="#8a5a33" /><path d="M2 -6c1-20 1-38-2-56" stroke="#6e4524" strokeWidth="3" fill="none" strokeLinecap="round" />
    <circle cx="-30" cy="-84" r="28" fill="#3f9d4f" /><circle cx="32" cy="-86" r="30" fill="#3f9d4f" /><circle cx="0" cy="-112" r="40" fill="#4cb35b" /><circle cx="-22" cy="-96" r="26" fill="#58c166" /><circle cx="26" cy="-98" r="26" fill="#58c166" />
    <circle cx="-14" cy="-120" r="12" fill="#7ad47f" opacity=".7" /><circle cx="30" cy="-84" r="8" fill="#7ad47f" opacity=".6" />
    <circle cx="-26" cy="-80" r="4" fill="#ff7a59" /><circle cx="18" cy="-102" r="4" fill="#ff7a59" /><circle cx="36" cy="-76" r="4" fill="#ff7a59" />
  </g>
);
export const Bee = ({ x, y, s = 1, flip = false, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`}>
    <ellipse cx="-3" cy="-11" rx="8" ry="5.2" fill="#e6f6ff" stroke="#9ad0ec" strokeWidth=".9" transform="rotate(-30 -3 -11)" />
    <ellipse cx="6" cy="-11" rx="8" ry="5.2" fill="#e6f6ff" stroke="#9ad0ec" strokeWidth=".9" transform="rotate(30 6 -11)" />
    <ellipse cx="2" cy="0" rx="12" ry="9" fill="#ffc43d" />
    <path d="M-1 -8.4q-2.4 8.4 0 16.8M6 -8.2q-2.4 8.2 0 16.4" stroke="#4a2f12" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M14 0l4 0" stroke="#4a2f12" strokeWidth="2" strokeLinecap="round" />
    <circle cx="-10" cy="0" r="6.8" fill="#5b3a17" />
    <circle cx="-12.4" cy="-1.6" r="2.1" fill="#fff" /><circle cx="-7.4" cy="-1.6" r="2.1" fill="#fff" /><circle cx="-12" cy="-1.4" r="1" fill="#1d130a" /><circle cx="-7.8" cy="-1.4" r="1" fill="#1d130a" />
    <path d="M-12 2.2q2.2 2.4 4.4 0" stroke="#fff" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    <path d="M-12 -6q-2-4-5-4M-8 -6.4q0-4-2-6" stroke="#5b3a17" strokeWidth="1.3" fill="none" strokeLinecap="round" />
  </g>
);
export const Person = ({ x, y, s = 1, shirt = '#2563eb', skin = '#f2c9a0', hair = '#3b2a10', hat = false, wave = false, pants = '#35495e', face = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="1" rx="17" ry="4" fill="#000" opacity=".12" />
    <rect x="-8.5" y="-16" width="7" height="16" rx="3" fill={pants} /><rect x="1.5" y="-16" width="7" height="16" rx="3" fill={pants} />
    <rect x="-17" y="-44" width="7" height="22" rx="3.5" fill={shirt} /><circle cx="-13.5" cy="-21" r="3.6" fill={skin} />
    <g transform={wave ? 'rotate(-150 13.5 -41)' : undefined}><rect x="10" y="-44" width="7" height="22" rx="3.5" fill={shirt} /><circle cx="13.5" cy="-21" r="3.6" fill={skin} /></g>
    <rect x="-11.5" y="-46" width="23" height="34" rx="10" fill={shirt} />
    <circle cx="0" cy="-58" r="11.5" fill={skin} />
    <path d="M-11.5 -60a11.5 11.5 0 0 1 23 0c-5-5.5-17.500-5.500-23 0z" fill={hair} />
    {hat && <><ellipse cx="0" cy="-66" rx="19" ry="4.6" fill="#e8b958" /><path d="M-10 -67a10 9 0 0 1 20 0z" fill="#f2cd75" /><rect x="-10" y="-70" width="20" height="3" fill="#c0392b" /></>}
    {face && <><circle cx="-4.2" cy="-58" r="1.5" fill="#2a1b12" /><circle cx="4.2" cy="-58" r="1.5" fill="#2a1b12" /><path d="M-3.6 -53.2q3.6 3.6 7.200 0" stroke="#7a3b2e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="-7.600" cy="-54.500" r="2.100" fill="#ff9aa2" opacity=".6" /><circle cx="7.600" cy="-54.500" r="2.100" fill="#ff9aa2" opacity=".6" /></>}
  </g>
);
export const Goat = ({ x, y, s = 1, flip = false }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <ellipse cx="2" cy="2" rx="44" ry="6" fill="#000" opacity=".12" />
    <rect x="-27" y="-36" width="8" height="34" rx="4" fill="#ece4d2" /><rect x="-27" y="-7" width="8" height="7" rx="2" fill="#6b5a45" />
    <rect x="17" y="-36" width="8" height="34" rx="4" fill="#ece4d2" /><rect x="17" y="-7" width="8" height="7" rx="2" fill="#6b5a45" />
    <path d="M-38 -58q-12-5-9-15 9 2 11 11z" fill="#fffdf6" />
    <ellipse cx="0" cy="-50" rx="41" ry="22" fill="#fffdf6" /><path d="M-38 -44q38 16 78 0 0 12-38 14-30 0-40-14z" fill="#efe7d6" />
    <ellipse cx="-12" cy="-58" rx="14" ry="9" fill="#e7cfa6" opacity=".85" />
    <rect x="-15" y="-36" width="8" height="34" rx="4" fill="#fffdf6" /><rect x="-15" y="-7" width="8" height="7" rx="2" fill="#6b5a45" />
    <rect x="29" y="-36" width="8" height="34" rx="4" fill="#fffdf6" /><rect x="29" y="-7" width="8" height="7" rx="2" fill="#6b5a45" />
    <path d="M24 -64Q34 -94 48 -90L54 -70Q42 -60 38 -44z" fill="#fffdf6" />
    <path d="M58 -78q-3 12 3 14q3-7 0-14z" fill="#efe5d2" />
    <ellipse cx="52" cy="-91" rx="15" ry="13" fill="#fffdf6" /><ellipse cx="64" cy="-86" rx="8.500" ry="6.800" fill="#f6ecda" />
    <ellipse cx="69" cy="-87" rx="2.200" ry="1.700" fill="#c98a8a" /><path d="M61 -82q4 3.500 8 0" stroke="#8a5a4a" strokeWidth="1.400" fill="none" strokeLinecap="round" />
    <path d="M46 -101q-5-14 5-19M53 -103q3-14 13-14" stroke="#b99d6e" strokeWidth="4.500" fill="none" strokeLinecap="round" />
    <ellipse cx="40" cy="-97" rx="12" ry="5.200" transform="rotate(-22 40 -97)" fill="#fffdf6" /><ellipse cx="40" cy="-97" rx="7.500" ry="2.800" transform="rotate(-22 40 -97)" fill="#f6b7be" />
    <circle cx="54.500" cy="-95" r="3.400" fill="#2a1b12" /><circle cx="55.700" cy="-96.200" r="1.200" fill="#fff" />
    <circle cx="58" cy="-87" r="2.600" fill="#ffb3bd" opacity=".7" />
  </g>
);
export const Pot = ({ x, y, s = 1, c = '#c4683a' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-13 -9h26l-3.500 23h-19z" fill={c} /><rect x="-14.500" y="-13" width="29" height="6" rx="3" fill="#d97b4a" />
    <path d="M0 -13v-20" stroke="#2f7d3a" strokeWidth="3.200" strokeLinecap="round" />
    <path d="M0 -26c-15-3-20-15-17-20 12 0 19 7 17 20z" fill="#58c166" /><path d="M0 -31c13-3 19-12 16-18-11 0-17 8-16 18z" fill="#7ad47f" />
  </g>
);
export const Hex = ({ x, y, r = 10, fill = '#ffd45e', stroke = '#e0a21a' }) => (
  <polygon points={[0, 60, 120, 180, 240, 300].map((a) => `${x + r * Math.cos(((a - 30) * Math.PI) / 180)},${y + r * Math.sin(((a - 30) * Math.PI) / 180)}`).join(' ')} fill={fill} stroke={stroke} strokeWidth="1.400" />
);
