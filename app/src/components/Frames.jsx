// Device frames for project screenshots.

export function Shot({ shot, alt = '', sizes = '(min-width: 1024px) 50vw, 92vw', eager = false, className = '' }) {
  return (
    <img
      src={shot.sm}
      srcSet={`${shot.sm} ${Math.min(shot.w, 720)}w, ${shot.src} ${shot.w}w`}
      sizes={sizes}
      width={shot.w}
      height={shot.h}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable="false"
      className={`block h-auto w-full ${className}`}
    />
  );
}

export function BrowserFrame({ address, children, className = '' }) {
  return (
    <figure className={`m-0 overflow-hidden rounded-xl border border-white/12 bg-[#0d1c24] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.85)] ${className}`}>
      <div className="flex h-8 items-center gap-1.5 border-b border-white/10 bg-white/[0.035] px-3.5" aria-hidden="true">
        <i className="size-2 rounded-full bg-[#ff6b5e]/80" />
        <i className="size-2 rounded-full bg-[#ffc24a]/80" />
        <i className="size-2 rounded-full bg-[#3fd07f]/80" />
        <span className="mx-auto max-w-[70%] truncate rounded-full bg-white/[0.06] px-3 py-0.5 font-mono text-[10px] tracking-wide text-fog">{address}</span>
        <i className="w-9" />
      </div>
      {children}
    </figure>
  );
}

export function PhoneFrame({ children, className = '' }) {
  return (
    <figure className={`relative m-0 overflow-hidden rounded-[1.4rem] border-[5px] border-[#17272f] bg-black shadow-[0_30px_60px_-20px_rgb(0_0_0/0.9)] ring-1 ring-white/15 ${className}`}>
      <span className="absolute left-1/2 top-1.5 z-10 h-1 w-10 -translate-x-1/2 rounded-full bg-black/70" aria-hidden="true" />
      {children}
    </figure>
  );
}
