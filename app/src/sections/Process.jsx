import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { Check } from 'lucide-react';
import { process } from '../data/site.js';
import SectionHead from '../components/SectionHead.jsx';
import SpotCard from '../components/SpotCard.jsx';

const ease = [0.16, 1, 0.3, 1];

/* "How I work": four steps along a line that fills with light as you scroll (the "tracing beam"), each with
   a small code panel showing what that step looks like in practice. */
export default function Process() {
  const track = useRef(null);
  const { scrollYProgress } = useScroll({ target: track, offset: ['start 70%', 'end 60%'] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });
  const dotY = useTransform(fill, value => `${value * 100}%`);

  return (
    <section id="process" className="relative py-[clamp(90px,14vh,170px)]">
      <div className="wrap">
        <SectionHead index="04" label="Process" title="How I take a feature" accent="from idea to production." sub="The same four steps on every project, whether it is a chat app or an AI interview coach." />

        <div ref={track} className="relative mt-[clamp(40px,7vh,80px)] pl-10 sm:pl-16">
          <span className="absolute bottom-0 left-[11px] top-0 w-px bg-white/[0.08] sm:left-[23px]" aria-hidden="true" />
          <motion.span
            className="absolute left-[11px] top-0 w-px origin-top bg-gradient-to-b from-teal via-sodium to-sodium sm:left-[23px]"
            style={{ scaleY: fill, height: '100%' }}
            aria-hidden="true"
          />
          <motion.span
            className="absolute left-[11px] size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sodium shadow-[0_0_20px_4px_rgb(255_138_61/0.6)] sm:left-[23px]"
            style={{ top: dotY }}
            aria-hidden="true"
          />

          <ol className="m-0 grid list-none gap-[clamp(20px,4vh,40px)] p-0">
            {process.map((step, i) => (
              <motion.li
                key={step.title}
                className="relative"
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '0px 0px -12% 0px' }}
                transition={{ duration: 1, ease }}
              >
                <span className="absolute -left-10 top-6 grid size-6 -translate-x-1/2 place-items-center rounded-full border border-white/15 bg-ink font-mono text-[0.65rem] text-bone sm:-left-16 sm:size-8 sm:text-[0.72rem]" style={{ marginLeft: 'calc(var(--dot-x, 0px))' }}>
                  0{i + 1}
                </span>
                <SpotCard className="grid gap-6 overflow-hidden rounded-[22px] p-[clamp(18px,2.4vw,32px)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
                  <div>
                    <p className="eyebrow m-0">Step 0{i + 1}</p>
                    <h3 className="display m-0 mt-3 text-[clamp(1.6rem,1.2rem+1.4vw,2.4rem)] tracking-[-0.035em]">{step.title}</h3>
                    <p className="m-0 mt-3 text-[0.98rem] leading-relaxed text-fog">{step.text}</p>
                    <ul className="m-0 mt-5 flex list-none flex-wrap gap-2 p-0">
                      {step.points.map(point => (
                        <li key={point} className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[0.8rem]">
                          <Check size={13} className="text-emerald-400" aria-hidden="true" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#08090b] font-mono text-[clamp(0.72rem,0.68rem+0.2vw,0.84rem)] leading-relaxed" aria-hidden="true">
                    <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-3.5 py-2.5">
                      <i className="size-2.5 rounded-full bg-[#ff5f57]" />
                      <i className="size-2.5 rounded-full bg-[#febc2e]" />
                      <i className="size-2.5 rounded-full bg-[#28c840]" />
                      <span className="ml-2 text-[0.7rem] text-fog">{['plan.md', 'routes/orders.js', 'terminal', 'deploy'][i]}</span>
                    </div>
                    <pre className="m-0 overflow-x-auto px-4 py-4 text-bone/85">
                      {step.code.map((line, n) => (
                        <motion.span
                          key={n}
                          className="block whitespace-pre"
                          initial={{ opacity: 0, x: -8 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: 0.3 + n * 0.15 }}
                        >
                          <span className="mr-4 select-none text-white/20">{n + 1}</span>
                          <span className={line.includes('✓') ? 'text-emerald-400' : line.startsWith('$') ? 'text-teal' : ''}>{line}</span>
                        </motion.span>
                      ))}
                    </pre>
                  </div>
                </SpotCard>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
