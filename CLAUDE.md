# øLu AnuAkin — Artist Portfolio & Landing Page

> **📝 Project Memory**: See [`memory.md`](memory.md) for tracked learnings, patterns, and context from previous sessions. Read it FIRST to avoid repeating mistakes.

## Why: Artistic & Business Context

**Project**: Cinematic, mobile-first single-page portfolio for øLu AnuAkin — Alternative Soul / Indie R&B. The site acts as an immersive "world" showcasing music, visual art, and process.

**Target Audience**: 
- Listeners and fans of layered, emotional, and cinematic music.
- Music Supervisors and industry professionals seeking tracks for Sync licensing.
- Curators and visual artists drawn to multimedia world-building.

**Success Metrics**:
1. **Primary:** Email capture (Private Access mailing list conversion).
2. **Secondary:** Streaming conversions (routing users to Bandcamp/Spotify).
3. **Tertiary:** Direct inquiries for Sync licensing.

**User Journey**: Enter atmospheric threshold → Listen to featured project (Afterglow) → Explore visual/audio world-building → Subscribe for private access.

---
### Non-Negotiable Constraints

**Performance:**
- Lighthouse score: 90+ (all categories)
- LCP: <2.5s on 3G throttled
- Mobile-first responsive design (target older demographic)

**Accessibility:**
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Semantic HTML throughout

**Browser Compatibility:**
- Chrome, Safari, Firefox, Edge (last 2 versions)
- Graceful degradation for older browsers

---
## What: Technical Architecture

### Stack Decision: Vanilla HTML + CSS + JS (Vite + Vitest)

**Why Vanilla + Vite:**
- Complete control over DOM for performance-heavy cinematic animations (canvas, cursors, scroll reveals).
- Lightweight and fast loading to retain user immersion without waiting for large JS bundles.
- Vite provides blazing fast HMR and optimized production builds.
- Vitest provides a seamless testing environment for vanilla JS modules.

**Production Stack:**
```text
Frontend: Vanilla HTML5 + CSS3 (CSS Variables for Theming) + ES6 JavaScript
Build Tool: Vite
Testing: Vitest
Image Optimization: sharp (via scripts/optimize-images.mjs)
Visuals: CSS Keyframes, 3D Gallery Canvas
```

### Project Structure 
```text
/
  index.html              # Main artist landing page (Vite entry)
  package.json            # Vite & Vitest dependencies
  CLAUDE.md               # Project overview
  .github/
    copilot-instructions.md # Architecture & coding guidelines
  public/                 # Static assets copied to build root (robots.txt, sitemap.xml, OG image)
  scripts/
    optimize-images.mjs   # sharp-based image optimizer — run after adding new assets
  src/
    css/
      styles.css          # Global styles
    js/
      main.js             # Theme toggle, custom cursor, scroll reveals
      gallery3d.js        # 3D card carousel for gallery section
```

---

## How: Development Workflow

### Non-Negotiable Constraints

**Aesthetic & Interactions:**
- Custom cursor (`.cursor-dot`, `.cursor-ring`) must remain smooth and unobtrusive.
- The `data-theme` variable must map perfectly to CSS tokens (`--bg`, `--text`, `--rust`, etc.) to allow seamless Dark/Light mode flipping.
- Animations must use `transform` and `opacity` to avoid layout thrashing (60fps target).

**Performance & Compatibility:**
- High Lighthouse scores despite media-heavy content.
- Graceful degradation (e.g., if canvas fails, fallback CSS gradients must hold the aesthetic).
- Mobile-first responsive grids (adapting complex grid layouts to 1fr stacks under 980px/640px).

**Code Quality:**
- Semantic HTML tags (nav, section, custom SVG inline icons).
- CSS Custom properties for strictly enforcing the brand palette.
- Pure Vanilla JS functions. Use `.github/copilot-instructions.md` as reference.

### Code Standards

- **Theming:** Use CSS variables heavily. All colors must be routed through the `:root` tokens so `[data-theme="light"]` overrides apply instantly across the UI.
- **Interactions:** Use `IntersectionObserver` for the `.reveal` class animations rather than scroll event listeners to maintain performance.
- **Media:** All images must be optimized with `sharp` before committing. Run `node scripts/optimize-images.mjs` after adding new assets. Gallery images resize to 800px (2x retina), logos to 80px. Never use `cwebp` directly — sharp produces 40-50% smaller files at the same visual quality. All below-fold images must have `loading="lazy"`.

---

## Future Roadmap

**Phase 1: Architecture separation & URL Cleanup**
- Refactor the single file (`index.html`) into modular `css/styles.css` and `js/main.js`. 

**Phase 2: Asset Implementation**
- Asset swapping: Replace placeholder comments (`<!-- ASSET SWAP: ... -->`) with final high-res but web-optimized artist imagery.
- Finalize Canvas interactions (ensuring the Flow Field doesn't drain mobile batteries).

**Phase 3: Deep World-Building**
- Expand the "Notes" section potentially into a CMS-driven or dynamically populated feed without breaking the vanilla aesthetic.
- Add audio preview snippets natively into the `.track-item` or `.catalog-card` so users can listen without leaving the page.
