import { Component, lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, MotionConfig, useScroll, useSpring } from 'motion/react';
import { scrollToTarget, startSmoothScroll } from './lib/scroll.js';
import Preloader from './components/Preloader.jsx';
import Nav from './components/Nav.jsx';
import Cursor from './components/Cursor.jsx';
import CaseStudy from './components/CaseStudy.jsx';
import Hero from './sections/Hero.jsx';
import Marquee from './sections/Marquee.jsx';
import About from './sections/About.jsx';
import Services from './sections/Services.jsx';
import Stack from './sections/Stack.jsx';
import Work from './sections/Work.jsx';
import Journey from './sections/Journey.jsx';
import Contact from './sections/Contact.jsx';

// Three.js is the heaviest part of the page, so it loads on its own after the first paint.
const Scene = lazy(() => import('./three/Scene.jsx'));

// If WebGL is unavailable the page still works; the gradient backdrop stands in for the 3D stage.
class StageBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return <motion.div className="fixed inset-x-0 top-0 z-[100] h-0.5 origin-left bg-gradient-to-r from-teal to-sodium" style={{ scaleX }} aria-hidden="true" />;
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [openId, setOpenId] = useState(null);
  const onDone = useCallback(() => setReady(true), []);

  useEffect(() => startSmoothScroll(), []);

  // In-page links glide instead of jumping.
  useEffect(() => {
    const onClick = event => {
      const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
      if (!link || event.defaultPrevented) return;
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      scrollToTarget(target);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // A case study is a history entry, so the browser's Back button closes it.
  useEffect(() => {
    const onPop = event => setOpenId(event.state?.caseStudy ?? null);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const open = useCallback(id => {
    window.history.pushState({ caseStudy: id }, '');
    setOpenId(id);
  }, []);
  const close = useCallback(() => {
    if (window.history.state?.caseStudy) window.history.back();
    else setOpenId(null);
  }, []);
  const navigate = useCallback(id => {
    window.history.replaceState({ caseStudy: id }, '');
    setOpenId(id);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <Preloader onDone={onDone} />

      {/* Stage: ambient light, the 3D scene, grain and a vignette, all fixed behind the page. */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(60vmax_50vmax_at_78%_18%,rgb(95_211_199/0.11),transparent_60%),radial-gradient(50vmax_40vmax_at_12%_88%,rgb(255_154_77/0.09),transparent_60%)]" />
        <StageBoundary>
          <Suspense fallback={null}>
            <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: ready ? 1 : 0 }} transition={{ duration: 2, delay: 0.3 }}>
              <Scene />
            </motion.div>
          </Suspense>
        </StageBoundary>
        <div className="grain absolute -inset-1/2 animate-grain opacity-[0.06] mix-blend-overlay max-md:hidden" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgb(0_0_0/0.55)_100%)]" />
      </div>

      <div id="page" className="relative z-[2]">
        <a
          href="#main"
          className="absolute left-[-9999px] top-2 z-[300] bg-sodium px-4 py-2 font-semibold text-ink no-underline focus:left-4"
        >
          Skip to content
        </a>
        <ScrollProgress />
        <Nav ready={ready} />
        <main id="main" className="overflow-x-clip">
          <Hero ready={ready} />
          <Marquee />
          <About />
          <Services />
          <Stack />
          <Work onOpen={open} />
          <Journey />
          <Contact />
        </main>
      </div>

      <Cursor />
      <AnimatePresence>{openId && <CaseStudy key="case-study" projectId={openId} onClose={close} onNavigate={navigate} />}</AnimatePresence>
    </MotionConfig>
  );
}
