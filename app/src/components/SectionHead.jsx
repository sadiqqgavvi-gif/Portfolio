import { motion } from 'motion/react';

const ease = [0.16, 1, 0.3, 1];

export function Eyebrow({ index, children, className = '' }) {
  return (
    <motion.p
      className={`eyebrow inline-flex items-center gap-2.5 rounded-full border border-line bg-white/[0.03] px-3 py-1.5 ${className}`}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.7, ease }}
    >
      <span className="size-1.5 rounded-full bg-sodium shadow-[0_0_10px_#ff8a3d]" aria-hidden="true" />
      {index && <span className="text-bone/80">{index}</span>}
      {index && <span className="text-bone/25" aria-hidden="true">/</span>}
      <span>{children}</span>
    </motion.p>
  );
}

// Each word rises out of its own mask as the heading scrolls into view.
export function RevealWords({ text, className = '', delay = 0, stagger = 0.06 }) {
  const words = text.split(' ');
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom [margin-bottom:-0.12em]">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', rotate: 4 }}
            whileInView={{ y: 0, rotate: 0 }}
            viewport={{ once: true, margin: '0px 0px -8% 0px' }}
            transition={{ duration: 1, ease, delay: delay + i * stagger }}
          >
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* Section opener: an eyebrow pill, a large heading whose last words are set in an italic serif, and a lead. */
export default function SectionHead({ index, label, title, accent, sub, align = 'left', className = '' }) {
  const centered = align === 'center';
  return (
    <header className={`${centered ? 'mx-auto text-center' : ''} max-w-4xl ${className}`}>
      <Eyebrow index={index}>{label}</Eyebrow>
      <h2 className="display text-gradient mt-6 text-[clamp(2.5rem,1.5rem+4.4vw,5.25rem)]">
        <RevealWords text={title} />
        {accent && (
          <>
            {' '}
            <RevealWords text={accent} delay={0.12} className="serif text-accent-gradient pr-[0.08em] tracking-[-0.02em]" />
          </>
        )}
      </h2>
      {sub && (
        <motion.p
          className={`mt-5 max-w-xl text-[clamp(1rem,0.95rem+0.3vw,1.125rem)] leading-relaxed text-fog ${centered ? 'mx-auto' : ''}`}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -8% 0px' }}
          transition={{ duration: 0.9, ease, delay: 0.2 }}
        >
          {sub}
        </motion.p>
      )}
    </header>
  );
}
