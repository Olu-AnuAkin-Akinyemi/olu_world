import { initFlowField } from './canvas.js';

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

document.querySelectorAll('a, button, .track-item, .catalog-card, .world-item, .sync-card, .note-item').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

/* --- Sticky nav --- */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* --- Theme toggle --- */
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

/* --- Video Mute Toggle (Sacred) --- */
const sacredVideo = document.getElementById('sacredVideo');
const sacredMuteBtn = document.getElementById('sacredMuteBtn');
const sacredMutedIcon = sacredMuteBtn?.querySelector('.mute-icon.muted');
const sacredUnmutedIcon = sacredMuteBtn?.querySelector('.mute-icon.unmuted');

if (sacredVideo && sacredMuteBtn) {
  sacredMuteBtn.addEventListener('click', () => {
    if (sacredVideo.muted) {
      sacredVideo.muted = false;
      sacredVideo.volume = 0.65;
      sacredMuteBtn.classList.add('unmuted');
      sacredMuteBtn.setAttribute('aria-label', 'Mute video');
      sacredMutedIcon.style.display = 'none';
      sacredUnmutedIcon.style.display = 'block';
    } else {
      sacredVideo.muted = true;
      sacredMuteBtn.classList.remove('unmuted');
      sacredMuteBtn.setAttribute('aria-label', 'Unmute video');
      sacredMutedIcon.style.display = 'block';
      sacredUnmutedIcon.style.display = 'none';
    }
  });
}

// Initialize canvas flow field
document.addEventListener('DOMContentLoaded', () => {
  initFlowField();
});
