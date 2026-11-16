import { useEffect, useMemo, useRef } from 'react';
import { brandColor, icons } from '../lib/icons.js';
import { prefersReducedMotion } from '../lib/scroll.js';
import Logo from './Logo.jsx';

/* Every tool as a badge on the surface of a slowly turning sphere (points spread with a Fibonacci lattice).
   Drag to spin it. Badges in the selected group light up in their brand colour; the rest fade back.
   Positions are written straight to the DOM each frame, and the loop stops while the sphere is off screen. */
export default function SkillSphere({ items, activeGroup, className = '' }) {
  const box = useRef(null);
  const nodes = useRef([]);
  const state = useRef({ ax: -0.35, ay: 0, vx: 0, vy: 0.0026, drag: null, radius: 200 });

  const points = useMemo(() => {
    const n = items.length;
    const golden = Math.PI * (3 - Math.sqrt(5));
    return items.map((_, i) => {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = golden * i;
      return [Math.cos(t) * r, y, Math.sin(t) * r];
    });
  }, [items]);

  useEffect(() => {
    const el = box.current;
    const s = state.current;
    const still = prefersReducedMotion();
    let frame = 0;
    let visible = false;

    const place = () => {
      const cx = Math.cos(s.ax), sx = Math.sin(s.ax), cy = Math.cos(s.ay), sy = Math.sin(s.ay);
      points.forEach(([x, y, z], i) => {
        const node = nodes.current[i];
        if (!node) return;
        // Turn around the vertical axis, then tilt around the horizontal one.
        const x1 = x * cy + z * sy;
        const z1 = -x * sy + z * cy;
        const y2 = y * cx - z1 * sx;
        const z2 = y * sx + z1 * cx;
        const depth = (z2 + 1) / 2; // 0 at the back, 1 at the front
        const scale = 0.55 + depth * 0.55;
        node.style.transform = `translate3d(${x1 * s.radius}px, ${y2 * s.radius}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
        node.style.zIndex = String(Math.round(depth * 100));
        node.style.setProperty('--depth', depth.toFixed(3));
      });
    };

    const tick = () => {
      frame = 0;
      if (!visible) return;
      if (!s.drag) {
        s.ay += s.vy;
        s.ax += s.vx;
        s.vy += (0.0026 - s.vy) * 0.02;
        s.vx *= 0.94;
        s.ax += (-0.35 - s.ax) * 0.01;
      }
      place();
      if (!still) frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const resize = () => {
      s.radius = el.offsetWidth * 0.4;
      place();
    };
    resize();
    const sizes = new ResizeObserver(resize);
    sizes.observe(el);
    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    seen.observe(el);

    const down = event => {
      s.drag = { x: event.clientX, y: event.clientY, ax: s.ax, ay: s.ay, lx: event.clientX, ly: event.clientY };
      el.setPointerCapture(event.pointerId);
    };
    const move = event => {
      if (!s.drag) return;
      const d = s.drag;
      s.ay = d.ay + (event.clientX - d.x) * 0.008;
      s.ax = d.ax - (event.clientY - d.y) * 0.006;
      s.vy = (event.clientX - d.lx) * 0.004;
      s.vx = -(event.clientY - d.ly) * 0.003;
      d.lx = event.clientX;
      d.ly = event.clientY;
      if (still) place();
    };
    const up = () => (s.drag = null);
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);

    return () => {
      cancelAnimationFrame(frame);
      sizes.disconnect();
      seen.disconnect();
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, [points]);

  return (
    <div ref={box} className={`relative aspect-square w-full cursor-grab touch-pan-y select-none active:cursor-grabbing ${className}`} role="img" aria-label="A turning sphere of the tools I use; drag to spin it">
      {/* Rings and a glowing core behind the badges. */}
      <div className="pointer-events-none absolute inset-[10%] rounded-full border border-white/[0.06]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-[22%] rounded-full border border-dashed border-white/[0.06]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-[30%] rounded-full bg-[radial-gradient(closest-side,rgb(255_138_61/0.22),rgb(86_216_201/0.06)_60%,transparent)]" aria-hidden="true" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 flex size-[72px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-sodium/40 bg-ink leading-none shadow-[0_0_50px_-6px_rgb(255_138_61/0.7)]" aria-hidden="true">
        <b className="text-[1.15rem] font-semibold">{items.length}</b>
        <span className="mt-1 text-[0.6rem] uppercase tracking-[0.14em] text-fog">tools</span>
      </div>

      <div className="absolute left-1/2 top-1/2" aria-hidden="true">
        {items.map((item, i) => {
          const on = item.group === activeGroup;
          const color = item.icon ? brandColor(icons[item.icon]) : '#ededee';
          return (
            <div
              key={item.name}
              ref={el => (nodes.current[i] = el)}
              className="absolute left-0 top-0 flex flex-col items-center gap-1 will-change-transform"
              style={{ opacity: `calc(${on ? 0.45 : 0.2} + var(--depth, 0.5) * ${on ? 0.55 : 0.5})` }}
            >
              <span
                className="grid size-11 place-items-center rounded-full border transition-[border-color,box-shadow,background-color] duration-500 max-sm:size-9"
                style={{
                  borderColor: on ? `${color}88` : 'rgb(255 255 255 / 0.1)',
                  background: on ? `${color}1a` : 'rgb(12 13 16 / 0.92)',
                  boxShadow: on ? `0 0 24px -4px ${color}` : 'none'
                }}
              >
                <Logo name={item.name} icon={item.icon} size={18} color={on ? undefined : '#8b8d97'} />
              </span>
              <span className={`whitespace-nowrap text-[0.66rem] font-medium transition-opacity duration-500 max-sm:hidden ${on ? 'opacity-100' : 'opacity-0'}`}>{item.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
