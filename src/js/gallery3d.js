/**
 * 3D Carousel Gallery — Canvas 2D pseudo-3D rotating ring
 * Images arranged in a circle, auto-rotating, draggable, click-to-overlay.
 * Progressive enhancement: falls back to CSS grid if unsupported.
 */

const AUTO_SPEED = 0.003;
const DRAG_FACTOR = 0.005;
const DRAG_THRESHOLD = 5;
const MIN_SCALE = 0.35;
const MAX_SCALE = 1.0;
const MIN_ALPHA = 0.25;
const MAX_ALPHA = 1.0;
const FRICTION = 0.95;
const Y_OFFSET = -15;
const FRONT_HIGHLIGHT_Z = 0.85;

/** @param {number} a @param {number} b @param {number} t */
function lerp(a, b, t) { return a + (b - a) * t; }

/**
 * @typedef {Object} CarouselImage
 * @property {string} src
 * @property {string} alt
 * @property {string} type
 * @property {HTMLImageElement|null} img
 * @property {boolean} visible
 */

/**
 * Initialize the 3D carousel gallery.
 * Reads image data from existing .world-item elements,
 * renders a rotating ring on #galleryCanvas.
 * @returns {{ destroy: () => void } | null} cleanup handle, or null if not initialized
 */
export function initGalleryCarousel() {
  // Capability gate
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) return null;
  if (navigator.connection && navigator.connection.saveData) return null;

  const section = document.getElementById('gallery');
  const canvas = document.getElementById('galleryCanvas');
  if (!section || !canvas) return null;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Extract image data from existing DOM
  const items = extractImageData(section);
  if (items.length === 0) return null;

  // Load images
  items.forEach(item => {
    const img = new Image();
    img.src = item.src;
    if (img.complete) {
      item.img = img;
    } else {
      img.onload = () => { item.img = img; };
    }
  });

  // Canvas sizing
  const dpr = window.devicePixelRatio || 1;
  let radius, imgDrawW, imgDrawH;

  function resize() {
    const w = section.offsetWidth;
    const h = Math.max(section.offsetHeight, 500);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    radius = w * 0.3;
    imgDrawW = Math.min(280, w * 0.35);
    imgDrawH = imgDrawW * 1.28;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Activate 3D mode
  section.classList.add('gallery-3d-active');

  // State
  let baseAngle = 0;
  let isDragging = false;
  let dragStartX = 0;
  let totalDragDist = 0;
  let dragVelocity = 0;
  let rafId = null;
  let isActive = false;
  let previousFocus = null;

  // --- Render ---

  function getVisibleItems() {
    return items.filter(i => i.visible && i.img);
  }

  function computeTransforms(visibleItems) {
    const N = visibleItems.length;
    if (N === 0) return [];
    const centerX = canvas.width / dpr / 2;
    const centerY = canvas.height / dpr / 2;

    return visibleItems.map((item, i) => {
      const angle = baseAngle + (i * (2 * Math.PI) / N);
      const x = centerX + radius * Math.sin(angle);
      const z = Math.cos(angle);
      const t = (z + 1) / 2;
      const scale = lerp(MIN_SCALE, MAX_SCALE, t);
      const alpha = lerp(MIN_ALPHA, MAX_ALPHA, t);
      const y = centerY + z * Y_OFFSET;
      return { item, x, y, z, scale, alpha, angle };
    });
  }

  function renderFrame() {
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);

    const visibleItems = getVisibleItems();
    const transforms = computeTransforms(visibleItems);
    transforms.sort((a, b) => a.z - b.z);

    for (const t of transforms) {
      const img = t.item.img;
      if (!img) continue;
      const drawW = imgDrawW * t.scale;
      const drawH = imgDrawH * t.scale;
      ctx.save();
      ctx.globalAlpha = t.alpha;
      ctx.drawImage(img, t.x - drawW / 2, t.y - drawH / 2, drawW, drawH);
      // Rust highlight on front-most image
      if (t.z > FRONT_HIGHLIGHT_Z) {
        const intensity = (t.z - FRONT_HIGHLIGHT_Z) / (1 - FRONT_HIGHLIGHT_Z);
        ctx.strokeStyle = `rgba(168,75,42,${intensity * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(t.x - drawW / 2, t.y - drawH / 2, drawW, drawH);
      }
      ctx.restore();
    }
  }

  function loop() {
    if (!isDragging) {
      baseAngle += dragVelocity + AUTO_SPEED;
      dragVelocity *= FRICTION;
      if (Math.abs(dragVelocity) < 0.0001) dragVelocity = 0;
    }
    renderFrame();
    rafId = requestAnimationFrame(loop);
  }

  // --- IntersectionObserver gating ---

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      isActive = true;
      if (!rafId) loop();
    } else {
      isActive = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }
  }, { threshold: 0.01 });
  obs.observe(section);

  // --- Drag interaction (PointerEvents) ---

  canvas.addEventListener('pointerdown', e => {
    isDragging = true;
    dragStartX = e.clientX;
    totalDragDist = 0;
    dragVelocity = 0;
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener('pointermove', e => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    dragStartX = e.clientX;
    totalDragDist += Math.abs(dx);
    baseAngle += dx * DRAG_FACTOR;
    dragVelocity = dx * DRAG_FACTOR;
  });

  canvas.addEventListener('pointerup', e => {
    const wasDrag = totalDragDist > DRAG_THRESHOLD;
    isDragging = false;

    if (!wasDrag) {
      // Treat as click — check if front image was hit
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      handleClick(px, py);
    }
  });

  // --- Click detection ---

  function handleClick(px, py) {
    const visibleItems = getVisibleItems();
    const transforms = computeTransforms(visibleItems);
    // Find the front-most item
    let front = null;
    let maxZ = -Infinity;
    for (const t of transforms) {
      if (t.z > maxZ) { maxZ = t.z; front = t; }
    }
    if (!front) return;

    const drawW = imgDrawW * front.scale;
    const drawH = imgDrawH * front.scale;
    const x1 = front.x - drawW / 2;
    const y1 = front.y - drawH / 2;

    if (px >= x1 && px <= x1 + drawW && py >= y1 && py <= y1 + drawH) {
      openOverlay(front.item);
    }
  }

  // --- Keyboard navigation ---

  function handleKeydown(e) {
    if (!isActive) return;
    // Don't handle keys when overlay is open
    const overlay = document.getElementById('galleryOverlay');
    if (overlay && !overlay.hidden) return;

    const visibleItems = getVisibleItems();
    const N = visibleItems.length;
    if (N === 0) return;

    if (e.key === 'ArrowLeft') {
      baseAngle -= (2 * Math.PI) / N;
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      baseAngle += (2 * Math.PI) / N;
      e.preventDefault();
    } else if (e.key === 'Enter' || e.key === ' ') {
      const transforms = computeTransforms(visibleItems);
      let front = null;
      let maxZ = -Infinity;
      for (const t of transforms) {
        if (t.z > maxZ) { maxZ = t.z; front = t; }
      }
      if (front) {
        openOverlay(front.item);
        e.preventDefault();
      }
    }
  }
  canvas.addEventListener('keydown', handleKeydown);

  // --- Filter sync ---

  function setupFilterSync() {
    document.querySelectorAll('.world-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.filter;
        items.forEach(item => {
          item.visible = (f === 'all' || item.type === f);
        });
      });
    });
  }
  setupFilterSync();

  // --- Overlay ---

  function openOverlay(item) {
    const overlay = document.getElementById('galleryOverlay');
    if (!overlay) return;
    const img = overlay.querySelector('.gallery-overlay-img');
    img.src = item.src;
    img.alt = item.alt;
    overlay.hidden = false;
    previousFocus = document.activeElement;
    const closeBtn = overlay.querySelector('.gallery-overlay-close');
    if (closeBtn) closeBtn.focus();
    document.addEventListener('keydown', overlayKeydown);
    overlay.addEventListener('keydown', trapFocus);
  }

  function closeOverlay() {
    const overlay = document.getElementById('galleryOverlay');
    if (!overlay) return;
    overlay.hidden = true;
    overlay.querySelector('.gallery-overlay-img').src = '';
    document.removeEventListener('keydown', overlayKeydown);
    overlay.removeEventListener('keydown', trapFocus);
    if (previousFocus) previousFocus.focus();
  }

  function overlayKeydown(e) {
    if (e.key === 'Escape') {
      closeOverlay();
      e.preventDefault();
    }
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const overlay = document.getElementById('galleryOverlay');
    if (!overlay) return;
    const focusable = overlay.querySelectorAll('button, [href], img[tabindex], [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // Close overlay on backdrop click
  const overlay = document.getElementById('galleryOverlay');
  if (overlay) {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeOverlay();
    });
    const closeBtn = overlay.querySelector('.gallery-overlay-close');
    if (closeBtn) closeBtn.addEventListener('click', closeOverlay);
  }

  // --- Destroy ---

  function destroy() {
    if (rafId) cancelAnimationFrame(rafId);
    obs.disconnect();
    window.removeEventListener('resize', resize);
    canvas.removeEventListener('keydown', handleKeydown);
    section.classList.remove('gallery-3d-active');
  }

  return { destroy };
}

/**
 * Extract image metadata from .world-item DOM elements
 * @param {HTMLElement} section
 * @returns {CarouselImage[]}
 */
function extractImageData(section) {
  const worldItems = section.querySelectorAll('.world-item');
  return Array.from(worldItems).map(el => {
    const img = el.querySelector('img');
    return {
      src: img ? img.src.trim() : '',
      alt: img ? img.alt : '',
      type: el.dataset.type || 'photo',
      img: null,
      visible: true,
    };
  }).filter(item => item.src);
}
