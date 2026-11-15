import { marqueeLogos } from '../data/site.js';
import Logo from '../components/Logo.jsx';

// Two endless rows of brand marks running in opposite directions, fading out at the edges.
function Row({ items, reverse, duration }) {
  const list = [...items, ...items];
  return (
    <div className="group flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
      <div
        className="flex shrink-0 animate-marquee items-center gap-3 pr-3 group-hover:[animation-play-state:paused]"
        style={{ '--marquee-duration': `${duration}s`, animationDirection: reverse ? 'reverse' : 'normal' }}
      >
        {list.map(([name, icon], i) => (
          <span
            key={i}
            className="flex items-center gap-2.5 whitespace-nowrap rounded-full border border-white/[0.07] bg-white/[0.025] py-2 pl-2.5 pr-4 text-[0.88rem] text-bone/80"
            aria-hidden={i >= items.length ? 'true' : undefined}
          >
            <Logo name={name} icon={icon} size={18} />
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function LogoMarquee() {
  const half = Math.ceil(marqueeLogos.length / 2);
  return (
    <section aria-label="Technologies I work with" className="relative py-6">
      <p className="eyebrow mb-6 text-center">Technologies I ship with</p>
      <div className="grid gap-3">
        <Row items={marqueeLogos.slice(0, half)} duration={38} />
        <Row items={marqueeLogos.slice(half)} duration={44} reverse />
      </div>
    </section>
  );
}
