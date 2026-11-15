import { motion } from 'motion/react';
import { stats } from '../data/site.js';
import { Eyebrow } from '../components/SectionHead.jsx';
import ScrollReveal from '../components/reactbits/ScrollReveal.jsx';
import CountUp from '../components/reactbits/CountUp.jsx';
import SpotlightCard from '../components/reactbits/SpotlightCard.jsx';

const ease = [0.16, 1, 0.3, 1];

export default function About() {
  return (
    <section id="about" className="relative py-[clamp(90px,16vh,190px)]">
      <div className="wrap">
        <Eyebrow index="01">About</Eyebrow>

        {/* Each word sharpens and brightens as it crosses the viewport (React Bits ScrollReveal). */}
        <ScrollReveal
          enableBlur={false}
          baseOpacity={0.12}
          baseRotation={2}
          blurStrength={5}
          containerClassName="mt-8 max-w-[19em] text-[clamp(1.85rem,1.1rem+3.4vw,4.3rem)]"
          textClassName="font-display font-bold! uppercase leading-[1.02]! text-[length:inherit]! tracking-[-0.005em]"
          rotationEnd="bottom 70%"
          wordAnimationEnd="bottom 62%"
        >
          React on the front. Node and Express behind it. MongoDB underneath. I plan, code and debug with ChatGPT, Claude, Codex, Google Antigravity and Gemini, then I ship it.
        </ScrollReveal>

        <ul className="m-0 mt-[clamp(48px,9vh,110px)] grid list-none grid-cols-2 gap-[clamp(10px,1.4vw,16px)] p-0 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.li
              key={stat.label}
              initial={{ opacity: 0, y: 60, rotateX: -28 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: '0px 0px -10% 0px' }}
              transition={{ duration: 1, ease, delay: index * 0.09 }}
              style={{ transformPerspective: 900, transformOrigin: '50% 100%' }}
            >
              <SpotlightCard
                spotlightColor="#ff9a4d"
                intensity={0.2}
                className="panel h-full !rounded-2xl !p-[clamp(16px,2vw,24px)]"
                style={{ '--spotlight-card-surface': 'rgb(6 12 16 / 0.86)', '--spotlight-card-border': 'rgb(255 255 255 / 0.16)' }}
              >
                <b className="display block text-[clamp(2.3rem,1.2rem+4.6vw,5.2rem)] leading-none text-bone">
                  <CountUp from={stat.from ?? 0} to={stat.to} separator={stat.separator ?? ''} suffix={stat.suffix ?? ''} duration={2.2} />
                </b>
                <span className="mt-[clamp(8px,1.4vw,16px)] block text-[clamp(0.8rem,0.72rem+0.4vw,0.95rem)] leading-normal text-bone/70">{stat.label}</span>
              </SpotlightCard>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
