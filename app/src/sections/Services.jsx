import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { services } from '../data/site.js';
import SectionHead from '../components/SectionHead.jsx';
import SpotCard from '../components/SpotCard.jsx';
import { ServiceIcon } from '../components/Icons.jsx';
import { demos } from '../components/demos/ServiceDemos.jsx';

const ACCENTS = ['#ff8a3d', '#56d8c9', '#ff6b8b', '#5aa2ff', '#7c9bff', '#3ddc97'];

function ServiceCard({ service, index }) {
  const Demo = demos[service.icon];
  const accent = ACCENTS[index % ACCENTS.length];
  return (
    <SpotCard
      color={accent}
      className="group flex h-full w-full flex-col overflow-hidden rounded-[24px] p-[clamp(14px,1.6vw,22px)]"
      style={{ backgroundImage: `radial-gradient(120% 70% at 50% 0%, ${accent}1f, transparent 60%)` }}
    >
      <div className="relative min-h-0 flex-1">
        <span className="pointer-events-none absolute -inset-4 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `radial-gradient(60% 60% at 50% 40%, ${accent}22, transparent)` }} aria-hidden="true" />
        <div className="own-layer relative h-full" aria-hidden="true">
          <Demo />
        </div>
      </div>
      <div className="shrink-0 pt-[clamp(14px,2vh,22px)]">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] [&>svg]:size-5" style={{ color: accent }}>
            <ServiceIcon name={service.icon} />
          </span>
          <span className="font-mono text-[0.72rem] text-fog">{String(index + 1).padStart(2, '0')} / {String(services.length).padStart(2, '0')}</span>
        </div>
        <h3 className="m-0 mt-3 text-[clamp(1.3rem,1.1rem+0.8vw,1.75rem)] font-semibold tracking-[-0.035em]">{service.title}</h3>
        <p className="m-0 mt-2 text-[0.92rem] leading-relaxed text-fog">{service.text}</p>
        <ul className="m-0 mt-4 flex list-none flex-wrap gap-1.5 p-0">
          {service.tags.map(tag => (
            <li key={tag} className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[0.74rem] text-bone/80">
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </SpotCard>
  );
}

/* The six services ride a horizontal track while the section is pinned: scrolling down slides them left,
   each card running a small live demo of that service. Same flow on every screen size. */
function Track() {
  const pin = useRef(null);
  const rail = useRef(null);
  const [distance, setDistance] = useState(0);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: pin, offset: ['start start', 'end end'] });
  // Tied straight to the scroll position: the page's own smooth scrolling already eases it on desktop, and on
  // phones the cards stay under the finger instead of trailing behind it.
  const x = useTransform(scrollYProgress, value => -value * distance);
  const bar = scrollYProgress;
  useMotionValueEvent(scrollYProgress, 'change', value => setActive(Math.min(services.length - 1, Math.round(value * (services.length - 1)))));

  useLayoutEffect(() => {
    const measure = () => {
      if (!rail.current) return;
      setDistance(Math.max(0, rail.current.scrollWidth - rail.current.parentElement.clientWidth));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(rail.current);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    // The pinned stretch is as long as the sideways travel, so a scroll down moves the cards the same distance.
    <div ref={pin} className="relative" style={{ height: `calc(100svh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden pt-[var(--nav-h)]">
        <div className="wrap">
          <motion.div ref={rail} className="flex w-max gap-[clamp(12px,1.6vw,20px)] will-change-transform" style={{ x }}>
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                className="h-[min(560px,calc(100svh-var(--nav-h)-120px))] w-[min(82vw,400px)] shrink-0"
                initial={{ opacity: 0, y: 60, rotate: 2 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true, margin: '0px -5% -10% 0px' }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: Math.min(index, 3) * 0.08 }}
              >
                <ServiceCard service={service} index={index} />
              </motion.div>
            ))}
            <div className="flex w-[min(70vw,320px)] shrink-0 flex-col justify-center pr-[var(--gutter)]">
              <p className="display m-0 text-[clamp(1.8rem,1.3rem+1.6vw,2.6rem)]">
                Need one of these? <span className="serif text-accent-gradient">Let’s talk.</span>
              </p>
              <a href="#contact" className="link-line mt-4 w-fit text-[0.95rem] text-bone no-underline">
                Get in touch →
              </a>
            </div>
          </motion.div>

          <div className="mt-[clamp(16px,3vh,28px)] flex items-center gap-4" aria-hidden="true">
            <span className="font-mono text-[0.72rem] text-sodium">{String(active + 1).padStart(2, '0')}</span>
            <span className="relative h-px flex-1 overflow-hidden bg-white/10">
              <motion.span className="absolute inset-0 origin-left bg-gradient-to-r from-teal via-sodium to-[#ff5e7a]" style={{ scaleX: bar }} />
            </span>
            <span className="font-mono text-[0.72rem] text-fog">{String(services.length).padStart(2, '0')}</span>
            <span className="hidden text-[0.75rem] text-fog sm:inline">Scroll to explore →</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reduced motion: the same cards in a plain grid.
function Grid() {
  return (
    <div className="wrap mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {services.map((service, index) => (
        <div key={service.title} className="h-[520px]">
          <ServiceCard service={service} index={index} />
        </div>
      ))}
    </div>
  );
}

export default function Services() {
  const reduce = useReducedMotion();
  return (
    <section id="services" className="relative pt-[clamp(90px,14vh,170px)]">
      <div className="wrap">
        <SectionHead index="03" label="Services" title="What I can do" accent="for your team." sub="Six things I do end to end. Each card runs a small live demo of the work itself." />
      </div>
      {reduce ? <Grid /> : <Track />}
    </section>
  );
}
