import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { nav, site } from '../data/site.js';
import { useActiveSection, useKey } from '../lib/hooks.js';
import { lockScroll, scrollToTarget, unlockScroll } from '../lib/scroll.js';
import Button from './Button.jsx';

const ids = ['top', ...nav.map(item => item.id)];
const ease = [0.16, 1, 0.3, 1];

export default function Nav({ ready }) {
  const active = useActiveSection(ids);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', value => setScrolled(value > 40));

  useEffect(() => {
    if (!open) return undefined;
    lockScroll();
    return unlockScroll;
  }, [open]);
  useKey('Escape', () => setOpen(false), open);

  const go = (event, id) => {
    event.preventDefault();
    setOpen(false);
    // Wait a frame so the menu's scroll lock is released before the glide starts.
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToTarget(`#${id}`)));
  };

  return (
    <>
      {/* A soft veil keeps the nav readable when large type scrolls underneath it. */}
      <div
        className={`pointer-events-none fixed inset-x-0 top-0 z-[89] h-28 bg-gradient-to-b from-ink via-ink/70 to-transparent transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden="true"
      />
      <motion.header
        className="fixed inset-x-0 top-0 z-[90]"
        initial={{ y: -90, opacity: 0 }}
        animate={ready ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 1, ease, delay: 0.5 }}
      >
        <div className="wrap flex h-[var(--nav-h)] items-center justify-between gap-4">
          <a
            href="#top"
            onClick={event => go(event, 'top')}
            className="display text-2xl no-underline"
            aria-label="Gavriel Sadiq, back to top"
          >
            GS<span className="text-sodium">.</span>
          </a>

          <nav
            aria-label="Sections"
            className={`hidden rounded-full border px-1.5 py-1.5 transition-colors duration-500 lg:block ${scrolled ? 'glass border-line' : 'border-transparent'}`}
          >
            <ul className="m-0 flex list-none items-center gap-0.5 p-0">
              {nav.map(item => (
                <li key={item.id} className="relative">
                  <a
                    href={`#${item.id}`}
                    onClick={event => go(event, item.id)}
                    aria-current={active === item.id ? 'true' : undefined}
                    className={`relative z-10 block rounded-full px-4 py-2 text-[0.82rem] font-medium no-underline transition-colors duration-300 ${active === item.id ? 'text-ink' : 'text-fog hover:text-bone'}`}
                  >
                    {item.label}
                  </a>
                  {active === item.id && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-bone"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2.5">
            <Button href={site.resume} variant="solid" external className="!px-4 !py-2.5">
              Résumé
            </Button>
            <button
              type="button"
              className="glass relative grid size-11 place-items-center rounded-full border border-line lg:hidden"
              aria-expanded={open}
              aria-controls="menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen(value => !value)}
            >
              <motion.i className="absolute h-px w-4.5 bg-bone" animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -3.5 }} />
              <motion.i className="absolute h-px w-4.5 bg-bone" animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 3.5 }} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu"
            data-lenis-prevent
            className="fixed inset-0 z-[80] overflow-y-auto bg-ink/96 pt-[var(--nav-h)] backdrop-blur-xl lg:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav className="wrap flex min-h-full flex-col justify-between gap-10 pb-10 pt-6" aria-label="Sections">
              <ol className="m-0 list-none p-0">
                {nav.map((item, index) => (
                  <li key={item.id} className="overflow-hidden border-b border-line">
                    <motion.a
                      href={`#${item.id}`}
                      onClick={event => go(event, item.id)}
                      className="display flex items-baseline gap-4 py-3 text-[clamp(2.6rem,13vw,4.5rem)] no-underline"
                      initial={{ y: '110%' }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.8, ease, delay: 0.25 + index * 0.06 }}
                    >
                      <span className="font-mono text-xs font-normal tracking-widest text-sodium">0{index + 1}</span>
                      {item.label}
                    </motion.a>
                  </li>
                ))}
              </ol>
              <motion.div
                className="flex flex-col gap-2 font-mono text-sm text-fog"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <a href={`mailto:${site.email}`} className="text-bone">{site.email}</a>
                <a href={site.github} target="_blank" rel="noopener">GitHub</a>
                <a href={site.linkedin} target="_blank" rel="noopener">LinkedIn</a>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
