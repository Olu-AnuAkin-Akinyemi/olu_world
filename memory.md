# Project Memory: øLu AnuAkin Portfolio

**Purpose**: Track learnings, patterns, and context to prevent repeated mistakes and maintain velocity across sessions.

**Updated**: 2026-03-14 (Initial Setup)

---

## How to Use This File

When something goes wrong or a pattern emerges:
1. Add entry under the relevant section
2. Include: what happened, why, and how it was resolved
3. Future sessions read this FIRST to avoid repeating mistakes

**Rule**: Memory entries are never deleted, only marked as resolved.

---

## Critical Project Context

### Artistic Vision
- **Artist**: øLu AnuAkin — Alternative Soul / Indie R&B
- **Site Purpose**: Immersive "world" entry point, not just a portfolio
- **Tone**: Cinematic, emotionally layered, atmospheric
- **Featured Project**: Afterglow (EP, 2024)

### Business Goals
1. Email capture (Private Access mailing list)
2. Streaming conversions (Bandcamp primary, then Spotify/Apple/Tidal)
3. Sync licensing inquiries

### Tech Stack
- Vanilla HTML5 + CSS3 + ES6 JavaScript
- Vite (build) + Vitest (testing)
- CSS Custom Properties for theming
- IntersectionObserver for scroll reveals and lazy loading

---

## Theming & CSS

### ✅ Patterns That Work

**[2026-03-14] Theme-aware assets**
- Use paired images with `.logo-dark` / `.logo-light` classes
- CSS: `[data-theme="dark"] .logo-light { display: none }` pattern
- Applied to: nav logo, mark-dividers throughout site

**[2026-03-14] CSS Variable architecture**
- All colors route through `:root` tokens (`--bg`, `--text`, `--rust`, etc.)
- `[data-theme="light"]` overrides apply globally
- Never hardcode hex values in component styles

### ⚠️ Gotchas

**Backdrop-filter ordering**
- Linter warns: `-webkit-backdrop-filter` must come BEFORE `backdrop-filter`
- Current code has this reversed in several places (non-breaking but flagged)

---

## Mobile Responsiveness

### ✅ Implemented Patterns

**[2026-03-14] Hamburger menu**
- Button: `.nav-hamburger` with 3 `.hamburger-line` spans
- Overlay: `.mobile-menu` with full-screen links
- JS: Toggle via `aria-expanded`, close on link click + Escape key
- Animation: Lines transform to X on open (CSS transforms)

**[2026-03-14] Carousel buttons on mobile**
- Previous approach: `display: none` at 640px (bad UX)
- Current: Visible at 36px size for touch targets
- Cards resize to `calc(100% - 80px)` to show peek of next card

### ⚠️ Breakpoints Reference

| Breakpoint | Target |
|------------|--------|
| 980px | Tablet — grid collapses, spacing adjusts |
| 640px | Mobile — single column, hamburger nav |

---

## Media Embeds

### ✅ Lazy Loading Pattern

**[2026-03-14] Bandcamp/YouTube iframes**
- Use `data-src` attribute instead of `src`
- IntersectionObserver loads when 200px from viewport
- Add `.loaded` class after iframe loads for transitions

```javascript
// Pattern in main.js
const iframeObs = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const iframe = entry.target;
      if (iframe.dataset.src) {
        iframe.src = iframe.dataset.src;
      }
      observer.unobserve(iframe);
    }
  });
}, { rootMargin: '200px' });
```

### ⚠️ Embed Gotchas

**YouTube iframe sizing**
- Use `.catalog-cover--video` with `aspect-ratio: 16/9`
- `allowfullscreen` attribute required for fullscreen button

**Video element attributes**
- `playsinline` — not supported in Firefox (graceful degradation)
- `controlslist="nofullscreen"` — not supported in Firefox/Safari

---

## Hero Section

### ✅ Current Implementation

**[2026-03-14] Split layout (Option C)**
- Grid: `1fr 1fr` with text left, Afterglow cover right
- Mobile: Stacks vertically, cover on top (280px max)
- Primary CTA: "Listen to Afterglow" with rust border
- Secondary CTA: "Explore" with underline style

**Previous approach (removed):**
- Full-bleed `.hero-photo` with mask gradient
- Badge component with small album thumbnail
- Less clear visual hierarchy

---

## Assets

### File Locations

| Asset | Path | Usage |
|-------|------|-------|
| Afterglow cover | `/src/assets/AFTERGLOW_cover-art.png` | Hero, featured section |
| Logo (dark) | `/src/assets/Olu logo_Dark_no_bkrgd.png` | Nav, dividers (dark theme) |
| Logo (light) | `/src/assets/Olu logo_Light_no_bkrgd.png` | Nav, dividers (light theme) |
| About photo | `/src/assets/Olu_About_pic.jpg` | About section background |
| Sacred video | `/src/assets/Sacred_Muses.mp4` | Archive carousel |

### ⚠️ Asset Swap Comments

Several sections still have `<!-- ASSET SWAP: ... -->` comments awaiting final imagery:
- Gallery grid items (8 placeholders)
- Atmospheric break backgrounds
- Track thumbnails (using gradients as fallback)

---

## Section Naming

**[2026-03-14] Renamed sections**
- "Catalog" → "Archive" (music & visuals collection)
- "World" → "Gallery" (visual art grid)
- "Sync" section: Commented out (not ready for launch)

---

## External Links

### Verified URLs

| Platform | URL |
|----------|-----|
| Instagram | `https://www.instagram.com/olu_anuakin/` |
| Bandcamp | `https://oluanuakin.bandcamp.com` |
| Spotify | `https://open.spotify.com/artist/6HlPxqjDQ8lM8iJiHqegxm` |
| Apple Music | `https://music.apple.com/ci/artist/%C3%B8lu-anuakin/1627657285` |
| Tidal | `https://tidal.com/artist/32492322/u` |
| Sacred (SoundCloud) | `https://on.soundcloud.com/iXN0umk0hC1gCcczV8` |
| Nirvana (YouTube) | `https://www.youtube.com/embed/wqOUkahoKmY` |

---

## Outstanding Items

### 🟡 Pending

**Linter warnings (pre-existing)**
- Inline styles throughout HTML (low priority, functional)
- Missing `rel="noopener"` on external links
- `backdrop-filter` ordering in CSS

**Asset swaps**
- Gallery grid images (8 items)
- Atmospheric break backgrounds
- Track thumbnails (optional — gradients work)

### ⚪ Future Phases

**Phase 2: Asset Implementation**
- Replace placeholder gradients with actual imagery
- Optimize images (WebP with PNG fallback)
- Canvas flow field performance tuning

**Phase 3: Industry Pages & Deep World-Building**
- `/sync` page — dedicated sync licensing page for music supervisors. Stream-only (no downloads), clear licensing inquiry CTA. Clean, professional, stripped-down. This is the link you send to supervisors.
- `/epk` page — Electronic Press Kit for bookers, press, playlist curators, labels. Bio, press photos, streaming stats, notable placements, press quotes. Include downloadable PDF/zip of press assets.
- Notes section as CMS-driven feed
- Native audio previews in track items
- Email form integration (Mailchimp/ConvertKit)

**Site Architecture (target):**
```
/       → immersive world (fans, listeners)
/sync   → music supervisors (tracks, licensing contact)
/epk    → industry (bio, stats, downloadable press assets)
```

---

## Quick Reference

### Dev Commands

```bash
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run test     # Run Vitest
```

### Key Files

| File | Purpose |
|------|---------|
| `index.html` | Main page structure |
| `src/css/styles.css` | All styling |
| `src/js/main.js` | Interactions, theme toggle, lazy loading |
| `CLAUDE.md` | Project overview and constraints |
| `memory.md` | This file — learnings and patterns |
| `.github/copilot-instructions.md` | Code architecture guidelines |

---

**Last Updated:** 2026-03-30
