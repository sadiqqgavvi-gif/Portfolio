import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, MotionConfig, useScroll, useSpring } from 'motion/react';
import { scrollToTarget, startSmoothScroll } from './lib/scroll.js';
import Preloader from './components/Preloader.jsx';
import Backdrop from './components/Backdrop.jsx';
import Nav from './components/Nav.jsx';
import Cursor from './components/Cursor.jsx';
import CaseStudy from './components/CaseStudy.jsx';
import Hero from './sections/Hero.jsx';
import LogoMarquee from './sections/LogoMarquee.jsx';
import About from './sections/About.jsx';
import Work from './sections/Work.jsx';
import Services from './sections/Services.jsx';
import Process from './sections/Process.jsx';
import Skills from './sections/Skills.jsx';
import Contact from './sections/Contact.jsx';

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return <motion.div className="fixed inset-x-0 top-0 z-[100] h-[2px] origin-left bg-gradient-to-r from-teal via-sodium to-[#ff5e7a]" style={{ scaleX }} aria-hidden="true" />;
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
      <Backdrop />

      <div id="page" className="relative z-[2]">
        <a href="#main" className="absolute left-[-9999px] top-2 z-[300] rounded-full bg-sodium px-4 py-2 font-medium text-ink no-underline focus:left-4">
          Skip to content
        </a>
        <ScrollProgress />
        <Nav ready={ready} />
        <main id="main" className="overflow-x-clip">
          <Hero ready={ready} />
          <LogoMarquee />
          <About />
          <Work onOpen={open} />
          <Services />
          <Process />
          <Skills />
          <Contact />
        </main>
      </div>

      <Cursor />
      <AnimatePresence>{openId && <CaseStudy key="case-study" projectId={openId} onClose={close} onNavigate={navigate} />}</AnimatePresence>
    </MotionConfig>
  );
}
