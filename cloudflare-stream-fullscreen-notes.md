# Cloudflare Stream Fullscreen: Debugging Notes

> Originally written from a debugging session on `oluanuakin.me` (2026-03-16).
> The fullscreen button on a Cloudflare Stream iframe embed was not appearing in the player controls during development. This documents the isolation process, what was ruled out, and the root cause.

---

## Table of Contents

1. [The Problem](#1-the-problem)
2. [The Isolation Process](#2-the-isolation-process)
3. [What Was Ruled Out](#3-what-was-ruled-out)
4. [The Root Cause](#4-the-root-cause)
5. [Correct Cloudflare Stream Embed Pattern](#5-correct-cloudflare-stream-embed-pattern)
6. [The Transferable Lesson](#6-the-transferable-lesson)

---

## 1. The Problem

A Cloudflare Stream video (`Divine One`) was embedded in an archive carousel card. The video loaded, played, and showed all controls (play/pause, volume, progress bar) — except the fullscreen button. It appeared on desktop but not in mobile testing.

**The embed setup:**
```html
<div class="catalog-cover catalog-cover--video-vertical">
  <iframe
    data-src="https://customer-mrl30lrm2q4cfcg0.cloudflarestream.com/{VIDEO_ID}/iframe?autoplay=true&loop=true&muted=true&controls=true"
    title="Divine One by øLu AnuAkin"
    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
    allowfullscreen="true"
    loading="lazy"
    playsinline
  ></iframe>
</div>
```

The iframe was lazy-loaded via `IntersectionObserver` (using `data-src` → `src` swap). The container had CSS constraints: `aspect-ratio: 3/4`, `max-height: 480px`, and `overflow: visible`.

---

## 2. The Isolation Process

When a bug could be caused by HTML attributes, CSS layout, JavaScript behavior, or the third-party player itself, the fastest way to find the cause is **isolation testing** — reproduce the embed in progressively more complex environments until the bug appears.

### Step 1: Bare iframe (Cloudflare docs example)

Created a standalone `test-fullscreen.html` with the exact embed code from Cloudflare's documentation:

```html
<iframe
  src="https://customer-{CODE}.cloudflarestream.com/{VIDEO_ID}/iframe?controls=true"
  style="border: none"
  height="720"
  width="1280"
  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
  allowfullscreen="true"
></iframe>
```

**Result:** Fullscreen button visible. The embed itself works.

### Step 2: Add the site's CSS constraints

Wrapped the iframe in a container matching the live site's CSS — `aspect-ratio: 3/4`, `max-height: 480px`, `overflow: visible`, `width: 100%; height: 100%` on the iframe.

**Result:** Fullscreen button visible. CSS constraints are not the cause.

### Step 3: Add the `::after` pseudo-element overlay

The live site uses a `::after` pseudo-element with `position: absolute; inset: 0` on video covers for a subtle border effect. Even with `pointer-events: none`, this could theoretically interfere with the player's internal hit-testing or visibility detection.

**Result:** Fullscreen button visible. The overlay is not the cause.

### Step 4: Add autoplay/loop/muted URL parameters

The live site URL includes `?autoplay=true&loop=true&muted=true&controls=true`. Tested whether `autoplay=true` triggers a different player mode that hides controls.

**Result:** Fullscreen button visible. URL parameters are not the cause.

### Step 5: Simulate the lazy-load pattern

Used `data-src` with an `IntersectionObserver` (identical to the live site's `main.js`) to test whether the dynamic `src` assignment affects attribute recognition.

**Result:** Fullscreen button visible. Lazy loading is not the cause.

### Step 6: Add `loading="lazy"` to the lazy-loaded iframe

Tested whether combining the browser's native `loading="lazy"` with the `IntersectionObserver` `data-src` pattern causes a conflict.

**Result:** Fullscreen button visible. The combination is not the cause.

### Step 7: Wrap in an `overflow-x: auto` carousel container

Replicated the full carousel structure: `display: flex`, `overflow-x: auto`, `scroll-snap-type`, with the card and cover nested inside.

**Result:** Fullscreen button visible. The carousel is not the cause.

### Step 8: Width threshold test

Tested the player at fixed widths (400px, 350px, 335px, 303px, 250px) to determine if the Cloudflare player hides fullscreen below a width threshold.

**Result:** Fullscreen button visible at all widths, including 250px. There is no width threshold.

### Conclusion

Every isolated test showed the fullscreen button. The only remaining difference was the testing environment itself.

---

## 3. What Was Ruled Out

| Hypothesis | Test | Result |
| --- | --- | --- |
| Missing `allowfullscreen` attribute | Verified in DOM | Present — not the cause |
| Wrong `allow` policy syntax | Matched to Cloudflare docs | Corrected but not the cause |
| `iframe.videodelivery.net` URL format | Switched to `customer-{CODE}.cloudflarestream.com` | Corrected but not the cause |
| CSS `overflow: hidden` on parent | Tested with `overflow: visible` | Not the cause |
| `::after` pseudo-element blocking clicks | Tested with and without, added `z-index: -1` | Not the cause |
| `max-height` constraining player dimensions | Tested at multiple sizes | Not the cause |
| `opacity: 0` initial state (lazy load transition) | Tested with direct `src` | Not the cause |
| `loading="lazy"` conflicting with `IntersectionObserver` | Tested with and without | Not the cause |
| `autoplay=true` URL parameter changing player mode | Tested with `controls=true` only | Not the cause |
| Player width too narrow for controls | Tested down to 250px | Not the cause |
| `overflow-x: auto` carousel container | Replicated full carousel structure | Not the cause |
| JavaScript modifying iframe attributes | Reviewed `main.js` — only copies `data-src` to `src` | Not the cause |

---

## 4. The Root Cause

**Chrome DevTools mobile emulation does not support the Fullscreen API.**

When using Chrome's device toolbar to simulate a mobile viewport, the browser reports that the Fullscreen API is unavailable. Embedded players — including Cloudflare Stream, YouTube, and others — detect this capability at runtime and hide their fullscreen button when the API is not supported.

This is a known limitation of DevTools emulation. It simulates viewport dimensions, touch events, and user-agent strings, but it does **not** simulate all browser APIs. The Fullscreen API is one of the gaps.

The fullscreen button was present all along on real mobile devices. The entire debugging session was chasing a phantom bug.

### How to verify

Open the browser console in DevTools mobile emulation and run:

```javascript
document.fullscreenEnabled
// Returns: false (in emulation)
// Returns: true (in a real browser window or on a real device)
```

If `fullscreenEnabled` is `false`, the Cloudflare player will not render the fullscreen button.

---

## 5. Correct Cloudflare Stream Embed Pattern

Despite the root cause being a testing environment issue, the debugging process revealed several improvements to the embed code that are worth keeping.

### Before (what was in the codebase)

```html
<iframe
  data-src="https://iframe.videodelivery.net/{VIDEO_ID}?autoplay=true&loop=true&muted=true&controls=true"
  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
  playsinline
></iframe>
```

Issues:
- `iframe.videodelivery.net` is the older, undocumented URL format
- `fullscreen` was in the `allow` attribute (Cloudflare's official embed does not include it)
- Missing `allowfullscreen="true"` attribute entirely

### After (corrected)

```html
<iframe
  data-src="https://customer-{CODE}.cloudflarestream.com/{VIDEO_ID}/iframe?autoplay=true&loop=true&muted=true&controls=true"
  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
  allowfullscreen="true"
  loading="lazy"
  playsinline
></iframe>
```

Changes:
- **URL format:** `customer-{CODE}.cloudflarestream.com/{VIDEO_ID}/iframe` — the officially documented format with the `/iframe` path
- **`allow` attribute:** Removed `fullscreen` — not needed and not in Cloudflare's official example
- **`allowfullscreen="true"`:** Added with explicit `"true"` value to match Cloudflare's documentation
- **`loading="lazy"`:** Added for additional browser-level lazy loading alongside `IntersectionObserver`

### Cloudflare Stream URL parameters

| Parameter | Default | Purpose |
| --- | --- | --- |
| `autoplay` | `false` | Auto-play on load (requires `muted=true` on most browsers) |
| `controls` | `true` | Show player controls (all-or-nothing, no per-control toggle) |
| `loop` | `false` | Loop playback |
| `muted` | `false` | Start muted |
| `preload` | `none` | `auto` or `metadata` — preload strategy |
| `poster` | — | Custom poster image URL |
| `primaryColor` | — | CSS color for UI elements |
| `startTime` | — | Start playback at timestamp (e.g., `1m30s`) |
| `letterboxColor` | — | CSS color for letterbox/pillarbox areas |

There is **no URL parameter** to control the fullscreen button specifically. It is included automatically when `controls=true` (the default) and the browser supports the Fullscreen API.

---

## 6. The Transferable Lesson

### Isolation testing is the fastest path to a root cause

When a bug could originate in HTML, CSS, JS, or the third-party code, do not guess. Build a minimal reproduction that adds one layer at a time:

1. **Bare embed** — does the third-party widget work at all?
2. **Add your CSS** — does layout break it?
3. **Add your JS** — does dynamic loading break it?
4. **Add your container structure** — does nesting break it?
5. **If all pass** — the bug is in the testing environment, not the code.

This process took 8 tests. Each test took seconds to write and verify. Without isolation, we would have continued modifying CSS and HTML indefinitely — trying to fix code that was already correct.

### Know what your testing environment cannot simulate

DevTools mobile emulation does not support:
- **Fullscreen API** — `document.fullscreenEnabled` returns `false`
- **Real touch event timing** — simulated touches don't trigger the same haptic/gesture behaviors
- **iOS Safari quirks** — auto-zoom on inputs, safe area insets, rubber-band scrolling
- **Real network conditions** — throttling is approximate, not a real 3G connection
- **Hardware GPU compositing** — animations may perform differently

**Rule of thumb:** Use DevTools for layout, responsive design, and JS debugging. Use real devices for API capabilities, performance, and interaction testing. When something works in isolation but not in DevTools, question the environment before questioning the code.

---

*These notes were written from a live debugging session. The isolation test file was deleted after confirming the root cause. Return to this file the next time a third-party embed behaves differently in DevTools than expected.*
