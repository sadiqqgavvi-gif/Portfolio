import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { projects } from '../data/projects.js';
import { useKey } from '../lib/hooks.js';
import { lockScroll, unlockScroll } from '../lib/scroll.js';
import { sceneState } from '../lib/scene-state.js';
import Button from './Button.jsx';
import Lightbox from './Lightbox.jsx';
import { BrowserFrame, Shot } from './Frames.jsx';
import { GitHubIcon } from './Icons.jsx';

const ease = [0.16, 1, 0.3, 1];
const pad = value => String(value).padStart(2, '0');

function Block({ label, children, className = '' }) {
  return (
    <div className={className}>
      <p className="eyebrow !text-[color:var(--accent)]">{label}</p>
      {children}
    </div>
  );
}

/* A full-height sheet that slides up over the page with everything about one project: the idea, what was
   built, how the interesting part works, and every screenshot from its repository. */
export default function CaseStudy({ projectId, onClose, onNavigate }) {
  const index = projects.findIndex(item => item.id === projectId);
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];
  const scroller = useRef(null);
  const closeButton = useRef(null);
  const [viewing, setViewing] = useState(null);
  const { scrollYProgress } = useScroll({ container: scroller });
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  const heroScale = useTransform(scrollYProgress, [0, 0.25], [0.94, 1]);
  const view = { once: true, root: scroller, margin: '0px 0px -8% 0px' };

  useEffect(() => {
    const previous = document.activeElement;
    const page = document.getElementById('page');
    lockScroll();
    sceneState.paused = true;
    if (page) page.inert = true;
    closeButton.current?.focus({ preventScroll: true });
    return () => {
      unlockScroll();
      sceneState.paused = false;
      if (page) page.inert = false;
      previous?.focus?.({ preventScroll: true });
    };
  }, []);

  // Moving to the next project keeps the sheet open and starts it again from the top.
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
    setViewing(null);
  }, [projectId]);

  const escape = useCallback(() => {
    if (viewing === null) onClose();
  }, [viewing, onClose]);
  useKey('Escape', escape);

  return createPortal(
    <div className="fixed inset-0 z-[120]" role="dialog" aria-modal="true" aria-label={`${project.name} case study`} style={{ '--accent': project.accent }}>
      <motion.div
        className="absolute inset-0 bg-ink/75 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        onClick={onClose}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 top-2 mx-auto flex max-w-[1560px] flex-col overflow-hidden rounded-t-[clamp(18px,2.4vw,32px)] border border-b-0 border-white/12 bg-[#081319] shadow-[0_-30px_120px_rgb(0_0_0/0.7)] sm:top-4 xl:inset-x-4"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.85, ease: [0.32, 0.72, 0, 1] }}
      >
        <header className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-b border-line bg-[#081319]/90 px-[clamp(14px,3vw,36px)] py-3 backdrop-blur-md">
          <p className="m-0 flex min-w-0 items-baseline gap-3">
            <span className="font-mono text-xs tracking-widest" style={{ color: project.accent }}>
              {pad(index + 1)} / {pad(projects.length)}
            </span>
            <span className="display truncate text-2xl">{project.name}</span>
          </p>
          <div className="flex shrink-0 items-center gap-2">
            {project.live && (
              <Button href={project.live} external magnetic={false} variant="solid" className="!px-4 !py-2.5 max-sm:hidden">
                Live demo <ArrowUpRight size={14} strokeWidth={2.2} aria-hidden="true" />
              </Button>
            )}
            <Button href={project.code} external magnetic={false} className="!px-4 !py-2.5 max-sm:hidden">
              <GitHubIcon width="15" height="15" /> Code
            </Button>
            <button
              type="button"
              ref={closeButton}
              onClick={onClose}
              aria-label="Close case study"
              className="grid size-11 place-items-center rounded-full border border-line bg-ink text-bone transition-colors duration-300 hover:border-sodium hover:bg-sodium hover:text-ink"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <motion.span className="absolute inset-x-0 bottom-[-1px] h-px origin-left" style={{ scaleX: progress, background: project.accent }} aria-hidden="true" />
        </header>

        <div ref={scroller} data-lenis-prevent className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <AnimatePresence mode="wait">
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease }}
            >
              {/* Opening */}
              <div
                className="relative overflow-hidden px-[clamp(16px,4vw,64px)] pb-[clamp(28px,5vh,56px)] pt-[clamp(36px,7vh,84px)]"
                style={{ backgroundImage: `radial-gradient(70% 90% at 80% 0%, color-mix(in srgb, ${project.accent} 22%, transparent), transparent 65%)` }}
              >
                <span className="inline-block rounded-full border px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-widest" style={{ borderColor: `${project.accent}66`, color: project.accent }}>
                  {project.tag}
                </span>
                <h2 className="display mt-5 flex flex-wrap overflow-hidden pb-[0.05em] pt-[0.08em] text-[clamp(3.6rem,1.4rem+11vw,12rem)] leading-[0.82]" aria-label={project.name}>
                  {[...project.name].map((char, i) => (
                    <motion.span
                      key={i}
                      aria-hidden="true"
                      className="inline-block whitespace-pre"
                      initial={{ y: '110%' }}
                      animate={{ y: 0 }}
                      transition={{ duration: 1, ease, delay: 0.25 + i * 0.04 }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </h2>
                <p className="eyebrow mt-3">{project.kind}</p>
                <p className="mt-6 max-w-3xl text-[clamp(1.1rem,1rem+0.7vw,1.5rem)] leading-snug text-bone/90">{project.lede}</p>
                <div className="mt-6 flex flex-wrap gap-2.5 sm:hidden">
                  {project.live && (
                    <Button href={project.live} external magnetic={false} variant="solid">
                      Live demo <ArrowUpRight size={14} strokeWidth={2.2} aria-hidden="true" />
                    </Button>
                  )}
                  <Button href={project.code} external magnetic={false}>
                    <GitHubIcon width="15" height="15" /> Code
                  </Button>
                </div>
              </div>

              <div className="px-[clamp(16px,4vw,64px)]">
                <motion.div className="mx-auto max-w-6xl origin-top" style={{ scale: heroScale }}>
                  <button type="button" className="block w-full border-0 bg-transparent p-0 text-left" data-cursor="Zoom" onClick={() => setViewing(0)} aria-label={`Enlarge: ${project.shots[0].caption}`}>
                    <BrowserFrame address={project.address}>
                      <Shot shot={project.heroShot} alt={project.shots[0].caption} sizes="(min-width: 1280px) 1150px, 94vw" eager />
                    </BrowserFrame>
                  </button>
                </motion.div>
              </div>

              {/* Idea, features, facts */}
              <div className="grid gap-x-[clamp(28px,5vw,80px)] gap-y-12 px-[clamp(16px,4vw,64px)] py-[clamp(48px,9vh,110px)] lg:grid-cols-[minmax(0,1fr)_340px]">
                <div>
                  <Block label="The idea">
                    <p className="mt-4 max-w-3xl text-[clamp(1.2rem,1rem+0.9vw,1.75rem)] leading-[1.35] text-bone">{project.idea}</p>
                  </Block>
                  <Block label="What I built" className="mt-[clamp(40px,7vh,72px)]">
                    <ul className="m-0 mt-5 grid list-none gap-3 p-0 sm:grid-cols-2">
                      {project.features.map((feature, i) => (
                        <motion.li
                          key={feature.title}
                          className="group relative overflow-hidden rounded-2xl border border-line bg-ink/60 p-5 transition-colors duration-500 hover:border-[color:var(--accent)]"
                          initial={{ opacity: 0, y: 44, rotateX: -22 }}
                          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                          viewport={view}
                          transition={{ duration: 0.9, ease, delay: (i % 2) * 0.08 }}
                          style={{ transformPerspective: 900, transformOrigin: '50% 100%' }}
                        >
                          <span className="font-mono text-[0.68rem] tracking-widest text-fog">{pad(i + 1)}</span>
                          <b className="display mt-2 block text-2xl">{feature.title}</b>
                          <span className="mt-2 block text-[0.95rem] leading-relaxed text-fog">{feature.text}</span>
                          <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-700 ease-out group-hover:scale-x-100" style={{ background: project.accent }} aria-hidden="true" />
                        </motion.li>
                      ))}
                    </ul>
                  </Block>
                </div>

                <aside className="lg:sticky lg:top-8 lg:self-start" aria-label={`${project.name} details`}>
                  <dl className="m-0">
                    {project.meta.map(([key, value]) => (
                      <div key={key} className="grid grid-cols-[92px_1fr] gap-3 border-t border-line py-3 text-[0.92rem] last:border-b">
                        <dt className="font-mono text-[0.7rem] uppercase tracking-widest text-fog">{key}</dt>
                        <dd className="m-0">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <ul className="m-0 mt-6 flex list-none flex-wrap gap-1.5 p-0">
                    {project.chips.map(chip => (
                      <li key={chip} className="rounded-full border border-line px-2.5 py-1 font-mono text-[0.68rem] tracking-wide text-bone/85">
                        {chip}
                      </li>
                    ))}
                  </ul>
                </aside>
              </div>

              {/* Under the hood */}
              <div className="border-y border-line bg-ink/50 px-[clamp(16px,4vw,64px)] py-[clamp(44px,8vh,96px)]">
                <Block label="Under the hood">
                  <h3 className="display mt-3 text-[clamp(2.2rem,1.4rem+3vw,4.2rem)]">{project.flow.title}</h3>
                </Block>
                <ol className="relative m-0 mt-9 grid list-none gap-3 p-0 lg:grid-cols-5">
                  {project.flow.steps.map(([kicker, title, text], i) => (
                    <motion.li
                      key={title}
                      className="relative rounded-2xl border border-line bg-[#081319] p-5"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={view}
                      transition={{ duration: 0.8, ease, delay: i * 0.12 }}
                    >
                      <motion.span
                        className="absolute left-5 top-0 h-px w-10 origin-left"
                        style={{ background: project.accent }}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={view}
                        transition={{ duration: 0.7, ease, delay: 0.3 + i * 0.12 }}
                        aria-hidden="true"
                      />
                      <small className="font-mono text-[0.68rem] uppercase tracking-widest" style={{ color: project.accent }}>
                        {pad(i + 1)} · {kicker}
                      </small>
                      <b className="display mt-2 block text-[1.7rem] leading-none">{title}</b>
                      <span className="mt-2.5 block text-[0.9rem] leading-relaxed text-fog">{text}</span>
                      {i < project.flow.steps.length - 1 && (
                        <ArrowRight
                          size={16}
                          className="absolute -bottom-2.5 left-1/2 z-10 -translate-x-1/2 rotate-90 rounded-full bg-[#081319] text-fog lg:-right-2.5 lg:bottom-auto lg:left-auto lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0 lg:rotate-0"
                          aria-hidden="true"
                        />
                      )}
                    </motion.li>
                  ))}
                </ol>
              </div>

              {/* Every screen */}
              <div className="px-[clamp(16px,4vw,64px)] py-[clamp(48px,9vh,110px)]">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <Block label={`Screens · ${project.shots.length}`}>
                    <h3 className="display mt-3 text-[clamp(2.2rem,1.4rem+3vw,4.2rem)]">Inside {project.name}</h3>
                  </Block>
                  <p className="m-0 text-sm text-fog">Real screenshots from the repository. Select one to enlarge it.</p>
                </div>
                <div className="mt-8 columns-1 gap-4 sm:columns-2 xl:columns-3">
                  {project.shots.map((item, i) => {
                    const portrait = item.h / item.w > 1.25 && item.w < 1000;
                    return (
                      <motion.button
                        key={item.name}
                        type="button"
                        onClick={() => setViewing(i)}
                        data-cursor="Zoom"
                        className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl border border-line bg-ink p-0 text-left transition-colors duration-500 hover:border-[color:var(--accent)]"
                        initial={{ opacity: 0, y: 40, scale: 0.96 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={view}
                        transition={{ duration: 0.8, ease, delay: (i % 3) * 0.07 }}
                      >
                        <span className={`block overflow-hidden ${portrait ? 'bg-ink-3 px-[22%] py-6' : ''}`}>
                          <Shot
                            shot={item}
                            alt={item.caption}
                            sizes="(min-width: 1280px) 30vw, (min-width: 640px) 46vw, 92vw"
                            className={`transition-transform duration-[900ms] ease-out group-hover:scale-[1.04] ${portrait ? 'rounded-lg shadow-2xl' : ''}`}
                          />
                        </span>
                        <span className="flex items-baseline gap-3 border-t border-line px-4 py-3 text-[0.86rem] text-bone/90">
                          <i className="font-mono text-[0.68rem] not-italic tracking-widest text-fog">{pad(i + 1)}</i>
                          {item.caption}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Next */}
              <button
                type="button"
                onClick={() => onNavigate(next.id)}
                data-cursor="Next"
                className="group relative block w-full overflow-hidden border-0 border-t border-line bg-ink px-[clamp(16px,4vw,64px)] py-[clamp(36px,7vh,80px)] text-left"
                style={{ '--accent': next.accent }}
              >
                <span className="absolute inset-0 origin-bottom scale-y-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100" style={{ background: `color-mix(in srgb, ${next.accent} 16%, transparent)` }} aria-hidden="true" />
                <span className="eyebrow relative">Next project</span>
                <span className="relative mt-2 flex items-center justify-between gap-6">
                  <span className="display text-[clamp(3rem,1.6rem+7vw,8rem)] leading-[0.85]">{next.name}</span>
                  <ArrowRight className="size-[clamp(2rem,5vw,4.5rem)] shrink-0 transition-transform duration-700 group-hover:translate-x-3" style={{ color: next.accent }} aria-hidden="true" />
                </span>
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {viewing !== null && <Lightbox shots={project.shots} index={viewing} accent={project.accent} onChange={setViewing} onClose={() => setViewing(null)} />}
      </AnimatePresence>
    </div>,
    document.body
  );
}
