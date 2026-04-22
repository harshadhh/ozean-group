/* ============================================================
   OZEAN GROUPS — MAIN SCRIPT
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- LOADER ----
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
  }, 1800);
  document.body.style.overflow = 'hidden';

  // ---- NAV SCROLL ----
  const nav = document.querySelector('nav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---- HAMBURGER / MOBILE MENU ----
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });
  mobileMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ---- HERO SLIDER ----
  const slides = document.querySelectorAll('.hero-slide');
  const indicators = document.querySelectorAll('.indicator');
  let current = 0;
  let sliderInterval;

  const goToSlide = (idx) => {
    slides[current].classList.remove('active');
    indicators[current].classList.remove('active');
    current = idx;
    slides[current].classList.add('active');
    indicators[current].classList.add('active');
    // Re-trigger zoom on new slide
    const img = slides[current].querySelector('img');
    img.style.animation = 'none';
    img.offsetHeight; // reflow
    img.style.animation = '';
  };

  const nextSlide = () => goToSlide((current + 1) % slides.length);

  const startSlider = () => {
    sliderInterval = setInterval(nextSlide, 5000);
  };

  indicators.forEach((ind, i) => {
    ind.addEventListener('click', () => {
      clearInterval(sliderInterval);
      goToSlide(i);
      startSlider();
    });
  });

  if (slides.length > 0) {
    slides[0].classList.add('active');
    indicators[0]?.classList.add('active');
    startSlider();
  }

  // ---- SCROLL REVEAL ----
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  // ---- ABOUT IMAGE REVEAL ----
  const aboutVisual = document.querySelector('.about-visual');
  if (aboutVisual) {
    const aboutObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          aboutObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    aboutObserver.observe(aboutVisual);
  }

  // ---- TESTIMONIALS CAROUSEL ----
  const track = document.querySelector('.testimonials-track');
  const cards = document.querySelectorAll('.testimonial-card');
  const prevBtn = document.querySelector('.t-btn.prev');
  const nextBtn = document.querySelector('.t-btn.next');
  let tCurrent = 0;

  const updateCarousel = () => {
    const cardWidth = cards[0]?.offsetWidth || 0;
    const gap = 32;
    track.style.transform = `translateX(-${tCurrent * (cardWidth + gap)}px)`;
  };

  prevBtn?.addEventListener('click', () => {
    tCurrent = Math.max(0, tCurrent - 1);
    updateCarousel();
  });
  nextBtn?.addEventListener('click', () => {
    tCurrent = Math.min(cards.length - 1, tCurrent + 1);
    updateCarousel();
  });
  window.addEventListener('resize', updateCarousel);

  // Touch/swipe for testimonials
  let touchStartX = 0;
  track?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track?.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextBtn?.click();
      else prevBtn?.click();
    }
  });

  // ---- COUNTER ANIMATION ----
  const counters = document.querySelectorAll('[data-count]');
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        let start = 0;
        const duration = 1800;
        const step = Math.ceil(target / (duration / 16));
        const timer = setInterval(() => {
          start = Math.min(start + step, target);
          el.textContent = prefix + start + suffix;
          if (start >= target) clearInterval(timer);
        }, 16);
        countObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => countObserver.observe(c));

  // ---- FLOATING WA PULSE ----
  const waFloat = document.querySelector('.wa-float');
  if (waFloat) {
    setTimeout(() => {
      waFloat.style.animation = 'waPulse 2s ease-in-out 3';
    }, 4000);
  }

});

// CSS animation for WA pulse (injected via JS)
const style = document.createElement('style');
style.textContent = `
  @keyframes waPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(196,164,124,0.4); }
    50% { box-shadow: 0 0 0 12px rgba(196,164,124,0); }
  }
`;
document.head.appendChild(style);
