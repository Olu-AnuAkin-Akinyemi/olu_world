# Muses Player — MVP Build Context v2
> For IDE AI agent use. Authoritative technical spec for building the Muses audio player MVP.
> Supersedes: muses-mvp-context.md and muses-player-context.md

---

## 0. MVP Scope

### In Scope
- Vite multi-page entry at `src/muses/index.html`
- CF Pages Functions proxy for Starboard manifest + asset streaming + audience heartbeats
- Dynamic tracklist from Starboard manifest
- Gate: email (required) + name (required) + phone (optional) — cosmetic only, any valid input unlocks
- Full audio playback: play/pause, prev/next, scrubber with range request support
- Background video via Cloudflare Stream (silent, loops, synced to audio play/pause state)
- Track info sheet per track (title, note, credits, lyrics from `track-meta.js`)
- Audience metrics: 15s heartbeats to Starboard during playback, attributed per track (see §14)
- Standalone page at `oluanuakin.me/muses` — no shared site nav

### Out of Scope for MVP
- Stripe / purchase integration (`handlePurchase()` is a stub)
- Email-based access auth (any email unlocks)
- File delivery (WAV, collage, lyric booklet)
- Phone number storage or transmission
- DSP link (hidden — activate post wide release)

---

## 1. Repo Structure

```
repo-root/
├── index.html                              ← main site entry (existing, do not touch)
├── vite.config.ts                          ← add muses entry point
├── functions/
│   └── api/
│       └── starboard/
│           ├── manifest.ts                 ← NEW: manifest proxy
│           ├── heartbeat.ts                ← NEW: audience-metrics proxy (per-track attribution)
│           └── assets/
│               └── [assetId]/
│                   └── object.ts           ← NEW: asset proxy with range support
└── src/
    └── muses/
        ├── index.html                      ← NEW: player entry point
        ├── player.css                      ← NEW: all styles
        ├── player.js                       ← NEW: all logic + manifest integration
        └── track-meta.js                   ← NEW: lyrics, notes, credits (edit freely)
```

---

## 2. Vite Config Update

Add the muses page as a second entry point. Modify `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main:  resolve(__dirname, 'index.html'),       // existing main site
        muses: resolve(__dirname, 'src/muses/index.html') // new player page
      }
    }
  }
  // ... rest of existing config unchanged
})
```

Vite will output `dist/muses/index.html` and its assets. Cloudflare Pages serves this at `oluanuakin.me/muses`.

---

## 3. Cloudflare Pages Functions

### Setup
- Functions directory already exists at repo root with `.ts` files — no new config needed
- TypeScript already configured — match existing function file style
- Add `STARBOARD_API_KEY` as a Pages secret via Wrangler:

```bash
wrangler pages secret put STARBOARD_API_KEY
# paste value at prompt — never pass inline as shell argument
wrangler pages secret put STARBOARD_API_KEY --env preview
```

### `functions/api/starboard/manifest.ts`
```typescript
export const onRequestGet: PagesFunction<{
  STARBOARD_API_KEY: string
}> = async ({ env }) => {
  const response = await fetch(
    'https://starboard.one-kind.co/api/public/projects/fdf755ab-80a7-40fb-b168-edef1e7ebd9a/manifest',
    {
      headers: {
        authorization: `Bearer ${env.STARBOARD_API_KEY}`,
      },
    }
  )

  return new Response(response.body, {
    status: response.status,
    headers: {
      'content-type': response.headers.get('content-type') ?? 'application/json',
      'cache-control': 'public, max-age=60',
      'access-control-allow-origin': '*',
    },
  })
}
```

### `functions/api/starboard/heartbeat.ts`
```typescript
interface Env {
  STARBOARD_API_KEY: string;
}

const RELEASE_PROJECT_ID = 'fdf755ab-80a7-40fb-b168-edef1e7ebd9a';
const SOURCE_HOSTNAME = 'oluanuakin.me';

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const body = await request.json() as Record<string, unknown>;
  const cf = (request as unknown as { cf?: Record<string, unknown> }).cf ?? {};

  // EP/album players send the per-track projectId; fall back to the release
  // ID for single-track players. Starboard aggregates track heartbeats up to
  // the parent release automatically.
  const targetProjectId = typeof body.projectId === 'string'
    ? body.projectId
    : RELEASE_PROJECT_ID;

  // Starboard does not infer client IP/geo from the proxy connection — we
  // must enrich from cf-connecting-ip and the Cloudflare request.cf object.
  const enriched = {
    ...body,
    ua: request.headers.get('user-agent') ?? '',
    source: SOURCE_HOSTNAME,
    ip: request.headers.get('cf-connecting-ip') ?? 'unknown',
    country: typeof cf.country === 'string' ? cf.country : '',
    region: typeof cf.region === 'string' ? cf.region : '',
    city: typeof cf.city === 'string' ? cf.city : '',
  };

  const starboardUrl = `https://starboard.one-kind.co/api/public/projects/${encodeURIComponent(targetProjectId)}/heartbeat`;
  const response = await fetch(starboardUrl, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.STARBOARD_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(enriched),
  });

  return new Response(response.body, { status: response.status });
};
```

### `functions/api/starboard/assets/[assetId]/object.ts`
```typescript
export const onRequestGet: PagesFunction<{
  STARBOARD_API_KEY: string
}> = async ({ env, params, request }) => {
  const assetUrl = `https://starboard.one-kind.co/api/public/assets/${encodeURIComponent(
    String(params.assetId)
  )}/object`

  const headers = new Headers({
    authorization: `Bearer ${env.STARBOARD_API_KEY}`,
  })

  // Range header is required for audio scrubbing
  const range = request.headers.get('range')
  if (range) headers.set('range', range)

  const response = await fetch(assetUrl, { headers })

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  })
}
```

---

## 4. Starboard Integration

### Credentials
```
Base URL:    https://starboard.one-kind.co
Project ID:  fdf755ab-80a7-40fb-b168-edef1e7ebd9a
Project:     Muses (EP)
Manifest:    https://starboard.one-kind.co/api/public/projects/fdf755ab-80a7-40fb-b168-edef1e7ebd9a/manifest
API Key:     stored as STARBOARD_API_KEY secret — never in client code
```

### Manifest Schema (Relevant Fields)
```typescript
type ProjectManifest = {
  project: {
    id: string
    name: string
    type: 'ep'
  }
  artwork?: ManifestAsset       // release cover art fallback
  tracks: ManifestTrack[]
}

type ManifestTrack = {
  id: string
  title: string
  position?: number             // use for track number display
  audio: ManifestAsset          // rewrite URL through asset proxy
  artwork?: ManifestAsset       // prefer per-track; fall back to manifest.artwork
}

type ManifestAsset = {
  id: string
  url: string                   // Starboard API URL — requires auth — never expose to browser
  contentType: string
  byteSize: number
}
```

### Asset URL Rewriting
All `track.audio.url` values must be rewritten through your proxy before use in the browser.
Starboard asset URLs follow the pattern:
`https://starboard.one-kind.co/api/public/assets/{assetId}/object`

```javascript
// src/muses/player.js
function rewriteAssetUrl(starboardUrl) {
  const match = starboardUrl.match(/\/assets\/([^/]+)\/object/)
  if (!match) return starboardUrl
  return `/api/starboard/assets/${match[1]}/object`
}
```

### Manifest Fetch (called after gate unlock)
```javascript
// src/muses/player.js
async function loadManifest() {
  const res = await fetch('/api/starboard/manifest')
  const { manifest } = await res.json()

  // Sort by position
  const sorted = [...manifest.tracks].sort(
    (a, b) => (a.position ?? 99) - (b.position ?? 99)
  )

  return sorted.map(track => ({
    num: String(track.position ?? '').padStart(2, '0'),
    title: track.title,
    id: track.id,
    projectId: track.projectId,        // required for per-track heartbeat attribution
    src: rewriteAssetUrl(track.audio.url),
    artwork: track.artwork?.url
      ? rewriteAssetUrl(track.artwork.url)
      : manifest.artwork?.url
        ? rewriteAssetUrl(manifest.artwork.url)
        : null,
    duration: '0:00', // updated on loadedmetadata
  }))
}
```

---

## 5. `src/muses/track-meta.js`

Separate from player logic. Edit this file freely for content updates.
Keyed by track position number (integer).

```javascript
// src/muses/track-meta.js
export const TRACK_META = {
  1: {
    note: '',
    // Intimate, journal-entry tone — one or two sentences max
    credits: 'written by ø Lu AnuAkin\nproduced by —\n℗ colorshvdes · ascap',
    lyrics: ''
  },
  2: {
    note: '',
    credits: 'written by ø Lu AnuAkin\nproduced by —\n℗ colorshvdes · ascap',
    lyrics: ''
  },
  3: {
    note: '',
    credits: 'written by ø Lu AnuAkin\nproduced by —\n℗ colorshvdes · ascap',
    lyrics: ''
  },
  4: {
    note: '',
    credits: 'written by ø Lu AnuAkin\nproduced by —\n℗ colorshvdes · ascap',
    lyrics: ''
  },
  5: {
    note: '',
    credits: 'written by ø Lu AnuAkin\nproduced by —\n℗ colorshvdes · ascap',
    lyrics: ''
  }
}
```

### Merging Manifest + Meta in `player.js`
```javascript
import { TRACK_META } from './track-meta.js'

// After loadManifest() returns sorted tracks:
const TRACKS = manifestTracks.map(track => ({
  ...track,
  ...(TRACK_META[track.position] ?? { note: '', credits: '', lyrics: '' })
}))
```

---

## 6. `src/muses/index.html`

Standalone HTML entry. No shared site nav, header, or footer.
References `player.css` and `player.js` as module.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>Muses (Unmastered) — ø Lu AnuAkin</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:ital,wght@0,300;0,400;1,300&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="./player.css">
</head>
<body>

  <!-- GATE SCREEN -->
  <div class="screen" id="gate">
    <div class="gate-bg" id="gate-bg"></div>
    <div class="gate-overlay"></div>
    <div class="gate-content">
      <p class="gate-label g1">— private —</p>
      <h1 class="gate-title g2">Muses</h1>
      <p class="gate-subtitle g3">(unmastered) · ø Lu AnuAkin</p>

      <div class="field g4">
        <label class="field-label" for="gate-email">email</label>
        <input type="email" id="gate-email" placeholder="your email"
          autocomplete="email" autocapitalize="none" spellcheck="false">
      </div>
      <div class="field g5">
        <label class="field-label" for="gate-name">name</label>
        <input type="text" id="gate-name" placeholder="your name"
          autocomplete="given-name">
      </div>
      <div class="field g6">
        <label class="field-label" for="gate-phone">
          phone <span class="optional-label">(optional)</span>
        </label>
        <input type="tel" id="gate-phone" placeholder="your number"
          autocomplete="tel">
      </div>

      <button class="enter-btn g7" id="enter-btn">enter</button>
      <p class="gate-error" id="gate-error"></p>

      <div class="purchase-toggle g8">
        <span>don't have access? </span>
        <button id="purchase-toggle-btn">purchase →</button>
      </div>

      <div class="purchase-panel" id="purchase-panel">
        <div class="purchase-card">
          <p class="purchase-card-title">Muses (Unmastered)</p>
          <ul class="purchase-includes">
            <li>lossless wav files — all tracks</li>
            <li>exclusive visual artifact</li>
            <li>lyric booklet · liner notes</li>
            <li>lifetime access to this player</li>
          </ul>
          <button class="purchase-btn" id="purchase-btn">purchase · $__</button>
        </div>
      </div>
    </div>
  </div>

  <!-- PLAYER SCREEN -->
  <div class="screen" id="player">
    <div class="video-bg" id="video-bg">
      <iframe
        id="cf-video"
        src="https://customer-mrl30lrm2q4cfcg0.cloudflarestream.com/66508d46a629e0814e87366fccd04830/iframe?autoplay=1&muted=1&loop=1&controls=0&preload=auto"
        allow="autoplay"
        allowfullscreen="false">
      </iframe>
    </div>
    <div class="player-overlay"></div>

    <div class="player-scroll">
      <div class="player-hero">
        <div class="sigil"></div>
        <h1 class="player-ep-title">Muses</h1>
        <p class="player-ep-sub">(unmastered)</p>
        <p class="player-artist">ø Lu AnuAkin</p>
      </div>
      <div class="rust-rule"></div>
      <div class="tracklist" id="tracklist"></div>
      <div class="dedication">
        <div class="dedication-rule"></div>
        <p class="dedication-text">
          dedicated to those that I've shared<br>
          moments of life with,<br>
          being art and experiencing love...
        </p>
      </div>
      <div class="dsp-link" id="dsp-link">
        <a href="#" target="_blank" rel="noopener">stream everywhere →</a>
      </div>
      <div style="height:28px;"></div>
    </div>

    <!-- Sticky Player Bar -->
    <div class="sticky-player">
      <div class="sticky-top">
        <button class="track-info-btn" id="track-info-btn">track info</button>
        <span class="now-playing-label">now playing</span>
        <div style="width:66px;"></div>
      </div>
      <p class="now-playing-title" id="now-playing-title">—</p>
      <div class="scrubber-row">
        <span class="time-label" id="time-current">0:00</span>
        <div class="scrubber" id="scrubber">
          <div class="scrubber-track">
            <div class="scrubber-fill" id="scrubber-fill"></div>
            <div class="scrubber-thumb" id="scrubber-thumb" style="left:0%"></div>
          </div>
        </div>
        <span class="time-label right" id="time-total">0:00</span>
      </div>
      <div class="controls">
        <button class="ctrl-btn" id="prev-btn" aria-label="Previous">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
          </svg>
        </button>
        <button class="play-btn" id="play-btn" aria-label="Play/Pause">
          <svg id="play-icon" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <svg id="pause-icon" width="15" height="15" viewBox="0 0 24 24"
            fill="currentColor" style="display:none">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </button>
        <button class="ctrl-btn" id="next-btn" aria-label="Next">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zm2-8.14 5.5 2.14L8 11.86V9.86zM16 6h2v12h-2z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- TRACK INFO SHEET -->
  <div class="overlay-backdrop" id="overlay-backdrop"></div>
  <div class="track-info-sheet" id="track-info-sheet">
    <div class="sheet-handle"></div>
    <button class="sheet-close" id="sheet-close">× close</button>
    <p class="sheet-track-num" id="sheet-num">01</p>
    <h2 class="sheet-track-title" id="sheet-title"></h2>
    <div class="sheet-rule"></div>
    <p class="sheet-section-label">note</p>
    <p class="sheet-note" id="sheet-note"></p>
    <p class="sheet-section-label">credits</p>
    <p class="sheet-credits" id="sheet-credits"></p>
    <p class="sheet-section-label">lyrics</p>
    <p class="sheet-lyrics" id="sheet-lyrics"></p>
  </div>

  <audio id="audio" preload="metadata"></audio>

  <script type="module" src="./player.js"></script>
</body>
</html>
```

---

## 7. `src/muses/player.js` — Structure

All event listeners attached by ID — no inline `onclick` handlers in HTML.

```javascript
// src/muses/player.js
import { TRACK_META } from './track-meta.js'

// ── STATE ──
let TRACKS = []
let currentTrack = 0
let isPlaying = false
let scrubInterval = null

// ── ASSET URL REWRITING ──
function rewriteAssetUrl(starboardUrl) {
  const match = starboardUrl.match(/\/assets\/([^/]+)\/object/)
  if (!match) return starboardUrl
  return `/api/starboard/assets/${match[1]}/object`
}

// ── MANIFEST ──
async function loadManifest() {
  const res = await fetch('/api/starboard/manifest')
  const { manifest } = await res.json()

  const sorted = [...manifest.tracks].sort(
    (a, b) => (a.position ?? 99) - (b.position ?? 99)
  )

  return sorted.map(track => ({
    num: String(track.position ?? '').padStart(2, '0'),
    title: track.title,
    position: track.position,
    src: rewriteAssetUrl(track.audio.url),
    artwork: track.artwork?.url
      ? rewriteAssetUrl(track.artwork.url)
      : manifest.artwork?.url
        ? rewriteAssetUrl(manifest.artwork.url)
        : null,
    duration: '0:00',
    ...(TRACK_META[track.position] ?? { note: '', credits: '', lyrics: '' })
  }))
}

// ── GATE ──
function handleEnter() { /* ... */ }
function unlockPlayer() {
  document.getElementById('gate').classList.add('exiting')
  setTimeout(async () => {
    document.getElementById('gate').style.display = 'none'
    TRACKS = await loadManifest()
    const player = document.getElementById('player')
    player.classList.add('entering')
    renderTracklist()
    // stagger tracklist items in
    document.querySelectorAll('.track-item').forEach((el, i) => {
      setTimeout(() => {
        el.style.opacity = '1'
        el.style.transform = 'translateX(0)'
      }, 460 + i * 75)
    })
    loadTrack(0)
  }, 550)
}

// ── TRACKLIST ──
function renderTracklist() {
  document.getElementById('tracklist').innerHTML = TRACKS.map((t, i) => `
    <div class="track-item" id="track-item-${i}" data-index="${i}">
      <span class="track-num">${t.num}</span>
      <span class="track-title">${t.title}</span>
      <span class="track-duration" id="dur-${i}">${t.duration}</span>
    </div>`).join('')

  // Attach click handlers after render
  document.querySelectorAll('.track-item').forEach(el => {
    el.addEventListener('click', () => selectTrack(Number(el.dataset.index)))
  })
}

// ── EVENT LISTENERS ──
// Attach all listeners after DOM ready — no inline onclick in HTML
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('enter-btn').addEventListener('click', handleEnter)
  document.getElementById('play-btn').addEventListener('click', togglePlay)
  document.getElementById('prev-btn').addEventListener('click', prevTrack)
  document.getElementById('next-btn').addEventListener('click', nextTrack)
  document.getElementById('track-info-btn').addEventListener('click', openSheet)
  document.getElementById('sheet-close').addEventListener('click', closeSheet)
  document.getElementById('overlay-backdrop').addEventListener('click', closeSheet)
  document.getElementById('purchase-toggle-btn').addEventListener('click', togglePurchase)
  document.getElementById('purchase-btn').addEventListener('click', handlePurchase)

  // Keyboard: Enter key on gate fields
  document.getElementById('gate-email')
    .addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('gate-name').focus() })
  document.getElementById('gate-name')
    .addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('gate-phone').focus() })
  document.getElementById('gate-phone')
    .addEventListener('keydown', e => { if (e.key === 'Enter') handleEnter() })

  // Scrubber
  const scrubEl = document.getElementById('scrubber')
  scrubEl.addEventListener('click', scrubTo)
  scrubEl.addEventListener('touchstart', e => { e.preventDefault(); scrubTo(e) }, { passive: false })

  // Sheet swipe down
  initSheetSwipe()
})

// ── PURCHASE (STUB) ──
function handlePurchase() {
  // POST-MVP: replace with collective API → Stripe redirect
  // fetch('/api/purchase', { method: 'POST', ... })
  console.log('Purchase stub — wire to collective API post-MVP')
}

// ── HEARTBEAT ──
// See §14 for full architecture. Two helpers + native audio-event wiring.
function getDeviceId() {
  try {
    let id = localStorage.getItem('sbDeviceId')
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('sbDeviceId', id)
    }
    return id
  } catch {
    return crypto.randomUUID() // localStorage blocked (private mode / ITP)
  }
}

function createHeartbeatTracker({ getProjectId, getUserId }) {
  let elapsed = 0
  let interval = null
  // Captured at play-time so a final flush on pause/ended attributes to the
  // outgoing track even if currentTrack has already advanced.
  let activeProjectId = null

  function send() {
    if (elapsed <= 0 || !activeProjectId) return
    const projectId = activeProjectId
    const length = elapsed
    elapsed = 0
    fetch('/api/starboard/heartbeat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        projectId,
        userId: getUserId(),
        deviceId: getDeviceId(),
        length,
      }),
    }).catch(() => {}) // fire-and-forget — never block playback
  }

  return {
    onPlay() {
      activeProjectId = getProjectId()
      if (interval) return
      interval = setInterval(() => {
        elapsed = Math.min(elapsed + 1, 30)
        if (elapsed >= 15) send()
      }, 1000)
    },
    onPause() { clearInterval(interval); interval = null; send(); activeProjectId = null },
    onEnded() { clearInterval(interval); interval = null; send(); activeProjectId = null },
  }
}

const heartbeat = createHeartbeatTracker({
  getProjectId: () => TRACKS[currentTrack]?.projectId ?? null,
  getUserId: () => 'anonymous', // MVP: gate is cosmetic; revisit when auth ships
})

// Wire to native audio events inside DOMContentLoaded:
// const audio = document.getElementById('audio')
// audio.addEventListener('play',  () => heartbeat.onPlay())
// audio.addEventListener('pause', () => heartbeat.onPause())
// audio.addEventListener('ended', () => heartbeat.onEnded())
```

---

## 8. `src/muses/player.css`

Extract all styles from the prototype HTML file `muses-player-v3.html`.
The CSS is complete and production-ready — copy verbatim from the `<style>` block.

Key design tokens already defined as CSS custom properties in `:root` — do not hardcode color or font values anywhere in the stylesheet.

---

## 9. Design System Reference

### Colors
| Token | Value | Usage |
|---|---|---|
| `--void` | `#07070D` | Primary background |
| `--surface` | `#0E0E17` | Sheet / card backgrounds |
| `--rust` | `#A84B2A` | Accent, active state, CTAs |
| `--rust-light` | `#C4603A` | Hover on rust elements |
| `--rust-dim` | `rgba(168,75,42,0.22)` | Borders, subtle fills |
| `--rust-glow` | `rgba(168,75,42,0.08)` | Button hover fill |
| `--parchment` | `#ECEAE6` | Primary text |
| `--muted` | `#6E7A8A` | Secondary text, metadata |
| `--muted-dim` | `rgba(110,122,138,0.3)` | Borders, dividers |

### Font Size Rules
- **Minimum 10px** for anything a user must read to take action
- **9px only** for purely decorative/atmospheric labels
- **15px** for body reading content (lyrics, liner notes)
- **19px** for now playing title
- **20px** for tracklist track titles

### Motion Curves
```css
--spring:   cubic-bezier(0.175, 0.885, 0.32, 1.075)
--ease-out: cubic-bezier(0.16, 1, 0.3, 1)
--ease-io:  cubic-bezier(0.45, 0, 0.55, 1)
--sheet-in: cubic-bezier(0.32, 0.72, 0, 1)
```

---

## 10. Cloudflare Stream

```
Customer subdomain: customer-mrl30lrm2q4cfcg0.cloudflarestream.com
Video ID:           66508d46a629e0814e87366fccd04830
Embed URL:          https://customer-mrl30lrm2q4cfcg0.cloudflarestream.com/66508d46a629e0814e87366fccd04830/iframe?autoplay=1&muted=1&loop=1&controls=0&preload=auto
```

Video is portrait orientation. Behavior: `opacity: 0` default → `opacity: 1` (2s ease) on audio play → `opacity: 0` on pause.

---

## 11. Tracklist Reference

| Position | Title | Note | Credits | Lyrics |
|---|---|---|---|---|
| 01 | Seasons lll | empty | needs producer | empty |
| 02 | Oblivious | empty | needs producer | empty |
| 03 | Reassurance | empty | needs producer | empty |
| 04 | Fxk&Luv | empty | needs producer | empty |
| 05 | Hope its all You Dream Of | empty | needs producer | empty |

All populated in `track-meta.js` — do not hardcode in `player.js`.

---

## 12. Dedication (Static — Do Not Change)

```
dedicated to those that I've shared
moments of life with,
being art and experiencing love...
```

Cormorant Garamond italic · centered · `opacity: 0.42` · `line-height: 2.1`

---

## 13. Publishing

```
Artist:    ø Lu AnuAkin
Publisher: colorshvdes (DBA of Galorious Expression LLC)
PRO:       ASCAP
Credit:    ℗ & © 2026 colorshvdes / galorious expression llc · ascap
```

---

## 14. Audience Heartbeats

Starboard's audience metrics are populated by the player itself, not by Starboard scraping anything. The browser sends a "heartbeat" every 15 seconds while audio is playing; the proxy enriches it with IP / geo / user-agent and forwards to Starboard. Aggregation up to the EP is automatic — heartbeats attributed to a track's own `projectId` roll up under the parent release.

### Architecture

```
┌──────────────┐  POST /api/starboard/heartbeat   ┌─────────────────────┐
│   Browser    │ ───────────────────────────────► │  Pages Function     │
│  (player.js) │   { projectId, userId,           │  heartbeat.ts       │
│              │     deviceId, length }           │                     │
└──────────────┘                                  │  + ua, source, ip,  │
                                                  │    country, region, │
                                                  │    city             │
                                                  ▼                     │
                                          POST starboard.one-kind.co/   │
                                          api/public/projects/          │
                                          {track.projectId}/heartbeat   │
                                          Authorization: Bearer <key>   │
```

### Per-track attribution rule (critical)

Heartbeats MUST use the **track's own** `projectId` (`track.projectId` from the manifest), **not** the release/EP `projectId`. The release ID is the Starboard fallback for single-track players. Sending heartbeats to the release ID directly bypasses Starboard's aggregation and miscounts plays.

The browser-side helper captures `activeProjectId` at the `play` event, not at `send` time. This guards against the pause→play sequence on track change misattributing the final flush to the incoming track.

### Heartbeat rules

| Rule | Why |
|---|---|
| Tick only while audio is playing (not paused, buffering, ended) | Prevents inflated counts |
| Cap `elapsed` at 30s per send | Defends against tab-throttle catch-up bursts |
| Never send `length: 0` | Heartbeat helper short-circuits |
| Send a final flush on pause and ended | Captures the trailing seconds before the interval stops |
| Fire-and-forget — never block playback on a slow heartbeat | UX over telemetry |
| `deviceId` = `crypto.randomUUID()` stored in `localStorage["sbDeviceId"]` | Stable per browser; ephemeral if storage blocked |
| `userId` = `'anonymous'` for MVP | Replace when real auth ships |

### What the proxy must enrich

The browser sends only `{ projectId, userId, deviceId, length }`. The proxy MUST add:

| Field | Source | Note |
|---|---|---|
| `ua` | `request.headers.get('user-agent')` | |
| `source` | Hardcoded constant `'oluanuakin.me'` | One-line config per deployment |
| `ip` | `request.headers.get('cf-connecting-ip')` | Cloudflare-only header; do not trust `x-forwarded-for` |
| `country` / `region` / `city` | `request.cf.country` etc. | Empty in `wrangler pages dev` (geo only resolves in production) |

Starboard does NOT infer IP/geo from the proxy connection — these fields are required from the proxy for accurate metrics.

### CSP

`/api/starboard/heartbeat` is same-origin → already covered by existing `connect-src 'self'` in `public/_headers`. No CSP change needed.

### Privacy disclosure

Heartbeats collect `deviceId` (UUID in localStorage), playback duration, and the proxy enriches with IP + country/region/city + user-agent. This is functionally similar to the existing D1 player-event analytics. Update `privacy.html` to add a "Muses player audience metrics" entry alongside the existing D1 disclosure.

### Testing

```bash
# 1. Get a real track projectId from the manifest
curl -s http://localhost:8788/api/starboard/manifest \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['manifest']['tracks'][0]['projectId'])"

# 2. POST a heartbeat for that track
curl -X POST http://localhost:8788/api/starboard/heartbeat \
  -H "content-type: application/json" \
  -d '{"projectId":"<paste-from-step-1>","userId":"anonymous","deviceId":"smoke-test","length":15}'

# Expect: HTTP 200, body "ok"
```

In the browser, confirm heartbeats fire by watching the network tab while a track plays for 15+ seconds. Pause and verify the final flush. Click next track and confirm the outgoing track's flush attributes to its own projectId, not the incoming track's.

---

## 15. MVP Go-Live Checklist

### Cloudflare Setup
- [ ] `wrangler pages secret put STARBOARD_API_KEY` (production)
- [ ] `wrangler pages secret put STARBOARD_API_KEY --env preview`

### Files to Create
- [ ] `functions/api/starboard/manifest.ts`
- [ ] `functions/api/starboard/heartbeat.ts`
- [ ] `functions/api/starboard/assets/[assetId]/object.ts`
- [ ] `src/muses/index.html`
- [ ] `src/muses/player.css` (extracted from `muses-player-v3.html` `<style>` block)
- [ ] `src/muses/player.js`
- [ ] `src/muses/track-meta.js`

### Vite Config
- [ ] Add `muses` entry point to `vite.config.ts` rollupOptions.input

### Content (in `track-meta.js`)
- [ ] Liner notes per track
- [ ] Credits per track (add producer names)
- [ ] Lyrics per track
- [ ] Purchase price (update button text from `$__`)

### Testing
- [ ] `GET /api/starboard/manifest` returns manifest JSON
- [ ] `GET /api/starboard/assets/{id}/object` streams audio bytes
- [ ] Range requests work — scrubbing does not jump to start
- [ ] `POST /api/starboard/heartbeat` with a real `track.projectId` returns `200 ok`
- [ ] Browser fires heartbeats every 15s during playback (network tab)
- [ ] Pause sends a final flush; track change attributes the flush to the outgoing track
- [ ] Gate: email + name required, phone optional, any input unlocks
- [ ] Tracklist renders dynamically from manifest
- [ ] Audio plays, pauses, prev/next works
- [ ] Video background fades in on play, out on pause
- [ ] Track info sheet opens, displays correct track data, closes via swipe/button/backdrop
- [ ] Now playing title cross-fades on track change
- [ ] `oluanuakin.me/muses` routes correctly
- [ ] No API key visible in browser network tab or page source
- [ ] `privacy.html` updated with Muses audience-metrics disclosure

### Post-MVP (Do Not Build Now)
- [ ] Stripe purchase integration
- [ ] Email-based access auth
- [ ] File delivery (WAV, collage, lyric booklet)
- [ ] DSP link — set `#dsp-link { display: block }` + Odesli href post wide release
- [ ] Phone number storage