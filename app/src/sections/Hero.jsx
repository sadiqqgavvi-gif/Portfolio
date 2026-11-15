import { lazy, Suspense, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowDown, ArrowUpRight, Mail } from 'lucide-react';
import { proof, roles, site } from '../data/site.js';
import { useMediaQuery } from '../lib/hooks.js';
import Button from '../components/Button.jsx';
import SafeBoundary from '../components/SafeBoundary.jsx';
import Logo from '../components/Logo.jsx';
import { GitHubIcon, LinkedInIcon } from '../components/Icons.jsx';
import RotatingText from '../components/reactbits/RotatingText.jsx';

// Three.js is the heaviest dependency, so the orb loads on its own after the first paint.
const HeroOrb = lazy(() => import('../three/HeroOrb.jsx'));

const ease = [0.16, 1, 0.3, 1];

const chips = [
  { name: 'React', icon: 'siReact', className: 'left-[2%] top-[16%]', delay: 0 },
  { name: 'Node.js', icon: 'siNodedotjs', className: 'right-[0%] top-[30%]', delay: 1.2 },
  { name: 'MongoDB', icon: 'siMongodb', className: 'left-[6%] bottom-[18%]', delay: 2.1 },
  { name: 'Socket.io', icon: 'siSocketdotio', className: 'right-[8%] bottom-[10%]', delay: 0.6 },
  { name: 'Express', icon: 'siExpress', className: 'right-[22%] top-[4%]', delay: 1.7, wide: true }
];

function Chip({ chip, ready, index }) {
  return (
    <motion.div
      className={`absolute ${chip.className} ${chip.wide ? 'max-lg:hidden' : ''}`}
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={ready ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 1, ease, delay: 1.1 + index * 0.12 }}
    >
      <div
        className="glass flex animate-float items-center gap-2 rounded-full border border-white/10 py-1.5 pl-1.5 pr-3.5 text-[0.8rem] font-medium shadow-[0_10px_30px_-10px_rgb(0_0_0/0.8)] max-sm:text-[0.7rem]"
        style={{ animationDelay: `${chip.delay}s` }}
      >
        <span className="grid size-7 place-items-center rounded-full bg-white/[0.06] max-sm:size-6">
          <Logo name={chip.name} icon={chip.icon} size={15} />
        </span>
        {chip.name}
      </div>
    </motion.div>
  );
}

export default function Hero({ ready }) {
  const ref = useRef(null);
  const wide = useMediaQuery('(min-width: 1024px)');
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const fadeOut = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const fade = (delay, y = 24) => ({
    initial: { opacity: 0, y, filter: 'blur(8px)' },
    animate: ready ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {},
    transition: { duration: 1.1, ease, delay }
  });

  return (
    <section id="top" ref={ref} className="relative isolate overflow-hidden">
      {/* A soft beam of light falling from the top left (the "spotlight" effect). */}
      <motion.div
        className="pointer-events-none absolute -left-[20%] -top-[30%] -z-10 h-[120%] w-[70%] origin-top-left rotate-[-28deg] bg-[radial-gradient(ellipse_at_top,rgb(255_255_255/0.10),rgb(255_255_255/0.03)_35%,transparent_65%)]"
        initial={{ opacity: 0, scaleY: 0.6 }}
        animate={ready ? { opacity: 1, scaleY: 1 } : {}}
        transition={{ duration: 2.2, ease, delay: 0.2 }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-ink" aria-hidden="true" />

      <div className="wrap grid min-h-svh grid-cols-1 items-center gap-y-2 pb-[clamp(24px,5svh,56px)] pt-[calc(var(--nav-h)+8px)] lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-x-6">
        {/* The orb: beside the copy on wide screens, above it on phones. */}
        <motion.div
          className="relative h-[clamp(240px,38svh,420px)] w-full lg:order-2 lg:h-[min(76svh,700px)]"
          style={{ opacity: fadeOut }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={ready ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.8, ease, delay: 0.3 }}
        >
          <div className="pointer-events-none absolute inset-[12%] rounded-full bg-[radial-gradient(closest-side,rgb(255_138_61/0.16),rgb(86_216_201/0.06)_55%,transparent)]" aria-hidden="true" />
          <SafeBoundary>
            <Suspense fallback={null}>
              <HeroOrb compact={!wide} />
            </Suspense>
          </SafeBoundary>
          <div className="absolute inset-0" aria-hidden="true">
            {chips.map((chip, index) => (
              <Chip key={chip.name} chip={chip} ready={ready} index={index} />
            ))}
          </div>
        </motion.div>

        <motion.div className="relative z-10 lg:order-1" style={{ y: textY }}>
          <motion.a
            href="#contact"
            className="group inline-flex items-center gap-2.5 rounded-full border border-emerald-400/25 bg-emerald-400/[0.07] py-1.5 pl-2.5 pr-3.5 text-[0.8rem] font-medium text-emerald-200 no-underline transition-colors hover:border-emerald-400/50"
            {...fade(0.15, 12)}
          >
            <span className="size-2 animate-pulse-dot rounded-full bg-emerald-400" aria-hidden="true" />
            Available for work · remote & on-site
            <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </motion.a>

          <h1 className="display mt-6 text-[clamp(3.2rem,1.2rem+7.6vw,7.4rem)] leading-[0.92]" aria-label={`${site.name}, full stack developer`}>
            {['Gavriel', 'Sadiq'].map((word, line) => (
              <span key={word} className="block overflow-hidden pb-[0.08em]" aria-hidden="true">
                <motion.span
                  className="text-gradient inline-block"
                  initial={{ y: '105%' }}
                  animate={ready ? { y: 0 } : {}}
                  transition={{ duration: 1.3, ease, delay: 0.25 + line * 0.12 }}
                >
                  {word}
                  {line === 1 && <span className="text-sodium">.</span>}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p className="mt-5 flex flex-wrap items-baseline gap-x-2.5 text-[clamp(1.35rem,1.05rem+1.3vw,2.2rem)] font-medium leading-tight tracking-[-0.03em]" {...fade(0.6)}>
            <span>Full stack developer building</span>
            <RotatingText
              texts={roles}
              mainClassName="serif text-accent-gradient text-[1.12em] pr-[0.06em]"
              splitBy="characters"
              staggerDuration={0.015}
              rotationInterval={2600}
              animatePresenceMode="popLayout"
              transition={{ type: 'tween', duration: 0.4, ease }}
            />
            <span>web apps.</span>
          </motion.p>

          <motion.p className="mt-5 max-w-[34rem] text-[clamp(1rem,0.96rem+0.25vw,1.12rem)] leading-relaxed text-fog" {...fade(0.72)}>
            Software Engineering graduate who designs, builds and deploys complete MERN applications: secure APIs, real-time features and polished interfaces. I use AI tools to move fast without cutting corners.
          </motion.p>

          <motion.div className="mt-8 flex flex-wrap items-center gap-3" {...fade(0.85)}>
            <Button href="#work" variant="solid">
              View my work <ArrowDown size={16} aria-hidden="true" />
            </Button>
            <Button href={site.resume} external>
              Résumé <ArrowUpRight size={16} aria-hidden="true" />
            </Button>
            <div className="flex items-center gap-2 sm:ml-2">
              {[
                { href: site.github, label: 'GitHub', icon: <GitHubIcon width="17" height="17" />, external: true },
                { href: site.linkedin, label: 'LinkedIn', icon: <LinkedInIcon width="16" height="16" />, external: true },
                { href: `mailto:${site.email}`, label: 'Email', icon: <Mail size={17} aria-hidden="true" /> }
              ].map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  {...(link.external ? { target: '_blank', rel: 'noopener' } : {})}
                  className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-fog transition-colors duration-300 hover:border-white/30 hover:text-bone"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </motion.div>

          <motion.dl className="mt-10 grid max-w-xl grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 sm:grid-cols-4" {...fade(1)}>
            {proof.map(item => (
              <div key={item.label}>
                <dt className="sr-only">{item.label}</dt>
                <dd className="m-0">
                  <b className="display block text-[clamp(1.6rem,1.3rem+1vw,2.1rem)] font-semibold">{item.value}</b>
                  <span className="mt-1 block text-[0.8rem] leading-snug text-fog">{item.label}</span>
                </dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>
      </div>

      <motion.a
        href="#about"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.7rem] uppercase tracking-[0.2em] text-fog no-underline lg:flex"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 1.6 }}
        aria-label="Scroll to About"
      >
        <span className="relative h-10 w-6 rounded-full border border-white/20">
          <span className="absolute left-1/2 top-2 h-2 w-0.5 -translate-x-1/2 animate-cue rounded-full bg-bone" />
        </span>
      </motion.a>
    </section>
  );
}
