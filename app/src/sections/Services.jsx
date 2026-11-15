import { useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { services } from '../data/site.js';
import { useMediaQuery } from '../lib/hooks.js';
import SectionHead from '../components/SectionHead.jsx';
import Tilt from '../components/Tilt.jsx';
import { ServiceIcon } from '../components/Icons.jsx';
import SpotCard from '../components/SpotCard.jsx';

function Face({ service, index }) {
  return (
    <Tilt className="group h-full rounded-[clamp(16px,2vw,22px)]" max={7}>
      <SpotCard className="flex h-full flex-col overflow-hidden rounded-[inherit] p-[clamp(14px,2.2vw,28px)] preserve-3d">
        <div className="flex items-start justify-between" style={{ transform: 'translateZ(36px)' }}>
          <span className="relative grid size-[clamp(2.5rem,2rem+2vw,3.1rem)] place-items-center rounded-[clamp(10px,1.2vw,14px)] border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.01] text-sodium shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 [&>svg]:size-[52%]">
            <span className="absolute inset-0 rounded-[inherit] opacity-0 shadow-[0_0_30px_-4px_rgb(255_138_61/0.8)] transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true" />
            <ServiceIcon name={service.icon} />
          </span>
          <span className="font-mono text-[0.72rem] text-fog">{String(index + 1).padStart(2, '0')}</span>
        </div>
        <h3 className="display mt-[clamp(16px,3vw,40px)] text-[clamp(1.15rem,0.85rem+1.4vw,1.75rem)] tracking-[-0.035em]" style={{ transform: 'translateZ(48px)' }}>
          {service.title}
        </h3>
        <p className="mt-[clamp(6px,1vw,10px)] text-[clamp(0.78rem,0.7rem+0.4vw,0.95rem)] leading-[1.5] text-fog" style={{ transform: 'translateZ(24px)' }}>
          {service.text}
        </p>
        <ul className="m-0 mt-auto flex list-none flex-wrap gap-1 p-0 pt-[clamp(12px,2.4vw,26px)] sm:gap-1.5" style={{ transform: 'translateZ(30px)' }}>
          {service.tags.map(tag => (
            <li key={tag} className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[0.62rem] text-bone/75 sm:px-2.5 sm:py-1 sm:text-[0.74rem]">
              {tag}
            </li>
          ))}
        </ul>
      </SpotCard>
    </Tilt>
  );
}

function Back({ index }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden rounded-[clamp(16px,2vw,22px)] border border-white/10 bg-ink-2 [backface-visibility:hidden]"
      style={{ transform: 'rotateY(180deg)' }}
      aria-hidden="true"
    >
      <span className="dot-grid absolute inset-0 opacity-60" />
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgb(255_138_61/0.18),transparent_60%)]" />
      <b className="relative text-[clamp(2rem,1.4rem+2.6vw,3.2rem)] font-semibold tracking-[-0.05em]">
        GS<i className="not-italic text-sodium">.</i>
      </b>
      <span className="eyebrow relative">{String(index + 1).padStart(2, '0')} / 06</span>
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
    <motion.li className="relative will-change-transform" style={{ x, y, rotate, scale, zIndex: services.length - index, transformPerspective: 1400 }}>
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
          index="03"
          label="Services"
          title="What I can do"
          accent="for your team."
          sub="I take a feature from the first screen to the database and out to production. Scroll to deal the cards."
        />
        <Dealt key={wide ? 3 : 2} columns={wide ? 3 : 2} />
      </div>
    </section>
  );
}
