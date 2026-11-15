import { motion } from 'motion/react';
import { skillGroups } from '../data/site.js';
import { brandColor, icons } from '../lib/icons.js';
import SectionHead from '../components/SectionHead.jsx';
import SpotCard from '../components/SpotCard.jsx';
import Logo from '../components/Logo.jsx';

const ease = [0.16, 1, 0.3, 1];

// Every tool as a tile: grey at rest, its own brand colour and a glow on hover.
function SkillTile({ name, icon, index }) {
  const color = icon ? brandColor(icons[icon]) : '#ededee';
  return (
    <motion.li
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '0px 0px -6% 0px' }}
      transition={{ duration: 0.7, ease, delay: index * 0.04 }}
    >
      <SpotCard
        color={color.length === 7 ? color : undefined}
        className="group flex h-full items-center gap-3 rounded-2xl px-3.5 py-3 transition-transform duration-300 hover:-translate-y-0.5"
      >
        <span className="relative grid size-9 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03]">
          <span className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ boxShadow: `0 0 24px -4px ${color}` }} aria-hidden="true" />
          <Logo name={name} icon={icon} size={18} color="#a3a6b0" className="transition-opacity duration-300 group-hover:opacity-0" />
          <Logo name={name} icon={icon} size={18} className="absolute opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </span>
        <span className="text-[0.9rem] font-medium">{name}</span>
      </SpotCard>
    </motion.li>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="relative py-[clamp(90px,14vh,170px)]">
      <div className="wrap">
        <SectionHead index="05" label="Skills" title="The toolkit behind" accent="every build." sub="What I use day to day, grouped the way a request flows: interface, server, data, delivery and the AI tools that speed it all up." />
        <div className="mt-[clamp(36px,6vh,64px)] grid gap-[clamp(24px,4vh,40px)]">
          {skillGroups.map(group => (
            <div key={group.title} className="grid gap-4 border-t border-line pt-5 md:grid-cols-[200px_1fr]">
              <h3 className="m-0 text-[1rem] font-medium tracking-[-0.01em] text-bone/90">{group.title}</h3>
              <ul className="m-0 grid list-none grid-cols-2 gap-2.5 p-0 sm:grid-cols-3 xl:grid-cols-4">
                {group.items.map(([name, icon], i) => (
                  <SkillTile key={name} name={name} icon={icon} index={i} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
