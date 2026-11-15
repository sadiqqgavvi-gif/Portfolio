import { useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { services } from '../data/site.js';
import { useMediaQuery } from '../lib/hooks.js';
import SectionHead from '../components/SectionHead.jsx';
import Tilt from '../components/Tilt.jsx';
import { ServiceIcon } from '../components/Icons.jsx';

function Face({ service, index }) {
  return (
    <Tilt className="group h-full rounded-[clamp(16px,2vw,24px)]">
      <div className="relative flex h-full flex-col overflow-hidden rounded-[inherit] panel border p-[clamp(14px,2.2vw,28px)] transition-colors duration-500 group-hover:border-sodium/60 preserve-3d">
        <span
          className="pointer-events-none absolute -right-10 -top-12 size-44 rounded-full bg-sodium/15 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
          aria-hidden="true"
        />
        <div className="flex items-start justify-between" style={{ transform: 'translateZ(36px)' }}>
          <span className="grid size-[clamp(2.5rem,2rem+2vw,3.25rem)] place-items-center rounded-[clamp(10px,1.2vw,16px)] border border-line bg-ink/80 text-sodium transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 [&>svg]:size-[55%]">
            <ServiceIcon name={service.icon} />
          </span>
          <span className="display text-[clamp(2rem,1.4rem+2.4vw,3rem)] text-outline">{String(index + 1).padStart(2, '0')}</span>
        </div>
        <h3 className="display mt-[clamp(14px,3vw,36px)] text-[clamp(1.35rem,0.9rem+2.2vw,2.1rem)]" style={{ transform: 'translateZ(48px)' }}>
          {service.title}
        </h3>
        <p className="mt-[clamp(6px,1vw,12px)] text-[clamp(0.78rem,0.68rem+0.5vw,0.96rem)] leading-[1.45] text-bone/70 sm:leading-relaxed" style={{ transform: 'translateZ(24px)' }}>
          {service.text}
        </p>
        <ul className="m-0 mt-auto flex list-none flex-wrap gap-1 p-0 pt-[clamp(12px,2.4vw,28px)] sm:gap-1.5" style={{ transform: 'translateZ(30px)' }}>
          {service.tags.map(tag => (
            <li key={tag} className="rounded-full border border-line px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-wider text-fog sm:px-2.5 sm:py-1 sm:text-[0.68rem]">
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </Tilt>
  );
}

function Back({ index }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-[clamp(16px,2vw,24px)] border border-sodium/40 bg-ink-3 [backface-visibility:hidden]"
      style={{
        transform: 'rotateY(180deg)',
        backgroundImage:
          'repeating-linear-gradient(45deg, rgb(255 154 77 / 0.07) 0 2px, transparent 2px 14px), repeating-linear-gradient(-45deg, rgb(95 211 199 / 0.06) 0 2px, transparent 2px 14px)'
      }}
      aria-hidden="true"
    >
      <b className="display text-[clamp(2.4rem,1.6rem+3vw,3.75rem)]">
        GS<i className="not-italic text-sodium">.</i>
      </b>
      <span className="eyebrow">{String(index + 1).padStart(2, '0')} · What I do</span>
    </div>
  );
}

// The six cards start as a face-down deck in the middle of the grid, then scrolling deals each one out to
// its place and flips it over: three columns on wide screens, two compact columns on phones and tablets.
function DealtCard({ service, index, columns, progress }) {
  const rows = Math.ceil(services.length / columns);
  const col = index % columns;
  const row = Math.floor(index / columns);
  const range = [index * 0.07, 0.55 + index * 0.07];
  const x = useTransform(progress, range, [`${((columns - 1) / 2 - col) * 104}%`, '0%'], { clamp: true });
  const y = useTransform(progress, range, [`${((rows - 1) / 2 - row) * 106 + 18}%`, '0%'], { clamp: true });
  const rotate = useTransform(progress, range, [(index - 2.5) * 5, 0], { clamp: true });
  const rotateY = useTransform(progress, [range[0] + 0.12, range[1]], [180, 0], { clamp: true });
  const scale = useTransform(progress, range, [0.86, 1], { clamp: true });

  return (
    <motion.li className="relative" style={{ x, y, rotate, scale, zIndex: services.length - index, transformPerspective: 1400 }}>
      <motion.div className="relative h-full preserve-3d" style={{ rotateY }}>
        <div className="h-full [backface-visibility:hidden] preserve-3d">
          <Face service={service} index={index} />
        </div>
        <Back index={index} />
      </motion.div>
    </motion.li>
  );
}

function Dealt({ columns }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 92%', 'start 18%'] });
  const eased = useSpring(scrollYProgress, { stiffness: 80, damping: 22, mass: 0.6 });
  const done = useMotionValue(1);
  return (
    <ul
      ref={ref}
      className="m-0 mt-[clamp(32px,7vh,84px)] grid list-none gap-[clamp(10px,1.6vw,20px)] p-0"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {services.map((service, index) => (
        <DealtCard key={service.title} service={service} index={index} columns={columns} progress={reduce ? done : eased} />
      ))}
    </ul>
  );
}

export default function Services() {
  const wide = useMediaQuery('(min-width: 1100px)');
  return (
    <section id="services" className="relative py-[clamp(80px,13vh,160px)]">
      <div className="wrap">
        <SectionHead
          index="02"
          label="What I do"
          title="Full features, front to back"
          sub="I take a feature from the first screen to the database and out to production."
        />
        <Dealt key={wide ? 3 : 2} columns={wide ? 3 : 2} />
      </div>
    </section>
  );
}
