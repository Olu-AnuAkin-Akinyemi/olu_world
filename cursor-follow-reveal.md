# Cursor-Follow Image Reveal

A lightweight interaction pattern where hovering over a trigger area reveals an image that tracks the mouse cursor. The image fades in on enter, follows on move, and fades out on leave.

---

## How It Works

Three layers working together:

### 1. HTML — The Structure

```html
<div class="trigger-area">
  <img src="portrait.webp" alt="" class="hover-portrait" aria-hidden="true" />
  <!-- ...other content the user hovers over... -->
</div>
```

- **Trigger area**: any container whose hover zone activates the reveal.
- **Portrait element**: an `<img>` (or `<div>` with background-image) that will follow the cursor. `aria-hidden="true"` because it's decorative — screen readers skip it.

### 2. CSS — The Presentation

```css
.hover-portrait {
  position: fixed;
  width: 18vw;
  height: 25vw;
  object-fit: cover;
  pointer-events: none;      /* clicks pass through */
  opacity: 0;
  scale: 0.95;
  z-index: 20;
  transition: opacity 0.3s ease, scale 0.3s ease;
  will-change: transform, opacity;
}
.hover-portrait.visible {
  opacity: 1;
  scale: 1;
}
```

Key decisions:

| Property | Why |
|---|---|
| `position: fixed` | Positions relative to the viewport, matching `clientX`/`clientY` from `mousemove`. No offset math needed for scroll position. |
| `pointer-events: none` | Prevents the portrait from intercepting mouse events, which would cause flickering (mouse enters portrait → triggers `mouseleave` on trigger → portrait hides → mouse re-enters trigger → loop). |
| `will-change: transform, opacity` | Promotes the element to its own compositor layer. The browser can animate `transform` and `opacity` on the GPU without triggering layout or paint. |
| `scale` via CSS transition | The subtle 0.95 → 1 scale on enter gives the reveal a tactile "pop" feel. Handled entirely by CSS — JS only toggles the class. |
| `transition` on opacity + scale | CSS handles the easing, not JS. This means the fade-out on `mouseleave` is automatic — JS just removes `.visible` and CSS transitions it back to `opacity: 0`. |
| `vw` sizing | Portrait scales proportionally with the viewport. On a 1440px screen, `18vw` = ~259px. On 1920px, ~346px. Keeps the proportion consistent without breakpoint logic. |

### 3. JavaScript — The Behavior

```js
export function initHoverReveal(trigger, portrait, opts = {}) {
  const ox = opts.offsetX ?? 16;   // nudge right of cursor
  const oy = opts.offsetY ?? -80;  // nudge above cursor

  const onEnter = () => portrait.classList.add('visible');
  const onLeave = () => portrait.classList.remove('visible');
  const onMove  = (e) => {
    portrait.style.transform =
      `translate3d(${e.clientX + ox}px, ${e.clientY + oy}px, 0)`;
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
```

How each piece works:

- **`translate3d(x, y, 0)`** — Moves the element without triggering layout. The `3d` suffix forces GPU acceleration on all browsers. Setting position via `transform` instead of `top`/`left` avoids layout thrashing.
- **`clientX`/`clientY`** — Mouse coordinates relative to the viewport. Since the portrait is `position: fixed` (also viewport-relative), these map directly — no `getBoundingClientRect()` or scroll offset math needed.
- **Offsets (`ox`, `oy`)** — Prevent the portrait from sitting directly under the cursor (which would trigger `mouseleave` if `pointer-events: none` ever fails, and looks better offset).
- **Returns a cleanup function** — Removes all listeners and resets state. Useful if the component unmounts, the page navigates via SPA routing, or you need to toggle the effect on/off.
- **No `requestAnimationFrame`** — `mousemove` already fires at the browser's paint cadence (typically 60fps). Wrapping in rAF adds a frame of latency with no benefit. Direct assignment is the standard approach for cursor tracking.

### Wiring it up (caller code)

```js
const trigger  = document.querySelector('.trigger-area');
const portrait = document.querySelector('.hover-portrait');

if (trigger && portrait && !matchMedia('(pointer: coarse)').matches) {
  import('./hoverReveal.js').then(({ initHoverReveal }) => {
    initHoverReveal(trigger, portrait);
  });
}
```

- **`(pointer: coarse)` guard** — Skips the effect on touch devices. There's no hover intent on mobile, and `mousemove` events fire unreliably on touch. This is more reliable than `'ontouchstart' in window` (which returns `true` on touch-capable laptops).
- **Dynamic `import()`** — The module is only loaded when the elements exist and the device has a fine pointer. Zero cost on mobile. Vite code-splits this into its own chunk automatically.

---

## When to Use This Pattern

**Good fit:**
- Name/bio lists where each item has an associated portrait (team pages, advisor lineups, credits).
- Product grids where hovering a title previews the product image.
- Navigation menus with preview thumbnails.
- Any text-heavy section where you want to reveal a visual without leaving the current context.

**Poor fit:**
- Touch/mobile-first UIs (no hover intent).
- Sections where the image is already visible (redundant).
- High-density layouts where a floating image would overlap other interactive elements.
- Accessibility-critical content — the revealed image is decorative only. If the image conveys essential information, show it statically instead.

---

## Adapting for Multiple Items

For a list of items each with their own portrait (like the Artist House advisor lineup):

```html
<ul class="team-list">
  <li class="team-item" data-portrait="alice.webp">Alice — Engineering</li>
  <li class="team-item" data-portrait="bob.webp">Bob — Design</li>
</ul>
<img src="" alt="" class="team-hover-portrait" aria-hidden="true" />
```

```js
const portrait = document.querySelector('.team-hover-portrait');
const items = document.querySelectorAll('.team-item');

items.forEach(item => {
  item.addEventListener('mouseenter', () => {
    portrait.src = item.dataset.portrait;
    portrait.classList.add('visible');
  });
  item.addEventListener('mouseleave', () => {
    portrait.classList.remove('visible');
  });
  item.addEventListener('mousemove', (e) => {
    portrait.style.transform =
      `translate3d(${e.clientX + 16}px, ${e.clientY - 80}px, 0)`;
  });
});
```

One shared `<img>` element, swap `src` on enter. Avoids creating N image elements in the DOM.

---

## Performance Notes

- **0 layout triggers** — Only `transform` and `opacity` are animated. These are compositor-only properties that bypass layout and paint.
- **Tiny footprint** — The module is ~0.25 KB gzipped. No dependencies.
- **No memory leaks** — The cleanup function removes all listeners. Call it when you no longer need the effect.
- **Image loading** — For the single-item case, the image is in the DOM from page load (browser can preload it). For the multi-item case, consider preloading portraits on section visibility via `IntersectionObserver` or using `<link rel="preload">` for critical ones.
