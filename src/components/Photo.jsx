import { useEffect, useId, useRef, useState } from 'react';
import { Sun, Cloud, Hills, Flower, Grass, Tree, Bee, Person, Goat, Pot, Hex } from './Cartoon.jsx';

/* Photo slot. Uses /images/<name>.jpg when a real photo exists, otherwise a cartoon scene. */
const BASE = import.meta.env.BASE_URL;
export const photoUrl = (name) => `${BASE}images/${name}.jpg`;

const Dipper = ({ x, y, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}><rect x="-3" y="-4" width="6" height="64" rx="3" fill="#b9854a" />
    {[-14, -7, 0, 7, 14].map((d) => <rect key={d} x={d - 2.4} y="52" width="4.8" height="34" rx="2.4" fill="#d79a4a" />)}<rect x="-15" y="50" width="30" height="8" rx="4" fill="#a8692a" /></g>
);
const Jar = ({ x, y, s = 1, label = 'น้ำผึ้ง' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="2" rx="40" ry="7" fill="#000" opacity=".12" />
    <rect x="-34" y="-96" width="68" height="94" rx="20" fill="#f5a623" /><rect x="-34" y="-96" width="68" height="94" rx="20" fill="#fff" opacity=".1" />
    <rect x="-30" y="-92" width="14" height="82" rx="7" fill="#fff" opacity=".28" />
    <rect x="-28" y="-114" width="56" height="22" rx="7" fill="#c98a2b" /><rect x="-28" y="-114" width="56" height="7" rx="3.5" fill="#e3a94a" />
    <rect x="-22" y="-74" width="44" height="40" rx="6" fill="#fff6dc" /><Hex x={0} y={-60} r={7} /><text x="0" y="-41" textAnchor="middle" fontSize="9" fontWeight="700" fill="#8a4b0b" fontFamily="Prompt, sans-serif">{label}</text>
    <path d="M-34 -78q10 8 22 0t22 0 24 0" stroke="#ffd36b" strokeWidth="5" fill="none" strokeLinecap="round" opacity=".7" />
  </g>
);
const Bar = ({ x, y, r = 0, c1 = '#ffc94a', c2 = '#ffe28a', s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x="-52" y="-30" width="104" height="60" rx="18" fill={c1} /><rect x="-52" y="-30" width="104" height="26" rx="13" fill="#fff" opacity=".22" />
    <rect x="-44" y="-22" width="88" height="44" rx="12" fill={c2} />
    {[[-24, -6], [-6, -6], [12, -6], [-15, 8], [3, 8], [21, 8]].map(([a, b], i) => <Hex key={i} x={a + 4} y={b} r={8} fill="#ffd45e" stroke="#e8a92a" />)}
    <path d="M-40 -20q40-8 80 0" stroke="#fff" strokeWidth="3" fill="none" opacity=".5" strokeLinecap="round" />
  </g>
);
const Bubble = ({ x, y, r }) => <g><circle cx={x} cy={y} r={r} fill="#fff" opacity=".45" stroke="#fff" strokeWidth="1.500" /><circle cx={x - r * .35} cy={y - r * .35} r={r * .22} fill="#fff" /></g>;
const Sack = ({ x, y, s = 1, label = 'ข้าว', c = '#e2c690' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="2" rx="52" ry="8" fill="#000" opacity=".12" />
    <path d="M-42 0C-52-30-48-64-34-88h68C48-64 52-30 42 0z" fill={c} /><path d="M-42 0C-52-30-48-64-34-88" stroke="#fff" strokeWidth="6" opacity=".2" fill="none" strokeLinecap="round" />
    <path d="M-34-88q-8-14-2-24 8 4 12 14 4-12 12-16 6 8 2 18 8-8 16-8 0 12-8 22z" fill={c} /><path d="M-34-88q34 12 68 0" stroke="#a37b3c" strokeWidth="6" fill="none" strokeLinecap="round" />
    <rect x="-28" y="-66" width="56" height="42" rx="8" fill="#fff8e6" /><path d="M0-58v26M0-52q-7-3-8-8M0-46q-7-3-8-8M0-52q7-3 8-8M0-46q7-3 8-8" stroke="#4aa24f" strokeWidth="2.200" fill="none" strokeLinecap="round" />
    <text x="0" y="-28" textAnchor="middle" fontSize="10" fontWeight="700" fill="#7a5a1f" fontFamily="Prompt, sans-serif">{label}</text>
  </g>
);
const Coconut = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <ellipse cx="0" cy="26" rx="34" ry="6" fill="#000" opacity=".12" />
    <path d="M-32 0a32 30 0 0 0 64 0z" fill="#7a4a24" /><ellipse cx="0" cy="0" rx="32" ry="11" fill="#7a4a24" /><ellipse cx="0" cy="0" rx="27" ry="8.500" fill="#fffaf0" /><ellipse cx="0" cy="1" rx="14" ry="4" fill="#efe3c9" />
    <path d="M-24 14q-6 6-2 12" stroke="#a06a3a" strokeWidth="3" fill="none" strokeLinecap="round" />
  </g>
);

const SCENES = {
  hive: (<>
    <Sun /><Cloud x={72} y={46} s={1.1} /><Cloud x={228} y={30} s={.75} /><Hills />
    <Tree x={338} y={196} s={.95} /><Grass x={30} y={212} s={1.4} /><Grass x={372} y={226} s={1.2} />
    <ellipse cx="190" cy="232" rx="125" ry="11" fill="#000" opacity=".1" />
    <rect x="112" y="172" width="10" height="58" rx="3" fill="#7a4d2b" /><rect x="262" y="172" width="10" height="58" rx="3" fill="#7a4d2b" /><rect x="100" y="166" width="184" height="10" rx="4" fill="#6a4122" />
    <rect x="98" y="104" width="184" height="66" rx="30" fill="#c98a43" /><rect x="104" y="108" width="172" height="26" rx="13" fill="#e2a95d" opacity=".75" />
    <path d="M122 132q70-8 150 0M116 150q74 8 156 0" stroke="#a86d2e" strokeWidth="2.600" fill="none" strokeLinecap="round" />
    <path d="M86 110Q190 62 296 110L296 120Q190 76 86 120z" fill="#8b4a2b" /><path d="M94 108Q190 70 288 108" stroke="#b86a3e" strokeWidth="3" fill="none" strokeLinecap="round" />
    <ellipse cx="282" cy="138" rx="14" ry="32" fill="#a8692a" /><ellipse cx="282" cy="138" rx="9.500" ry="25" fill="#d9a35f" />
    <ellipse cx="294" cy="140" rx="9" ry="8" fill="#7a4a1d" /><ellipse cx="297" cy="140" rx="4.200" ry="3.800" fill="#241407" />
    <path d="M150 170v16c0 7 11 7 11 0v-16" fill="#f5a623" />
    <path d="M300 128q24-20 6-46t-40-10" stroke="#f5a623" strokeWidth="2" strokeDasharray="2 7" fill="none" strokeLinecap="round" />
    <Bee x={304} y={90} s={1.5} flip /><Bee x={264} y={70} s={1.3} flip rot={-10} /><Bee x={332} y={134} s={1.15} flip /><Bee x={74} y={104} s={1.3} rot={8} />
    <Flower x={58} y={196} c="#ff7aa8" s={1.3} /><Flower x={82} y={206} c="#ffffff" s={1} /><Flower x={350} y={214} c="#ffb347" s={1.2} />
    <g transform="translate(40 232)"><rect x="-18" y="-24" width="36" height="26" rx="8" fill="#f5a623" /><rect x="-12" y="-33" width="24" height="10" rx="4" fill="#c98a2b" /><Hex x={0} y={-11} r={6} /></g>
  </>),
  goat: (<>
    <Sun x={70} y={50} /><Cloud x={250} y={44} s={1.1} /><Cloud x={350} y={86} s={.7} /><Hills c1="#9bd77a" c2="#7cc45a" y={150} />
    <Tree x={344} y={170} s={.8} />
    <g>{[40, 110, 180, 250, 320].map((x) => <rect key={x} x={x} y="148" width="7" height="46" rx="3" fill="#a8743f" />)}
      <rect x="30" y="158" width="320" height="6" rx="3" fill="#c28a4f" /><rect x="30" y="176" width="320" height="6" rx="3" fill="#c28a4f" /></g>
    <Goat x={206} y={238} s={1.55} /><Goat x={74} y={240} s={.8} flip />
    <Grass x={30} y={232} s={1.5} /><Grass x={352} y={242} s={1.3} /><Grass x={128} y={250} s={1.1} />
    <Flower x={22} y={246} c="#ff7aa8" /><Flower x={376} y={232} c="#ffffff" /><Flower x={300} y={250} c="#ffb347" s={.9} />
  </>),
  visit: (<>
    <Sun x={64} y={48} /><Cloud x={210} y={38} s={1.1} /><Cloud x={344} y={64} s={.7} /><Hills />
    <Tree x={348} y={192} s={.85} /><Tree x={44} y={194} s={.7} />
    <g transform="translate(210 100)"><rect x="-4" y="40" width="8" height="64" fill="#8a5a33" /><rect x="-72" y="-14" width="144" height="60" rx="12" fill="#8a5a33" /><rect x="-67" y="-9" width="134" height="50" rx="9" fill="#fff6dc" />
      <text x="0" y="14" textAnchor="middle" fontSize="15" fontWeight="700" fill="#14532d" fontFamily="Prompt, sans-serif">ยินดีต้อนรับ</text><text x="0" y="32" textAnchor="middle" fontSize="10.500" fill="#4d7a58" fontFamily="Prompt, sans-serif">ศึกษาดูงาน Trees4All</text></g>
    <Person x={78} y={246} s={1.55} shirt="#e11d48" hat wave skin="#e8b98f" /><Person x={140} y={252} s={1.45} shirt="#2563eb" skin="#f2c9a0" /><Person x={208} y={254} s={1.4} shirt="#f59e0b" skin="#d9a273" hair="#1f1408" />
    <Person x={272} y={252} s={1.45} shirt="#7c3aed" skin="#f2c9a0" hair="#7a4a1d" /><Person x={334} y={246} s={1.5} shirt="#0d9488" hat skin="#e8b98f" />
    <Flower x={30} y={246} c="#ff7aa8" /><Flower x={376} y={248} c="#ffffff" /><Grass x={110} y={256} s={1.2} />
  </>),
  nursery: (<>
    <Sun x={346} y={46} /><Cloud x={80} y={42} s={1} /><Hills c1="#9fdc8b" c2="#7fc96b" y={140} />
    <path d="M40 150Q200 54 360 150z" fill="#d7f3dc" opacity=".6" stroke="#7bc58a" strokeWidth="3" /><path d="M40 150Q200 54 360 150" fill="none" stroke="#4aa86a" strokeWidth="5" strokeLinecap="round" />
    <path d="M110 138Q200 78 290 138M170 112v38M230 112v38" stroke="#7bc58a" strokeWidth="2" fill="none" />
    <rect x="38" y="148" width="324" height="9" rx="4" fill="#8a5a33" /><rect x="52" y="157" width="8" height="52" fill="#7a4d2b" /><rect x="340" y="157" width="8" height="52" fill="#7a4d2b" />
    <rect x="30" y="184" width="340" height="9" rx="4" fill="#9a6a3a" />
    {[70, 108, 146, 184, 222, 260, 298, 336].map((x, i) => <Pot key={x} x={x} y={145} s={.78} c={i % 2 ? '#c4683a' : '#b85a2c'} />)}
    {[88, 126, 164, 202, 240, 278, 316].map((x) => <Pot key={x} x={x} y={182} s={.78} c="#3a3f45" />)}
    <Pot x={64} y={246} s={1.25} /><Pot x={130} y={250} s={1.1} c="#d99a4a" /><Pot x={338} y={246} s={1.25} />
    <g transform="translate(236 232)"><path d="M-22 0q-4-26 8-30h22q12 4 8 30z" fill="#4a90d9" /><path d="M22-18q26-14 40-2" stroke="#4a90d9" strokeWidth="5" fill="none" strokeLinecap="round" /><path d="M-22-12q-18-2-26-18" stroke="#4a90d9" strokeWidth="5" fill="none" strokeLinecap="round" /><ellipse cx="-2" cy="-31" rx="10" ry="3" fill="#2e6fb0" />
      <g fill="#7cc3ff"><circle cx="66" cy="-2" r="3" /><circle cx="70" cy="8" r="2.500" /><circle cx="62" cy="10" r="2.500" /></g></g>
    <Person x={382} y={252} s={1} shirt="#16a34a" hat skin="#e8b98f" />
    <Flower x={22} y={244} c="#ff7aa8" /><Grass x={190} y={254} s={1.3} />
  </>),
  soap: (<>
    <rect y="188" width="400" height="72" fill="#e9c79a" opacity=".55" /><rect y="188" width="400" height="6" fill="#d9a96a" opacity=".5" />
    <ellipse cx="200" cy="204" rx="150" ry="34" fill="#a8743f" /><ellipse cx="200" cy="198" rx="142" ry="30" fill="#c28a4f" /><ellipse cx="200" cy="196" rx="124" ry="24" fill="#d6a064" opacity=".6" />
    <Bar x={150} y={172} r={-9} /><Bar x={262} y={178} r={10} c1="#ffb74a" c2="#ffd68a" s={.95} /><Bar x={206} y={134} r={-3} c1="#ffd24f" c2="#fff0a8" s={.92} />
    <Dipper x={338} y={74} r={24} />
    <g><path d="M60 224q-26-6-30-34 22 2 30 34z" fill="#58c166" /><path d="M60 224q-6-30 12-46 8 22-12 46z" fill="#7ad47f" /><path d="M60 224q22-6 30-28-24-2-30 28z" fill="#3f9d4f" /></g>
    <Flower x={344} y={228} c="#ff7aa8" s={1.3} /><Flower x={366} y={236} c="#ffffff" s={1} />
    <Bee x={60} y={78} s={1.6} rot={-8} /><Bee x={330} y={50} s={1.3} flip />
    <Bubble x={48} y={140} r={13} /><Bubble x={86} y={112} r={8} /><Bubble x={310} y={116} r={16} /><Bubble x={350} y={150} r={9} /><Bubble x={116} y={60} r={6} /><Bubble x={238} y={64} r={10} />
  </>),
  honey: (<>
    <rect y="196" width="400" height="64" fill="#e0a860" opacity=".5" />
    {[[40, 40], [66, 55], [40, 70], [358, 36], [332, 51], [358, 66], [330, 84]].map(([x, y], i) => <Hex key={i} x={x} y={y} r={14} fill="#ffcf5a" stroke="#e0a21a" />)}
    <path d="M0 214q60-14 130-6t140 0 130-8v60H0z" fill="#d98a2b" opacity=".35" />
    <Jar x={200} y={226} s={1.35} /><Jar x={102} y={232} s={.82} label="ชันโรง" /><Jar x={304} y={234} s={.78} label="ผึ้ง" />
    <Dipper x={50} y={172} r={-28} />
    <Bee x={290} y={80} s={1.7} flip rot={-8} /><Bee x={98} y={72} s={1.4} rot={8} /><Bee x={356} y={168} s={1.1} flip />
    <path d="M296 88q-30 22-60 8" stroke="#f5a623" strokeWidth="2" strokeDasharray="2 7" fill="none" strokeLinecap="round" />
    <Flower x={20} y={236} c="#ff7aa8" s={1.2} /><Flower x={380} y={238} c="#ffffff" s={1.1} />
  </>),
  rice: (<>
    <Sun x={338} y={50} /><Cloud x={80} y={44} s={1} /><Hills c1="#d6e8a0" c2="#b9d57a" y={160} />
    {[40, 62, 84, 316, 340, 362].map((x, i) => <g key={x} transform={`translate(${x} ${222 + (i % 2) * 6})`}><path d="M0 0q-3-50 5-74" stroke="#a9c44a" strokeWidth="3" fill="none" strokeLinecap="round" />{[-60, -50, -40, -30].map((y, k) => <ellipse key={k} cx={2 + k} cy={y} rx="3.200" ry="6" fill="#e7c34a" transform={`rotate(${28 + k * 4} ${2 + k} ${y})`} />)}</g>)}
    <Sack x={200} y={236} s={1.55} label="ข้าวหอม" /><Sack x={110} y={242} s={.85} c="#d9b87a" label="ข้าว" />
    <g transform="translate(300 240)"><path d="M-30 0q4-26 30-26t30 26z" fill="#a8743f" /><ellipse cx="0" cy="-26" rx="30" ry="9" fill="#e7c34a" />{[-14, -4, 8, 16, 0, -8].map((x, i) => <circle key={i} cx={x} cy={-28 + (i % 3) * 2} r="2.200" fill="#fff3b0" />)}</g>
    <Flower x={20} y={248} c="#ff7aa8" /><Grass x={250} y={254} s={1.2} />
  </>),
  sugar: (<>
    <rect y="196" width="400" height="64" fill="#d8b27a" opacity=".5" />
    <path d="M300 20q50 22 80 78M300 20q30 40 22 92M300 20q-30 30-50 80" stroke="#3f9d4f" strokeWidth="9" fill="none" strokeLinecap="round" /><path d="M300 20q60 8 84 50M300 20q70-18 94 6" stroke="#58c166" strokeWidth="7" fill="none" strokeLinecap="round" />
    <Coconut x={92} y={176} s={1.35} r={-8} /><Coconut x={170} y={206} s={.95} r={10} />
    <g transform="translate(262 232)"><ellipse cx="0" cy="2" rx="62" ry="9" fill="#000" opacity=".12" /><path d="M-56-60h112q4 52-56 58-60-6-56-58z" fill="#fff6e6" stroke="#e2c690" strokeWidth="3" /><ellipse cx="0" cy="-60" rx="56" ry="13" fill="#d99a2b" />
      {[-30, -14, 4, 22, 36, -4, 14].map((x, i) => <circle key={i} cx={x} cy={-62 + (i % 3) * 3} r="3" fill="#f0b64a" />)}<ellipse cx="-14" cy="-66" rx="14" ry="3" fill="#fff" opacity=".35" /></g>
    {[[210, 232, -8], [236, 238, 6]].map(([x, y, r], i) => <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}><rect x="-10" y="-14" width="20" height="14" rx="3" fill="#e0a844" /><rect x="-10" y="-14" width="20" height="5" rx="2" fill="#f4c76a" /></g>)}
    <Flower x={26} y={236} c="#ff7aa8" /><Flower x={376} y={240} c="#ffffff" s={.9} />
  </>),
  resale: (<>
    <Sun x={340} y={48} /><Cloud x={80} y={44} /><Hills />
    <g transform="translate(200 232)"><ellipse cx="0" cy="4" rx="100" ry="10" fill="#000" opacity=".12" /><path d="M-96-80h192l-18 84h-156z" fill="#c7904f" />{[-60, -30, 0, 30, 60].map((x) => <path key={x} d={`M${x}-80l${x < 0 ? -5 : 5} 84`} stroke="#a8692a" strokeWidth="3" />)}
      <path d="M-96-80h192" stroke="#8b5a2b" strokeWidth="8" strokeLinecap="round" />
      <circle cx="-52" cy="-92" r="20" fill="#e5443a" /><circle cx="-6" cy="-100" r="22" fill="#f59e0b" /><circle cx="44" cy="-94" r="20" fill="#7cc243" /><circle cx="76" cy="-86" r="15" fill="#e5443a" /><path d="M-4-128q6-10 14-8" stroke="#3c8a3c" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M-96-80Q0-60 96-80" fill="none" stroke="#8b5a2b" strokeWidth="6" /></g>
    <Flower x={30} y={238} c="#ff7aa8" /><Grass x={352} y={244} s={1.4} />
  </>),
  tree: (<><Sun /><Cloud x={80} y={46} /><Hills /><Tree x={200} y={206} s={1.2} /><Flower x={60} y={226} /><Flower x={340} y={232} c="#ffffff" /></>),
};
const BG = {
  hive: ['#c9ecff', '#f4fbe9'], goat: ['#bfe6ff', '#f1fbe3'], visit: ['#bfe6ff', '#f1fbe3'], nursery: ['#c9ecff', '#eefbe4'],
  soap: ['#fff3e0', '#fde2b8'], honey: ['#fff0c6', '#fcd88a'], rice: ['#cfeeff', '#f7f3d2'], sugar: ['#fdeed2', '#f3cf92'], resale: ['#c9ecff', '#f1fbe3'], tree: ['#c9ecff', '#f1fbe3'],
};

export function Placeholder({ name = 'tree', className = '' }) {
  const key = SCENES[name] ? name : 'tree';
  const [a, b] = BG[key];
  const uid = `bg${useId().replace(/:/g, '')}`;
  return (
    <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" className={`ph ${className}`} role="img" aria-label={key}>
      <defs><linearGradient id={uid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient></defs>
      <rect width="400" height="260" fill={`url(#${uid})`} />
      {SCENES[key]}
    </svg>
  );
}

// <img> that falls back when the file is missing. The error can fire before React attaches onError,
// so also re-check after mount (complete + naturalWidth === 0 means the load failed).
export function useImgFallback(url) {
  const ref = useRef(null);
  const [bad, setBad] = useState(false);
  useEffect(() => { setBad(false); }, [url]);
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setBad(true);
  });
  return [ref, bad, () => setBad(true)];
}

export default function Photo({ name, src, alt = '', className = '' }) {
  const url = src || photoUrl(name);
  const [ref, bad, fail] = useImgFallback(url);
  if (bad) return <Placeholder name={name} className={className} />;
  return <img ref={ref} className={`photo ${className}`} src={url} alt={alt} loading="lazy" onError={fail} />;
}
