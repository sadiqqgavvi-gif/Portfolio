import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { roles, site } from '../data/site.js';
import Button from '../components/Button.jsx';
import RotatingText from '../components/reactbits/RotatingText.jsx';
import DecryptedText from '../components/reactbits/DecryptedText.jsx';

const ease = [0.16, 1, 0.3, 1];

// One line of the name. Every letter rises out of a mask, and thins out while the pointer is on it
// (the display face is variable, so weight can animate).
function NameLine({ text, ready, delay, accent = false }) {
  return (
    <span className="flex overflow-hidden pb-[0.04em] pt-[0.08em]" aria-hidden="true">
      {[...text].map((char, index) => (
        <motion.span
          key={index}
          className="inline-block transition-[font-weight,color] duration-500 ease-out hover:font-[300] hover:text-sodium"
          initial={{ y: '115%', rotate: 7 }}
          animate={ready ? { y: 0, rotate: 0 } : {}}
          transition={{ duration: 1.25, ease, delay: delay + index * 0.045 }}
          style={{ transformOrigin: '0% 100%' }}
        >
          {char}
        </motion.span>
      ))}
      {accent && (
        <motion.span
          className="inline-block text-sodium"
          initial={{ scale: 0 }}
          animate={ready ? { scale: 1 } : {}}
          transition={{ type: 'spring', stiffness: 260, damping: 14, delay: delay + 0.75 }}
          style={{ transformOrigin: '50% 85%' }}
        >
          .
        </motion.span>
      )}
    </span>
  );
}

export default function Hero({ ready }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const fade = (delay, distance = 28) => ({
    initial: { opacity: 0, y: distance },
    animate: ready ? { opacity: 1, y: 0 } : {},
    transition: { duration: 1, ease, delay }
  });

  return (
    <section id="top" ref={ref} className="relative flex min-h-svh flex-col justify-end pb-[clamp(28px,6vh,64px)] pt-[calc(var(--nav-h)+24px)]">
      <motion.div className="wrap" style={{ y, opacity }}>
        <motion.p className="eyebrow !text-teal" {...fade(0.15, 12)}>
          {ready ? <DecryptedText text="// Full stack web developer · MERN" animateOn="view" sequential speed={28} /> : ' '}
        </motion.p>

        <h1 className="display mt-3 text-[clamp(4.6rem,1rem+17.5vw,16.5rem)] leading-[0.8]" aria-label={site.name}>
          <NameLine text="Gavriel" ready={ready} delay={0.1} />
          <NameLine text="Sadiq" ready={ready} delay={0.26} accent />
        </h1>

        <motion.div
          className="mt-6 flex max-w-2xl flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[clamp(1.1rem,0.95rem+0.9vw,1.6rem)] font-medium leading-snug"
          {...fade(0.75)}
        >
          <span>I build</span>
          <RotatingText
            texts={roles}
            highlight
            highlightColor="#ff9a4d"
            transition={{ type: 'tween', duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
            animatePresenceMode="popLayout"
            staggerDuration={0.01}
            rotationInterval={2800}
            mainClassName="font-semibold"
          />
          <span className="basis-full text-fog">and use AI tools to ship them faster.</span>
        </motion.div>

        <motion.div className="mt-8 flex flex-wrap items-end justify-between gap-x-10 gap-y-7" {...fade(0.9)}>
          <div className="flex flex-wrap gap-3">
            <Button href="#work" variant="solid">
              See my work <ArrowDown size={16} strokeWidth={2.2} aria-hidden="true" />
            </Button>
            <Button href={site.resume} external>
              Download résumé <ArrowUpRight size={16} strokeWidth={2.2} aria-hidden="true" />
            </Button>
          </div>
          <ul className="m-0 flex list-none flex-wrap gap-x-7 gap-y-1.5 p-0 font-mono text-[0.76rem] uppercase tracking-[0.1em] text-fog">
            <li className="flex items-center gap-2.5 text-bone">
              <span className="size-2 animate-pulse-dot rounded-full bg-teal" aria-hidden="true" />
              Open to remote and on-site roles
            </li>
            <li>{site.location}</li>
            <li>BS Software Engineering, 2026</li>
          </ul>
        </motion.div>
      </motion.div>

      <motion.p
        className="eyebrow pointer-events-none absolute right-[var(--gutter)] top-[calc(var(--nav-h)+3vh)] hidden text-right lg:block"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ duration: 1.2, delay: 1.5 }}
        aria-hidden="true"
      >
        Fig. 01 · The full stack
        <span className="mt-1 block normal-case tracking-normal text-fog/60">interface → api → runtime → data</span>
      </motion.p>
    </section>
  );
}
