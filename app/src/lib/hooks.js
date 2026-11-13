import { useEffect, useState, useSyncExternalStore } from 'react';

export function useMediaQuery(query) {
  return useSyncExternalStore(
    notify => {
      const list = window.matchMedia(query);
      list.addEventListener('change', notify);
      return () => list.removeEventListener('change', notify);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

// Which section is currently under the middle of the viewport.
export function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const els = ids.map(id => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: '-45% 0px -54% 0px' }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

export function useKey(key, handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;
    const onKey = event => {
      if (event.key === key) handler(event);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [key, handler, enabled]);
}
