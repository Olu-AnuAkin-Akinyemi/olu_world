
/* --- Cursor --- */
const dot = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { 
  mx = e.clientX; 
  my = e.clientY; 
  if (dot) {
    dot.style.left = mx + 'px'; 
    dot.style.top = my + 'px'; 
  }
});
(function animRing() { 
  rx += (mx - rx) * 0.12; 
  ry += (my - ry) * 0.12; 
  if (ring) {
    ring.style.left = rx + 'px'; 
    ring.style.top = ry + 'px'; 
  }
  requestAnimationFrame(animRing); 
})();

document.querySelectorAll('a, button, .track-item, .catalog-card, .sync-card, .note-item').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});
document.querySelectorAll('.world-item').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover', 'cursor-gallery-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover', 'cursor-gallery-hover'));
});

/* --- Sticky nav --- */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* --- Theme toggle (commented out for pre-release — dark mode only.
       Uncomment when light mode is polished. Also uncomment toggle button in index.html) ---
const toggle = document.getElementById('themeToggle');
const iD = document.getElementById('iconDark');
const iL = document.getElementById('iconLight');
const html = document.documentElement;

if (window.matchMedia('(prefers-color-scheme: light)').matches) {
  html.setAttribute('data-theme', 'light');
  if (iD) iD.style.display = 'none';
  if (iL) iL.style.display = 'block';
}

if (toggle) {
  toggle.addEventListener('click', () => {
    const dark = html.getAttribute('data-theme') === 'dark';
    html.setAttribute('data-theme', dark ? 'light' : 'dark');
    if (iD) iD.style.display = dark ? 'none' : 'block';
    if (iL) iL.style.display = dark ? 'block' : 'none';
  });
}
--- END Theme toggle */

/* --- Mobile menu --- */
const hamburger = document.getElementById('navHamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-menu-link');

/**
 * Toggle mobile menu state
 * @param {boolean} open - Whether to open or close menu
 */
function toggleMobileMenu(open) {
  hamburger.setAttribute('aria-expanded', open);
  mobileMenu.setAttribute('aria-hidden', !open);
  mobileMenu.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
}

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    toggleMobileMenu(!isOpen);
  });
  
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => toggleMobileMenu(false));
  });
  
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      toggleMobileMenu(false);
      hamburger.focus();
    }
  });
}

/* --- Scroll reveal --- */
const obs = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { 
    e.target.classList.add('visible'); 
    obs.unobserve(e.target); 
  }
}), { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

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


/* --- Hero cover tilt on mousemove + hover audio --- */
const heroCoverLayers = document.querySelector('.hero-cover-layers');
const heroCover = document.querySelector('.hero-cover');
if (heroCoverLayers && heroCover) {
  const audioUrl = new URL('../assets/PWR_audio-snip.mp3', import.meta.url).href;
  let hoverAudio = null;

  import('./hoverAudio.js').then(({ createHoverAudio }) => {
    hoverAudio = createHoverAudio(audioUrl, {
      onEnded() {
        heroCoverLayers.style.transform = '';
        heroCoverLayers.classList.remove('tilt-active');
      }
    });
  });

  const isTouchDevice = matchMedia('(pointer: coarse)').matches;

  if (!isTouchDevice) {
    /* Desktop: tilt on mousemove, audio on hover */
    heroCover.addEventListener('mousemove', e => {
      const rect = heroCoverLayers.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      heroCoverLayers.style.transform = `scale(1.03) rotateY(${x * 8}deg) rotateX(${y * -8}deg)`;
      heroCoverLayers.classList.add('tilt-active');
    });
    heroCover.addEventListener('mouseenter', () => {
      hoverAudio?.init().then(ok => { if (ok) hoverAudio.start(); });
    });
    heroCover.addEventListener('mouseleave', () => {
      heroCoverLayers.style.transform = '';
      heroCoverLayers.classList.remove('tilt-active');
      hoverAudio?.stop();
    });
  } else {
    /* Mobile: tap to play once, glow resets when audio ends */
    heroCoverLayers.addEventListener('click', () => {
      heroCoverLayers.classList.add('tilt-active');
      hoverAudio?.init().then(ok => { if (ok) hoverAudio.start(); });
    });
  }
}

/* --- Parallax on atmo breaks --- */
const atmoBgs = document.querySelectorAll('.atmo-break-bg');
window.addEventListener('scroll', () => {
  atmoBgs.forEach(bg => {
    const rect = bg.parentElement.getBoundingClientRect();
    bg.style.transform = `translateY(${(rect.top / window.innerHeight) * 30}px)`;
  });
}, { passive: true });

/* --- World feed filter --- */
document.querySelectorAll('.world-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.world-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    document.querySelectorAll('.world-item').forEach(item => {
      item.style.opacity = f === 'all' || item.dataset.type === f ? '1' : '0.15';
      item.style.transition = 'opacity .35s ease';
    });
  });
});

/* --- 3D Gallery Carousel (progressive enhancement) --- */
const gallerySec = document.getElementById('gallery');
if (gallerySec) {
  const galleryObs = new IntersectionObserver(async (entries, observer) => {
    if (entries[0].isIntersecting) {
      observer.disconnect();
      const { initGalleryCarousel } = await import('./gallery3d.js');
      initGalleryCarousel();
    }
  }, { rootMargin: '200px' });
  galleryObs.observe(gallerySec);
}

/* --- Notes filter --- */
document.querySelectorAll('.notes-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.notes-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    document.querySelectorAll('.note-item').forEach(item => {
      const match = f === 'all' || item.dataset.noteType === f;
      item.classList.toggle('hidden', !match);
    });
  });
});

/* --- Notes overlay --- */
const notesOverlay = document.getElementById('notesOverlay');

function openNoteOverlay(noteItem) {
  if (!notesOverlay) return;
  const date = noteItem.querySelector('.note-date')?.textContent || '';
  const title = noteItem.querySelector('.note-title')?.textContent || '';
  const type = noteItem.dataset.noteType || 'written';
  const fullContent = noteItem.querySelector('.note-full-content');

  notesOverlay.querySelector('.notes-overlay-date').textContent = date;
  notesOverlay.querySelector('.notes-overlay-title').textContent = title;

  const pill = notesOverlay.querySelector('.notes-overlay-pill');
  pill.className = 'notes-overlay-pill ' + type;
  pill.textContent = type.charAt(0).toUpperCase() + type.slice(1);

  const body = notesOverlay.querySelector('.notes-overlay-body');
  body.innerHTML = fullContent ? fullContent.innerHTML : (noteItem.querySelector('.note-desc')?.textContent || '');

  body.querySelectorAll('iframe[data-src]').forEach(iframe => {
    iframe.src = iframe.dataset.src;
  });

  notesOverlay.hidden = false;
  document.body.classList.add('cursor-hidden');
  notesOverlay.querySelector('.notes-overlay-close')?.focus();
}

function closeNoteOverlay() {
  if (!notesOverlay) return;
  notesOverlay.hidden = true;
  document.body.classList.remove('cursor-hidden');
  notesOverlay.querySelectorAll('iframe').forEach(iframe => { iframe.src = ''; });
}

document.querySelectorAll('.note-item').forEach(item => {
  item.addEventListener('click', () => openNoteOverlay(item));
  item.setAttribute('role', 'button');
  item.setAttribute('tabindex', '0');
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openNoteOverlay(item);
    }
  });
});

if (notesOverlay) {
  notesOverlay.querySelector('.notes-overlay-close')?.addEventListener('click', closeNoteOverlay);
  notesOverlay.addEventListener('click', e => {
    if (e.target === notesOverlay) closeNoteOverlay();
  });
}

/* --- Gallery grid click-to-overlay (fallback when 3D not active) --- */
document.querySelectorAll('.world-item').forEach(item => {
  item.addEventListener('click', () => {
    const section = document.getElementById('gallery');
    if (section?.classList.contains('gallery-3d-active')) return;
    const img = item.querySelector('img');
    const overlay = document.getElementById('galleryOverlay');
    if (!img || !overlay) return;
    overlay.querySelector('.gallery-overlay-img').src = img.src.replace(/-\d+\.webp$/, '-1200.webp');
    overlay.querySelector('.gallery-overlay-img').alt = img.alt;
    const infoTitle = overlay.querySelector('.gallery-overlay-info-title');
    const infoArtist = overlay.querySelector('.gallery-overlay-info-artist');
    if (infoTitle) infoTitle.textContent = item.dataset.title || '';
    if (infoArtist) infoArtist.textContent = item.dataset.artist || '';
    overlay.hidden = false;
    document.body.classList.add('cursor-hidden');
    overlay.querySelector('.gallery-overlay-close')?.focus();
  });
});

/* --- Gallery overlay cursor sync via MutationObserver --- */
const galleryOverlay = document.getElementById('galleryOverlay');
if (galleryOverlay) {
  new MutationObserver(() => {
    if (galleryOverlay.hidden) {
      document.body.classList.remove('cursor-hidden');
    } else {
      document.body.classList.add('cursor-hidden');
    }
  }).observe(galleryOverlay, { attributes: true, attributeFilter: ['hidden'] });
}

/* --- Bottom close buttons for overlays (mobile) --- */
document.querySelectorAll('.overlay-bottom-close').forEach(btn => {
  btn.addEventListener('click', () => {
    const overlay = btn.closest('.gallery-overlay, .notes-overlay');
    if (overlay?.id === 'notesOverlay') closeNoteOverlay();
    else if (overlay?.id === 'galleryOverlay') {
      overlay.hidden = true;
      overlay.querySelector('.gallery-overlay-img').src = '';
    }
  });
});

/* --- Contact overlay --- */
const contactOverlay = document.getElementById('contactOverlay');
const contactTrigger = document.querySelector('.contact-trigger');

function openContactOverlay() {
  if (!contactOverlay) return;
  contactOverlay.hidden = false;
  document.body.classList.add('cursor-hidden');
  contactOverlay.querySelector('.contact-overlay-close')?.focus();
}

function closeContactOverlay() {
  if (!contactOverlay) return;
  contactOverlay.hidden = true;
  document.body.classList.remove('cursor-hidden');
}

if (contactTrigger) {
  contactTrigger.addEventListener('click', openContactOverlay);
}

if (contactOverlay) {
  contactOverlay.querySelector('.contact-overlay-close')?.addEventListener('click', closeContactOverlay);
  contactOverlay.addEventListener('click', e => {
    if (e.target === contactOverlay) closeContactOverlay();
  });
}

// Footer contact link also opens the overlay
document.querySelectorAll('a[href="#contact"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    openContactOverlay();
  });
});

/* --- Global Escape key for overlays --- */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (notesOverlay && !notesOverlay.hidden) closeNoteOverlay();
    if (contactOverlay && !contactOverlay.hidden) closeContactOverlay();
  }
});

/* --- Catalog carousel --- */
const carouselTrack = document.querySelector('.catalog-track');
const prevBtn = document.querySelector('.carousel-btn--prev');
const nextBtn = document.querySelector('.carousel-btn--next');

if (carouselTrack && prevBtn && nextBtn) {
  const scrollAmount = () => {
    const card = carouselTrack.querySelector('.catalog-card');
    return card ? card.offsetWidth + 24 : 300;
  };
  
  prevBtn.addEventListener('click', () => carouselTrack.scrollBy({ left: -scrollAmount(), behavior: 'smooth' }));
  nextBtn.addEventListener('click', () => carouselTrack.scrollBy({ left: scrollAmount(), behavior: 'smooth' }));
  
  const updateBtnStates = () => {
    prevBtn.disabled = carouselTrack.scrollLeft <= 0;
    nextBtn.disabled = carouselTrack.scrollLeft + carouselTrack.offsetWidth >= carouselTrack.scrollWidth - 1;
  };
  carouselTrack.addEventListener('scroll', updateBtnStates, { passive: true });
  updateBtnStates();
}

/* --- Hero Audio Player --- */
const heroAudioBtn = document.getElementById('heroAudioBtn');
const heroAudio = document.getElementById('heroAudio');
const heroPlayIcon = heroAudioBtn?.querySelector('.hero-audio-icon.play');
const heroPauseIcon = heroAudioBtn?.querySelector('.hero-audio-icon.pause');
const heroAudioLabel = document.querySelector('.hero-audio-label');

if (heroAudioBtn && heroAudio) {
  // Set volume to 65%
  heroAudio.volume = 0.65;
  
  heroAudioBtn.addEventListener('click', () => {
    if (heroAudio.paused) {
      heroAudio.play();
      heroAudioBtn.classList.add('playing');
      heroPlayIcon.style.display = 'none';
      heroPauseIcon.style.display = 'block';
      if (heroAudioLabel) heroAudioLabel.textContent = 'Playing';
    } else {
      heroAudio.pause();
      heroAudioBtn.classList.remove('playing');
      heroPlayIcon.style.display = 'block';
      heroPauseIcon.style.display = 'none';
      if (heroAudioLabel) heroAudioLabel.textContent = 'Paused';
    }
  });
  
  heroAudio.addEventListener('ended', () => {
    heroAudioBtn.classList.remove('playing');
    heroPlayIcon.style.display = 'block';
    heroPauseIcon.style.display = 'none';
    if (heroAudioLabel) heroAudioLabel.textContent = 'Listen';
  });
}

/* --- Scroll to top --- */
const scrollTopBtn = document.getElementById('scrollTop');
if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* --- Private tagline hover/tap reveal --- */
const privateLogoCta = document.querySelector('.private-logo-cta');
const privateStrip = document.querySelector('.private-strip');
if (privateLogoCta && privateStrip) {
  privateLogoCta.addEventListener('mouseenter', () => privateStrip.classList.add('tagline-open'));
  privateLogoCta.addEventListener('mouseleave', () => privateStrip.classList.remove('tagline-open'));
  privateLogoCta.addEventListener('click', e => {
    if (privateStrip.classList.contains('tagline-open')) return;
    e.preventDefault();
    privateStrip.classList.toggle('tagline-open');
  });
}

/* --- Kindred accordion --- */
const kindredToggle = document.querySelector('.kindred-toggle');
const kindredList = document.querySelector('.kindred-list');
if (kindredToggle && kindredList) {
  kindredToggle.addEventListener('click', () => {
    const open = kindredList.classList.toggle('kindred-list--open');
    kindredToggle.setAttribute('aria-expanded', open);
  });
}

/* --- Web3Forms handler --- */
const RATE_LIMIT_MS = 60000;
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function isRateLimited(formType) {
  const last = localStorage.getItem('lastSubmit_' + formType);
  return last && (Date.now() - parseInt(last)) < RATE_LIMIT_MS;
}

document.querySelectorAll('form[data-form]').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const feedback = form.parentElement.querySelector('.form-feedback');
    const originalText = submitBtn.innerHTML;
    const formType = form.dataset.form;

    // Rate limit check
    if (isRateLimited(formType)) {
      if (feedback) {
        feedback.hidden = false;
        feedback.textContent = 'Please wait a moment before submitting again.';
        feedback.className = 'form-feedback error';
      }
      return;
    }

    // Email validation
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput && !isValidEmail(emailInput.value.trim())) {
      if (feedback) {
        feedback.hidden = false;
        feedback.textContent = 'Please enter a valid email address.';
        feedback.className = 'form-feedback error';
      }
      return;
    }

    // Stamp local time so Web3Forms receives the user's timezone
    const timeField = form.querySelector('.local-time');
    if (timeField) timeField.value = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });

    submitBtn.innerHTML = 'Sending...';
    submitBtn.disabled = true;

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new FormData(form)
      });
      const data = await response.json();

      if (feedback) {
        feedback.hidden = false;
        if (response.ok) {
          feedback.textContent = formType === 'mailing-list'
            ? "You're in. We'll be in touch."
            : 'Message sent. We\'ll get back to you.';
          feedback.className = 'form-feedback success';
          localStorage.setItem('lastSubmit_' + formType, Date.now().toString());
          form.reset();
          if (formType === 'inquiry') {
            setTimeout(() => { if (contactOverlay) closeContactOverlay(); }, 2000);
          }
        } else {
          feedback.textContent = data.message || 'Something went wrong. Try again.';
          feedback.className = 'form-feedback error';
        }
      }
    } catch {
      if (feedback) {
        feedback.hidden = false;
        feedback.textContent = 'Connection error. Please try again.';
        feedback.className = 'form-feedback error';
      }
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
});
