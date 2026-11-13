import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { site } from '../data/site.js';
import { scrollToTarget } from '../lib/scroll.js';
import { Eyebrow } from '../components/SectionHead.jsx';
import SplitText from '../components/reactbits/SplitText.jsx';
import ShinyText from '../components/reactbits/ShinyText.jsx';
import Reveal from '../components/Reveal.jsx';
import Button from '../components/Button.jsx';

const ease = [0.16, 1, 0.3, 1];

const channels = [
  { label: 'Phone', value: site.phone, href: `tel:${site.phone.replace(/\s/g, '')}` },
  { label: 'GitHub', value: site.githubHandle, href: site.github, external: true },
  { label: 'LinkedIn', value: site.linkedinHandle, href: site.linkedin, external: true },
  { label: 'Résumé', value: 'Download PDF', href: site.resume, external: true }
];

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${site.email}`;
    }
  };

  return (
    <section id="contact" className="relative pb-[clamp(60px,10vh,120px)] pt-[clamp(90px,16vh,200px)]">
      <div className="wrap">
        <Eyebrow index="06">Contact</Eyebrow>
        <Reveal className="mt-6">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-teal/40 bg-teal/10 px-3.5 py-2 font-mono text-[0.72rem] uppercase tracking-widest">
            <span className="size-2 animate-pulse-dot rounded-full bg-teal" aria-hidden="true" />
            <ShinyText text="Open to Frontend, Backend and Full Stack roles" color="#bfe9e3" shineColor="#ffffff" speed={3} />
          </span>
        </Reveal>

        <h2 className="display mt-6 text-[clamp(3.6rem,1rem+14vw,14rem)] leading-[0.8]" aria-label="Let's build something">
          <span aria-hidden="true">
            <SplitText tag="span" text="Let’s build" splitType="chars" effect="rise" delay={32} duration={1.1} textAlign="left" rootMargin="-40px" className="block py-[0.06em]" />
            <SplitText tag="span" text="something" splitType="chars" effect="rise" delay={32} duration={1.1} textAlign="left" rootMargin="-40px" className="block py-[0.06em] text-sodium" />
          </span>
        </h2>

        <Reveal className="mt-[clamp(28px,5vh,56px)] flex flex-wrap items-center gap-x-6 gap-y-4" delay={0.1}>
          <a href={`mailto:${site.email}`} className="link-line break-all text-[clamp(1.25rem,0.9rem+1.9vw,2.6rem)] font-medium no-underline hover:text-sodium" data-cursor="Email">
            {site.email}
          </a>
          <Button onClick={copy} aria-label="Copy email address">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={copied ? 'done' : 'copy'}
                className="flex items-center gap-2"
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                {copied ? 'Copied' : 'Copy email'}
              </motion.span>
            </AnimatePresence>
          </Button>
          <span className="sr-only" role="status" aria-live="polite">
            {copied ? 'Email address copied' : ''}
          </span>
        </Reveal>

        <ul className="m-0 mt-[clamp(40px,8vh,90px)] grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:w-[62%]">
          {channels.map((item, index) => (
            <motion.li
              key={item.label}
              initial={{ opacity: 0, y: 44, rotateX: -26 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: '0px 0px -6% 0px' }}
              transition={{ duration: 0.9, ease, delay: index * 0.07 }}
              style={{ transformPerspective: 900, transformOrigin: '50% 100%' }}
            >
              <a
                href={item.href}
                {...(item.external ? { target: '_blank', rel: 'noopener' } : {})}
                className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-line bg-ink-2/70 px-5 py-4 no-underline backdrop-blur-md transition-colors duration-500 hover:border-sodium hover:text-ink"
              >
                <span className="absolute inset-0 origin-bottom scale-y-0 bg-sodium transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100" aria-hidden="true" />
                <span className="relative">
                  <span className="eyebrow block transition-colors duration-500 group-hover:text-ink/70">{item.label}</span>
                  <b className="mt-1 block text-[1.05rem] font-semibold">{item.value}</b>
                </span>
                <ArrowUpRight size={20} className="relative shrink-0 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
            </motion.li>
          ))}
        </ul>
      </div>

      <footer className="wrap mt-[clamp(60px,12vh,140px)]">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-line pt-6 font-mono text-[0.72rem] uppercase tracking-widest text-fog">
          <span>© 2026 {site.name}</span>
          <span>Built with React, Three.js, GSAP, Motion and React Bits</span>
          <a
            href="#top"
            className="link-line text-bone no-underline"
            onClick={event => {
              event.preventDefault();
              scrollToTarget('#top');
            }}
          >
            Back to top ↑
          </a>
        </div>
      </footer>
    </section>
  );
}
