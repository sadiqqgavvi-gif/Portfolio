import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { skillGroups } from '../data/site.js';
import { projects } from '../data/projects.js';
import SectionHead from '../components/SectionHead.jsx';
import SpotCard from '../components/SpotCard.jsx';
import SkillSphere from '../components/SkillSphere.jsx';
import Logo from '../components/Logo.jsx';

const ease = [0.16, 1, 0.3, 1];
const ALL = projects.map(p => p.name);

// Which projects used a tool: read from each project's tech chips, with a few tools named by hand.
const BY_HAND = {
  JavaScript: ALL,
  CSS: ALL,
  Git: ALL,
  GitHub: ALL,
  Netlify: ['SmartHire'],
  'REST APIs': ['SmartHire', 'Ember', 'Chat App'],
  'MVC structure': ['SmartHire', 'Ember', 'Chat App'],
  'Third-party APIs': ['SmartHire'],
  'Three.js / R3F': ['Ember'],
  ChatGPT: ALL,
  Claude: ALL,
  Gemini: ALL,
  Codex: ALL,
  Antigravity: ALL
};
function usedIn(name) {
  if (BY_HAND[name]) return BY_HAND[name];
  const key = name.toLowerCase();
  return projects.filter(p => p.chips.some(chip => chip.toLowerCase().startsWith(key))).map(p => p.name);
}

export default function Skills() {
  const items = useMemo(() => skillGroups.flatMap(group => group.items.map(([name, icon]) => ({ name, icon, group: group.title }))), []);
  const [active, setActive] = useState(skillGroups[0].title);
  const [touched, setTouched] = useState(false);
  const area = useRef(null);
  const inView = useInView(area, { margin: '-20% 0px -20% 0px' });
  const group = skillGroups.find(g => g.title === active);

  // Until someone picks a group, the groups take turns lighting up.
  useEffect(() => {
    if (touched || !inView) return undefined;
    const id = setInterval(() => {
      setActive(current => skillGroups[(skillGroups.findIndex(g => g.title === current) + 1) % skillGroups.length].title);
    }, 3800);
    return () => clearInterval(id);
  }, [touched, inView]);

  const pick = title => {
    setTouched(true);
    setActive(title);
  };

  return (
    <section id="skills" className="relative py-[clamp(90px,14vh,170px)]">
      <div className="wrap">
        <SectionHead index="05" label="Skills" title="The toolkit behind" accent="every build." sub="Pick a group to light it up on the sphere, and see where each tool was used. Drag the sphere to spin it." />

        <div ref={area} className="mt-[clamp(32px,6vh,64px)] grid items-center gap-[clamp(20px,4vw,56px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div className="order-2 lg:order-1">
            <div className="no-scrollbar -mx-[var(--gutter)] flex gap-2 overflow-x-auto px-[var(--gutter)] pb-1 lg:mx-0 lg:flex-wrap lg:px-0" role="tablist" aria-label="Skill groups">
              {skillGroups.map(g => {
                const on = g.title === active;
                return (
                  <button
                    key={g.title}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => pick(g.title)}
                    className={`relative shrink-0 rounded-full border px-4 py-2 text-[0.85rem] transition-colors duration-300 ${on ? 'border-transparent text-ink' : 'border-white/10 text-fog hover:border-white/25 hover:text-bone'}`}
                  >
                    {on && <motion.span layoutId="skill-tab" className="absolute inset-0 rounded-full bg-bone" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                    <span className="relative">
                      {g.title} <span className={on ? 'text-ink/50' : 'text-fog/60'}>{g.items.length}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <SpotCard className="mt-4 overflow-hidden rounded-[22px] p-[clamp(14px,2vw,22px)]">
              <AnimatePresence mode="wait">
                <motion.ul
                  key={active}
                  className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease }}
                  role="tabpanel"
                  aria-label={active}
                >
                  {group.items.map(([name, icon], i) => {
                    const where = usedIn(name);
                    return (
                      <motion.li
                        key={name}
                        className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, ease, delay: i * 0.04 }}
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                          <Logo name={name} icon={icon} size={18} />
                        </span>
                        <span className="min-w-0">
                          <b className="block text-[0.9rem] font-medium">{name}</b>
                          <span className="block truncate text-[0.72rem] text-fog">{where.length ? (where.length === ALL.length ? 'All four projects' : where.join(' · ')) : 'Day-to-day tool'}</span>
                        </span>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              </AnimatePresence>
            </SpotCard>
          </div>

          <motion.div
            className="order-1 mx-auto w-full max-w-[min(560px,92vw)] lg:order-2"
            initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 1.4, ease }}
          >
            <SkillSphere items={items} activeGroup={active} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
