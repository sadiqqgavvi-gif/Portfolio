import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowUpRight, Maximize2 } from 'lucide-react';
import { projects } from '../data/projects.js';
import { site } from '../data/site.js';
import { useMediaQuery } from '../lib/hooks.js';
import { sceneState } from '../lib/scene-state.js';
import SectionHead from '../components/SectionHead.jsx';
import Reveal from '../components/Reveal.jsx';
import Button from '../components/Button.jsx';
import { BrowserFrame, PhoneFrame, Shot } from '../components/Frames.jsx';
import { GitHubIcon } from '../components/Icons.jsx';

const clamp01 = value => Math.min(1, Math.max(0, value));
const pad = value => String(value).padStart(2, '0');

/* The screenshots of one project, arranged in depth: a browser window turned in perspective, a phone in
   front of it and a second screen floating behind. `enter` runs 0 → 1 as the card arrives, and the three
   layers settle into place at different speeds. The pointer then tilts the whole arrangement. */
function Stage({ project, enter, onOpen }) {
  const ref = useRef(null);
  const tiltX = useSpring(0, { stiffness: 120, damping: 18 });
  const tiltY = useSpring(0, { stiffness: 120, damping: 18 });
  const rotateY = useTransform([enter, tiltY], ([e, t]) => -30 + e * 18 + t);
  const rotateX = useTransform([enter, tiltX], ([e, t]) => 16 - e * 11 + t);
  const frameY = useTransform(enter, [0, 1], [90, 0]);
  const frameScale = useTransform(enter, [0, 1], [0.86, 1]);
  const phoneY = useTransform(enter, [0, 1], [190, 0]);
  const phoneX = useTransform(enter, [0, 1], [-40, 0]);
  const floatX = useTransform(enter, [0, 1], [130, 0]);
  const floatY = useTransform(enter, [0, 1], [-50, 0]);
  const floatOpacity = useTransform(enter, [0.25, 1], [0, 1]);
  const isPopup = project.phoneShot && project.phoneShot.w / project.phoneShot.h > 0.55;

  const onMove = event => {
    if (event.pointerType !== 'mouse') return;
    const rect = ref.current.getBoundingClientRect();
    tiltY.set(((event.clientX - rect.left) / rect.width - 0.5) * 12);
    tiltX.set((0.5 - (event.clientY - rect.top) / rect.height) * 9);
  };
  const onLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="group/stage relative h-full min-h-[120px] w-full [container-type:size] [perspective:1500px] lg:min-h-[240px]"
    >
      <span
        className="pointer-events-none absolute inset-[8%] rounded-full opacity-50 blur-[70px] transition-opacity duration-700 group-hover/stage:opacity-80"
        style={{ background: `radial-gradient(closest-side, ${project.accent}, transparent)` }}
        aria-hidden="true"
      />
      <motion.div className="absolute inset-0 flex items-center justify-center preserve-3d" style={{ rotateX, rotateY }}>
        {project.floatShot && (
          <motion.div
            className="absolute right-[-7%] top-[3%] w-[52%] overflow-hidden rounded-lg border border-white/15 opacity-90 shadow-2xl"
            style={{ x: floatX, y: floatY, opacity: floatOpacity, z: -90 }}
          >
            <Shot shot={project.floatShot} sizes="(min-width: 1024px) 26vw, 46vw" />
          </motion.div>
        )}
        <motion.div className="relative block w-[min(86cqw,calc((100cqh-36px)*1.5))]" style={{ y: frameY, scale: frameScale }}>
          <BrowserFrame address={project.address}>
            <Shot shot={project.heroShot} alt={`${project.name}: ${project.shots[0].caption}`} sizes="(min-width: 1024px) 44vw, 80vw" />
          </BrowserFrame>
        </motion.div>
        {project.phoneShot && (
          <motion.div
            className={`absolute bottom-[1%] left-[4%] lg:left-[-1%] ${isPopup ? 'w-[min(26cqw,36cqh)]' : 'w-[min(19cqw,26cqh)]'}`}
            style={{ x: phoneX, y: phoneY, z: 110 }}
          >
            {isPopup ? (
              <div className="overflow-hidden rounded-xl border border-white/15 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.9)]">
                <Shot shot={project.phoneShot} sizes="(min-width: 1024px) 14vw, 24vw" />
              </div>
            ) : (
              <PhoneFrame>
                <Shot shot={project.phoneShot} sizes="(min-width: 1024px) 10vw, 18vw" />
              </PhoneFrame>
            )}
          </motion.div>
        )}
      </motion.div>
      <button
        type="button"
        onClick={onOpen}
        data-cursor="Open"
        aria-label={`Open the ${project.name} case study, ${project.shots.length} screens`}
        className="absolute inset-0 z-20 flex items-end justify-end rounded-2xl border-0 bg-transparent p-3"
      >
        <span className="glass flex items-center gap-2 rounded-full border border-line px-3.5 py-2 font-mono text-[0.68rem] uppercase tracking-widest text-bone transition-colors duration-300 group-hover/stage:border-sodium group-hover/stage:text-sodium">
          <Maximize2 size={13} aria-hidden="true" />
          {project.shots.length} screens
        </span>
      </button>
    </div>
  );
}

function ProjectCard({ project, index, enter, onOpen, pinned = false, className = '' }) {
  const shown = project.chips.slice(0, 6);
  const compact = 'max-sm:!px-3.5 max-sm:!py-2.5 max-sm:!text-[0.72rem]';
  return (
    <article
      aria-labelledby={`project-${project.id}`}
      className={`relative grid grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto] overflow-hidden rounded-[clamp(20px,2.4vw,36px)] border border-white/14 bg-[#07141b] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-1 ${className}`}
      style={{
        '--accent': project.accent,
        backgroundImage: `radial-gradient(90% 120% at 100% 0%, color-mix(in srgb, ${project.accent} 26%, transparent), transparent 62%), radial-gradient(60% 80% at 0% 100%, color-mix(in srgb, ${project.accent} 12%, transparent), transparent 70%)`
      }}
    >
      <div className="relative z-10 order-2 flex flex-col p-[clamp(16px,3vw,44px)] max-lg:pt-1 lg:order-1">
        <div className="flex items-center justify-between gap-4">
          <span className="truncate rounded-full border px-3 py-1.5 font-mono text-[clamp(0.58rem,0.5rem+0.4vw,0.68rem)] uppercase tracking-wider sm:tracking-widest" style={{ borderColor: `${project.accent}66`, color: project.accent }}>
            {project.tag}
          </span>
          <span className="shrink-0 whitespace-nowrap font-mono text-xs tracking-widest text-fog" aria-hidden="true">
            {pad(index + 1)} / {pad(projects.length)}
          </span>
        </div>

        <h3 id={`project-${project.id}`} className="display mt-[clamp(10px,2.4vh,30px)] text-[clamp(2.7rem,1.6rem+5vw,6.4rem)] leading-[0.84]">
          {project.name}
        </h3>
        <p className="eyebrow mt-2 max-lg:text-[0.66rem]">{project.kind}</p>
        <p className="mt-[clamp(8px,1.8vh,20px)] max-w-[34em] text-[clamp(0.88rem,0.84rem+0.3vw,0.98rem)] leading-relaxed text-bone/85 max-lg:line-clamp-4 max-lg:leading-snug max-lg:[@media(max-height:720px)]:line-clamp-2">{project.lede}</p>

        <dl className="m-0 mt-[clamp(10px,2.2vh,26px)] grid grid-cols-3 gap-3 border-y border-line py-[clamp(8px,1.4vh,14px)] max-lg:[@media(max-height:620px)]:hidden">
          {project.highlights.map(item => (
            <div key={item.label} className="min-w-0">
              <dt className="sr-only">{item.label}</dt>
              <dd className="m-0">
                <b className="display block text-[clamp(1.5rem,1.1rem+1.2vw,2.3rem)] leading-none" style={{ color: project.accent }}>
                  {item.value}
                </b>
                <span className="mt-1 block text-[0.74rem] leading-snug text-fog">{item.label}</span>
              </dd>
            </div>
          ))}
        </dl>

        <ul className="m-0 mt-[clamp(12px,2vh,22px)] flex list-none flex-wrap gap-1.5 p-0 max-lg:[@media(max-height:900px)]:hidden">
          {shown.map(chip => (
            <li key={chip} className="rounded-full border border-line bg-ink/40 px-2.5 py-1 font-mono text-[0.68rem] tracking-wide text-bone/80">
              {chip}
            </li>
          ))}
          {project.chips.length > shown.length && (
            <li className="rounded-full px-1.5 py-1 font-mono text-[0.68rem] text-fog">+{project.chips.length - shown.length} more</li>
          )}
        </ul>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-[clamp(12px,2.6vh,30px)] sm:gap-2.5">
          <Button variant="solid" onClick={onOpen} className={compact}>
            Case study
          </Button>
          {project.live && (
            <Button href={project.live} external className={compact} aria-label={`${project.name} live demo`}>
              Live<span className="max-[430px]:hidden">&nbsp;demo</span> <ArrowUpRight size={15} strokeWidth={2.2} aria-hidden="true" />
            </Button>
          )}
          <Button href={project.code} external className={compact} aria-label={`${project.name} source code on GitHub`}>
            <GitHubIcon width="16" height="16" /> Code
          </Button>
        </div>
      </div>

      <div className={`relative order-1 min-h-0 p-[clamp(12px,2.4vw,36px)] lg:order-2 ${pinned ? '' : 'aspect-[16/11] lg:aspect-auto'}`}>
        <Stage project={project} enter={enter} onOpen={onOpen} />
      </div>
    </article>
  );
}

/* On every screen size each project is a full-height card that sticks under the nav. The next card slides up
   over it while the one underneath shrinks back and dims, so the four build into a stack. */
// Extra scroll (as a fraction of the viewport) that each card holds its place before the next one arrives.
const HOLD = 0.4;
const PITCH = 1 + HOLD;

function StickyCard({ project, index, travel, onOpen }) {
  const last = index === projects.length - 1;
  // `travel` counts cards that have reached the top. A card is on screen for the last 1/PITCH of its step.
  const enter = useTransform(travel, value => (index === 0 ? clamp01(value) : clamp01((value - (index + 1 - 1 / PITCH)) * PITCH)));
  const covered = useTransform(travel, value => Math.max(0, (value - (index + 2 - 1 / PITCH)) * PITCH));
  const scale = useTransform(covered, value => 1 - Math.min(value, 3) * 0.045);
  const veil = useTransform(covered, value => Math.min(value, 1) * 0.55);
  const lift = useTransform(covered, value => -Math.min(value, 3) * 10);

  return (
    <>
      <div className="sticky top-0 flex h-svh items-center pt-[var(--nav-h)]" style={{ zIndex: index + 1 }}>
        <motion.div className="relative w-full origin-top" style={{ scale, y: lift, marginTop: `calc(${index} * clamp(5px, 1vw, 14px))` }}>
          <ProjectCard
            project={project}
            index={index}
            enter={enter}
            onOpen={onOpen}
            pinned
            className="h-[calc(100svh-var(--nav-h)-30px)] lg:h-[min(700px,calc(100svh-var(--nav-h)-64px))]"
          />
          <motion.div className="pointer-events-none absolute inset-0 rounded-[clamp(20px,2.4vw,36px)] bg-ink" style={{ opacity: veil }} aria-hidden="true" />
        </motion.div>
      </div>
      {/* A spacer, not a margin: a margin on the sticky box would drag it up at the end of the stack. */}
      {!last && <div style={{ height: `${HOLD * 100}svh` }} aria-hidden="true" />}
    </>
  );
}

function StickyStack({ onOpen }) {
  const ref = useRef(null);
  const count = projects.length;
  const { scrollYProgress: arriving } = useScroll({ target: ref, offset: ['start end', 'start start'] });
  const { scrollYProgress: stacking } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  // 0 → 1 while the first card rises into view, then +1 for every further card that reaches the top.
  const travel = useTransform([arriving, stacking], ([a, s]) => a + s * (count - 1));

  // The backdrop behind the page takes the colour of whichever project is on top of the stack.
  useMotionValueEvent(travel, 'change', value => {
    const top = Math.min(count - 1, Math.max(0, Math.floor(value - 0.55)));
    sceneState.accent = value > 0.15 ? projects[top].accent : null;
  });
  useEffect(
    () => () => {
      sceneState.accent = null;
    },
    []
  );

  return (
    <div ref={ref} className="wrap relative mt-[clamp(20px,4vh,48px)]">
      {projects.map((project, index) => (
        <StickyCard key={project.id} project={project} index={index} travel={travel} onOpen={() => onOpen(project.id)} />
      ))}
    </div>
  );
}

// Very short windows and reduced motion: the cards simply follow one another, each settling as it arrives.
function FlowCard({ project, index, onOpen }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 95%', 'start 30%'] });
  const settled = useMotionValue(1);
  const enter = reduce ? settled : scrollYProgress;
  const y = useTransform(enter, [0, 1], [70, 0]);
  const scale = useTransform(enter, [0, 1], [0.93, 1]);
  const opacity = useTransform(enter, [0, 0.4], [0.35, 1]);

  return (
    <motion.div ref={ref} style={{ y, scale, opacity }}>
      <ProjectCard project={project} index={index} enter={enter} onOpen={onOpen} />
    </motion.div>
  );
}

export default function Work({ onOpen }) {
  const sticky = useMediaQuery('(min-height: 520px)');
  const reduce = useReducedMotion();

  return (
    <section id="work" className="relative pt-[clamp(80px,13vh,160px)]">
      <div className="wrap">
        <SectionHead
          index="04"
          label="Selected work"
          title="Selected work"
          sub="Four full builds, each designed, coded and deployed end to end. Open a case study for the features, the architecture and every screen."
        />
      </div>

      {sticky && !reduce ? (
        <StickyStack onOpen={onOpen} />
      ) : (
        <div className="wrap mt-10 grid gap-6">
          {projects.map((project, index) => (
            <FlowCard key={project.id} project={project} index={index} onOpen={() => onOpen(project.id)} />
          ))}
        </div>
      )}

      <Reveal className="wrap mt-[clamp(40px,8vh,90px)] flex flex-wrap items-center justify-between gap-5 border-t border-line pt-8">
        <p className="display m-0 text-[clamp(1.8rem,1.2rem+2.4vw,3.2rem)]">More on GitHub</p>
        <Button href={site.github} external>
          <GitHubIcon width="16" height="16" /> github.com/{site.githubHandle} <ArrowUpRight size={15} strokeWidth={2.2} aria-hidden="true" />
        </Button>
      </Reveal>
    </section>
  );
}
