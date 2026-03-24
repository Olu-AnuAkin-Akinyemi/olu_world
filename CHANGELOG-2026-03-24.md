# Changelog — 2026-03-24

Functionality and SEO hardening pass. All changes are backward-compatible.
To revert any individual fix, search for the heading keyword in the relevant file.

---

## JavaScript — `src/js/main.js`

### 1. Hero audio race condition (FIXED)
- **Before:** `hoverAudio` was dynamically imported but user could interact before the promise resolved. On slow 3G, `hoverAudio?.start()` silently failed.
- **After:** Stored import promise as `hoverAudioReady`. New `startAudio()` async function awaits the promise before calling `init()`/`start()`. Audio is queued, not lost.
- **Revert:** Replace `hoverAudioReady` / `startAudio()` block with the original direct `import().then()` + inline `hoverAudio?.init()` calls.

### 2. Error handling on dynamic imports (ADDED)
- **gallery3d.js import:** Wrapped in `try/catch` so flat grid fallback remains functional if module fails to load.
- **hoverAudio.js import:** Added `.catch()` to the promise chain — audio stays disabled on failure.
- **Revert:** Remove the `try/catch` around gallery import and `.catch()` on hoverAudio import.

### 3. Notes overlay XSS prevention (HARDENED)
- **Before:** `body.innerHTML = fullContent.innerHTML` — direct HTML injection.
- **After:** `body.textContent = ''` then `Array.from(fullContent.cloneNode(true).childNodes).forEach(n => body.appendChild(n))`. DOM cloning prevents script injection.
- **Note:** Current content is same-page HTML (safe), but this hardens the path for future CMS content.
- **Revert:** Replace the `cloneNode` block with `body.innerHTML = fullContent ? fullContent.innerHTML : ...`.

### 4. Consolidated Escape key handlers (MERGED)
- **Before:** Two separate `document.addEventListener('keydown')` handlers — one for mobile menu (line 88), one for overlays (line 376). Both fired on every Escape press.
- **After:** Overlay handler now uses early returns with priority: galleryOverlay → notesOverlay → contactOverlay. Mobile menu handler unchanged (already guarded by `.contains('open')`).
- **Added:** Gallery overlay now closeable via Escape key (was previously missing from the global handler).
- **Revert:** Remove early returns and `galleryOverlay` handling from the global handler, restore the original `if/if` pattern.

### 5. Overlay-bottom-close expanded scope (WIDENED)
- **Before:** `.closest('.gallery-overlay, .notes-overlay')` — didn't include contact overlay.
- **After:** `.closest('.gallery-overlay, .notes-overlay, .contact-overlay')` + added `contactOverlay` close branch.
- **Revert:** Remove `, .contact-overlay` from the closest selector and the `contactOverlay` branch.

### 6. Carousel button state on resize (FIXED)
- **Before:** `updateBtnStates()` only triggered by scroll events. Landscape/portrait rotation could leave buttons in wrong state.
- **After:** Added `window.addEventListener('resize', updateBtnStates, { passive: true })`.
- **Revert:** Remove the resize listener line.

### 7. Timezone — user locale (CHANGED)
- **Before:** `new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })` — always Chicago.
- **After:** `new Date().toLocaleString('en-US') + ' (' + Intl.DateTimeFormat().resolvedOptions().timeZone + ')'` — user's actual timezone with identifier.
- **Revert:** Restore the `{ timeZone: 'America/Chicago' }` option.

### 8. Cursor fallback (ADDED — JS side)
- Added `if (dot && ring) document.body.classList.add('cursor-ready')` at top of cursor init.
- If custom cursor elements don't exist in DOM, the `cursor-ready` class is never added and the native cursor remains visible.
- **Revert:** Remove the `classList.add('cursor-ready')` line and restore `cursor: none` on `body`/`button`/`.world-item` in CSS.

---

## HTML — `index.html`

### 9. Form feedback aria-live (ADDED)
- All three `<p class="form-feedback" hidden>` elements now have `aria-live="polite"` so screen readers announce success/error messages.
- **Revert:** Remove `aria-live="polite"` from the three `.form-feedback` elements.

---

## CSS — `src/css/styles.css`

### 10. New design tokens in `:root` (ADDED)
```css
--press: #5a9ebf;
--soundcloud: #ff5500;
--error: #e85a5a;
--text-on-dark: #e8e4dc;
--text-on-dark-muted: rgba(232, 228, 220, 0.6);
```
All hardcoded `#5a9ebf`, `#ff5500`, `#e85a5a`, `#e8e4dc` instances replaced with these tokens.
- **Revert:** Replace `var(--press)` → `#5a9ebf`, `var(--soundcloud)` → `#ff5500`, `var(--error)` → `#e85a5a`, `var(--text-on-dark)` → `#e8e4dc`, `var(--text-on-dark-muted)` → `rgba(232, 228, 220, 0.6)`. Remove the 5 token lines from `:root`.

### 11. Reveal animation — removed filter:blur (PERFORMANCE)
- **Before:** `.reveal` transitioned `opacity`, `transform`, AND `filter: blur(6px)` — `filter` is not GPU-composited and caused layout thrashing on scroll with many `.reveal` elements.
- **After:** `.reveal` only transitions `opacity` + `transform`. Blur removed entirely.
- **Revert:** Add `filter: blur(6px)` back to `.reveal` and `filter: blur(0)` to `.reveal.visible`, plus `filter 0.85s var(--ease)` to the transition list.

### 12. Cursor fallback (CSS side)
- **Before:** `body { cursor: none; }`, `button { cursor: none; }`, `.world-item { cursor: none; }` — no cursor if JS fails.
- **After:** `cursor: none` gated behind `body.cursor-ready` class (set by JS only when cursor DOM elements exist). Native cursor shows as fallback.
- **Revert:** Remove `.cursor-ready` selectors, restore `cursor: none` on `body`, `button`, and `.world-item`.

### 13. Mobile gutter calc (FIXED)
- **Before:** `calc(100vw - 48px)` hardcoded in ≤640px breakpoint for `.hero-cover-layers` and `.hero-cover-photo`.
- **After:** `calc(100vw - var(--page-gutter) * 2)` — correctly uses the 28px value active at that breakpoint.
- **Revert:** Replace `var(--page-gutter) * 2` with `48px`.

### 14. Touch targets (INCREASED)
- `.theme-toggle`: 28×28px → 44×44px (meets WCAG 2.5 minimum). Note: toggle is currently commented out in HTML for pre-release.
- `.contact-trigger` mobile: 40×40px → 44×44px, SVG 18→20px.
- **Revert:** Restore `width: 28px; height: 28px` on `.theme-toggle` and `width: 40px; height: 40px` on mobile `.contact-trigger`.

---

## Tests — `src/js/main.test.js` (NEW)

10 new tests covering:
- Cursor fallback class logic
- Notes overlay DOM cloning (XSS prevention) — with and without full content
- Exhibition overlay populates correct src (no -1200 swap)
- Gallery overlay populates -1200 variant
- Escape key handler priority
- Form feedback aria-live attribute
- Timezone uses user locale with identifier

All 39 tests pass (16 hoverAudio + 8 gallery3d + 5 hoverReveal + 10 new main).

---

## Files changed

| File | Type |
|---|---|
| `src/js/main.js` | Modified (8 fixes) |
| `src/css/styles.css` | Modified (5 fixes) |
| `index.html` | Modified (aria-live) |
| `src/js/main.test.js` | Created (10 tests) |
| `CHANGELOG-2026-03-24.md` | Created (this file) |

## Pre-Release Hero note

These changes do **not** alter hero layout, animation timing, cover art behavior, or the PWR pre-release structure. The hero audio fix (#1) only changes *when* the audio module becomes available (awaits import instead of fire-and-forget). The cursor fallback (#8, #12) adds a CSS class gate but doesn't change visual behavior when custom cursor JS loads normally.
