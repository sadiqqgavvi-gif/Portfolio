import SplitText from './reactbits/SplitText.jsx';
import DecryptedText from './reactbits/DecryptedText.jsx';
import Reveal from './Reveal.jsx';

export function Eyebrow({ index, children, className = '' }) {
  return (
    <p className={`eyebrow flex items-center gap-3 ${className}`}>
      <span className="text-sodium">({index})</span>
      <span className="h-px w-8 bg-line" aria-hidden="true" />
      <DecryptedText text={children} animateOn="view" sequential speed={45} />
    </p>
  );
}

// Section opener: numbered eyebrow, a display heading whose letters rise in, and a short lead.
export default function SectionHead({ index, label, title, sub, className = '' }) {
  return (
    <header className={`max-w-4xl ${className}`}>
      <Eyebrow index={index}>{label}</Eyebrow>
      <div className="mt-5">
        <SplitText
          tag="h2"
          text={title}
          splitType="chars"
          effect="rise"
          delay={28}
          duration={1}
          textAlign="left"
          rootMargin="-60px"
          className="display py-[0.06em] text-[clamp(2.9rem,1.6rem+6vw,7rem)]"
        />
      </div>
      {sub && (
        <Reveal as="p" delay={0.15} className="mt-4 max-w-xl text-fog">
          {sub}
        </Reveal>
      )}
    </header>
  );
}
