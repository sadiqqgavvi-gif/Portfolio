import { brandColor, icons } from '../lib/icons.js';

// A brand mark from simple-icons, or a monogram for tools that have no published icon.
export default function Logo({ name, icon, size = 22, color, className = '' }) {
  const data = icon ? icons[icon] : null;
  if (!data) {
    const letters = name.replace(/[^A-Za-z]/g, '').slice(0, 2);
    return (
      <span
        className={`inline-grid shrink-0 place-items-center rounded-md border border-white/15 font-mono font-semibold uppercase leading-none ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.42, color: color ?? '#ededee' }}
        aria-hidden="true"
      >
        {letters}
      </span>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={`shrink-0 ${className}`} fill={color ?? brandColor(data)} aria-hidden="true">
      <path d={data.path} />
    </svg>
  );
}
