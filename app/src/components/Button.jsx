import Magnet from './reactbits/Magnet.jsx';

const base =
  'group/btn relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border px-5 py-3 text-[0.82rem] font-semibold uppercase tracking-[0.08em] leading-none no-underline transition-colors duration-500 ' +
  'before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:rounded-[inherit] before:bg-bone before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.16,1,0.3,1)] ' +
  'hover:text-ink hover:border-bone hover:before:scale-y-100 focus-visible:text-ink focus-visible:before:scale-y-100';

const variants = {
  solid: 'border-sodium bg-sodium text-ink',
  ghost: 'border-line bg-ink/40 text-bone backdrop-blur-sm'
};

// A pill button that leans toward the pointer (React Bits Magnet) and fills from the bottom on hover.
export default function Button({ href, variant = 'ghost', external = false, magnetic = true, className = '', children, ...rest }) {
  const classes = `${base} ${variants[variant]} ${className}`;
  const link = external ? { target: '_blank', rel: 'noopener' } : {};
  const node = href ? (
    <a href={href} className={classes} {...link} {...rest}>
      {children}
    </a>
  ) : (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
  if (!magnetic) return node;
  return (
    <Magnet padding={36} magnetStrength={3.2}>
      {node}
    </Magnet>
  );
}
