import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { journey } from '../data/site.js';
import SectionHead from '../components/SectionHead.jsx';

const ease = [0.16, 1, 0.3, 1];

export default function Journey() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 55%'] });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  return (
    <section id="journey" className="relative py-[clamp(80px,13vh,160px)]">
      <div className="wrap">
        <SectionHead index="05" label="Journey" title="Journey" sub="The path that got me building full stack apps." />

        <div ref={ref} className="relative mt-[clamp(40px,7vh,84px)] lg:w-[68%]">
          {/* The rail fills in as the list scrolls past. */}
          <span className="absolute bottom-0 left-[7px] top-0 w-px bg-line" aria-hidden="true" />
          <motion.span className="absolute bottom-0 left-[7px] top-0 w-px origin-top bg-gradient-to-b from-teal to-sodium" style={{ scaleY: fill }} aria-hidden="true" />

          <ol className="m-0 list-none p-0">
            {journey.map((item, index) => (
              <motion.li
                key={item.title}
                className="relative grid gap-x-[clamp(20px,4vw,60px)] gap-y-2 pb-[clamp(36px,6vh,64px)] pl-10 last:pb-0 md:grid-cols-[minmax(170px,0.42fr)_1fr]"
                initial={{ opacity: 0, x: 70 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '0px 0px -15% 0px' }}
                transition={{ duration: 1.1, ease, delay: index * 0.05 }}
              >
                <motion.span
                  className="absolute left-0 top-2.5 size-[15px] rounded-full border-2 border-sodium bg-ink"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: '0px 0px -15% 0px' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.2 }}
                  aria-hidden="true"
                />
                <div>
                  <span className="display block text-[clamp(2.2rem,1.5rem+2.6vw,3.8rem)] leading-none">{item.years}</span>
                  <small className="eyebrow mt-2 block !text-teal">{item.status}</small>
                </div>
                <div className="rounded-2xl border border-line bg-ink-2/70 p-[clamp(18px,2.4vw,30px)] backdrop-blur-md transition-colors duration-500 hover:border-sodium/50">
                  <h3 className="display m-0 text-[clamp(1.6rem,1.2rem+1.5vw,2.5rem)] leading-[0.95]">{item.title}</h3>
                  <p className="m-0 mt-2 text-fog">{item.place}</p>
                  {item.note && <p className="m-0 mt-4 border-t border-line pt-4 text-[0.95rem] text-bone/90">{item.note}</p>}
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
