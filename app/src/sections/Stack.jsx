import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValueEvent, useScroll } from 'motion/react';
import { mern, skills } from '../data/site.js';
import { sceneState } from '../lib/scene-state.js';
import SectionHead from '../components/SectionHead.jsx';
import Reveal from '../components/Reveal.jsx';

const ease = [0.16, 1, 0.3, 1];

export default function Stack() {
  const list = useRef(null);
  const inView = useInView(list, { margin: '-25% 0px -25% 0px' });
  const [scrolled, setScrolled] = useState(0);
  const [hovered, setHovered] = useState(null);
  const active = hovered ?? scrolled;

  // Scrolling through the list walks the highlight down the four rows.
  const { scrollYProgress } = useScroll({ target: list, offset: ['start 75%', 'end 40%'] });
  useMotionValueEvent(scrollYProgress, 'change', value => {
    setScrolled(Math.min(mern.length - 1, Math.max(0, Math.floor(value * mern.length))));
  });

  // The matching slab in the 3D stack lifts out while its row is active.
  useEffect(() => {
    sceneState.highlight = inView ? mern[active].layer : -1;
    return () => {
      sceneState.highlight = -1;
    };
  }, [active, inView]);

  return (
    <section id="stack" className="relative py-[clamp(80px,13vh,160px)]">
      <div className="wrap">
        <SectionHead
          index="03"
          label="Stack"
          title="The stack"
          sub="Four technologies I build every project on, plus the tools around them. Move over a row to pull its layer out of the stack."
        />

        <div className="mt-[clamp(36px,6vh,72px)] lg:w-[54%]" ref={list} role="list" onPointerLeave={() => setHovered(null)}>
          {mern.map((item, index) => {
            const on = active === index;
            return (
              <motion.div
                key={item.letter}
                role="listitem"
                tabIndex={0}
                onPointerEnter={() => setHovered(index)}
                onFocus={() => setHovered(index)}
                onBlur={() => setHovered(null)}
                className="group relative flex cursor-default items-center gap-[clamp(16px,3vw,40px)] border-t border-line py-[clamp(10px,1.8vh,20px)] outline-none last:border-b"
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                transition={{ duration: 1, ease, delay: index * 0.08 }}
              >
                <motion.span className="absolute inset-y-0 left-0 w-px origin-top bg-sodium" animate={{ scaleY: on ? 1 : 0 }} transition={{ duration: 0.5, ease }} aria-hidden="true" />
                <motion.span
                  className="display w-[0.72em] shrink-0 text-center text-[clamp(4.2rem,2rem+8.5vw,9.5rem)] leading-[0.82]"
                  animate={{ color: on ? '#ff9a4d' : 'rgba(232,236,230,0)', x: on ? 14 : 0 }}
                  transition={{ duration: 0.5, ease }}
                  style={{ WebkitTextStroke: on ? '1px #ff9a4d' : '1px rgb(232 236 230 / 0.4)' }}
                  aria-hidden="true"
                >
                  {item.letter}
                </motion.span>
                <motion.span className="min-w-0" animate={{ x: on ? 14 : 0 }} transition={{ duration: 0.5, ease }}>
                  <span className="display block text-[clamp(1.6rem,1.1rem+2vw,3rem)] leading-none">{item.name}</span>
                  <span className={`mt-1.5 block text-[0.95rem] transition-colors duration-500 ${on ? 'text-bone' : 'text-fog'}`}>{item.role}</span>
                </motion.span>
              </motion.div>
            );
          })}
        </div>

        <dl className="m-0 mt-[clamp(56px,10vh,120px)] grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2 xl:grid-cols-4">
          {skills.map((group, index) => (
            <Reveal key={group.title} delay={(index % 4) * 0.07} className="border-t border-line pt-4">
              <dt className={`eyebrow ${group.accent ? '!text-sodium' : ''}`}>{group.title}</dt>
              <dd className="m-0 mt-3 flex flex-wrap gap-1.5">
                {group.items.map(item => (
                  <span
                    key={item}
                    className={`rounded-full border px-3 py-1.5 text-[0.84rem] leading-none transition-colors duration-300 hover:border-sodium hover:text-sodium ${group.accent ? 'border-sodium/40 bg-sodium/10 text-bone' : 'border-line bg-ink/50 text-bone/90'}`}
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
