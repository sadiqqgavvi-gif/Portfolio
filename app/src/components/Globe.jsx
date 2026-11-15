import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';
import { prefersReducedMotion } from '../lib/scroll.js';

const HOME = [32.94, 73.73]; // Jhelum, Pakistan
const PLACES = [
  [25.2, 55.27], // Dubai
  [51.51, -0.13], // London
  [40.71, -74.0], // New York
  [52.52, 13.4], // Berlin
  [1.35, 103.82], // Singapore
  [43.65, -79.38] // Toronto
];

/* A dotted WebGL globe (cobe) with arcs from home to cities around the world. It turns on its own, can be
   dragged, and stops drawing whenever it is off screen. */
export default function Globe({ className = '' }) {
  const canvas = useRef(null);

  useEffect(() => {
    const el = canvas.current;
    const still = prefersReducedMotion();
    // The globe is drawn per pixel, so its resolution is the main cost; 1.5x stays sharp on retina screens.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let size = el.offsetWidth || 400;
    let phi = 4.6;
    let drag = null;
    let velocity = 0;
    let visible = false;
    let frame = 0;

    const globe = createGlobe(el, {
      devicePixelRatio: dpr,
      width: size,
      height: size,
      phi,
      theta: 0.28,
      dark: 1,
      diffuse: 1.25,
      mapSamples: 10000,
      mapBrightness: 5.5,
      mapBaseBrightness: 0.02,
      baseColor: [0.22, 0.22, 0.25],
      markerColor: [1, 0.54, 0.24],
      glowColor: [0.18, 0.18, 0.21],
      markers: [{ location: HOME, size: 0.09 }, ...PLACES.map(location => ({ location, size: 0.035, color: [0.34, 0.85, 0.79] }))],
      arcs: PLACES.map(to => ({ from: HOME, to })),
      arcColor: [1, 0.54, 0.24],
      arcWidth: 0.6,
      arcHeight: 0.28,
      markerElevation: 0.01
    });

    const render = () => {
      frame = 0;
      if (!visible) return;
      if (!drag && !still) phi += 0.0035 + velocity;
      velocity *= 0.94;
      globe.update({ phi });
      frame = requestAnimationFrame(render);
    };
    const start = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    observer.observe(el);
    const resize = new ResizeObserver(() => {
      size = el.offsetWidth;
      globe.update({ width: size, height: size });
    });
    resize.observe(el);

    const down = event => {
      drag = { x: event.clientX, phi };
      el.setPointerCapture(event.pointerId);
      el.style.cursor = 'grabbing';
    };
    const move = event => {
      if (!drag) return;
      const next = drag.phi + (event.clientX - drag.x) / 160;
      velocity = (next - phi) * 0.2;
      phi = next;
      if (still) globe.update({ phi });
    };
    const up = () => {
      drag = null;
      el.style.cursor = 'grab';
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.style.opacity = '1';

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      globe.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvas}
      className={`aspect-square w-full cursor-grab touch-pan-y opacity-0 transition-opacity duration-1000 ${className}`}
      aria-label="Globe showing Jhelum, Pakistan connected to cities around the world"
      role="img"
    />
  );
}
