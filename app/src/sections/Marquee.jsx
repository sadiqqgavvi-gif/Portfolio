import { marquee } from '../data/site.js';
import ScrollVelocity from '../components/reactbits/ScrollVelocity.jsx';

// Two bands of type that run in opposite directions and speed up with the scroll (React Bits ScrollVelocity).
export default function Marquee() {
  return (
    <div className="relative z-10 -rotate-2 scale-105 border-y border-line bg-ink/55 py-4 backdrop-blur-sm sm:py-6" aria-hidden="true">
      <ScrollVelocity
        texts={[marquee.tech.join('  ·  '), marquee.traits.join('  /  ')]}
        velocity={55}
        numCopies={4}
        outlineAlternate
        skewWithVelocity={3}
        separator={<span className="text-sodium">✦</span>}
        gap={36}
        fontSize="clamp(2.4rem, 1.2rem + 5.4vw, 6rem)"
        scrollerStyle={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0',
          lineHeight: 1.1,
          filter: 'none'
        }}
      />
    </div>
  );
}
