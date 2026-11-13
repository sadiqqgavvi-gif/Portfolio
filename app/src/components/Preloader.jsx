import { useEffect, useState } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { lockScroll, prefersReducedMotion, unlockScroll } from '../lib/scroll.js';

const ease = [0.76, 0, 0.24, 1];

// Opening curtain: a counter runs to 100, then two panels part and the hero animates in behind them.
export default function Preloader({ onDone }) {
  const [phase, setPhase] = useState(() => (prefersReducedMotion() ? 'gone' : 'count'));
  const count = useMotionValue(0);
  const label = useTransform(count, value => String(Math.round(value)).padStart(3, '0'));
  const bar = useTransform(count, value => value / 100);

  useEffect(() => {
    if (phase === 'gone') {
      onDone();
      return undefined;
    }
    if (phase !== 'count') return undefined;
    lockScroll();
    window.scrollTo(0, 0);
    const controls = animate(count, 100, {
      duration: 1.5,
      ease: [0.3, 0, 0.2, 1],
      onComplete: () => {
        setPhase('open');
        onDone();
      }
    });
    return () => {
      controls.stop();
      unlockScroll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase === 'gone']);

  if (phase === 'gone') return null;
  const open = phase === 'open';

  return (
    <div className="fixed inset-0 z-[200]" aria-hidden="true" style={{ pointerEvents: open ? 'none' : 'auto' }}>
      <motion.div
        className="absolute inset-x-0 top-0 h-1/2 bg-ink"
        animate={{ y: open ? '-101%' : 0 }}
        transition={{ duration: 1.1, ease }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 h-1/2 bg-ink"
        animate={{ y: open ? '101%' : 0 }}
        transition={{ duration: 1.1, ease }}
        onAnimationComplete={() => open && setPhase('gone')}
      />
      <motion.div
        className="wrap absolute inset-0 flex flex-col justify-end pb-[max(8vh,40px)]"
        animate={{ opacity: open ? 0 : 1, y: open ? -30 : 0 }}
        transition={{ duration: 0.45 }}
      >
        <span className="eyebrow">Gavriel Sadiq · Portfolio</span>
        <div className="mt-2 flex items-end justify-between gap-6">
          <span className="display text-[clamp(5rem,22vw,15rem)] leading-[0.8] tabular-nums">
            <motion.span>{label}</motion.span>
            <small className="ml-2 text-[0.28em] text-sodium">%</small>
          </span>
          <span className="eyebrow hidden pb-3 sm:block">Loading the stage</span>
        </div>
        <div className="mt-6 h-px w-full bg-line">
          <motion.div className="h-full origin-left bg-gradient-to-r from-teal to-sodium" style={{ scaleX: bar }} />
        </div>
      </motion.div>
    </div>
  );
}
