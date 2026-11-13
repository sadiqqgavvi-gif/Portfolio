import { motion } from 'motion/react';

const ease = [0.16, 1, 0.3, 1];

// Fades and lifts its children into place the first time they scroll into view.
export default function Reveal({ as = 'div', delay = 0, y = 36, className = '', children, ...rest }) {
  const Tag = motion[as] ?? motion.div;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, ease, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
