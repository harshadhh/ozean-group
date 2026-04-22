/* ============================================================
   OZEAN GROUPS — INNER PAGES SCRIPT
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- NAV SCROLL ----
  const nav = document.querySelector('nav');
  nav?.classList.add('scrolled'); // Inner pages start scrolled
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // ---- HAMBURGER ----
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu?.classList.toggle('open');
    document.body.style.overflow = mobileMenu?.classList.contains('open') ? 'hidden' : '';
  });
  mobileMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('active');
      mobileMenu?.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ---- SCROLL REVEAL ----
  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => observer.observe(el));

  // ---- COUNTER ANIMATION ----
  document.querySelectorAll('[data-count]').forEach(el => {
    const countObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(el.dataset.count);
          const suffix = el.dataset.suffix || '';
          let val = 0;
          const step = Math.ceil(target / (1600 / 16));
          const timer = setInterval(() => {
            val = Math.min(val + step, target);
            el.textContent = val + suffix;
            if (val >= target) clearInterval(timer);
          }, 16);
          countObs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    countObs.observe(el);
  });

  // ---- GALLERY FILTER ----
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      galleryItems.forEach(item => {
        const match = cat === 'all' || item.dataset.cat === cat;
        item.style.opacity = match ? '1' : '0.25';
        item.style.pointerEvents = match ? 'auto' : 'none';
        item.style.transition = 'opacity 0.4s';
      });
    });
  });

  // ---- BEFORE / AFTER SLIDER ----
  document.querySelectorAll('.ba-wrapper').forEach(wrapper => {
    const before = wrapper.querySelector('.ba-before');
    const divider = wrapper.querySelector('.ba-divider');
    if (!before || !divider) return;

    let dragging = false;

    const setPos = (x) => {
      const rect = wrapper.getBoundingClientRect();
      let pct = ((x - rect.left) / rect.width) * 100;
      pct = Math.max(5, Math.min(95, pct));
      before.style.width = pct + '%';
      divider.style.left = pct + '%';
    };

    wrapper.addEventListener('mousedown', e => { dragging = true; setPos(e.clientX); });
    window.addEventListener('mousemove', e => { if (dragging) setPos(e.clientX); });
    window.addEventListener('mouseup', () => { dragging = false; });

    wrapper.addEventListener('touchstart', e => {
      dragging = true;
      setPos(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchmove', e => {
      if (dragging) setPos(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchend', () => { dragging = false; });
  });

  // ---- CONTACT FORM ----
  const form = document.getElementById('consultForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('.btn-submit');
      const success = document.querySelector('.form-success');
      btn.classList.add('loading');
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

      // Simulate send (replace with EmailJS / Formspree)
      await new Promise(r => setTimeout(r, 1800));

      form.style.display = 'none';
      success?.classList.add('show');
    });
  }

  // ---- LIGHTBOX (simple) ----
  const gallItemsClick = document.querySelectorAll('.gallery-item[data-img]');
  if (gallItemsClick.length) {
    const lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.style.cssText = `position:fixed;inset:0;background:rgba(26,29,32,0.97);z-index:9998;
      display:none;align-items:center;justify-content:center;padding:2rem;cursor:zoom-out;`;
    lb.innerHTML = `<img id="lb-img" style="max-height:90vh;max-width:90vw;object-fit:contain;" alt=""/>
      <button id="lb-close" style="position:absolute;top:1.5rem;right:1.5rem;color:#fff;font-size:1.5rem;
      background:none;border:none;cursor:pointer;" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>`;
    document.body.appendChild(lb);

    const lbImg = lb.querySelector('#lb-img');
    gallItemsClick.forEach(item => {
      item.addEventListener('click', () => {
        lbImg.src = item.dataset.img;
        lb.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      });
    });
    lb.addEventListener('click', (e) => {
      if (e.target === lb || e.target.closest('#lb-close')) {
        lb.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && lb.style.display === 'flex') {
        lb.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
  }

  // ---- ABOUT VISUAL REVEAL ----
  document.querySelectorAll('.about-visual').forEach(el => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.2 });
    obs.observe(el);
  });

});
