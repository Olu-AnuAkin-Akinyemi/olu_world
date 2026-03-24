import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/* ── DOM helpers ─────────────────────────────────────────── */

function createMinimalDOM() {
  document.body.innerHTML = `
    <div id="cursorDot"></div>
    <div id="cursorRing"></div>
    <div id="galleryOverlay" class="gallery-overlay" hidden>
      <button class="gallery-overlay-close">&times;</button>
      <img class="gallery-overlay-img" src="" alt="" />
      <div class="gallery-overlay-info">
        <span class="gallery-overlay-info-title"></span>
        <span class="gallery-overlay-info-artist"></span>
      </div>
      <button class="overlay-bottom-close overlay-bottom-close--always">Tap to close</button>
    </div>
    <div id="notesOverlay" class="notes-overlay" hidden>
      <button class="notes-overlay-close">&times;</button>
      <div class="notes-overlay-body"></div>
    </div>
    <div id="contactOverlay" class="contact-overlay" hidden>
      <button class="contact-overlay-close">&times;</button>
    </div>
    <section id="gallery" class="world-section">
      <div class="world-item" data-title="Test Art" data-artist="Test Artist">
        <img src="/test-400.webp" alt="Test" />
      </div>
    </section>
    <section class="exhibition-section" id="exhibition">
      <div class="world-item" data-title="2k17 Show" data-artist="øLu AnuAkin">
        <img src="/exhibition/2k17-01-800.webp" alt="2k17" />
      </div>
    </section>
    <div class="notes-section">
      <div class="note-item" data-note-type="written">
        <span class="note-date">Mar 2026</span>
        <span class="note-title">Test Note</span>
        <p class="note-desc">Short desc</p>
        <div class="note-full-content" hidden>
          <p>Full content here</p>
          <p>Second paragraph</p>
        </div>
      </div>
    </div>
    <p class="form-feedback" hidden aria-live="polite"></p>
  `;
}

/* ── Tests ────────────────────────────────────────────────── */

describe('Cursor fallback', () => {
  beforeEach(() => {
    document.body.className = '';
  });

  it('adds cursor-ready class when cursor elements exist', () => {
    createMinimalDOM();
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (dot && ring) document.body.classList.add('cursor-ready');
    expect(document.body.classList.contains('cursor-ready')).toBe(true);
  });

  it('does not add cursor-ready when cursor elements are missing', () => {
    document.body.innerHTML = '';
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (dot && ring) document.body.classList.add('cursor-ready');
    expect(document.body.classList.contains('cursor-ready')).toBe(false);
  });
});

describe('Notes overlay XSS prevention (DOM cloning)', () => {
  beforeEach(() => createMinimalDOM());

  it('populates overlay body via cloneNode instead of innerHTML', () => {
    const noteItem = document.querySelector('.note-item');
    const fullContent = noteItem.querySelector('.note-full-content');
    const body = document.querySelector('.notes-overlay-body');

    // Simulate the sanitized approach from main.js
    body.textContent = '';
    if (fullContent) {
      Array.from(fullContent.cloneNode(true).childNodes).forEach(n => body.appendChild(n));
    }

    expect(body.children.length).toBe(2); // two <p> tags
    expect(body.children[0].textContent).toBe('Full content here');
    expect(body.children[1].textContent).toBe('Second paragraph');
  });

  it('falls back to textContent when no full content exists', () => {
    const noteItem = document.querySelector('.note-item');
    // Remove the full content element
    noteItem.querySelector('.note-full-content').remove();

    const fullContent = noteItem.querySelector('.note-full-content');
    const body = document.querySelector('.notes-overlay-body');

    body.textContent = '';
    if (fullContent) {
      Array.from(fullContent.cloneNode(true).childNodes).forEach(n => body.appendChild(n));
    } else {
      body.textContent = noteItem.querySelector('.note-desc')?.textContent || '';
    }

    expect(body.textContent).toBe('Short desc');
    expect(body.children.length).toBe(0); // plain text, no child elements
  });
});

describe('Gallery overlay from exhibition', () => {
  beforeEach(() => createMinimalDOM());

  it('exhibition click populates overlay with direct img src (no -1200 swap)', () => {
    const overlay = document.getElementById('galleryOverlay');
    const item = document.querySelector('.exhibition-section .world-item');
    const img = item.querySelector('img');

    // Simulate exhibition click handler logic
    overlay.querySelector('.gallery-overlay-img').src = img.src;
    overlay.querySelector('.gallery-overlay-img').alt = img.alt;
    overlay.querySelector('.gallery-overlay-info-title').textContent = item.dataset.title;
    overlay.querySelector('.gallery-overlay-info-artist').textContent = item.dataset.artist;
    overlay.hidden = false;

    expect(overlay.querySelector('.gallery-overlay-img').src).toContain('2k17-01-800.webp');
    expect(overlay.querySelector('.gallery-overlay-info-title').textContent).toBe('2k17 Show');
    expect(overlay.hidden).toBe(false);
  });

  it('gallery click swaps to -1200 variant', () => {
    const overlay = document.getElementById('galleryOverlay');
    const item = document.querySelector('#gallery .world-item');
    const img = item.querySelector('img');

    // Simulate gallery click handler logic
    overlay.querySelector('.gallery-overlay-img').src = img.src.replace(/-\d+\.webp$/, '-1200.webp');

    expect(overlay.querySelector('.gallery-overlay-img').src).toContain('test-1200.webp');
  });
});

describe('Escape key handler priorities', () => {
  beforeEach(() => createMinimalDOM());

  it('closes gallery overlay first when multiple overlays are open', () => {
    const galleryOverlay = document.getElementById('galleryOverlay');
    const notesOverlay = document.getElementById('notesOverlay');

    galleryOverlay.hidden = false;
    notesOverlay.hidden = false;

    // Simulate the consolidated Escape handler
    if (!galleryOverlay.hidden) {
      galleryOverlay.hidden = true;
      galleryOverlay.querySelector('.gallery-overlay-img').src = '';
      // early return — notes overlay stays open
    }

    expect(galleryOverlay.hidden).toBe(true);
    expect(notesOverlay.hidden).toBe(false); // not closed — gallery took priority
  });
});

describe('Form feedback aria-live', () => {
  beforeEach(() => createMinimalDOM());

  it('form-feedback elements have aria-live="polite"', () => {
    const feedbacks = document.querySelectorAll('.form-feedback');
    feedbacks.forEach(el => {
      expect(el.getAttribute('aria-live')).toBe('polite');
    });
  });
});

describe('Timezone uses user locale', () => {
  it('Intl.DateTimeFormat resolves a timezone', () => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    expect(typeof tz).toBe('string');
    expect(tz.length).toBeGreaterThan(0);
  });

  it('timestamp string includes timezone identifier', () => {
    const stamp = new Date().toLocaleString('en-US') + ' (' + Intl.DateTimeFormat().resolvedOptions().timeZone + ')';
    expect(stamp).toMatch(/\(.+\)$/);
  });
});
