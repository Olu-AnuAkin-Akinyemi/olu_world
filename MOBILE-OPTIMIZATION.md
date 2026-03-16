# Mobile Optimization — Reference Guide

> General-purpose checklist and patterns for building mobile-friendly websites. Not project-specific — use across any frontend work.

---

## 1. Touch vs Hover: The Double-Tap Problem

**The issue:** iOS Safari treats the first tap as a `:hover` event when hover styles visually change an element. The second tap actually navigates. Users think the link is broken.

**The fix:** Wrap hover styles in `@media(hover: hover)` so they only fire on devices with a real pointer (mouse/trackpad).

```css
/* Desktop only — mouse hover */
@media (hover: hover) {
  .cta:hover {
    background: red;
    color: white;
  }
}
```

**For content revealed on hover** (expandable descriptions, tooltips), make them always visible on touch:

```css
/* Touch devices — always show */
@media (hover: none) {
  .description {
    max-height: 80px;
    opacity: 1;
  }
}
```

**Key distinction:**
- `hover: hover` — device has a hover-capable pointer (desktop)
- `hover: none` — no hover capability (phones, tablets)
- `pointer: coarse` — imprecise pointer (finger/touch)
- `pointer: fine` — precise pointer (mouse/stylus)

Use `hover` for styling decisions. Use `pointer` for interaction logic (JS event listeners, hit target sizing).

---

## 2. iOS Safari Auto-Zoom on Inputs

**The issue:** iOS Safari auto-zooms when a user taps any `<input>`, `<textarea>`, or `<select>` with `font-size` below **16px**. It does **not** zoom back out when the user leaves the field.

**The fix:**
```css
input, textarea, select {
  font-size: 16px;
}
```

**Why 16px specifically:** This is Safari's hardcoded threshold. 15.9px triggers zoom. 16px does not. There is no setting to change this.

**Does NOT affect:** Android Chrome (no auto-zoom behavior on any font size).

---

## 3. Preventing Horizontal Overflow

**The issue:** Elements wider than the viewport cause horizontal scrolling. On mobile this feels like the page is broken — users have to swipe sideways to find buttons.

**Common causes:**
- Fixed `max-width` values that exceed narrow screens (e.g., `max-width: 400px` on a 375px screen, once padding is added)
- Elements with explicit `width` exceeding viewport
- Content inside flex/grid that doesn't shrink (long URLs, pre-formatted text)
- Padding/border pushing an element past its container

**Fixes:**

```css
/* Global safety net */
*, *::before, *::after {
  box-sizing: border-box;
}
body {
  overflow-x: hidden;
}

/* Container pattern — caps at pixel value OR screen width */
.container {
  max-width: min(400px, 100%);
  width: 100%;
}
```

**The `min()` pattern:** `max-width: min(400px, 100%)` means "be 400px when there's room, but never wider than the screen." One line replaces a media query.

**Debugging tip:** In Chrome DevTools, toggle device toolbar → check for any element with a blue box extending past the viewport edge. Or add this temporarily:

```css
* { outline: 1px solid red; }
```

---

## 4. Tap Target Sizing

**The rule:** Interactive elements (buttons, links, inputs) should be at least **44×44px** touch target. This is Apple's Human Interface Guideline and WCAG 2.1 AAA.

**The problem:** A text link styled at `font-size: 9px` with no padding has a tiny hit area. Users miss it or tap the wrong thing.

**The fix:** Add padding, not just font size:

```css
.small-link {
  font-size: 9px;
  padding: 12px 16px; /* Expands tap target without changing visual size */
}
```

Or use `min-height`/`min-width`:

```css
.icon-button {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

## 5. Viewport and Scaling

**The baseline:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

**Never do this:**
```html
<!-- Blocks pinch-to-zoom — accessibility violation -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
```

Blocking zoom is an accessibility failure (WCAG 1.4.4). If you're blocking zoom to prevent the iOS input zoom problem, fix the font-size instead (see section 2).

---

## 6. Filenames and URLs

**The issue:** Spaces in filenames break `srcset` parsing. The browser treats each space-separated token as a descriptor, so `Dreams of our Ancestors.webp 400w` becomes four broken fragments.

**The rule:** Never use spaces in asset filenames. Use hyphens.

```
Bad:  Dreams of our Ancestors_collage-400.webp
Good: Dreams-of-our-Ancestors_collage-400.webp
```

This applies to all assets: images, fonts, audio, video. It prevents issues in:
- HTML `srcset` attributes
- CSS `url()` values
- JavaScript `import` / `fetch` paths
- Build tools that shell out commands

---

## 7. Images: Responsive Delivery

**The pattern:**
```html
<img
  srcset="photo-400.webp 400w,
          photo-800.webp 800w,
          photo-1200.webp 1200w"
  sizes="(max-width: 640px) 100vw,
         (max-width: 1024px) 50vw,
         33vw"
  src="photo-400.webp"
  alt="Description"
  loading="lazy"
/>
```

**Key rules:**
- `src` is the fallback — use the smallest size
- `sizes` tells the browser how wide the image will render at each breakpoint, so it picks the right `srcset` candidate
- `loading="lazy"` for anything below the fold
- `fetchpriority="high"` for the LCP (Largest Contentful Paint) image only — typically the hero
- Use `.webp` for delivery. Facebook/LinkedIn OG images need `.jpg` or `.png` (they reject `.webp`)

**Preloading the LCP image:**
```html
<link rel="preload" as="image" type="image/webp" href="hero-640.webp" />
```

Only preload what will actually be used. If mobile loads the 640 variant, don't preload the 1024 — that wastes bandwidth and triggers browser warnings.

---

## 8. Performance Priorities for Mobile

**Target metrics (Lighthouse / Core Web Vitals):**
| Metric | Target | What it measures |
|--------|--------|-----------------|
| LCP | < 2.5s | Largest visible element render time |
| FID / INP | < 100ms | Input responsiveness |
| CLS | < 0.1 | Visual stability (no layout shifts) |

**Quick wins:**
- Lazy load all below-fold images
- Preload only the hero/LCP image
- Use `transform` and `opacity` for animations (GPU-composited, no layout thrashing)
- Avoid `scroll` event listeners — use `IntersectionObserver` instead
- Add `{ passive: true }` to scroll/touch listeners you can't avoid
- Minimize main-thread JS — defer non-critical scripts

**What causes layout shifts (CLS):**
- Images without `width`/`height` or `aspect-ratio`
- Fonts loading and swapping (use `font-display: swap` + preload critical fonts)
- Dynamically injected content above the fold

---

## 9. Mobile Menu Patterns

**Common pitfalls:**
- Forgetting `overflow: hidden` on `<body>` when menu is open (page scrolls behind the menu)
- Not handling `Escape` key to close
- Not restoring focus to the trigger button after close
- Links in the menu not closing the menu after navigation

**Minimal accessible pattern:**
```html
<button id="menuToggle" aria-expanded="false" aria-controls="mobileMenu">Menu</button>
<nav id="mobileMenu" aria-hidden="true">
  <a href="#section1">Section 1</a>
  <a href="#section2">Section 2</a>
</nav>
```

```javascript
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', !open);
  menu.setAttribute('aria-hidden', open);
  document.body.style.overflow = open ? '' : 'hidden';
});

// Close on link click
menu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => closeMenu());
});

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menuIsOpen) {
    closeMenu();
    toggle.focus(); // Return focus
  }
});
```

---

## 10. OG / Social Share Images

**Requirements by platform:**
| Platform | Formats | Dimensions | Max size |
|----------|---------|------------|----------|
| Facebook | `.jpg`, `.png` | 1200×630 | 8MB |
| Twitter/X | `.jpg`, `.png`, `.gif`, `.webp` | 1200×628 | 5MB |
| LinkedIn | `.jpg`, `.png` | 1200×627 | 5MB |

**`.webp` is rejected by Facebook and LinkedIn.** Always use `.jpg` for photo-based OG images (smaller than PNG for photos).

**After deploying OG changes:**
1. Purge CDN cache (Cloudflare: Caching → Purge Everything)
2. Facebook: developers.facebook.com/tools/debug → "Scrape Again"
3. Twitter: cards-dev.twitter.com/validator
4. LinkedIn: linkedin.com/post-inspector

**Verify content-type headers:**
```bash
curl -I https://yourdomain.com/og-image.jpg
# Should return: content-type: image/jpeg
# If it returns text/html, the file isn't deployed or a SPA fallback is intercepting it
```

---

## Quick Checklist

- [ ] All hover styles wrapped in `@media(hover: hover)`
- [ ] Content reveals use `@media(hover: none)` for touch fallback
- [ ] All form inputs are `font-size: 16px` minimum
- [ ] No asset filenames contain spaces
- [ ] `box-sizing: border-box` is global
- [ ] Containers use `min()` or `max-width: 100%` to respect screen width
- [ ] Below-fold images have `loading="lazy"`
- [ ] LCP image is preloaded (and only the variant that will load)
- [ ] Tap targets are 44×44px minimum
- [ ] Mobile menu locks body scroll and handles Escape key
- [ ] OG images are `.jpg` or `.png`, not `.webp`
- [ ] All images have `width`/`height` HTML attributes (prevents CLS)
- [ ] Skip-to-content link before nav (WCAG 2.1 AA)
- [ ] No asset filenames contain spaces (breaks srcset, CDN URLs, shell commands)
- [ ] Animations use `transform`/`opacity` only
- [ ] Scroll listeners use `IntersectionObserver` or `{ passive: true }`
- [ ] Viewport meta does not block user scaling
