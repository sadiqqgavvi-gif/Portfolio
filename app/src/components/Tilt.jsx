import { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react';

const spring = { stiffness: 170, damping: 20, mass: 0.6 };

// Tilts its content toward the pointer in 3D and slides a soft glare across it. Children can add depth
// with translateZ because the surface keeps its 3D context.
export default function Tilt({ max = 9, glare = true, className = '', children, ...rest }) {
  const ref = useRef(null);
  const rotateX = useSpring(0, spring);
  const rotateY = useSpring(0, spring);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glareOpacity = useSpring(0, spring);
  const background = useMotionTemplate`radial-gradient(420px circle at ${glareX}% ${glareY}%, rgb(255 255 255 / 0.13), transparent 60%)`;

  const onMove = event => {
    if (event.pointerType !== 'mouse') return;
    const rect = ref.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateX.set((0.5 - py) * max * 2);
    rotateY.set((px - 0.5) * max * 2);
    glareX.set(px * 100);
    glareY.set(py * 100);
    glareOpacity.set(1);
  };
  const onLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    glareOpacity.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative preserve-3d ${className}`}
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      {...rest}
    >
      {children}
      {glare && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
          style={{ background, opacity: glareOpacity }}
        />
      )}
    </motion.div>
  );
}
