import Magnet from './reactbits/Magnet.jsx';

const base =
  'group/btn relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border px-5 py-3 text-[0.9rem] font-medium leading-none tracking-[-0.01em] no-underline transition-[color,border-color,background-color,box-shadow] duration-300';

const variants = {
  solid:
    'border-transparent bg-bone text-ink shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_8px_30px_-8px_rgb(255_255_255/0.35)] hover:bg-white hover:shadow-[0_0_0_1px_rgb(255_255_255/0.2),0_10px_40px_-6px_rgb(255_138_61/0.55)]',
  accent:
    'border-transparent bg-sodium text-ink shadow-[0_8px_30px_-8px_rgb(255_138_61/0.7)] hover:bg-[#ff9a55] hover:shadow-[0_10px_40px_-6px_rgb(255_138_61/0.85)]',
  ghost: 'border-white/12 bg-white/[0.04] text-bone hover:border-white/25 hover:bg-white/[0.08]'
};

// A pill button that leans toward the pointer (React Bits Magnet), with a light sweep across it on hover.
export default function Button({ href, variant = 'ghost', external = false, magnetic = true, className = '', children, ...rest }) {
  const classes = `${base} ${variants[variant]} ${className}`;
  const link = external ? { target: '_blank', rel: 'noopener' } : {};
  const sweep = (
    <span
      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition-[transform,opacity] duration-700 ease-out group-hover/btn:translate-x-[420%] group-hover/btn:opacity-100"
      aria-hidden="true"
    />
  );
  const node = href ? (
    <a href={href} className={classes} {...link} {...rest}>
      {sweep}
      {children}
    </a>
  ) : (
    <button type="button" className={classes} {...rest}>
      {sweep}
      {children}
    </button>
  );
  if (!magnetic) return node;
  return (
    <Magnet padding={30} magnetStrength={3.5}>
      {node}
    </Magnet>
  );
}
