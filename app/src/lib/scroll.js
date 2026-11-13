import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// One smooth scroller for the whole page. GSAP's ticker drives it so ScrollTrigger, Motion's useScroll and
// the 3D scene all read the same scroll position on the same frame.
let lenis = null;
let locks = 0;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function startSmoothScroll() {
  if (lenis || prefersReducedMotion()) return () => {};
  // A slow, gliding scroll: the page eases toward the wheel target instead of jumping to it.
  lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.7, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = time => lenis && lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  if (locks > 0) lenis.stop();
  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}

export function scrollToTarget(target, { immediate = false } = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: immediate ? 0 : 1.8, immediate, force: true });
  else el.scrollIntoView({ behavior: prefersReducedMotion() || immediate ? 'auto' : 'smooth' });
}

// Overlays (menu, case study, lightbox) lock the page behind them. Locks nest.
export function lockScroll() {
  locks += 1;
  if (locks === 1) {
    lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
  }
}
export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks === 0) {
    document.documentElement.style.overflow = '';
    lenis?.start();
  }
}
