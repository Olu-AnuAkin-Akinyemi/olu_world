# Session Log — March 16, 2026

> Quick-reference of what was done, what was learned, and what to watch for.

---

## Changes Made

### 1. Web3Forms Timestamp Fix
- **Problem:** Submission timestamps showed 6 hours ahead (UTC vs CST).
- **Fix:** Added a hidden `<input name="time" class="local-time">` to all 3 forms. JS stamps the user's local time (`America/Chicago`) into it before each submission.
- **Files:** `index.html`, `src/js/main.js`

### 2. iOS Auto-Zoom Prevention
- **Problem:** Tapping an input on iPhone zoomed in and stayed zoomed.
- **Root cause:** iOS Safari auto-zooms any input with `font-size` below `16px`. Our inputs were `10px`.
- **Fix:** Set `font-size: 16px` on `.email-input`, `.contact-input`, `.contact-textarea`.
- **Note:** Android is unaffected by this bug — the fix is universal and improves readability everywhere.
- **File:** `src/css/styles.css`

### 3. Mobile Form Overflow
- **Problem:** Forms overflowed the screen width on small phones, requiring horizontal scroll to reach the submit button.
- **Root cause:** Fixed `max-width` values (360px, 380px) plus padding/border pushed past narrow screens (~375px).
- **Fix:** Changed to `max-width: min(360px, 100%)` / `min(380px, 100%)` with `width: 100%`. Forms now respect the screen edge while keeping their max size on larger screens.
- **File:** `src/css/styles.css`

### 4. Metadata Overhaul (Evergreen)
- **Problem:** OG/Twitter/JSON-LD metadata referenced "PWR out now" and the PWR cover art — release-specific copy that goes stale.
- **Fix:** Updated all titles, descriptions, and images to evergreen content:
  - Titles → `øLu AnuAkin — Multidisciplinary · Griot`
  - Descriptions → `Multidisciplinary · Griot · Founder. Alternative Soul / Indie R&B from Minnesota. Yoruba and American roots.`
  - Images → `about_FB_OG_photo.jpg` (personal photo, 1200x630)
  - Genre → `Trap with Soul` (replaced `Conscious Hip Hop`)
- **Files:** `index.html`

### 5. Domain Correction
- **Problem:** All canonical URLs, OG URLs, sitemap, and robots.txt pointed to `olu.world`. The live domain is `oluanuakin.me`.
- **Fix:** Global find-and-replace across `index.html`, `sitemap.xml`, `robots.txt`, and all project `.md` files.
- **Impact:** This was causing Facebook/LinkedIn to fail OG image validation (wrong domain → wrong server → wrong content-type).

### 6. Nav & Hero Cleanup
- **Fix:** Added "Sync" to mobile menu (was desktop-only). Removed `PWR — Single` label from pre-release hero. Added `margin-top: 20px` spacing between hero eyebrow and action buttons.
- **Files:** `index.html`, `src/css/styles.css`

### 7. Mobile Hover / Double-Tap Audit
- **Problem:** iOS Safari requires two taps on elements with `:hover` styles — first tap triggers hover, second tap navigates.
- **Fix:** Wrapped all navigation hover styles in `@media(hover: hover)` so they only fire on devices with a real pointer. Added `@media(hover: none)` block to always reveal content (track scenes, note descriptions) that was hidden behind hover on desktop.
- **Files:** `src/css/styles.css`

### 8. Console Error Cleanup
- **Problem:** Browser console showed `srcset` parsing errors, deprecated attribute warnings, and preload mismatch.
- **Fixes:**
  - Renamed 4 collage files with spaces in filenames → hyphens (spaces break `srcset` parsing)
  - Removed deprecated `allowfullscreen` / `webkitallowfullscreen` from iframes (replaced by `allow="fullscreen"`)
  - Simplified hero preload to only hint the 640px variant (mobile-first — don't preload what won't load)
- **Files:** `index.html`, `src/assets/collage/` (file renames)

### 9. Collage Quality Bump (q75 → q80)
- **Problem:** Collages at q75 looked slightly soft, especially in the overlay/fullscreen view.
- **Fix:** Bumped WebP quality from q75 to q80 in `optimize-images.mjs`. Regenerated all 21 variants (7 collages x 3 sizes). File size increase is modest (~20% on largest variants).
- **Files:** `scripts/optimize-images.mjs`, all `src/assets/collage/*.webp`

### 10. Lucky-charm-prince Missing -1200 Variant
- **Problem:** Source PNG is only 1148px wide — the script skipped the 1200 variant (`1200 > 1148`). Overlay JS tried to load `-1200.webp` and got a 404.
- **Fix:** Generated variant at native width (1148px), named it `-1200.webp` for overlay JS compatibility. HTML srcset uses accurate `1148w` descriptor.
- **Files:** `index.html`, `src/assets/collage/Lucky-charm-prince_collage-1200.webp`

### 11. CLS Prevention — Image Dimensions
- **Problem:** 5 images had CSS dimensions but no HTML `width`/`height` attributes. Browsers can't reserve layout space until CSS loads, causing layout shifts (CLS).
- **Fix:** Added `width`/`height` to: GE logo (22x22), private logos (52x52, 38x38), footer icons (34x34).
- **File:** `index.html`

### 12. Audio Filename Space
- **Problem:** `PWR_audio snip.mp3` contained a space — same class of bug that broke collage srcsets.
- **Fix:** Renamed to `PWR_audio-snip.mp3`, updated JS reference.
- **Files:** `src/assets/PWR_audio-snip.mp3`, `src/js/main.js`

### 13. Skip-to-Content Link (Accessibility)
- **Fix:** Added keyboard-accessible skip link before nav — visually hidden, appears on Tab focus, jumps to `#music`. Satisfies WCAG 2.1 AA.
- **Files:** `index.html`, `src/css/styles.css`

### 14. Google Search Console Verification
- **Fix:** Added `<meta name="google-site-verification">` tag to `<head>` for GSC HTML tag verification.
- **File:** `index.html`

---

## Key Learnings

### OG Images: Format Matters
Facebook and LinkedIn **reject `.webp`** for `og:image`. Must use `.jpg` or `.png`. Use `.jpg` for photos (smaller file size). Standard dimensions: **1200x630px**.

### iOS Safari Input Zoom
Any `<input>` or `<textarea>` with `font-size` below **16px** triggers auto-zoom on iOS Safari. The browser does not zoom back out after the user taps away. Fix: always use `font-size: 16px` minimum on form fields.

### Cloudflare Cache + OG Debugging
After deploying meta/OG changes on Cloudflare Pages:
1. **Purge Cloudflare cache** (Caching → Purge Everything)
2. **Facebook debugger** → hit "Scrape Again" to clear their cached version
3. **Verify content-type headers** with `curl -I <url>` — if Cloudflare returns `text/html` for an image, the file likely wasn't in the build output

### Domain Consistency
Every place that references the site URL must match the actual live domain. Mismatches between canonical URL and actual domain cause:
- OG image failures (server returns HTML fallback instead of the image)
- SEO confusion (search engines see conflicting signals)
- Social share card failures

### `min()` for Responsive Containers
`max-width: min(380px, 100%)` is cleaner than media queries for capping container width. It says "be 380px or the screen width, whichever is smaller" in one line.

### CLS: Always Add `width`/`height` to Images
Even if CSS sets dimensions, browsers can't reserve layout space until CSS loads. Adding `width` and `height` HTML attributes lets the browser calculate aspect ratio immediately and prevents layout shifts. Direct Lighthouse CLS improvement.

### Spaces in Filenames Break Things
Spaces in asset filenames break `srcset` parsing (browser treats spaces as descriptor delimiters). Also a risk in CDN URLs and shell commands. Rule: always use hyphens, never spaces, in any asset filename.

### Skip-to-Content for Accessibility
A hidden `<a>` before the nav that appears on Tab focus and jumps past navigation. One element, ~3 lines of CSS, checks the WCAG 2.1 AA box. No visual impact.

### Image Source Width Limits Variants
The sharp script skips variants wider than the source (`withoutEnlargement: true`). If a source is 1148px, it won't generate a 1200px variant. Fix: generate at native width, name the file `-1200.webp` for overlay JS compatibility, use the accurate `1148w` descriptor in `srcset`.

---

## Files Modified This Session
| File | Changes |
|------|---------|
| `index.html` | Timestamp fields, metadata overhaul, domain fix, nav + hero cleanup, hover audit, srcset fixes, image width/height, skip-to-content, GSC verification |
| `src/js/main.js` | Local time injection, audio file rename reference |
| `src/css/styles.css` | Input font-size 16px, form max-width, hero spacing, `@media(hover:hover)` wrappers, `@media(hover:none)` touch fallback, skip-to-content styles |
| `scripts/optimize-images.mjs` | Collage quality q75 → q80 |
| `src/assets/collage/*.webp` | All 21 variants regenerated at q80, Lucky-charm-prince -1200 added |
| `src/assets/PWR_audio-snip.mp3` | Renamed from `PWR_audio snip.mp3` |
| `public/robots.txt` | Domain → oluanuakin.me |
| `public/sitemap.xml` | Domain → oluanuakin.me, lastmod → 2026-03-16 |
| `image-optimization-spec.md` | Domain fix, quality q75 → q80, AVIF equivalent updated |
| `CLAUDE.md` | Quality reference updated, 2k17 Zine added to Future roadmap |
| `.github/copilot-instructions.md` | Quality reference updated |
| `learning-notes/web-audio-and-image-pipeline.md` | Quality reference updated |
| `SEO-COPY-IMPROVEMENTS.md` | Domain references updated |
| `EPK-PLAN.md` | Domain reference updated |
