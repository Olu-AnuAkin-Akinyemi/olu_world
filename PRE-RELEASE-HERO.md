# Pre-Release Hero — Full-Bleed Photo Layout

> **Status:** Active (site launch April 24 through May 14)
> **Delete this file** once the May 14 PWR wide release swap is complete.

---

## What

Convert the hero from a 2-column split layout (photo right, text left) to a full-bleed atmospheric photo background with text content at the bottom. The photo (moody portrait, blue/magenta lighting) fills the viewport. A gradient scrim ensures text legibility. On mobile, the CTA is the last thing visible before scroll.

---

## Why

- **No cover art reveal:** The DSP cover art (tilt layers) is saved for May 14. This layout showcases the artist without exposing it.
- **Immersive first impression:** Full-bleed photo is more cinematic than a split grid for a first-time visitor.
- **Temporary:** This layout only lives for ~3 weeks (April 24 → May 14). The May 14 swap restores the 2-column grid with tilt cover art.

---

## Structure

### May 14 layout (split grid — currently commented out)
```
.hero
  .hero-split (2-col grid)
    .hero-content (left: text, CTAs)
    .hero-cover (right: tilt cover art)
  .scroll-hint
```

### Active layout (full-bleed)
```
.hero.hero--fullbleed
  img.hero-bg (absolute, fills section)
  ::after (gradient scrim, z-index:1)
  .hero-content.hero-content--bottom (z-index:2, flexbox justify-end)
    .hero-eyebrow
    .hero-headline
    .hero-cover-label ("PWR — Single")
    .hero-actions (CTAs)
  .hero-split (display:none — contains only commented-out May 14 + Afterglow blocks)
  .scroll-hint (z-index:2)
```

---

## CSS Changes (in `src/css/styles.css`, HERO section)

### New rules (labeled `/* PRE-RELEASE */`)
```css
/* PRE-RELEASE — Full-bleed photo hero */
.hero-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}
.hero--fullbleed::after{content:'';position:absolute;inset:0;z-index:1;pointer-events:none;
  background:linear-gradient(to top,var(--bg) 0%,rgba(7,7,13,.6) 35%,transparent 65%)}
[data-theme="light"] .hero--fullbleed::after{
  background:linear-gradient(to top,var(--bg) 0%,rgba(7,7,13,.45) 35%,transparent 65%)}
.hero-content--bottom{position:relative;z-index:2;display:flex;flex-direction:column;
  justify-content:flex-end;min-height:100vh;padding:0 48px 100px;max-width:600px}
.hero-content--bottom .hero-cover-label{margin:0 0 20px;opacity:0;animation:fadeUp .7s var(--ease) 2.9s forwards}
.hero--fullbleed .hero-split{display:none}
```

### Mobile overrides (at 980px and 640px breakpoints)
```css
/* 980px */
.hero-content--bottom{padding:0 28px 100px}

/* 640px */
.hero-content--bottom{max-width:100%;text-align:center;padding:0 28px 90px}
.hero-content--bottom .hero-eyebrow{justify-content:center}
.hero-content--bottom .hero-eyebrow::before{display:none}
.hero-content--bottom .hero-actions{justify-content:center}
```

### What NOT to touch
- `.hero-split` base rules (grid, max-width, padding) — needed for May 14
- `.hero-cover-layers`, `.hero-cover-base`, `.hero-cover-words`, `.tilt-active` — May 14 tilt effect
- `.hero-cover-photo` — removed from pre-release HTML but CSS stays for reference
- `.hero-audio-wrap`, `.hero-audio-btn` — May 14 audio player
- All hero animation keyframes

---

## HTML Changes (in `index.html`, HERO section)

### Pre-release block (OUTSIDE `.hero-split`)
```html
<section class="hero hero--fullbleed" id="home">
  <!-- PRE-RELEASE HERO (active — site launch through May 14)
       To swap to PWR Cover Art:
       1. Remove "hero--fullbleed" from <section> above
       2. Delete this <img> and the hero-content--bottom <div> below
       3. Uncomment PWR COVER ART HERO inside hero-split -->
  <img src="/src/assets/hero_photo.webp" alt="" class="hero-bg" aria-hidden="true" />
  <div class="hero-content hero-content--bottom">
    ...eyebrow, headline, cover-label, actions...
  </div>
  <!-- END PRE-RELEASE HERO -->

  <div class="hero-split">
    <!-- PWR COVER ART HERO (commented out, unchanged) -->
    <!-- AFTERGLOW HERO (commented out, unchanged) -->
  </div>
  <div class="scroll-hint">Scroll</div>
</section>
```

### May 14 + Afterglow blocks
**No changes.** They stay commented out inside `.hero-split` exactly as they are.

---

## JS Impact

**None.** `main.js` already has null guards:
```js
if (heroCoverLayers && heroCover) { /* tilt + hover audio */ }
```
The pre-release hero has no `.hero-cover-layers` or `#heroAudioBtn`, so this code safely skips. No JS changes needed for any phase.

---

## May 14 Swap Checklist

When PWR goes wide on mainstream platforms:

1. **`index.html` — Hero swap:**
   - Remove `hero--fullbleed` from `<section class="hero">`
   - Delete `<img class="hero-bg">` element
   - Delete `<div class="hero-content hero-content--bottom">` block (entire pre-release content)
   - Uncomment `PWR COVER ART HERO` block inside `.hero-split`
   - Swap hero CTA link to new PWR Odesli smart link (create once PWR is on streaming platforms)
2. **`index.html` — Archive:**
   - Uncomment the PWR archive card (currently wrapped in `<!-- PWR ARCHIVE CARD -->`)
   - Add Spotify/Apple/Tidal streaming links to the `.catalog-links` row for PWR
3. **`index.html` — Afterglow track order:**
   - The commented-out Afterglow hero block has the wrong track order and is missing tracks. Fix before any future Afterglow swap. Correct arc: Magnetic Electric → WTFYA → INDECISION → Interlude → ALWYS LØVE(D) → unreleased closer.
4. **`src/css/styles.css`:**
   - Optionally remove `/* PRE-RELEASE */` CSS rules (dead code after swap)
5. **OG image:** Update if needed (see `SEO-COPY-IMPROVEMENTS.md`)
6. **Delete this file** (`PRE-RELEASE-HERO.md`)

---

## Verification

After implementing:
- [ ] `npm run build` — no errors
- [ ] Desktop dark: photo fills viewport, text legible at bottom, CTA works
- [ ] Desktop light: scrim adjusts, text still legible
- [ ] Mobile (640px): text centered at bottom, CTA in thumb zone
- [ ] Scroll-hint visible and not overlapping CTAs
- [ ] Comment out pre-release, uncomment May 14 → split grid layout works, tilt effect works
- [ ] Revert back to pre-release → full-bleed works again
- [ ] All 24 tests still pass
