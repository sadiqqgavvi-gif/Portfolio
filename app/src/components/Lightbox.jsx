import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useKey } from '../lib/hooks.js';

const pad = value => String(value).padStart(2, '0');
const control =
  'grid size-12 place-items-center rounded-full border border-line bg-ink/80 text-bone backdrop-blur-md transition-colors duration-300 hover:border-sodium hover:bg-sodium hover:text-ink';

// Full-screen viewer for one project's screenshots: arrows, keyboard and swipe move between them.
export default function Lightbox({ shots, index, accent, onChange, onClose }) {
  const [direction, setDirection] = useState(0);
  const closeButton = useRef(null);
  const shot = shots[index];
  // Long page captures are shown at reading width and scroll; everything else fits the screen.
  const long = shot.h / shot.w > 0.9 && shot.w >= 1000;

  const step = useCallback(
    by => {
      setDirection(by);
      onChange((index + by + shots.length) % shots.length);
    },
    [index, shots.length, onChange]
  );
  const previous = useCallback(() => step(-1), [step]);
  const forward = useCallback(() => step(1), [step]);

  useKey('ArrowLeft', previous);
  useKey('ArrowRight', forward);
  useKey('Escape', onClose);
  useEffect(() => {
    closeButton.current?.focus({ preventScroll: true });
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[140] flex flex-col bg-ink/96 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label="Screenshot viewer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex shrink-0 items-center justify-between gap-4 px-[clamp(14px,3vw,32px)] py-3">
        <p className="m-0 flex min-w-0 items-baseline gap-3 text-sm" aria-live="polite">
          <b className="font-mono text-xs font-medium tracking-widest" style={{ color: accent }}>
            {pad(index + 1)} / {pad(shots.length)}
          </b>
          <span className="truncate text-bone/90">{shot.caption}</span>
        </p>
        <button type="button" ref={closeButton} onClick={onClose} aria-label="Close viewer" className={control}>
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="relative min-h-0 flex-1" onClick={event => event.target === event.currentTarget && onClose()}>
        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
          <motion.div
            key={shot.src}
            custom={direction}
            data-lenis-prevent
            className={`absolute inset-0 flex justify-center px-[clamp(8px,5vw,84px)] pb-4 ${long ? 'items-start overflow-y-auto overscroll-contain' : 'items-center'}`}
            variants={{
              enter: dir => ({ opacity: 0, x: dir * 90, scale: 0.96 }),
              center: { opacity: 1, x: 0, scale: 1 },
              exit: dir => ({ opacity: 0, x: dir * -90, scale: 0.96 })
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            drag={long ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={(_, info) => {
              if (info.offset.x < -70) forward();
              else if (info.offset.x > 70) previous();
            }}
            onClick={event => event.target === event.currentTarget && onClose()}
          >
            <img
              src={shot.src}
              width={shot.w}
              height={shot.h}
              alt={shot.caption}
              draggable="false"
              className={`rounded-lg border border-white/12 shadow-[0_40px_120px_rgb(0_0_0/0.8)] ${long ? 'h-auto w-full max-w-[1100px]' : 'h-auto max-h-full w-auto max-w-full object-contain'}`}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex shrink-0 items-center justify-center gap-3 pb-[max(14px,env(safe-area-inset-bottom))] pt-2">
        <button type="button" onClick={previous} aria-label="Previous screenshot" className={control}>
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <button type="button" onClick={forward} aria-label="Next screenshot" className={control}>
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
}
