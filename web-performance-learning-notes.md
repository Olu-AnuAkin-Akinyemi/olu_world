# Web Performance: Learning Notes

> Originally written from a fix applied to `galoriousexpression.com` (2026-03-08).
> Updated for `oluanuakin.com` (2026-03-14) — applied to Bandcamp embed optimization.
> Lighthouse mobile score improvement: **57 → 90+** using these concepts.

---

## Table of Contents

1. [The Core Mental Model: Critical Path vs. Deferred Path](#1-the-core-mental-model-critical-path-vs-deferred-path)
2. [Pattern 1 — `preconnect`](#2-pattern-1--preconnect)
3. [Pattern 2 — `defer`](#3-pattern-2--defer)
4. [Pattern 3 — `data-src` + IntersectionObserver](#4-pattern-3--data-src--intersectionobserver)
5. [The Network Waterfall](#5-the-network-waterfall)
6. [What Is Not Worth Memorizing (And Why Knowing That Matters)](#6-what-is-not-worth-memorizing-and-why-knowing-that-matters)

---

## 1. The Core Mental Model: Critical Path vs. Deferred Path

### What is the "critical path"?

Before a browser can show a user anything — before a single pixel is painted on screen — it has to complete a specific sequence of work. That sequence is called the **critical rendering path**. It includes:

1. Downloading the HTML document
2. Parsing the HTML to build the DOM (Document Object Model)
3. Finding and downloading CSS files referenced in the HTML
4. Parsing CSS to build the CSSOM (CSS Object Model)
5. Combining the DOM and CSSOM into a **Render Tree**
6. Calculating layout (where everything sits on the page)
7. Painting pixels to the screen

Any resource that sits on this path — meaning the browser cannot complete the above steps without it — is called a **critical resource** or a **render-blocking resource**.

**The goal of performance optimization is not to make resources download faster. It is to reduce the number of resources that must be resolved before the first paint.**

The browser cannot paint while it is waiting. Every additional resource on the critical path adds latency. A resource that takes 500ms to download pushes the first visible paint back by 500ms, even if the user never scrolls to the part of the page that needs it.

### The deferred path

Everything that is *not* needed for the first paint belongs on the **deferred path**. This includes:

- JavaScript that only runs when a user clicks a button
- An embedded iframe the user hasn't scrolled to yet
- Third-party analytics scripts
- Fonts used in sections below the fold
- Images below the fold

Moving a resource from the critical path to the deferred path is the single highest-leverage action in web performance optimization. It does not require a faster server, a CDN, or compressed assets — it just requires telling the browser: *"you do not need this yet."*

### Why this matters for your site

On the øLu AnuAkin portfolio, the catalog section contains multiple Bandcamp embeds — each one an iframe that would normally connect to `bandcamp.com` during initial page load. Without optimization, the browser would initiate DNS + TCP + TLS for Bandcamp before the user ever scrolls to the catalog, adding hundreds of milliseconds to the critical path.

None of that is needed for the first paint. The hero section, navigation, and Afterglow featured project are what users see first. The catalog embeds below the fold should not block initial render.

---

## 2. Pattern 1 — `preconnect`

### The problem it solves

When a browser encounters a resource from a domain it has never visited before — say, `bandcamp.com` — it cannot immediately start downloading that resource. It must first:

1. **DNS lookup** — translate `static.canva.com` into an IP address (~20–120ms)
2. **TCP handshake** — establish a connection to that IP (~1 round trip)
3. **TLS handshake** — negotiate encryption (for HTTPS sites, ~1–2 additional round trips)

Only after all three steps complete can the download begin. On a mobile connection, this can cost 200–500ms of pure setup time — before a single byte of the actual resource has been transferred.

The browser only begins this process when it *discovers* the origin — meaning when it encounters the `src` or `href` pointing to it in the HTML. If that reference is deep in the page, or inside a CSS file, the discovery happens late.

### What `preconnect` does

A `preconnect` hint, placed in the `<head>`, tells the browser: *"I know you'll need a connection to this origin soon. Start the DNS + TCP + TLS process now, in parallel with everything else."*

By the time the browser actually needs to download a resource from that origin, the connection is already established. The 200–500ms setup cost is gone.

```html
<link rel="preconnect" href="https://bandcamp.com" />
<link rel="dns-prefetch" href="https://bandcamp.com" />
```

**`preconnect`** does the full three-step setup: DNS + TCP + TLS.

**`dns-prefetch`** is a lighter fallback that only resolves DNS. It is used as a companion hint for browsers that do not support `preconnect` (older browsers), or for secondary origins where you want some benefit without committing to a full connection.

### The `crossorigin` attribute

When a resource will be fetched with CORS (Cross-Origin Resource Sharing) — such as fonts, or resources loaded by a script from a different domain — you must include `crossorigin` on the `preconnect` hint. Without it, the browser opens an anonymous connection, and when the CORS request actually arrives, it opens a *second* connection anyway, wasting the work.

**Note:** The Bandcamp embed on øLu AnuAkin's site does not require `crossorigin` on preconnect because the iframe loads as a full document, not as a CORS resource.

### Practical rule

Add `preconnect` for any third-party origin that:
- Loads resources used above the fold (fonts, hero images, embeds)
- Is on the critical path (loaded during initial page render)

Lighthouse directly tells you these: the "Preconnect candidates" audit lists origins with estimated LCP savings.

**Limit to 4 or fewer.** Each `preconnect` keeps a connection open, which consumes resources. Too many hints can create connection overhead that hurts rather than helps.

---

## 3. Pattern 2 — `defer`

### How script loading works by default

When a browser is parsing HTML and encounters a `<script src="...">` tag, it stops. It pauses everything — parsing, layout, rendering — downloads the script, executes it, and only then continues. This is called **parser-blocking** behavior.

The reason for this default is historical: scripts can modify the DOM using `document.write()`, so the browser cannot safely continue building the DOM until it knows what the script might do to it.

The practical consequence: if you have 9 scripts loaded sequentially, the browser executes them one at a time. Each one blocks the parser. The total blocking time is the sum of all download + execution times.

### Why "bottom of body" is not enough

A common (and partially correct) piece of advice is to place scripts at the bottom of the `<body>` instead of in the `<head>`. This helps because the HTML content above the scripts has already been parsed and can be rendered before the scripts run.

However, it does not eliminate the blocking behavior — it just moves it later. The scripts still download sequentially, and the browser still cannot fire the `DOMContentLoaded` event until all non-deferred scripts have executed. Lighthouse's network dependency chain showed exactly this: each script was waiting on the previous one.

### What `defer` does

Adding `defer` to a script tag changes the behavior in two important ways:

1. **Non-blocking download** — the browser downloads the script in parallel with HTML parsing, without pausing the parser.
2. **Deferred execution** — the script only executes after the HTML is fully parsed, but before the `DOMContentLoaded` event fires.

```html
<script src="js/script.js" defer></script>
```

Critically, `defer` preserves execution order. If you have three deferred scripts, they execute in the order they appear in the HTML, regardless of which finished downloading first. This matters when scripts depend on each other — for example, `audioState.js` being required by `ui-sounds.js`.

### `defer` vs `async`

`async` also downloads scripts without blocking the parser, but it executes them *immediately when downloaded*, in whatever order they arrive. This breaks dependency chains. Use `async` only for fully independent scripts that have no dependencies and no dependents — analytics scripts are the classic example (which is why the Cabin analytics script on your page already uses `async`).

| Attribute | Download | Execution | Order preserved |
|-----------|----------|-----------|-----------------|
| none | Blocks parser | Immediate | Yes |
| `defer` | Parallel | After HTML parsed | Yes |
| `async` | Parallel | Immediately on download | No |

### What changed on your site

Before: 9 scripts downloaded sequentially, each blocking the next, producing a chain with 511ms maximum latency.

After: All 9 scripts download in parallel. The browser's network layer fetches them concurrently, constrained only by bandwidth — not by sequential blocking. Execution still happens in order (because `defer` guarantees this), but the download time collapses from sequential to parallel.

---

## 4. Pattern 3 — `data-src` + IntersectionObserver

### The limitation of `loading="lazy"`

HTML5 introduced the `loading="lazy"` attribute for images and iframes. It tells the browser not to load the resource until it is near the viewport. This is a useful default improvement, but it has a significant limitation for iframes specifically:

The browser still **pre-connects to the iframe's origin early in the page lifecycle**. It reads the `src` attribute during HTML parsing and initiates DNS resolution and sometimes a TCP connection, even before the iframe is near the viewport. The resource itself may not download, but the connection overhead still occurs.

For a third-party embed like Bandcamp, this means the browser connects to `bandcamp.com` during initial load — which is enough to trigger additional sub-resource loading, contributing to performance issues even when the embed is below the fold.

### The solution: remove `src` entirely until needed

True lazy-loading means the browser should have no knowledge of the embed's origin until the user is actually about to see it. The way to achieve this is to not use `src` at all in the HTML:

```html
<iframe
    data-src="https://bandcamp.com/EmbeddedPlayer/track=4226434042/size=large/bgcol=ffffff/linkcol=0687f5/minimal=true/transparent=true/"
    title="PWR by øLu AnuAkin"
    allow="autoplay"
></iframe>
```

`data-src` is not a recognized attribute — the browser ignores it completely. No connection is made. No DNS lookup. No resources consumed. The iframe is an empty shell.

### IntersectionObserver

The **IntersectionObserver API** lets JavaScript watch one or more elements and receive a notification when they enter (or exit) the viewport. It is the browser-native way to implement scroll-based lazy loading.

```javascript
/* --- Lazy load Bandcamp iframes --- */
const iframeObs = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const iframe = entry.target;
      if (iframe.dataset.src) {
        iframe.src = iframe.dataset.src;
        iframe.addEventListener('load', () => iframe.classList.add('loaded'), { once: true });
      }
      observer.unobserve(iframe);
    }
  });
}, { rootMargin: '200px' });
document.querySelectorAll('.catalog-cover iframe[data-src]').forEach(iframe => iframeObs.observe(iframe));
```
```

**`rootMargin: '200px'`** means the observer fires when the iframe comes within 200px of the viewport edge — slightly before it is fully visible. This gives the browser a head start on loading Bandcamp's player so it appears loaded by the time the user scrolls to it, rather than showing a blank frame.

### Why this pattern is more powerful than `preconnect` alone

`preconnect` speeds up the connection to an origin that will definitely be used. The IntersectionObserver approach eliminates the connection entirely during initial load. These are complementary — `preconnect` is used for origins that will be needed early and unavoidably; IntersectionObserver is used to defer origins that are only needed conditionally or later.

Together, they cover the full spectrum:
- Unavoidable early third-party → `preconnect`
- Avoidable or below-fold third-party → `data-src` + IntersectionObserver

### The transferable playbook for any third-party embed

Whenever a YouTube video, Vimeo embed, Bandcamp player, Typeform, Calendly, or any other iframe tanks your Lighthouse score:

1. Replace `src` with `data-src`
2. Add the IntersectionObserver script
3. Add `preconnect` to the embed's primary CDN origin
4. If it is still too heavy — replace the iframe with a static preview image and a "click to load" interaction

This four-step escalation handles virtually every third-party embed performance problem you will encounter.

### Applying the same principle to audio and JS modules

The `data-src` + IntersectionObserver pattern is specific to iframes, but the underlying principle — *don't load it until the user needs it* — applies to any resource:

**Dynamic `import()` for JS modules:**
```javascript
// WRONG — loads hoverAudio.js in the initial bundle
import { createHoverAudio } from './hoverAudio.js';

// RIGHT — loads hoverAudio.js only when the hero cover exists on the page
import('./hoverAudio.js').then(({ createHoverAudio }) => {
  // now it's available
});
```

The browser downloads `hoverAudio.js` as a separate chunk (~0.5KB), only when the `import()` is reached. If the hero cover doesn't exist (e.g., a future page without it), the module is never fetched at all.

**Deferring `AudioContext` and `fetch` to first interaction:**
```javascript
// AudioContext is NOT created on page load.
// It is created on the first hover/tap — when the user actually wants audio.
async function init() {
  if (audioCtx) return true;  // already initialized — idempotent
  audioCtx = new AudioContext();
  const res = await fetch(audioUrl);
  audioBuffer = await audioCtx.decodeAudioData(await res.arrayBuffer());
}

// First hover triggers init, subsequent hovers skip it
el.addEventListener('mouseenter', () => {
  init().then(() => start());
});
```

This means zero audio overhead on page load. The `AudioContext`, network fetch, and decode all happen on the first user interaction — and only once.

**The transferable principle:** For any resource that is *conditional on user interaction* (audio, video, heavy visualizations), defer both the module load and the runtime initialization to the moment the user first triggers it.

---

## 5. The Network Waterfall

### What it is

The network waterfall is a visual representation of every network request the browser makes during a page load, displayed as horizontal bars on a timeline. Each bar is one request. The bar's start position shows when the request began. The bar's length shows how long it took. The color coding (in Chrome DevTools) shows what phase of the request each portion represents: DNS, connection, SSL, waiting for the first byte, and content download.

You can access it in **Chrome DevTools → Network tab** (Cmd+Option+I on Mac, then click "Network").

### How to read it

The most important things to look for:

**Staircase patterns** — when requests start one after another in sequence, forming a staircase shape, it means each request is waiting for the previous one to complete. This is the visual signature of parser-blocking scripts or sequential resource loading. The fix is usually `defer`, `async`, or restructuring the dependency chain.

**Long bars before the first resource** — if there is a large gap at the start before any resources begin downloading, it often indicates DNS resolution, server response time, or redirect chains.

**Indented or "waterfall" sub-requests** — some requests spawn additional requests (a script that loads another script; a CSS file that loads fonts). These appear indented or staggered. They represent the "dependency tree" Lighthouse described. A resource deep in the chain cannot start until everything above it has completed.

**The vertical blue line (DOMContentLoaded)** — this marks when the HTML has been fully parsed and all synchronous scripts have executed. Everything to the right of this line was not blocking initial render.

**The vertical red line (Load event)** — this marks when the page is fully loaded, including all sub-resources. This is less important for user experience than DOMContentLoaded.

### What Lighthouse's "dependency tree" was showing you

The tree in Lighthouse was a simplified representation of a waterfall. The indentation showed causality: the main HTML triggered the CSS download; the CSS and HTML together triggered the script downloads; each script was waiting on the previous one. The maximum critical path latency of 511ms was the length of that chain from first request to last script execution.

Reading the full waterfall in DevTools gives you more detail: you can see exactly when each request started, how long DNS resolution took, whether keep-alive connections were reused, and which requests are on the critical path.

### Why this skill transfers everywhere

Lighthouse gives you a score and a list of recommendations. It tells you *what* is slow. The network waterfall tells you *why*. Once you can read a waterfall, you can diagnose performance problems that no automated tool will catch — unusual dependency chains, misconfigured caching headers, redirect loops, resources loading in unexpected orders.

The waterfall is also the tool for *verifying* that a fix worked. After deploying the changes on the øLu AnuAkin site, a waterfall comparison would show: the Bandcamp connections no longer appear in the initial load; the catalog iframes only load when scrolled into view; the DOMContentLoaded line moves left.

**Practice reading waterfalls by loading pages you use every day in DevTools, not just your own projects.** Compare a fast site to a slow one. The patterns become readable quickly.

---

## 6. What Is Not Worth Memorizing (And Why Knowing That Matters)

This section exists because knowing *what not to study* is as valuable as knowing what to study. Performance optimization has a lot of noise — version-specific metrics, tool-specific labels, third-party behaviors you cannot control. Spending time on these is a trap that feels productive but does not compound into reusable knowledge.

### Lighthouse audit names and wording

Lighthouse audit names change between versions. "Avoid chaining critical requests" in one version becomes "Network dependency tree" in another. The specific wording of a recommendation is not the thing to remember — the underlying principle is.

When you see an audit, ask: *"What is the browser waiting for, and why?"* The answer to that question is stable knowledge. The name of the audit that surfaced it is not.

### Exact millisecond thresholds

Lighthouse uses thresholds like "good LCP is under 2.5 seconds" and "FCP savings of 100ms." These numbers shift as the web evolves and as Google updates its scoring model. The scores themselves are calculated differently on different network conditions and device profiles.

What is stable: *fewer blocking resources means faster paint*. The principle does not change. The specific threshold at which Lighthouse turns a metric from orange to green does.

### Third-party behaviors you cannot control

Any third-party embed — Bandcamp, YouTube, Spotify — comes with its own internal resource loading. If Bandcamp's player loads additional fonts or scripts without optimization, that is their code. It cannot be fixed from your side. The lesson to extract is: *recognize when a problem is inside a third-party's own code, and know when to stop trying to fix it from the outside*.

The category of problem ("third-party embed loading resources without optimization") is worth knowing. The specific internal behavior of any platform's embed is not worth memorizing.

A useful diagnostic question: *"Is the resource being loaded by code I control?"* If no, your options are limited to:
- `preconnect` (reduces connection cost)
- Lazy-loading the embed (defers the problem)
- Replacing the embed entirely (eliminates the problem)

Knowing *which category of fix applies* — rather than trying to solve the underlying issue in code you don't own — is the practical skill.

---

*These notes were written from live optimization sessions. The patterns here are not theoretical — they were applied to galoriousexpression.com (Canva embeds) and oluanuakin.com (Bandcamp embeds) with measurable results. Return to this file the next time a Lighthouse score drops.*
