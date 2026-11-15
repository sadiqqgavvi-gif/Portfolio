import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Check, Copy, FileText, Mail, Phone, Send } from 'lucide-react';
import { nav, site } from '../data/site.js';
import { scrollToTarget } from '../lib/scroll.js';
import { RevealWords } from '../components/SectionHead.jsx';
import SpotCard from '../components/SpotCard.jsx';
import Button from '../components/Button.jsx';
import { GitHubIcon, LinkedInIcon } from '../components/Icons.jsx';

const ease = [0.16, 1, 0.3, 1];

const channels = [
  { label: 'GitHub', value: `@${site.githubHandle}`, href: site.github, icon: <GitHubIcon width="18" height="18" />, external: true },
  { label: 'LinkedIn', value: site.linkedinHandle, href: site.linkedin, icon: <LinkedInIcon width="17" height="17" />, external: true },
  { label: 'Phone', value: site.phone, href: `tel:${site.phone.replace(/\s/g, '')}`, icon: <Phone size={17} aria-hidden="true" /> },
  { label: 'Résumé', value: 'Download PDF', href: site.resume, icon: <FileText size={17} aria-hidden="true" />, external: true }
];

const field =
  'w-full rounded-xl border border-white/[0.09] bg-white/[0.03] px-4 py-3 text-[0.95rem] text-bone placeholder:text-fog/70 outline-none transition-colors duration-300 focus:border-sodium/60 focus:bg-white/[0.05]';

// No backend: the form composes an email in the visitor's own mail app, which says so on the button.
function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const update = key => event => setForm(prev => ({ ...prev, [key]: event.target.value }));
  const submit = event => {
    event.preventDefault();
    const subject = `Portfolio enquiry from ${form.name || 'a visitor'}`;
    const body = `${form.message}\n\n— ${form.name}${form.email ? `\nReply to: ${form.email}` : ''}`;
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  return (
    <SpotCard as="form" onSubmit={submit} className="grid gap-3 rounded-[22px] p-[clamp(18px,2.4vw,28px)]">
      <p className="m-0 text-[1.05rem] font-medium tracking-[-0.01em]">Send a message</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-[0.8rem] text-fog">
          Name
          <input className={field} value={form.name} onChange={update('name')} placeholder="Your name" autoComplete="name" required />
        </label>
        <label className="grid gap-1.5 text-[0.8rem] text-fog">
          Email
          <input className={field} type="email" value={form.email} onChange={update('email')} placeholder="you@company.com" autoComplete="email" />
        </label>
      </div>
      <label className="grid gap-1.5 text-[0.8rem] text-fog">
        Message
        <textarea className={`${field} min-h-[130px] resize-y`} value={form.message} onChange={update('message')} placeholder="Tell me about the role or the project" required />
      </label>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <span className="text-[0.78rem] text-fog">Opens your email app with the message filled in.</span>
        <Button variant="accent" type="submit" magnetic={false}>
          Send <Send size={15} aria-hidden="true" />
        </Button>
      </div>
    </SpotCard>
  );
}

function Footer() {
  return (
    <footer className="relative mt-[clamp(70px,12vh,140px)] overflow-hidden border-t border-line pt-10">
      <div className="wrap flex flex-wrap items-start justify-between gap-x-10 gap-y-6 text-[0.9rem]">
        <div>
          <p className="m-0 font-semibold tracking-tight">
            GS<span className="text-sodium">.</span>
          </p>
          <p className="m-0 mt-2 max-w-xs text-fog">Full stack developer building real-time, AI-powered web apps.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          {nav.map(item => (
            <a key={item.id} href={`#${item.id}`} className="link-line text-fog no-underline hover:text-bone">
              {item.label}
            </a>
          ))}
        </nav>
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
      <p className="display text-outline pointer-events-none m-0 mt-10 select-none whitespace-nowrap text-center text-[clamp(3.5rem,15vw,15rem)] leading-[0.8] tracking-[-0.06em] [mask-image:linear-gradient(to_bottom,#000_40%,transparent)]" aria-hidden="true">
        Gavriel Sadiq
      </p>
      <div className="wrap flex flex-wrap justify-between gap-3 border-t border-line py-6 text-[0.8rem] text-fog">
        <span>© 2026 {site.name}</span>
        <span>Built with React, Three.js, Motion, GSAP and React Bits</span>
      </div>
    </footer>
  );
}

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
    <section id="contact" className="relative isolate pt-[clamp(110px,18vh,220px)]">
      {/* The lamp: two cones of light meeting at a bright line above the heading. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex h-[420px] justify-center overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute top-[60px] h-[360px] w-[min(1000px,140vw)] bg-[conic-gradient(from_180deg_at_50%_0%,transparent_32%,rgb(255_138_61/0.28)_44%,rgb(255_138_61/0.05)_50%,rgb(255_138_61/0.28)_56%,transparent_68%)] [mask-image:linear-gradient(to_bottom,#000,transparent_85%)]"
          initial={{ opacity: 0, scaleX: 0.4 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease }}
        />
        <motion.div
          className="absolute top-[60px] h-px w-[min(520px,80vw)] bg-gradient-to-r from-transparent via-[#ffb27a] to-transparent shadow-[0_0_30px_4px_rgb(255_138_61/0.7)]"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease }}
        />
      </div>

      <div className="wrap">
        <div className="mx-auto max-w-4xl text-center">
          <motion.span
            className="inline-flex items-center gap-2.5 rounded-full border border-emerald-400/25 bg-emerald-400/[0.07] px-3.5 py-1.5 text-[0.8rem] font-medium text-emerald-200"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease }}
          >
            <span className="size-2 animate-pulse-dot rounded-full bg-emerald-400" aria-hidden="true" />
            Open to frontend, backend and full stack roles
          </motion.span>
          <h2 className="display text-gradient mt-6 text-[clamp(2.8rem,1.4rem+6vw,6.6rem)]">
            <RevealWords text="Let’s build something" /> <RevealWords text="great together." delay={0.15} className="serif text-accent-gradient pr-[0.06em] tracking-[-0.02em]" />
          </h2>
          <motion.p
            className="mx-auto mt-5 max-w-xl text-[1.05rem] leading-relaxed text-fog"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease, delay: 0.2 }}
          >
            Hiring for a junior developer role, or have a project in mind? I usually reply within a day.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease, delay: 0.3 }}
          >
            <Button href={`mailto:${site.email}`} variant="solid">
              <Mail size={16} aria-hidden="true" /> {site.email}
            </Button>
            <Button onClick={copy} aria-label="Copy email address">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={copied ? 'done' : 'copy'} className="flex items-center gap-2" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.2 }}>
                  {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                  {copied ? 'Copied' : 'Copy'}
                </motion.span>
              </AnimatePresence>
            </Button>
            <span className="sr-only" role="status" aria-live="polite">
              {copied ? 'Email address copied' : ''}
            </span>
          </motion.div>
        </div>

        <div className="mx-auto mt-[clamp(44px,8vh,80px)] grid max-w-5xl gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-1">
            {channels.map((item, i) => (
              <motion.li
                key={item.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -6% 0px' }}
                transition={{ duration: 0.8, ease, delay: i * 0.07 }}
              >
                <SpotCard
                  as="a"
                  href={item.href}
                  {...(item.external ? { target: '_blank', rel: 'noopener' } : {})}
                  className="group flex items-center gap-4 rounded-2xl px-4 py-3.5 no-underline"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-bone">{item.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.75rem] text-fog">{item.label}</span>
                    <b className="block truncate text-[0.95rem] font-medium">{item.value}</b>
                  </span>
                  <ArrowUpRight size={18} className="shrink-0 text-fog transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-bone" aria-hidden="true" />
                </SpotCard>
              </motion.li>
            ))}
          </ul>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '0px 0px -6% 0px' }} transition={{ duration: 0.9, ease, delay: 0.15 }}>
            <ContactForm />
          </motion.div>
        </div>
      </div>

      <Footer />
    </section>
  );
}
