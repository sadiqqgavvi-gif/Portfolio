import { forwardRef, useCallback } from 'react';

/* A card whose border and surface light up around the pointer (the "magic card" effect). The pointer position
   is written straight to CSS variables, so moving the mouse never re-renders React. */
const SpotCard = forwardRef(function SpotCard({ as: Tag = 'div', className = '', color, style, children, onPointerMove, onPointerLeave, ...rest }, ref) {
  const move = useCallback(
    event => {
      const el = event.currentTarget;
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      el.style.setProperty('--my', `${event.clientY - rect.top}px`);
      onPointerMove?.(event);
    },
    [onPointerMove]
  );
  const leave = useCallback(
    event => {
      event.currentTarget.style.setProperty('--mx', '-400px');
      event.currentTarget.style.setProperty('--my', '-400px');
      onPointerLeave?.(event);
    },
    [onPointerLeave]
  );
  const colors = color ? { '--spot': `${color}d9`, '--spot-fill': `${color}14` } : null;
  return (
    <Tag ref={ref} className={`spot-card ${className}`} style={{ ...colors, ...style }} onPointerMove={move} onPointerLeave={leave} {...rest}>
      {children}
    </Tag>
  );
});

export default SpotCard;
