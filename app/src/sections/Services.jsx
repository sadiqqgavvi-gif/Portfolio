import { useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { services } from '../data/site.js';
import { useMediaQuery } from '../lib/hooks.js';
import SectionHead from '../components/SectionHead.jsx';
import Tilt from '../components/Tilt.jsx';
import { ServiceIcon } from '../components/Icons.jsx';

const ease = [0.16, 1, 0.3, 1];

function Face({ service, index }) {
  return (
    <Tilt className="group h-full rounded-3xl">
      <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-ink-2/85 p-7 backdrop-blur-md transition-colors duration-500 group-hover:border-sodium/50 preserve-3d">
        <span
          className="pointer-events-none absolute -right-10 -top-12 size-44 rounded-full bg-sodium/15 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
          aria-hidden="true"
        />
        <div className="flex items-start justify-between" style={{ transform: 'translateZ(36px)' }}>
          <span className="grid size-13 place-items-center rounded-2xl border border-line bg-ink text-sodium transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
            <ServiceIcon name={service.icon} />
          </span>
          <span className="display text-5xl text-outline">{String(index + 1).padStart(2, '0')}</span>
        </div>
        <h3 className="display mt-9 text-[2.1rem]" style={{ transform: 'translateZ(48px)' }}>
          {service.title}
        </h3>
        <p className="mt-3 text-[0.96rem] leading-relaxed text-fog" style={{ transform: 'translateZ(24px)' }}>
          {service.text}
        </p>
        <ul className="m-0 mt-auto flex list-none flex-wrap gap-1.5 p-0 pt-7" style={{ transform: 'translateZ(30px)' }}>
          {service.tags.map(tag => (
            <li key={tag} className="rounded-full border border-line px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-wider text-fog">
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
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-3xl border border-sodium/40 bg-ink-3 [backface-visibility:hidden]"
      style={{
        transform: 'rotateY(180deg)',
        backgroundImage:
          'repeating-linear-gradient(45deg, rgb(255 154 77 / 0.07) 0 2px, transparent 2px 14px), repeating-linear-gradient(-45deg, rgb(95 211 199 / 0.06) 0 2px, transparent 2px 14px)'
      }}
      aria-hidden="true"
    >
      <b className="display text-6xl">
        GS<i className="not-italic text-sodium">.</i>
      </b>
      <span className="eyebrow">{String(index + 1).padStart(2, '0')} · What I do</span>
    </div>
  );
}

// On wide screens the six cards start as a face-down deck in the middle of the grid, then scrolling
// deals each one out to its place and flips it over.
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
      className="m-0 mt-[clamp(40px,7vh,84px)] grid list-none gap-5 p-0"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {services.map((service, index) => (
        <DealtCard key={service.title} service={service} index={index} columns={columns} progress={reduce ? done : eased} />
      ))}
    </ul>
  );
}

function Listed() {
  return (
    <ul className="m-0 mt-10 grid list-none grid-cols-1 gap-4 p-0">
      {services.map((service, index) => (
        <motion.li
          key={service.title}
          initial={{ opacity: 0, y: 70, rotateX: -32, scale: 0.94 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          viewport={{ once: true, margin: '0px 0px -8% 0px' }}
          transition={{ duration: 1, ease }}
          style={{ transformPerspective: 900, transformOrigin: '50% 100%' }}
        >
          <Face service={service} index={index} />
        </motion.li>
      ))}
    </ul>
  );
}

export default function Services() {
  const wide = useMediaQuery('(min-width: 1100px)');
  const medium = useMediaQuery('(min-width: 700px)');
  return (
    <section id="services" className="relative py-[clamp(80px,13vh,160px)]">
      <div className="wrap">
        <SectionHead
          index="02"
          label="What I do"
          title="Full features, front to back"
          sub="I take a feature from the first screen to the database and out to production."
        />
        {medium ? <Dealt key={wide ? 3 : 2} columns={wide ? 3 : 2} /> : <Listed />}
      </div>
    </section>
  );
}
