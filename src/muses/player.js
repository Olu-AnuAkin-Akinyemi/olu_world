// src/muses/player.js
import { TRACK_META } from './track-meta.js';

// ── STATE ──
let TRACKS = [];
let currentTrack = 0;
let isPlaying = false;
let scrubInterval = null;

// ── ASSET URL REWRITING ──
function rewriteAssetUrl(starboardUrl) {
  const match = starboardUrl.match(/\/assets\/([^/]+)\/object/);
  if (!match) return starboardUrl;
  return `/api/starboard/assets/${match[1]}/object`;
}

// ── MANIFEST ──
async function loadManifest() {
  const res = await fetch('/api/starboard/manifest');
  if (!res.ok) throw new Error(`manifest ${res.status}`);
  const { manifest } = await res.json();

  const sorted = [...manifest.tracks].sort(
    (a, b) => (a.position ?? 99) - (b.position ?? 99)
  );

  return sorted.map(track => ({
    num: String(track.position ?? '').padStart(2, '0'),
    title: track.title,
    position: track.position,
    projectId: track.projectId,
    src: rewriteAssetUrl(track.audio.url),
    artwork: track.artwork?.url
      ? rewriteAssetUrl(track.artwork.url)
      : manifest.artwork?.url
        ? rewriteAssetUrl(manifest.artwork.url)
        : null,
    duration: '0:00',
    ...(TRACK_META[track.position] ?? { note: '', credits: '', lyrics: '' })
  }));
}

// ── GATE SNIPPET (ambient preview audio) ──
// Browsers block autoplay-with-sound until first user gesture, so we attach
// once-only listeners that start the snippet on the first interaction with
// the gate (mouse move, touch, key, focus). Fade in on start, fade out on
// gate exit so the transition feels like a door, not a hard cut.
const GATE_SNIPPET_URL = '/gate-snippet.mp3';
const GATE_VOLUME = 0.18;
const GATE_FADE_IN_MS = 1500;
const GATE_FADE_OUT_MS = 800;

let gateAudio = null;
let gateFadeRaf = 0;

function fadeAudio(audio, from, to, ms, onDone) {
  cancelAnimationFrame(gateFadeRaf);
  if (ms <= 0) { audio.volume = to; onDone?.(); return; }
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min((now - start) / ms, 1);
    audio.volume = from + (to - from) * t;
    if (t < 1) gateFadeRaf = requestAnimationFrame(tick);
    else onDone?.();
  };
  gateFadeRaf = requestAnimationFrame(tick);
}

function initGateSnippet() {
  gateAudio = new Audio(GATE_SNIPPET_URL);
  gateAudio.loop = true;
  gateAudio.volume = 0;
  gateAudio.preload = 'metadata';

  const startOnce = () => {
    if (!gateAudio) return;
    const p = gateAudio.play();
    if (p && p.then) {
      p.then(() => fadeAudio(gateAudio, 0, GATE_VOLUME, GATE_FADE_IN_MS))
       .catch(() => {}); // gesture not yet trusted; another listener will retry
    }
  };

  const events = ['pointerdown', 'pointermove', 'touchstart', 'keydown'];
  events.forEach(evt =>
    document.addEventListener(evt, startOnce, { once: true, passive: true, capture: true })
  );

  // Be polite if the visitor tabs away
  document.addEventListener('visibilitychange', () => {
    if (!gateAudio) return;
    if (document.hidden) gateAudio.pause();
    else if (gateAudio.currentTime > 0 && gateAudio.volume > 0) {
      gateAudio.play().catch(() => {});
    }
  });
}

function fadeOutGateSnippet(ms = GATE_FADE_OUT_MS) {
  if (!gateAudio) return;
  const audio = gateAudio;
  gateAudio = null;
  fadeAudio(audio, audio.volume, 0, ms, () => {
    audio.pause();
    audio.src = '';
  });
}

// ── GATE ──
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

async function submitCrewSignup(email, name) {
  try {
    const res = await fetch('/api/starboard/crew', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, name: name || undefined }),
    });
    if (!res.ok) return false;
    const data = await res.json().catch(() => ({}));
    const id = data.heartbeatUserId || data.crewMember?.email || email;
    localStorage.setItem('sbUserId', id);
    return true;
  } catch {
    return false;
  }
}

async function handleEnter() {
  const email = document.getElementById('gate-email').value.trim().toLowerCase();
  const name  = document.getElementById('gate-name').value.trim();
  const err   = document.getElementById('gate-error');
  const btn   = document.getElementById('enter-btn');

  if (!email || !name) {
    err.textContent = 'please enter your email and name.';
    err.classList.add('visible');
    shake(btn);
    return;
  }
  if (!isValidEmail(email)) {
    err.textContent = 'please enter a valid email.';
    err.classList.add('visible');
    shake(btn);
    return;
  }
  err.classList.remove('visible');

  const originalLabel = btn.textContent;
  btn.textContent = 'entering…';
  btn.disabled = true;

  // Fire-and-await crew signup. Network/server failure does not block entry —
  // gate is cosmetic — but we persist sbUserId on success so heartbeats
  // attribute back to this fan.
  await submitCrewSignup(email, name);

  // Fallback so heartbeats still have a stable id even if crew call failed.
  if (!localStorage.getItem('sbUserId')) {
    localStorage.setItem('sbUserId', email);
  }

  btn.textContent = originalLabel;
  btn.disabled = false;
  unlockPlayer();
}

function shake(el) {
  el.style.animation = 'none';
  void el.offsetHeight;
  el.style.animation = 'shake 0.42s ease';
}

function showError(msg = 'something went wrong. try again.') {
  const err = document.getElementById('gate-error');
  err.textContent = msg;
  err.classList.add('visible');
  shake(document.getElementById('enter-btn'));
}

async function unlockPlayer() {
  fadeOutGateSnippet();
  document.getElementById('gate').classList.add('exiting');
  setTimeout(async () => {
    document.getElementById('gate').style.display = 'none';
    try {
      TRACKS = await loadManifest();
    } catch (e) {
      console.error(e);
      document.getElementById('gate').style.display = '';
      document.getElementById('gate').classList.remove('exiting');
      showError('could not load tracks. try again.');
      return;
    }
    const player = document.getElementById('player');
    player.classList.add('entering');
    renderTracklist();
    document.querySelectorAll('.track-item').forEach((el, i) => {
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateX(0)';
      }, 460 + i * 75);
    });
    loadTrack(0);
  }, 550);
}

function togglePurchase() {
  document.getElementById('purchase-panel').classList.toggle('open');
}

function handlePurchase() {
  // POST-MVP: replace with collective API → Stripe redirect
  console.log('Purchase stub — wire to collective API post-MVP');
}

// ── TRACKLIST ──
function renderTracklist() {
  document.getElementById('tracklist').innerHTML = TRACKS.map((t, i) => `
    <div class="track-item" id="track-item-${i}" data-index="${i}">
      <span class="track-num">${t.num}</span>
      <span class="track-title">${t.title}</span>
      <span class="track-duration" id="dur-${i}">${t.duration}</span>
    </div>`).join('');

  document.querySelectorAll('.track-item').forEach(el => {
    el.addEventListener('click', () => selectTrack(Number(el.dataset.index)));
  });
}

function selectTrack(i) {
  loadTrack(i);
  if (isPlaying) { pauseAudio(); setTimeout(playAudio, 80); }
}

function loadTrack(i) {
  currentTrack = i;
  const t = TRACKS[i];
  const audio = document.getElementById('audio');
  const titleEl = document.getElementById('now-playing-title');

  // Cross-fade title
  titleEl.classList.add('switching');
  setTimeout(() => {
    titleEl.textContent = t.title;
    titleEl.classList.remove('switching');
  }, 230);

  document.querySelectorAll('.track-item').forEach((el, idx) =>
    el.classList.toggle('active', idx === i)
  );

  if (t.src) {
    audio.src = t.src;
    audio.load();
    audio.onloadedmetadata = () => {
      const dur = fmt(audio.duration);
      document.getElementById('time-total').textContent = dur;
      const rowDur = document.getElementById(`dur-${i}`);
      if (rowDur) rowDur.textContent = dur;
      TRACKS[i].duration = dur;
    };
  }
  resetScrubber();
  updateSheetContent();
}

// ── PLAYBACK ──
function togglePlay() { isPlaying ? pauseAudio() : playAudio(); }

function playAudio() {
  isPlaying = true;
  document.getElementById('play-icon').style.display = 'none';
  document.getElementById('pause-icon').style.display = 'block';
  document.getElementById('play-btn').classList.add('playing');
  const audio = document.getElementById('audio');
  if (audio.src) {
    audio.play().catch(err => console.warn('play blocked', err));
    startScrubber();
  }
}

function pauseAudio() {
  isPlaying = false;
  document.getElementById('play-icon').style.display = 'block';
  document.getElementById('pause-icon').style.display = 'none';
  document.getElementById('play-btn').classList.remove('playing');
  document.getElementById('audio').pause();
  clearInterval(scrubInterval);
}

function prevTrack() { selectTrack((currentTrack - 1 + TRACKS.length) % TRACKS.length); }
function nextTrack() { selectTrack((currentTrack + 1) % TRACKS.length); }

// ── HEARTBEAT ──
// Starboard audience metrics: 15s tick while playing, attributed per track.
function getDeviceId() {
  try {
    let id = localStorage.getItem('sbDeviceId');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('sbDeviceId', id);
    }
    return id;
  } catch {
    // localStorage blocked (private mode / ITP) — ephemeral id for this session
    return crypto.randomUUID();
  }
}

function createHeartbeatTracker({ getProjectId, getUserId }) {
  let elapsed = 0;
  let interval = null;
  // Captured at play-time so a final flush on pause/ended attributes to the
  // outgoing track even if currentTrack has already advanced.
  let activeProjectId = null;

  function send() {
    if (elapsed <= 0 || !activeProjectId) return;
    const projectId = activeProjectId;
    const length = elapsed;
    elapsed = 0;
    fetch('/api/starboard/heartbeat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        projectId,
        userId: getUserId(),
        deviceId: getDeviceId(),
        length,
      }),
    }).catch(() => {}); // fire-and-forget — never block playback
  }

  return {
    onPlay() {
      activeProjectId = getProjectId();
      if (interval) return;
      interval = setInterval(() => {
        elapsed = Math.min(elapsed + 1, 30);
        if (elapsed >= 15) send();
      }, 1000);
    },
    onPause() {
      clearInterval(interval);
      interval = null;
      send();
      activeProjectId = null;
    },
    onEnded() {
      clearInterval(interval);
      interval = null;
      send();
      activeProjectId = null;
    },
  };
}

const heartbeat = createHeartbeatTracker({
  getProjectId: () => TRACKS[currentTrack]?.projectId ?? null,
  getUserId: () => localStorage.getItem('sbUserId') || 'anonymous',
});

// ── SCRUBBER ──
function startScrubber() {
  clearInterval(scrubInterval);
  const audio = document.getElementById('audio');
  scrubInterval = setInterval(() => {
    if (!audio.duration) return;
    setScrub(audio.currentTime / audio.duration, audio.currentTime, audio.duration);
    if (audio.ended) nextTrack();
  }, 250);
}

function setScrub(pct, cur, tot) {
  const p = (pct * 100).toFixed(2) + '%';
  document.getElementById('scrubber-fill').style.width = p;
  document.getElementById('scrubber-thumb').style.left = p;
  document.getElementById('time-current').textContent = fmt(cur);
  document.getElementById('time-total').textContent = fmt(tot);
}

function resetScrubber() {
  clearInterval(scrubInterval);
  setScrub(0, 0, 0);
}

function scrubTo(e) {
  const scrubEl = document.getElementById('scrubber');
  const rect = scrubEl.getBoundingClientRect();
  const cx = e.touches ? e.touches[0].clientX : e.clientX;
  const pct = Math.min(Math.max((cx - rect.left) / rect.width, 0), 1);
  const audio = document.getElementById('audio');
  if (audio.duration) {
    audio.currentTime = pct * audio.duration;
    setScrub(pct, audio.currentTime, audio.duration);
  }
}

function fmt(s) {
  if (!s || isNaN(s)) return '0:00';
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
}

// ── SHEET ──
function openSheet() {
  updateSheetContent();
  const sheet = document.getElementById('track-info-sheet');
  sheet.classList.remove('closing');
  sheet.classList.add('open');
  document.getElementById('overlay-backdrop').classList.add('open');
}

function closeSheet() {
  const sheet = document.getElementById('track-info-sheet');
  sheet.classList.add('closing');
  sheet.classList.remove('open');
  document.getElementById('overlay-backdrop').classList.remove('open');
  setTimeout(() => sheet.classList.remove('closing'), 380);
}

function updateSheetContent() {
  const t = TRACKS[currentTrack];
  if (!t) return;
  // Resilient to commented-out sheet sections (e.g. lyrics)
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  set('sheet-num',     t.num);
  set('sheet-title',   t.title);
  set('sheet-note',    t.note);
  set('sheet-credits', t.credits);
  set('sheet-lyrics',  t.lyrics);
}

// Swipe-down to close sheet with resistance
function initSheetSwipe() {
  const sheetEl = document.getElementById('track-info-sheet');
  let ty0 = 0;

  sheetEl.addEventListener('touchstart', e => {
    ty0 = e.touches[0].clientY;
  }, { passive: true });

  sheetEl.addEventListener('touchmove', e => {
    const dy = e.touches[0].clientY - ty0;
    if (dy > 0 && sheetEl.scrollTop <= 0) {
      e.preventDefault();
      sheetEl.style.transform = `translateY(${Math.pow(dy, 0.75)}px)`;
    }
  }, { passive: false });

  sheetEl.addEventListener('touchend', e => {
    const dy = e.changedTouches[0].clientY - ty0;
    sheetEl.style.transform = '';
    if (dy > 52 && sheetEl.scrollTop <= 0) closeSheet();
  });
}

// ── EVENT LISTENERS ──
document.addEventListener('DOMContentLoaded', () => {
  initGateSnippet();
  document.getElementById('enter-btn').addEventListener('click', handleEnter);
  document.getElementById('play-btn').addEventListener('click', togglePlay);
  document.getElementById('prev-btn').addEventListener('click', prevTrack);
  document.getElementById('next-btn').addEventListener('click', nextTrack);
  document.getElementById('track-info-btn').addEventListener('click', openSheet);
  document.getElementById('sheet-close').addEventListener('click', closeSheet);
  document.getElementById('overlay-backdrop').addEventListener('click', closeSheet);
  document.getElementById('purchase-toggle-btn').addEventListener('click', togglePurchase);
  document.getElementById('purchase-btn').addEventListener('click', handlePurchase);

  // Gate field navigation
  document.getElementById('gate-email').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('gate-name').focus();
  });
  document.getElementById('gate-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('gate-phone').focus();
  });
  document.getElementById('gate-phone').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleEnter();
  });

  // Scrubber
  const scrubEl = document.getElementById('scrubber');
  scrubEl.addEventListener('click', scrubTo);
  scrubEl.addEventListener('touchstart', e => {
    e.preventDefault();
    scrubTo(e);
  }, { passive: false });

  // Heartbeat — wire to native audio element events
  const audio = document.getElementById('audio');
  audio.addEventListener('play',  () => heartbeat.onPlay());
  audio.addEventListener('pause', () => heartbeat.onPause());
  audio.addEventListener('ended', () => heartbeat.onEnded());

  initSheetSwipe();
});
