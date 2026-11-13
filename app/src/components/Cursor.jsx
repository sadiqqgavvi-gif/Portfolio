import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useMediaQuery } from '../lib/hooks.js';

const spring = { stiffness: 380, damping: 32, mass: 0.5 };

// A ring that trails the pointer, grows over links and buttons, and shows a short label over anything
// marked with data-cursor="…". The native cursor stays visible; this is an accent, not a replacement.
export default function Cursor() {
  const fine = useMediaQuery('(hover: hover) and (pointer: fine)');
  const reduce = useMediaQuery('(prefers-reduced-motion: reduce)');
  const x = useSpring(useMotionValue(-100), spring);
  const y = useSpring(useMotionValue(-100), spring);
  const [state, setState] = useState({ visible: false, hover: false, label: '' });

  useEffect(() => {
    if (!fine || reduce) return undefined;
    const onMove = event => {
      x.set(event.clientX);
      y.set(event.clientY);
      const target = event.target instanceof Element ? event.target : null;
      const labelled = target?.closest('[data-cursor]');
      const interactive = target?.closest('a, button, [role="button"]');
      const label = labelled?.getAttribute('data-cursor') ?? '';
      const hover = Boolean(interactive || labelled);
      setState(prev => (prev.visible && prev.hover === hover && prev.label === label ? prev : { visible: true, hover, label }));
    };
    const onLeave = () => setState(prev => ({ ...prev, visible: false }));
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [fine, reduce, x, y]);

  if (!fine || reduce) return null;
  const size = state.label ? 84 : state.hover ? 52 : 26;

  return (
    <motion.div className="pointer-events-none fixed left-0 top-0 z-[150]" style={{ x, y }} aria-hidden="true">
      <motion.div
        className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border font-mono text-[10px] font-medium uppercase tracking-[0.14em]"
        animate={{
          width: size,
          height: size,
          opacity: state.visible ? 1 : 0,
          backgroundColor: state.label ? 'rgb(255 154 77 / 0.95)' : 'rgb(255 154 77 / 0)',
          borderColor: state.label ? 'rgb(255 154 77 / 1)' : state.hover ? 'rgb(255 154 77 / 0.9)' : 'rgb(232 236 230 / 0.45)',
          color: '#050b10'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      >
        {state.label}
      </motion.div>
    </motion.div>
  );
}
