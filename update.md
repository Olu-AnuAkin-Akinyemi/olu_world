# Catalog Player — CSS Snippet
## Add to `src/css/styles.css`

Paste this block after your existing `.release-card` rules (search for `.release-card` to find the right spot). It uses your existing CSS variables (`--bg-card`, `--accent`, `--text-muted`, etc.) — if your variable names differ, check and align.

```css
/* ═══════════════════════════════════════════════
   CATALOG PLAYER GRID
   ─────────────────────────────────────────────── */

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

/* Card */
.player-card {
  background: #0E0E18;
  border: 0.5px solid #1E1E2E;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.player-card:hover {
  border-color: #A84B2A;
}

/* Cover image */
.player-cover {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
}

.player-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: opacity 0.3s ease;
}

/* Card body */
.player-body {
  padding: 10px 12px 14px;
}

.player-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 17px;
  font-weight: 400;
  color: #E8E0D8;
  margin: 0 0 3px;
  letter-spacing: 0.02em;
}

.player-meta {
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  color: #6E7A8A;
  margin: 0 0 10px;
  letter-spacing: 0.08em;
}

.player-date-pill {
  display: inline-block;
  font-family: 'DM Mono', monospace;
  font-size: 8px;
  letter-spacing: 0.1em;
  color: #A84B2A;
  border: 0.5px solid rgba(168, 75, 42, 0.4);
  padding: 2px 7px;
  border-radius: 2px;
  margin-bottom: 8px;
}

/* ── Player controls ── */
.player-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.player-play-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #A84B2A;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease;
  padding: 0;
  color: #A84B2A;
}

.player-play-btn:hover {
  background: rgba(168, 75, 42, 0.15);
}

.player-play-btn.is-playing {
  background: #A84B2A;
  color: #E8E0D8;
}

.player-play-btn svg {
  width: 9px;
  height: 9px;
}

/* Progress bar */
.player-progress-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.player-progress-bar {
  width: 100%;
  height: 2px;
  background: #1E1E2E;
  border-radius: 1px;
  cursor: pointer;
  overflow: hidden;
  position: relative;
}

.player-progress-fill {
  height: 100%;
  width: 0%;
  background: #A84B2A;
  border-radius: 1px;
  transition: width 0.1s linear;
  pointer-events: none;
}

.player-time-row {
  display: flex;
  justify-content: space-between;
}

.player-elapsed,
.player-duration {
  font-family: 'DM Mono', monospace;
  font-size: 8px;
  color: #6E7A8A;
  letter-spacing: 0.04em;
}

/* ── DSP links ── */
.player-dsp {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.dsp-primary {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 5px;
}

/* Hairline divider — visible on desktop, hidden on mobile */
.dsp-divider {
  height: 0.5px;
  background: #1A1A28;
  margin: 5px 0;
}

.dsp-secondary {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 5px;
}

/* DSP link pill */
.dsp-link {
  display: inline-flex;
  align-items: center;
  font-family: 'DM Mono', monospace;
  font-size: 8px;
  letter-spacing: 0.07em;
  color: #6E7A8A;
  text-decoration: none;
  padding: 3px 7px;
  border: 0.5px solid #1E1E2E;
  border-radius: 2px;
  white-space: nowrap;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.dsp-link:hover {
  border-color: #A84B2A;
  color: #A84B2A;
}

/* Bandcamp / primary action — always rust-accented */
.dsp-link--bc {
  color: #A84B2A;
  border-color: rgba(168, 75, 42, 0.35);
}

.dsp-link--bc:hover {
  border-color: #A84B2A;
}

/* ── More toggle (mobile only) ── */
.dsp-more-btn {
  display: none; /* hidden on desktop */
  align-items: center;
  gap: 4px;
  font-family: 'DM Mono', monospace;
  font-size: 8px;
  letter-spacing: 0.1em;
  color: #3A4A5A;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 0;
  transition: color 0.15s ease;
}

.dsp-more-btn:hover {
  color: #6E7A8A;
}

.dsp-chevron {
  width: 7px;
  height: 7px;
  transition: transform 0.2s ease;
}

.dsp-more-btn[aria-expanded="true"] .dsp-chevron {
  transform: rotate(180deg);
}

/* ═══════════════════════════════════════════════
   RESPONSIVE — CATALOG PLAYER
   ─────────────────────────────────────────────── */

/* Tablet: 2 columns */
@media (max-width: 900px) {
  .catalog-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile: 1 column + toggle behaviour */
@media (max-width: 480px) {
  .catalog-grid {
    grid-template-columns: 1fr;
  }

  /* Show the More button */
  .dsp-more-btn {
    display: flex;
    margin-bottom: 2px;
  }

  /* Hide secondary row and divider by default on mobile */
  .dsp-secondary {
    display: none;
    margin-top: 4px;
  }

  .dsp-secondary.is-open {
    display: flex;
  }
}
```

---

## Notes

- **4-column desktop** — matches your existing 4-track catalog. If you add more tracks later, the grid auto-flows.
- **Tablet 2-column** — kicks in at 900px, cards stay readable.
- **Mobile 1-column + More toggle** — at 480px, secondary links collapse behind the toggle button.
- **`.is-playing` and `.is-open`** — these are the JS-toggled classes. Keep the naming consistent with the JS file.
- **No hardcoded hex needed if you have CSS variables** — if your `styles.css` defines `--bg-surface`, `--accent`, `--text-muted` etc., swap the hex values to match. The values used here are the ones already present in your inline styles and existing cards.

# Catalog Player — HTML Snippet
## Drop-in replacement for `.release-grid` in `index.html`

**Find and delete** this entire block (from the comment through the closing `</div>`):
```
<!-- Release cards grid -->
<div class="section-inner release-grid reveal">
  ...four <a class="release-card"> blocks...
</div>
```

**Replace with:**

```html
<!-- ── CATALOG PLAYER GRID ───────────────────────────────────────── -->
<div class="section-inner catalog-grid reveal">

  <!-- ALWYS LØVE(D) -->
  <div class="player-card">
    <div class="player-cover">
      <img src="/src/assets/cover-art/ALWYS LØVE(D)-400.webp" alt="ALWYS LØVE(D) cover art" width="400" height="400" loading="lazy" />
    </div>
    <div class="player-body">
      <h3 class="player-title">ALWYS LØVE(D)</h3>
      <p class="player-meta">Single · 2022</p>
      <div class="player-controls">
        <button class="player-play-btn" data-track="alwys-lovd" data-src="https://media.oluanuakin.me/alwys-lovd.mp3" data-duration="251" aria-label="Play ALWYS LØVE(D)">
          <svg class="icon-play" viewBox="0 0 10 10" fill="none" aria-hidden="true"><polygon points="2,1 9,5 2,9" fill="currentColor"/></svg>
          <svg class="icon-pause" viewBox="0 0 10 10" fill="none" aria-hidden="true" style="display:none;"><rect x="1" y="1" width="3" height="8" fill="currentColor"/><rect x="6" y="1" width="3" height="8" fill="currentColor"/></svg>
        </button>
        <div class="player-progress-wrap">
          <div class="player-progress-bar" data-track="alwys-lovd" role="progressbar" aria-valuemin="0" aria-valuemax="251" aria-valuenow="0">
            <div class="player-progress-fill"></div>
          </div>
          <div class="player-time-row">
            <span class="player-elapsed" data-track="alwys-lovd">0:00</span>
            <span class="player-duration">4:11</span>
          </div>
        </div>
      </div>
      <div class="player-dsp">
        <div class="dsp-primary">
          <a class="dsp-link dsp-link--bc" href="https://oluanuakin.bandcamp.com/track/alwys-lved" target="_blank" rel="noopener" data-track="alwys-lovd" data-dest="bandcamp">Bandcamp</a>
          <a class="dsp-link" href="ALWYS_SPOTIFY_URL" target="_blank" rel="noopener" data-track="alwys-lovd" data-dest="spotify">Spotify</a>
          <a class="dsp-link" href="ALWYS_APPLE_URL" target="_blank" rel="noopener" data-track="alwys-lovd" data-dest="apple">Apple</a>
        </div>
        <button class="dsp-more-btn" data-sec="dsp-sec-alwys" aria-expanded="false">More <svg class="dsp-chevron" viewBox="0 0 8 8" fill="none" aria-hidden="true"><polyline points="1,2.5 4,5.5 7,2.5" stroke="currentColor" stroke-width="1" fill="none" stroke-linecap="round"/></svg></button>
        <div class="dsp-secondary" id="dsp-sec-alwys">
          <a class="dsp-link" href="ALWYS_TIDAL_URL" target="_blank" rel="noopener" data-track="alwys-lovd" data-dest="tidal">Tidal</a>
          <a class="dsp-link" href="ALWYS_PANDORA_URL" target="_blank" rel="noopener" data-track="alwys-lovd" data-dest="pandora">Pandora</a>
          <a class="dsp-link" href="ALWYS_AMAZON_URL" target="_blank" rel="noopener" data-track="alwys-lovd" data-dest="amazon">Amazon</a>
          <a class="dsp-link" href="https://audiomack.com/oluanuakin/song/alwys-loved" target="_blank" rel="noopener" data-track="alwys-lovd" data-dest="audiomack">Audiomack</a>
          <a class="dsp-link" href="ALWYS_DEEZER_URL" target="_blank" rel="noopener" data-track="alwys-lovd" data-dest="deezer">Deezer</a>
        </div>
      </div>
    </div>
  </div>

  <!-- INDECISION -->
  <div class="player-card">
    <div class="player-cover">
      <img src="/src/assets/cover-art/INDECISION-400.webp" alt="INDECISION cover art" width="400" height="400" loading="lazy" />
    </div>
    <div class="player-body">
      <h3 class="player-title">INDECISION</h3>
      <p class="player-meta">Single · 2025</p>
      <div class="player-controls">
        <button class="player-play-btn" data-track="indecision" data-src="https://media.oluanuakin.me/indecision.mp3" data-duration="235" aria-label="Play INDECISION">
          <svg class="icon-play" viewBox="0 0 10 10" fill="none" aria-hidden="true"><polygon points="2,1 9,5 2,9" fill="currentColor"/></svg>
          <svg class="icon-pause" viewBox="0 0 10 10" fill="none" aria-hidden="true" style="display:none;"><rect x="1" y="1" width="3" height="8" fill="currentColor"/><rect x="6" y="1" width="3" height="8" fill="currentColor"/></svg>
        </button>
        <div class="player-progress-wrap">
          <div class="player-progress-bar" data-track="indecision" role="progressbar" aria-valuemin="0" aria-valuemax="235" aria-valuenow="0">
            <div class="player-progress-fill"></div>
          </div>
          <div class="player-time-row">
            <span class="player-elapsed" data-track="indecision">0:00</span>
            <span class="player-duration">3:55</span>
          </div>
        </div>
      </div>
      <div class="player-dsp">
        <div class="dsp-primary">
          <a class="dsp-link dsp-link--bc" href="https://oluanuakin.bandcamp.com/track/indecision" target="_blank" rel="noopener" data-track="indecision" data-dest="bandcamp">Bandcamp</a>
          <a class="dsp-link" href="INDECISION_SPOTIFY_URL" target="_blank" rel="noopener" data-track="indecision" data-dest="spotify">Spotify</a>
          <a class="dsp-link" href="INDECISION_APPLE_URL" target="_blank" rel="noopener" data-track="indecision" data-dest="apple">Apple</a>
        </div>
        <button class="dsp-more-btn" data-sec="dsp-sec-indecision" aria-expanded="false">More <svg class="dsp-chevron" viewBox="0 0 8 8" fill="none" aria-hidden="true"><polyline points="1,2.5 4,5.5 7,2.5" stroke="currentColor" stroke-width="1" fill="none" stroke-linecap="round"/></svg></button>
        <div class="dsp-secondary" id="dsp-sec-indecision">
          <a class="dsp-link" href="INDECISION_TIDAL_URL" target="_blank" rel="noopener" data-track="indecision" data-dest="tidal">Tidal</a>
          <a class="dsp-link" href="INDECISION_PANDORA_URL" target="_blank" rel="noopener" data-track="indecision" data-dest="pandora">Pandora</a>
          <a class="dsp-link" href="INDECISION_AMAZON_URL" target="_blank" rel="noopener" data-track="indecision" data-dest="amazon">Amazon</a>
          <a class="dsp-link" href="https://audiomack.com/oluanuakin/song/indecision" target="_blank" rel="noopener" data-track="indecision" data-dest="audiomack">Audiomack</a>
          <a class="dsp-link" href="INDECISION_DEEZER_URL" target="_blank" rel="noopener" data-track="indecision" data-dest="deezer">Deezer</a>
        </div>
      </div>
    </div>
  </div>

  <!-- WTFYA -->
  <div class="player-card">
    <div class="player-cover">
      <img src="/src/assets/cover-art/WTFYA_Cover-art-400.webp" alt="WTFYA cover art" width="400" height="400" loading="lazy" />
    </div>
    <div class="player-body">
      <h3 class="player-title">WTFYA</h3>
      <p class="player-meta">Single · 2025</p>
      <div class="player-controls">
        <button class="player-play-btn" data-track="wtfya" data-src="https://media.oluanuakin.me/wtfya.mp3" data-duration="222" aria-label="Play WTFYA">
          <svg class="icon-play" viewBox="0 0 10 10" fill="none" aria-hidden="true"><polygon points="2,1 9,5 2,9" fill="currentColor"/></svg>
          <svg class="icon-pause" viewBox="0 0 10 10" fill="none" aria-hidden="true" style="display:none;"><rect x="1" y="1" width="3" height="8" fill="currentColor"/><rect x="6" y="1" width="3" height="8" fill="currentColor"/></svg>
        </button>
        <div class="player-progress-wrap">
          <div class="player-progress-bar" data-track="wtfya" role="progressbar" aria-valuemin="0" aria-valuemax="222" aria-valuenow="0">
            <div class="player-progress-fill"></div>
          </div>
          <div class="player-time-row">
            <span class="player-elapsed" data-track="wtfya">0:00</span>
            <span class="player-duration">3:42</span>
          </div>
        </div>
      </div>
      <div class="player-dsp">
        <div class="dsp-primary">
          <a class="dsp-link dsp-link--bc" href="https://oluanuakin.bandcamp.com/track/wtfya" target="_blank" rel="noopener" data-track="wtfya" data-dest="bandcamp">Bandcamp</a>
          <a class="dsp-link" href="https://open.spotify.com/track/4b5YTgxSa7wF7HxulDQKc6" target="_blank" rel="noopener" data-track="wtfya" data-dest="spotify">Spotify</a>
          <a class="dsp-link" href="https://geo.music.apple.com/us/album/wtfya/1819812167?i=1819812171" target="_blank" rel="noopener" data-track="wtfya" data-dest="apple">Apple</a>
        </div>
        <button class="dsp-more-btn" data-sec="dsp-sec-wtfya" aria-expanded="false">More <svg class="dsp-chevron" viewBox="0 0 8 8" fill="none" aria-hidden="true"><polyline points="1,2.5 4,5.5 7,2.5" stroke="currentColor" stroke-width="1" fill="none" stroke-linecap="round"/></svg></button>
        <div class="dsp-secondary" id="dsp-sec-wtfya">
          <a class="dsp-link" href="http://www.tidal.com/track/44111204" target="_blank" rel="noopener" data-track="wtfya" data-dest="tidal">Tidal</a>
          <a class="dsp-link" href="https://pandora.app.link/?$desktop_url=https%3A%2F%2Fwww.pandora.com%2Fartist%2Folu-anuakin%2Fwtfya%2Fwtfya%2FTR57r74ZkVXrJ4K" target="_blank" rel="noopener" data-track="wtfya" data-dest="pandora">Pandora</a>
          <a class="dsp-link" href="https://music.amazon.com/tracks/B0FCKCD8MW" target="_blank" rel="noopener" data-track="wtfya" data-dest="amazon">Amazon</a>
          <a class="dsp-link" href="https://audiomack.com/oluanuakin/song/wtfya" target="_blank" rel="noopener" data-track="wtfya" data-dest="audiomack">Audiomack</a>
          <a class="dsp-link" href="https://www.deezer.com/track/3406581681" target="_blank" rel="noopener" data-track="wtfya" data-dest="deezer">Deezer</a>
        </div>
      </div>
    </div>
  </div>

  <!-- PWR -->
  <div class="player-card">
    <div class="player-cover">
      <img src="/src/assets/cover-art/PWR_Cover-Art(OFFICIAL)-400.webp" alt="PWR cover art" width="400" height="400" loading="lazy" />
    </div>
    <div class="player-body">
      <h3 class="player-title">PWR</h3>
      <p class="player-meta">Single · 2026</p>
      <span class="player-date-pill">May 14</span>
      <div class="player-controls">
        <button class="player-play-btn" data-track="pwr" data-src="https://media.oluanuakin.me/pwr.mp3" data-duration="195" aria-label="Play PWR">
          <svg class="icon-play" viewBox="0 0 10 10" fill="none" aria-hidden="true"><polygon points="2,1 9,5 2,9" fill="currentColor"/></svg>
          <svg class="icon-pause" viewBox="0 0 10 10" fill="none" aria-hidden="true" style="display:none;"><rect x="1" y="1" width="3" height="8" fill="currentColor"/><rect x="6" y="1" width="3" height="8" fill="currentColor"/></svg>
        </button>
        <div class="player-progress-wrap">
          <div class="player-progress-bar" data-track="pwr" role="progressbar" aria-valuemin="0" aria-valuemax="195" aria-valuenow="0">
            <div class="player-progress-fill"></div>
          </div>
          <div class="player-time-row">
            <span class="player-elapsed" data-track="pwr">0:00</span>
            <span class="player-duration">3:15</span>
          </div>
        </div>
      </div>
      <div class="player-dsp">
        <div class="dsp-primary">
          <!-- PWR: all links → ffm.to/pwr until May 14 direct URLs are live. Swap hrefs per-platform on release day. -->
          <a class="dsp-link dsp-link--bc" href="https://ffm.to/pwr" target="_blank" rel="noopener" data-track="pwr" data-dest="bandcamp">Pre-Save</a>
          <a class="dsp-link" href="https://ffm.to/pwr" target="_blank" rel="noopener" data-track="pwr" data-dest="spotify">Spotify</a>
          <a class="dsp-link" href="https://ffm.to/pwr" target="_blank" rel="noopener" data-track="pwr" data-dest="apple">Apple</a>
        </div>
        <button class="dsp-more-btn" data-sec="dsp-sec-pwr" aria-expanded="false">More <svg class="dsp-chevron" viewBox="0 0 8 8" fill="none" aria-hidden="true"><polyline points="1,2.5 4,5.5 7,2.5" stroke="currentColor" stroke-width="1" fill="none" stroke-linecap="round"/></svg></button>
        <div class="dsp-secondary" id="dsp-sec-pwr">
          <a class="dsp-link" href="https://ffm.to/pwr" target="_blank" rel="noopener" data-track="pwr" data-dest="tidal">Tidal</a>
          <a class="dsp-link" href="https://ffm.to/pwr" target="_blank" rel="noopener" data-track="pwr" data-dest="pandora">Pandora</a>
          <a class="dsp-link" href="https://ffm.to/pwr" target="_blank" rel="noopener" data-track="pwr" data-dest="amazon">Amazon</a>
          <a class="dsp-link" href="https://ffm.to/pwr" target="_blank" rel="noopener" data-track="pwr" data-dest="audiomack">Audiomack</a>
          <a class="dsp-link" href="https://ffm.to/pwr" target="_blank" rel="noopener" data-track="pwr" data-dest="deezer">Deezer</a>
        </div>
      </div>
    </div>
  </div>

</div>
<!-- ── END CATALOG PLAYER GRID ───────────────────────────────────── -->
```

---

## Placeholder URLs to fill in

These need direct platform URLs — pull from Spotify for Artists, Apple Music for Artists, or your Feature.fm dashboard:

| Track | Missing |
|---|---|
| ALWYS LØVE(D) | Spotify, Apple, Tidal, Pandora, Amazon, Deezer |
| INDECISION | Spotify, Apple, Tidal, Pandora, Amazon, Deezer |
| PWR | All (swap from ffm.to/pwr on May 14) |
| WTFYA | All populated ✓ |

# Catalog Player — JS Snippet
## Add to `src/js/main.js`

Paste this as a new function block near the bottom of `main.js`, before the final closing of any init/DOMContentLoaded wrapper. Call `initCatalogPlayer()` inside your existing DOMContentLoaded or init function.

---

```js
/* ═══════════════════════════════════════════════
   CATALOG PLAYER
   ─────────────────────────────────────────────── */

function initCatalogPlayer() {

  // ── Session ID (anonymous, clears when tab closes) ──────────────
  const SESSION_ID = (() => {
    let id = sessionStorage.getItem('olu_sid');
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem('olu_sid', id);
    }
    return id;
  })();

  const DEVICE_TYPE = /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
  const DEBUG = document.cookie.includes('olu_debug=1');

  // ── Event sender (fire-and-forget via sendBeacon) ────────────────
  function sendEvent(payload) {
    if (DEBUG) return;
    navigator.sendBeacon(
      '/api/player-event',
      JSON.stringify({ ...payload, session_id: SESSION_ID, device_type: DEVICE_TYPE })
    );
  }

  // ── Global audio state ───────────────────────────────────────────
  let activeTrack  = null;   // track slug string
  let activeAudio  = null;   // HTMLAudioElement
  let activeBtn    = null;   // play button element
  let playStart    = null;   // Date.now() when play started
  let playFired    = false;  // deduplication: only send one play event per press
  let seekDebounce = null;

  // ── Stop whatever is playing ─────────────────────────────────────
  function stopCurrent() {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    }
    if (activeBtn) {
      activeBtn.classList.remove('is-playing');
      activeBtn.querySelector('.icon-play').style.display  = '';
      activeBtn.querySelector('.icon-pause').style.display = 'none';
      activeBtn.setAttribute('aria-label', activeBtn.getAttribute('aria-label').replace('Pause', 'Play'));
    }
    // Reset progress bar and elapsed time for the stopped track
    if (activeTrack) {
      const bar = document.querySelector(`.player-progress-bar[data-track="${activeTrack}"] .player-progress-fill`);
      const lbl = document.querySelector(`.player-elapsed[data-track="${activeTrack}"]`);
      if (bar) bar.style.width = '0%';
      if (lbl) lbl.textContent = '0:00';
      const pbar = document.querySelector(`.player-progress-bar[data-track="${activeTrack}"]`);
      if (pbar) pbar.setAttribute('aria-valuenow', '0');
    }
    activeTrack  = null;
    activeAudio  = null;
    activeBtn    = null;
    playStart    = null;
    playFired    = false;
  }

  // ── Format seconds → M:SS ────────────────────────────────────────
  function fmt(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  // ── Wire up each play button ─────────────────────────────────────
  document.querySelectorAll('.player-play-btn').forEach(btn => {
    const track    = btn.dataset.track;
    const src      = btn.dataset.src;
    const duration = parseInt(btn.dataset.duration, 10);
    const bar      = document.querySelector(`.player-progress-bar[data-track="${track}"]`);
    const fill     = bar?.querySelector('.player-progress-fill');
    const elapsed  = document.querySelector(`.player-elapsed[data-track="${track}"]`);

    // Create audio element per track (lazy — only when first played)
    let audio = null;

    btn.addEventListener('click', () => {

      // If this track is already playing → pause it
      if (activeTrack === track && activeAudio && !activeAudio.paused) {
        const listenedSecs = playStart ? Math.round((Date.now() - playStart) / 1000) : null;
        activeAudio.pause();
        btn.classList.remove('is-playing');
        btn.querySelector('.icon-play').style.display  = '';
        btn.querySelector('.icon-pause').style.display = 'none';
        sendEvent({ track_id: track, event_type: 'pause', play_duration_s: listenedSecs });
        playStart = null;
        playFired = false;
        return;
      }

      // Stop whatever else is playing
      if (activeTrack && activeTrack !== track) {
        const listenedSecs = playStart ? Math.round((Date.now() - playStart) / 1000) : null;
        sendEvent({ track_id: activeTrack, event_type: 'pause', play_duration_s: listenedSecs });
        stopCurrent();
      }

      // Lazy-load audio
      if (!audio) {
        audio = new Audio();
        audio.preload = 'none';
        audio.src = src;

        // Progress update
        audio.addEventListener('timeupdate', () => {
          if (!duration) return;
          const pct = (audio.currentTime / duration) * 100;
          if (fill)    fill.style.width = `${Math.min(pct, 100)}%`;
          if (elapsed) elapsed.textContent = fmt(audio.currentTime);
          if (bar)     bar.setAttribute('aria-valuenow', Math.round(audio.currentTime));
        });

        // Track ended
        audio.addEventListener('ended', () => {
          const listenedSecs = playStart ? Math.round((Date.now() - playStart) / 1000) : null;
          sendEvent({ track_id: track, event_type: 'complete', play_duration_s: listenedSecs });
          stopCurrent();
        });

        // Seek event (fires after user releases scrubber)
        audio.addEventListener('seeked', () => {
          clearTimeout(seekDebounce);
          seekDebounce = setTimeout(() => {
            sendEvent({ track_id: track, event_type: 'seek', seek_position_s: Math.round(audio.currentTime) });
          }, 300);
        });
      }

      // Play
      activeTrack = track;
      activeAudio = audio;
      activeBtn   = btn;

      audio.play().then(() => {
        btn.classList.add('is-playing');
        btn.querySelector('.icon-play').style.display  = 'none';
        btn.querySelector('.icon-pause').style.display = '';

        if (!playFired) {
          playFired = true;
          playStart = Date.now();
          sendEvent({ track_id: track, event_type: 'play' });
        } else {
          playStart = Date.now(); // resume after pause
        }
      }).catch(err => {
        // iOS Safari may block autoplay — safe to ignore, user gesture required
        console.warn('Audio play blocked:', err);
      });
    });

    // ── Scrub bar click ────────────────────────────────────────────
    if (bar) {
      bar.addEventListener('click', e => {
        if (!audio || !duration) return;
        const rect = bar.getBoundingClientRect();
        const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        audio.currentTime = pct * duration;
        if (fill)    fill.style.width = `${pct * 100}%`;
        if (elapsed) elapsed.textContent = fmt(audio.currentTime);
      });
    }
  });

  // ── DSP link tracking ────────────────────────────────────────────
  document.querySelectorAll('.dsp-link[data-track][data-dest]').forEach(link => {
    link.addEventListener('click', () => {
      sendEvent({
        track_id: link.dataset.track,
        event_type: 'link_click',
        link_dest: link.dataset.dest
      });
    });
  });

  // ── More / Less toggle (mobile) ──────────────────────────────────
  document.querySelectorAll('.dsp-more-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sec    = document.getElementById(btn.dataset.sec);
      const isOpen = sec.classList.contains('is-open');

      sec.classList.toggle('is-open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
      btn.childNodes[0].textContent = isOpen ? 'More' : 'Less';
    });
  });

}

// ── Call it ───────────────────────────────────────────────────────
// If you already have a DOMContentLoaded listener in main.js, add
// initCatalogPlayer() inside it. Otherwise:
document.addEventListener('DOMContentLoaded', initCatalogPlayer);
```

---

## Notes

**Lazy audio loading** — `new Audio()` is only created when the user first presses play on a track. No audio is fetched on page load, which keeps initial page weight at zero.

**iOS Safari** — `audio.play()` returns a Promise. The `.catch()` handles the case where Safari blocks play before a user gesture. Since play is always triggered by a button click this should never fire in practice, but it prevents an uncaught error.

**`sendEvent` is a no-op until D1 is wired** — the `navigator.sendBeacon('/api/player-event', ...)` call will silently fail with a 404 until the Pages Function exists. That's fine — it won't throw an error or break the player. The UI works completely independently.

**Debug mode** — set a cookie `olu_debug=1` in your browser to suppress all event sends during testing:
```js
document.cookie = 'olu_debug=1; path=/';
```
Clear it with:
```js
document.cookie = 'olu_debug=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
```

**D1 tracking step** — when ready, create `functions/api/player-event.js` (see the Pages Function spec from earlier in this conversation). No changes needed to this JS file at that point — the `sendBeacon` calls are already wired.