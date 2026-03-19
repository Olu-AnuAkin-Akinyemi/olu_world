import { describe, it, expect, beforeEach } from 'vitest';
import { initHoverReveal } from './hoverReveal.js';

function fireMouseEvent(el, type, clientX = 0, clientY = 0) {
  el.dispatchEvent(new MouseEvent(type, { clientX, clientY, bubbles: true }));
}

describe('initHoverReveal', () => {
  let trigger, portrait, cleanup;

  beforeEach(() => {
    trigger = document.createElement('div');
    portrait = document.createElement('div');
    document.body.append(trigger, portrait);
    cleanup = initHoverReveal(trigger, portrait);
  });

  it('adds .visible on mouseenter', () => {
    fireMouseEvent(trigger, 'mouseenter');
    expect(portrait.classList.contains('visible')).toBe(true);
  });

  it('removes .visible on mouseleave', () => {
    fireMouseEvent(trigger, 'mouseenter');
    fireMouseEvent(trigger, 'mouseleave');
    expect(portrait.classList.contains('visible')).toBe(false);
  });

  it('sets transform on mousemove with default offsets', () => {
    fireMouseEvent(trigger, 'mousemove', 200, 300);
    expect(portrait.style.transform).toBe('translate3d(216px, 220px, 0)');
  });

  it('applies custom offsets', () => {
    cleanup();
    cleanup = initHoverReveal(trigger, portrait, { offsetX: 0, offsetY: 0 });
    fireMouseEvent(trigger, 'mousemove', 100, 100);
    expect(portrait.style.transform).toBe('translate3d(100px, 100px, 0)');
  });

  it('cleanup removes listeners and .visible class', () => {
    fireMouseEvent(trigger, 'mouseenter');
    expect(portrait.classList.contains('visible')).toBe(true);

    cleanup();
    expect(portrait.classList.contains('visible')).toBe(false);

    fireMouseEvent(trigger, 'mouseenter');
    expect(portrait.classList.contains('visible')).toBe(false);
  });
});
