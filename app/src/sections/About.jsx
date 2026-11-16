import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, MapPin, Rocket, Sparkles } from 'lucide-react';
import { site } from '../data/site.js';
import SectionHead from '../components/SectionHead.jsx';
import SpotCard from '../components/SpotCard.jsx';
import Globe from '../components/Globe.jsx';
import Logo from '../components/Logo.jsx';
import CountUp from '../components/reactbits/CountUp.jsx';

const ease = [0.16, 1, 0.3, 1];

function Tile({ className = '', index = 0, children }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 50, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 1, ease, delay: (index % 4) * 0.08 }}
    >
      <SpotCard className="relative h-full overflow-hidden rounded-[22px] p-[clamp(18px,2.2vw,28px)]">{children}</SpotCard>
    </motion.div>
  );
}

function TileLabel({ icon: Icon, children }) {
  return (
    <p className="eyebrow m-0 flex items-center gap-2">
      {Icon && <Icon size={14} className="text-sodium" aria-hidden="true" />}
      {children}
    </p>
  );
}

function LocalTime() {
  const format = () =>
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi' }).format(new Date());
  const [time, setTime] = useState(format);
  useEffect(() => {
    const id = setInterval(() => setTime(format()), 15000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{time}</span>;
}

// Light travelling along curved wires from five AI tools, through me, to a shipped app (the "animated beam").
const TOOLS = [
  { name: 'ChatGPT', icon: null },
  { name: 'Claude', icon: 'siClaude' },
  { name: 'Gemini', icon: 'siGooglegemini' },
  { name: 'Codex', icon: null },
  { name: 'Antigravity', icon: null }
];
function AIBeams() {
  const ys = [14, 32, 50, 68, 86];
  return (
    <div className="relative mt-5 h-[190px] w-full">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="beam" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#56d8c9" stopOpacity="0" />
            <stop offset="0.5" stopColor="#56d8c9" />
            <stop offset="1" stopColor="#ff8a3d" />
          </linearGradient>
        </defs>
        {ys.map(y => (
          <g key={y}>
            <path d={`M 10 ${y} C 32 ${y}, 32 50, 50 50`} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
            <path
              d={`M 10 ${y} C 32 ${y}, 32 50, 50 50`}
              fill="none"
              stroke="url(#beam)"
              strokeWidth="1.6"
              vectorEffect="non-scaling-stroke"
              pathLength="100"
              strokeDasharray="18 82"
              className="beam-dash"
              style={{ animationDelay: `${(y / 18) * 0.45}s` }}
            />
          </g>
        ))}
        <path d="M 50 50 L 90 50" fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
        <path d="M 50 50 L 90 50" fill="none" stroke="url(#beam)" strokeWidth="2" vectorEffect="non-scaling-stroke" pathLength="100" strokeDasharray="22 78" className="beam-dash" />
      </svg>
      {TOOLS.map((tool, i) => (
        <div key={tool.name} className="absolute left-[10%] flex -translate-x-1/2 -translate-y-1/2 items-center" style={{ top: `${ys[i]}%` }}>
          <span className="grid size-8 place-items-center rounded-lg border border-white/10 bg-ink-3 shadow-[0_0_20px_-6px_rgb(86_216_201/0.6)]" title={tool.name}>
            <Logo name={tool.name} icon={tool.icon} size={15} />
          </span>
          <span className="absolute left-10 whitespace-nowrap text-[0.7rem] text-fog max-sm:hidden">{tool.name}</span>
        </div>
      ))}
      <div className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border border-sodium/40 bg-ink-3 font-semibold tracking-tight shadow-[0_0_40px_-8px_rgb(255_138_61/0.8)]">
        <span>
          GS<span className="text-sodium">.</span>
        </span>
      </div>
      <div className="absolute left-[90%] top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-xl border border-white/10 bg-ink-3 text-sodium">
        <Rocket size={18} aria-hidden="true" />
      </div>
      <span className="absolute left-[90%] top-[calc(50%+30px)] -translate-x-1/2 whitespace-nowrap text-[0.7rem] text-fog">Shipped</span>
    </div>
  );
}

// Brand marks circling the MERN core on two rings (the "orbiting circles" effect).
const INNER = [['React', 'siReact'], ['Node.js', 'siNodedotjs'], ['MongoDB', 'siMongodb'], ['Express', 'siExpress']];
const OUTER = [['Tailwind CSS', 'siTailwindcss'], ['Socket.io', 'siSocketdotio'], ['Docker', 'siDocker'], ['Three.js', 'siThreedotjs'], ['GitHub Actions', 'siGithubactions'], ['Vite', 'siVite']];
function Orbit() {
  const ring = (items, radius, duration, reverse) => (
    <div
      className="absolute left-1/2 top-1/2 animate-spin-slow rounded-full border border-white/[0.07]"
      style={{ width: radius * 2, height: radius * 2, marginLeft: -radius, marginTop: -radius, animationDuration: `${duration}s`, animationDirection: reverse ? 'reverse' : 'normal' }}
    >
      {items.map(([name, icon], i) => {
        const angle = (i / items.length) * Math.PI * 2;
        return (
          <span
            key={name}
            className="absolute grid size-10 place-items-center rounded-full border border-white/10 bg-ink-3 shadow-[0_6px_20px_-8px_rgb(0_0_0/0.9)]"
            style={{ left: radius + Math.cos(angle) * radius - 20, top: radius + Math.sin(angle) * radius - 20 }}
            title={name}
          >
            <span className="grid animate-spin-slow place-items-center" style={{ animationDuration: `${duration}s`, animationDirection: reverse ? 'normal' : 'reverse' }}>
              <Logo name={name} icon={icon} size={18} />
            </span>
          </span>
        );
      })}
    </div>
  );
  return (
    <div className="relative mx-auto h-[250px] w-full max-w-[300px]" aria-hidden="true">
      {ring(OUTER, 118, 60, true)}
      {ring(INNER, 70, 36, false)}
      <div className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-sodium/40 bg-ink text-[0.7rem] font-semibold tracking-[0.12em] shadow-[0_0_40px_-6px_rgb(255_138_61/0.7)]">
        MERN
      </div>
    </div>
  );
}

export default function About() {
  return (
    <section id="about" className="relative py-[clamp(90px,14vh,170px)]">
      <div className="wrap">
        <SectionHead index="01" label="About" title="Developer who ships," accent="end to end." sub="A quick look at who I am, where I work from and how I build." />

        <div className="mt-[clamp(36px,6vh,64px)] grid grid-cols-2 gap-[clamp(10px,1.2vw,16px)] lg:grid-cols-4">
          <Tile className="col-span-2 lg:row-span-2" index={0}>
            <TileLabel>About me</TileLabel>
            <p className="display mt-5 text-[clamp(1.6rem,1.2rem+1.4vw,2.4rem)] leading-[1.08] tracking-[-0.035em]">
              I turn ideas into <span className="serif text-accent-gradient">production-ready</span> web apps.
            </p>
            <p className="mt-5 text-[0.98rem] leading-relaxed text-fog">
              I’m Gavriel, a Software Engineering graduate from Pakistan. I build on the MERN stack with a modular MVC structure and care about the parts users never see: secure auth, clean APIs, tests and a CI pipeline that keeps it all honest. I’m looking to take ownership of features in a product team and keep growing.
            </p>
            <ul className="m-0 mt-6 grid list-none gap-2.5 p-0 text-[0.92rem]">
              {['Frontend, backend and full stack roles', 'Remote, or ready to relocate', 'English and Urdu'].map(item => (
                <li key={item} className="flex items-center gap-3">
                  <span className="size-1.5 rounded-full bg-sodium" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="serif mt-8 text-3xl text-bone/70">Gavriel Sadiq</p>
          </Tile>

          <Tile className="col-span-2 lg:row-span-2" index={1}>
            <TileLabel icon={MapPin}>Location</TileLabel>
            <p className="display mt-4 text-[clamp(1.4rem,1.1rem+1vw,2rem)] tracking-[-0.03em]">
              Based in Pakistan, <span className="serif text-accent-gradient">working worldwide.</span>
            </p>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 text-[0.9rem] text-fog">
              {site.location}
              <span className="text-bone/30" aria-hidden="true">·</span>
              <span>
                <LocalTime /> PKT (UTC+5)
              </span>
            </p>
            <div className="pointer-events-auto mx-auto -mb-[22%] mt-4 w-[min(100%,460px)]">
              <Globe />
            </div>
          </Tile>

          <Tile index={2}>
            <TileLabel>Projects</TileLabel>
            <b className="display mt-6 block text-[clamp(2rem,1.2rem+3.2vw,4.2rem)] leading-none tracking-[-0.05em]">
              <CountUp to={4} duration={1.6} />
            </b>
            <span className="mt-3 block text-[0.9rem] leading-snug text-fog">full stack builds, designed, coded and deployed by me</span>
          </Tile>

          <Tile index={3}>
            <TileLabel>SmartHire</TileLabel>
            <b className="display mt-6 block text-[clamp(2rem,1.2rem+3.2vw,4.2rem)] leading-none tracking-[-0.05em]">
              <CountUp to={30000} separator="," suffix="+" duration={2.2} />
            </b>
            <span className="mt-3 block text-[0.9rem] leading-snug text-fog">interview questions served, across 20+ technologies</span>
          </Tile>

          <Tile className="col-span-2" index={4}>
            <TileLabel icon={Sparkles}>AI-assisted workflow</TileLabel>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-fog">Five AI tools in the loop for planning, pair programming and review, and every line still goes through tests and CI.</p>
            <AIBeams />
          </Tile>

          <Tile className="col-span-2" index={5}>
            <TileLabel icon={GraduationCap}>Education</TileLabel>
            <div className="mt-5 flex items-start justify-between gap-4">
              <div>
                <p className="display m-0 text-[clamp(1.4rem,1.1rem+1vw,1.9rem)] tracking-[-0.03em]">BS Software Engineering</p>
                <p className="m-0 mt-1.5 text-[0.92rem] text-fog">PMAS Arid Agriculture University, Rawalpindi</p>
              </div>
              <span className="shrink-0 rounded-full border border-white/10 px-3 py-1 font-mono text-[0.72rem] text-fog">2022 – 26</span>
            </div>
            <p className="m-0 mt-6 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-[0.9rem] leading-relaxed">
              <span className="text-fog">Final year project · </span>SmartHire, an AI interview coach with voice answers and five-criteria scoring, supervised by Ms. Iram Rubab.
            </p>
            <ul className="m-0 mt-4 grid list-none gap-2 p-0 text-[0.86rem] text-fog">
              <li className="flex justify-between gap-4"><span>ICS, Degree College Jhelum</span><span className="shrink-0 whitespace-nowrap font-mono text-[0.72rem]">2020 – 22</span></li>
              <li className="flex justify-between gap-4"><span>Matriculation, M.A Jinnah Grammar High School</span><span className="shrink-0 whitespace-nowrap font-mono text-[0.72rem]">2018 – 20</span></li>
            </ul>
          </Tile>

          <Tile className="col-span-2" index={6}>
            <div className="grid items-center gap-4 sm:grid-cols-[1fr_1.1fr]">
              <div>
                <TileLabel>Core stack</TileLabel>
                <p className="display mt-4 text-[clamp(1.4rem,1.1rem+1vw,1.9rem)] tracking-[-0.03em]">
                  MERN at the core, <span className="serif text-accent-gradient">the right tools around it.</span>
                </p>
                <p className="mt-3 text-[0.9rem] text-fog">MongoDB, Express, React and Node.js, with Tailwind, Socket.io, Docker and CI.</p>
              </div>
              <Orbit />
            </div>
          </Tile>
        </div>
      </div>
    </section>
  );
}
