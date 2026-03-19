/**
 * Cursor-following hover reveal.
 * Attaches mouseenter/leave/move listeners to a trigger element
 * that show/hide and position a portrait element at the cursor.
 *
 * @param {HTMLElement} trigger  — element whose hover area activates the reveal
 * @param {HTMLElement} portrait — element to show/position (should be position:fixed)
 * @param {{ offsetX?: number, offsetY?: number }} [opts]
 * @returns {() => void} cleanup — removes all listeners
 */
export function initHoverReveal(trigger, portrait, opts = {}) {
  const ox = opts.offsetX ?? 16;
  const oy = opts.offsetY ?? -80;

  const onEnter = () => portrait.classList.add('visible');
  const onLeave = () => portrait.classList.remove('visible');
  const onMove = (e) => {
    portrait.style.transform = `translate3d(${e.clientX + ox}px, ${e.clientY + oy}px, 0)`;
  };

  trigger.addEventListener('mouseenter', onEnter);
  trigger.addEventListener('mouseleave', onLeave);
  trigger.addEventListener('mousemove', onMove);

  return () => {
    trigger.removeEventListener('mouseenter', onEnter);
    trigger.removeEventListener('mouseleave', onLeave);
    trigger.removeEventListener('mousemove', onMove);
    portrait.classList.remove('visible');
  };
}
