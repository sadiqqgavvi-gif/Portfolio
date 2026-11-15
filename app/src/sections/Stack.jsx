import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValueEvent, useScroll, useSpring } from 'motion/react';
import { mern, skills } from '../data/site.js';
import { sceneState } from '../lib/scene-state.js';
import SectionHead from '../components/SectionHead.jsx';
import Reveal from '../components/Reveal.jsx';

const ease = [0.16, 1, 0.3, 1];

/* The four rows are pinned to the screen while the 3D stack hangs pulled apart beside them (above them on
   tall screens). Scrolling walks the highlight from M to N, and the matching slab lifts out of the stack. */
export default function Stack() {
  const pin = useRef(null);
  const inView = useInView(pin, { margin: '-40% 0px -40% 0px' });
  const [scrolled, setScrolled] = useState(0);
  const [hovered, setHovered] = useState(null);
  const active = hovered ?? scrolled;

  const { scrollYProgress } = useScroll({ target: pin, offset: ['start start', 'end end'] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  useMotionValueEvent(scrollYProgress, 'change', value => {
    setScrolled(Math.min(mern.length - 1, Math.max(0, Math.floor(value * mern.length * 0.999))));
  });

  useEffect(() => {
    sceneState.highlight = inView ? mern[active].layer : -1;
    return () => {
      sceneState.highlight = -1;
    };
  }, [active, inView]);

  return (
    <section id="stack" className="relative pt-[clamp(80px,13vh,160px)]">
      <div className="wrap">
        <SectionHead index="03" label="Stack" title="The stack" sub="Four technologies I build every project on, plus the tools around them." />
      </div>

      <div id="stack-pin" ref={pin} className="relative h-[260svh]">
        <div className="wrap sticky top-0 flex h-svh flex-col justify-end pb-[clamp(18px,4svh,48px)] pt-[var(--nav-h)] lg:justify-center lg:pb-0">
          <div data-stage-edge="pin" className="lg:w-[52%]" role="list" onPointerLeave={() => setHovered(null)}>
            {mern.map((item, index) => {
              const on = active === index;
              return (
                <div
                  key={item.letter}
                  role="listitem"
                  onPointerEnter={event => event.pointerType === 'mouse' && setHovered(index)}
                  className="relative flex items-center gap-[clamp(14px,3vw,40px)] border-t border-line py-[clamp(6px,1.5svh,20px)] last:border-b"
                >
                  <motion.span className="absolute inset-y-0 left-0 w-px origin-top bg-sodium" animate={{ scaleY: on ? 1 : 0 }} transition={{ duration: 0.5, ease }} aria-hidden="true" />
                  <motion.span
                    className="display w-[0.72em] shrink-0 text-center text-[clamp(3.4rem,min(8.5vw,11.5svh),9.5rem)] leading-[0.82]"
                    animate={{ color: on ? '#ff9a4d' : 'rgba(232,236,230,0)', x: on ? 14 : 0 }}
                    transition={{ duration: 0.5, ease }}
                    style={{ WebkitTextStroke: on ? '1px #ff9a4d' : '1px rgb(232 236 230 / 0.45)' }}
                    aria-hidden="true"
                  >
                    {item.letter}
                  </motion.span>
                  <motion.span className="min-w-0" animate={{ x: on ? 14 : 0 }} transition={{ duration: 0.5, ease }}>
                    <span className="display block text-[clamp(1.5rem,min(3vw,4.4svh),3rem)] leading-none">{item.name}</span>
                    <span className={`mt-1 block text-[clamp(0.82rem,0.78rem+0.2vw,0.95rem)] transition-colors duration-500 ${on ? 'text-bone' : 'text-fog'}`}>{item.role}</span>
                  </motion.span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-4 lg:w-[52%]" aria-hidden="true">
            <span className="font-mono text-xs tracking-widest text-sodium">0{active + 1}</span>
            <span className="h-px flex-1 bg-line">
              <motion.span className="block h-full origin-left bg-gradient-to-r from-teal to-sodium" style={{ scaleX: progress }} />
            </span>
            <span className="font-mono text-xs tracking-widest text-fog">04</span>
          </div>
        </div>
      </div>

      <div className="wrap" id="skills">
        <dl className="m-0 grid grid-cols-2 gap-x-[clamp(16px,3vw,40px)] gap-y-9 pt-[clamp(48px,9vh,110px)] xl:grid-cols-4">
          {skills.map((group, index) => (
            <Reveal key={group.title} delay={(index % 4) * 0.07} className="border-t border-line pt-4">
              <dt className={`eyebrow ${group.accent ? '!text-sodium' : ''}`}>{group.title}</dt>
              <dd className="m-0 mt-3 flex flex-wrap gap-1.5">
                {group.items.map(item => (
                  <span
                    key={item}
                    className={`rounded-full border bg-ink/70 px-3 py-1.5 text-[clamp(0.76rem,0.7rem+0.3vw,0.84rem)] leading-none transition-colors duration-300 hover:border-sodium hover:text-sodium ${group.accent ? 'border-sodium/50 text-bone' : 'border-line text-bone/90'}`}
                  >
                    {item}
                  </span>
                ))}
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
