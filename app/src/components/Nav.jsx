import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { nav, site } from '../data/site.js';
import { useActiveSection, useKey } from '../lib/hooks.js';
import { lockScroll, scrollToTarget, unlockScroll } from '../lib/scroll.js';

const ids = ['top', ...nav.map(item => item.id)];
const ease = [0.16, 1, 0.3, 1];

export default function Nav({ ready }) {
  const active = useActiveSection(ids);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', value => setScrolled(value > 30));

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
      <motion.header
        className="fixed inset-x-0 top-0 z-[90] px-3 pt-3 sm:pt-4"
        initial={{ y: -90, opacity: 0 }}
        animate={ready ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 1, ease, delay: 0.4 }}
      >
        <div
          className={`mx-auto flex h-[52px] max-w-[1080px] items-center justify-between gap-3 rounded-full border pl-4 pr-1.5 transition-[background-color,border-color,box-shadow] duration-500 ${
            scrolled
              ? 'border-white/[0.09] bg-[#0c0d10]/80 shadow-[0_10px_40px_-12px_rgb(0_0_0/0.9)] backdrop-blur-xl'
              : 'border-transparent bg-transparent'
          }`}
        >
          <a href="#top" onClick={event => go(event, 'top')} className="text-[1.15rem] font-semibold tracking-[-0.05em] no-underline" aria-label="Gavriel Sadiq, back to top">
            GS<span className="text-sodium">.</span>
          </a>

          <nav aria-label="Sections" className="hidden lg:block">
            <ul className="m-0 flex list-none items-center gap-0.5 p-0">
              {nav.map(item => (
                <li key={item.id} className="relative">
                  <a
                    href={`#${item.id}`}
                    onClick={event => go(event, item.id)}
                    aria-current={active === item.id ? 'true' : undefined}
                    className={`relative z-10 block rounded-full px-3.5 py-2 text-[0.86rem] no-underline transition-colors duration-300 ${active === item.id ? 'text-bone' : 'text-fog hover:text-bone'}`}
                  >
                    {item.label}
                  </a>
                  {active === item.id && (
                    <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-white/[0.08]" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5">
            <a
              href={site.resume}
              target="_blank"
              rel="noopener"
              className="hidden rounded-full px-3.5 py-2 text-[0.86rem] text-fog no-underline transition-colors hover:text-bone sm:block"
            >
              Résumé
            </a>
            <a
              href="#contact"
              onClick={event => go(event, 'contact')}
              className="group inline-flex items-center gap-1.5 rounded-full bg-bone px-4 py-2.5 text-[0.86rem] font-medium text-ink no-underline transition-shadow duration-300 hover:shadow-[0_8px_30px_-6px_rgb(255_138_61/0.7)]"
            >
              Hire me
              <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
            <button
              type="button"
              className="relative grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] lg:hidden"
              aria-expanded={open}
              aria-controls="menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen(value => !value)}
            >
              <motion.i className="absolute h-px w-4 bg-bone" animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -3 }} />
              <motion.i className="absolute h-px w-4 bg-bone" animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 3 }} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu"
            data-lenis-prevent
            className="fixed inset-0 z-[80] overflow-y-auto bg-ink/[0.98] pt-24 lg:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav className="wrap flex min-h-full flex-col justify-between gap-10 pb-10" aria-label="Sections">
              <ol className="m-0 list-none p-0">
                {nav.map((item, index) => (
                  <li key={item.id} className="overflow-hidden border-b border-line">
                    <motion.a
                      href={`#${item.id}`}
                      onClick={event => go(event, item.id)}
                      className="display flex items-baseline gap-4 py-4 text-[clamp(2.2rem,11vw,3.6rem)] no-underline"
                      initial={{ y: '110%' }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.8, ease, delay: 0.25 + index * 0.06 }}
                    >
                      <span className="font-mono text-xs font-normal tracking-normal text-sodium">0{index + 1}</span>
                      {item.label}
                    </motion.a>
                  </li>
                ))}
              </ol>
              <motion.div className="flex flex-col gap-2 text-sm text-fog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                <a href={`mailto:${site.email}`} className="text-bone">{site.email}</a>
                <a href={site.github} target="_blank" rel="noopener">GitHub</a>
                <a href={site.linkedin} target="_blank" rel="noopener">LinkedIn</a>
                <a href={site.resume} target="_blank" rel="noopener">Résumé (PDF)</a>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
