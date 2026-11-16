import { Sun, Cloud, Flower, Grass, Tree, Bee, Person, Goat, Pot } from './Cartoon.jsx';

// Hero illustration: a big tree surrounded by stingless bees, a goat, seedlings, a shopping bag and people.
export default function Illustration() {
  return (
    <svg viewBox="0 0 600 480" className="illustration" role="img" aria-label="ต้นไม้ล้อมรอบด้วยผึ้งชันโรง แพะ ต้นกล้า ถุงช้อปปิ้ง และผู้คน">
      <defs>
        <radialGradient id="hsky" cx="50%" cy="42%" r="70%"><stop offset="0" stopColor="#f6fcec" /><stop offset="1" stopColor="#d3efcb" /></radialGradient>
        <clipPath id="hclip"><circle cx="300" cy="236" r="226" /></clipPath>
      </defs>
      <circle cx="300" cy="236" r="226" fill="url(#hsky)" />
      <g clipPath="url(#hclip)">
        <Sun x={470} y={100} r={30} /><Cloud x={130} y={110} s={1.5} /><Cloud x={420} y={190} s={1} o={0.9} />
        <path d="M60 340Q200 270 330 320T560 316V470H60Z" fill="#a8dc7e" /><path d="M60 380Q220 330 360 372T560 360V470H60Z" fill="#86c85f" />
        <ellipse cx="300" cy="430" rx="250" ry="38" fill="#6cb055" />
      </g>
      <ellipse cx="300" cy="428" rx="260" ry="46" fill="#7fc65e" opacity=".0" />

      <g transform="translate(300 424) scale(1.82)"><Tree x={0} y={0} s={1} /></g>

      {/* hive log on a stand */}
      <g>
        <ellipse cx="136" cy="428" rx="74" ry="10" fill="#000" opacity=".12" />
        <rect x="92" y="372" width="9" height="56" rx="3" fill="#7a4d2b" /><rect x="170" y="372" width="9" height="56" rx="3" fill="#7a4d2b" /><rect x="84" y="366" width="104" height="9" rx="4" fill="#6a4122" />
        <rect x="82" y="318" width="112" height="52" rx="24" fill="#c98a43" /><rect x="88" y="322" width="100" height="20" rx="10" fill="#e2a95d" opacity=".75" />
        <path d="M70 322Q136 282 204 322L204 330Q136 292 70 330z" fill="#8b4a2b" />
        <ellipse cx="190" cy="346" rx="11" ry="25" fill="#a8692a" /><ellipse cx="190" cy="346" rx="7" ry="19" fill="#d9a35f" /><ellipse cx="199" cy="348" rx="6.500" ry="6" fill="#7a4a1d" /><ellipse cx="201" cy="348" rx="3" ry="2.800" fill="#241407" />
        <path d="M206 340q40-30 18-64" stroke="#f5a623" strokeWidth="2.400" strokeDasharray="2 8" fill="none" strokeLinecap="round" />
      </g>
      <Bee x={236} y={284} s={1.7} flip rot={-8} /><Bee x={170} y={262} s={1.5} rot={8} /><Bee x={124} y={300} s={1.25} /><Bee x={462} y={176} s={1.55} flip /><Bee x={396} y={150} s={1.3} rot={-6} />

      {/* seedlings */}
      <Pot x={238} y={440} s={1.35} /><Pot x={276} y={448} s={1.15} c="#d99a4a" /><Pot x={206} y={450} s={1.05} />

      {/* goat */}
      <Goat x={444} y={420} s={1.5} flip />
      {/* shopping bag */}
      <g transform="translate(528 424)">
        <ellipse cx="0" cy="2" rx="34" ry="6" fill="#000" opacity=".12" />
        <path d="M-17-48c0-26 34-26 34 0" stroke="#14532d" strokeWidth="4.500" fill="none" strokeLinecap="round" />
        <path d="M-30-46h60l6 48h-72z" fill="#f59e0b" /><path d="M-30-46h60l1.800 14h-63.600z" fill="#fbbf24" />
        <path d="M0-12c-9 0-11-9-9-14 9 0 12 6 9 14zM0-12c9 0 11-9 9-14-9 0-12 6-9 14z" fill="#fff" />
        <circle cx="-17" cy="-47" r="2.500" fill="#14532d" /><circle cx="17" cy="-47" r="2.500" fill="#14532d" />
      </g>

      {/* people */}
      <Person x={352} y={452} s={1.4} shirt="#2563eb" hat skin="#e8b98f" wave /><Person x={394} y={462} s={1.25} shirt="#e11d48" hair="#222" skin="#f2c9a0" />
      <Person x={70} y={452} s={1.3} shirt="#7c3aed" hair="#6b3f1d" skin="#f2c9a0" /><Person x={566} y={470} s={1} shirt="#0d9488" skin="#d9a273" hair="#1f1408" />

      <Flower x={30} y={428} c="#ff7aa8" s={1.4} /><Flower x={56} y={440} c="#ffffff" s={1.1} /><Flower x={548} y={400} c="#ffb347" s={1.2} />
      <Grass x={150} y={446} s={1.6} /><Grass x={316} y={452} s={1.5} /><Grass x={500} y={448} s={1.4} />
    </svg>
  );
}
