# Image Optimization Spec — oluanuakin.me

## Current State (Phase 1 complete)
- Non-destructive script generates `-400`, `-800`, `-1200` WebP variants alongside untouched originals
- Gallery `<img>` tags use `srcset` + `sizes` for responsive delivery
- Overlay JS swaps to `-1200` variant for fullscreen
- Originals stored in Google Drive (not in git — `.gitignore` excludes PNGs)
- One format (WebP), no AVIF yet, no blur-up placeholders

## Goal
Mimic Instagram-level image delivery on a static site:
- Right resolution for every device (mobile grid vs desktop overlay vs retina)
- Best format the browser supports (AVIF > WebP > JPEG)
- Perceived instant loading via blur-up placeholders
- Non-destructive pipeline (originals preserved, variants generated)

---

## Phase 1: Multi-Resolution srcset Pipeline

### Sharp Script Changes (`scripts/optimize-images.mjs`)

**Non-destructive output:** Generate variants alongside originals instead of overwriting.

```
src/assets/collage/Triumph_collage.png          ← original (untouched)
src/assets/collage/Triumph_collage-400.webp      ← small (mobile grid)
src/assets/collage/Triumph_collage-800.webp      ← medium (desktop grid, mobile overlay)
src/assets/collage/Triumph_collage-1200.webp     ← large (desktop overlay, retina)
```

**Size breakpoints:**

| Use case | Width | Rationale |
|----------|-------|-----------|
| Small | 400px | Mobile grid (~200px display, 2x retina) |
| Medium | 800px | Desktop grid, mobile overlay |
| Large | 1200px | Desktop overlay (90vw on 1440px = ~1296px) |

**Quality settings:**
- WebP: q75, effort 6
- Modeling photos: q80 (preserve detail on professional photography)

### HTML Pattern

```html
<img
  srcset="/src/assets/collage/Triumph_collage-400.webp 400w,
          /src/assets/collage/Triumph_collage-800.webp 800w,
          /src/assets/collage/Triumph_collage-1200.webp 1200w"
  sizes="(max-width:640px) 50vw, 202px"
  src="/src/assets/collage/Triumph_collage-800.webp"
  alt="Collage — Triumph"
  loading="lazy" />
```

**`sizes` attribute breakdown:**
- `≤640px` (mobile): images display at ~50vw in 2-column grid
- Default: ~202px in the desktop 12-column grid
- Overlay: JS swaps `src` to the 1200w variant when opening fullscreen

### Overlay Enhancement
When opening the gallery overlay, JS should swap to the largest available variant:
```js
overlayImg.src = img.src.replace(/-\d+\.webp$/, '-1200.webp');
```

---

## Phase 2: AVIF + WebP via `<picture>`

### Sharp Script Addition
Generate AVIF variants alongside WebP:
```
src/assets/collage/Triumph_collage-800.webp
src/assets/collage/Triumph_collage-800.avif
```

**AVIF settings:** q60 (AVIF at q60 ≈ WebP at q75 visually, 30-50% smaller files)

### HTML Pattern
```html
<picture>
  <source
    srcset="Triumph_collage-400.avif 400w, Triumph_collage-800.avif 800w, Triumph_collage-1200.avif 1200w"
    sizes="(max-width:640px) 50vw, 202px"
    type="image/avif" />
  <source
    srcset="Triumph_collage-400.webp 400w, Triumph_collage-800.webp 800w, Triumph_collage-1200.webp 1200w"
    sizes="(max-width:640px) 50vw, 202px"
    type="image/webp" />
  <img src="Triumph_collage-800.webp" alt="Collage — Triumph" loading="lazy" />
</picture>
```

### Browser Support
- AVIF: Chrome 85+, Firefox 93+, Safari 16.4+ (covers ~90% of traffic)
- WebP: Universal fallback

---

## Phase 3: Blur-Up Placeholders

### Concept
Generate a tiny (20px wide) base64-encoded version of each image. Inline it as a CSS background on the container. When the full image loads, it covers the blur.

### Sharp Script Addition
```js
const placeholder = await sharp(file)
  .resize(20)
  .webp({ quality: 20 })
  .toBuffer();
const base64 = `data:image/webp;base64,${placeholder.toString('base64')}`;
```

Output a JSON manifest: `src/assets/image-placeholders.json`
```json
{
  "collage/Triumph_collage.png": "data:image/webp;base64,UklGR..."
}
```

### HTML/CSS Pattern
```html
<div class="world-item" style="background-image:url(data:image/webp;base64,UklGR...)">
  <img srcset="..." sizes="..." alt="..." loading="lazy" />
</div>
```

```css
.world-item {
  background-size: cover;
  background-position: center;
  filter: blur(10px);
}
.world-item img { position: relative; z-index: 1; }
```

---

## Phase 4 (Future): Headless CMS Integration

### When to implement
Once the site structure is stable and content updates (Notes, gallery) become the primary workflow — not during active design iteration.

### Recommended approach
- **Headless CMS** (Sanity, Contentful, or self-built with Cloudflare D1 + Workers)
- CMS stores content as JSON, fetched at build time or client-side
- Images uploaded to CMS, served via CMS CDN or Cloudflare Image Resizing
- At that point, **Cloudflare Image Resizing** (Pro plan, $20/mo) makes sense — CMS-uploaded images get on-the-fly transforms via URL params: `/cdn-cgi/image/width=800,format=auto/image.png`

### What it replaces
- Manual HTML edits for Notes, gallery items, catalog entries
- Local sharp pipeline for CMS-managed images (local sharp stays for hero/brand assets)

### CMS scope
| Section | CMS-managed | Why |
|---------|-------------|-----|
| Notes | Yes | Frequently updated, text + media |
| Gallery | Yes | Image swaps, ordering, metadata |
| Archive/Catalog | Maybe | New releases, links |
| Hero | No | Core brand, rarely changes |
| Kindred | Maybe | Occasional artist additions |

---

## Implementation Order
1. **Phase 1** (srcset) — immediate impact, no new dependencies
2. **Phase 2** (AVIF) — after Phase 1 is stable, requires sharp AVIF support check
3. **Phase 3** (blur-up) — polish layer, after Phases 1-2
4. **Phase 4** (CMS) — post-launch, when content velocity justifies it

## Original Source Files

Original high-resolution PNGs are **not stored in git** (`.gitignore` excludes `src/assets/**/*.png`). Only the generated WebP variants are committed.

**Originals location:** Google Drive — øLu AnuAkin project folder.

To regenerate variants from originals:
1. Download originals from Google Drive into `src/assets/collage/` (or `src/assets/modeling/`)
2. Run `node scripts/optimize-images.mjs`
3. The script generates `-400`, `-800`, `-1200` WebP variants alongside the PNGs
4. Commit only the WebP variants (PNGs are auto-ignored)

## Rules for Contributors
- **Never overwrite originals** — generate variants alongside
- **Always start from originals** — avoid generation loss (re-compressing compressed images)
- **Resize first, compress second** — sharp handles this in one pipeline
- **Match dimensions to display size** — 2x retina for grid, 1x for overlay max
- **Test on 3G throttle** — Lighthouse with simulated slow connection
- **Run `node scripts/optimize-images.mjs` after adding any new image assets**
