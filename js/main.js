/* ===========================
   RW Capital & Strategy — JS
   =========================== */

// === NAV SCROLL ===
const nav = document.getElementById('main-nav');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

window.addEventListener('scroll', () => {
  if (window.scrollY > 30) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
}, { passive: true });

// === HAMBURGER ===
hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navMenu.classList.toggle('open');
  document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
});

// Close menu when a link is clicked (mobile)
navMenu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger?.classList.remove('open');
    navMenu?.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// === MOBILE DROPDOWNS ===
document.querySelectorAll('.nav__item--has-dropdown').forEach(item => {
  const link = item.querySelector('.nav__link');
  link?.addEventListener('click', e => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      item.classList.toggle('open');
    }
  });
});

// === TABS ===
function initTabs() {
  document.querySelectorAll('[data-tab-group]').forEach(group => {
    const btns     = group.querySelectorAll('.tab-btn');
    const panels   = group.querySelectorAll('.tab-panel');
    const groupKey = group.dataset.tabGroup;

    btns.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        panels[i]?.classList.add('active');
        const id = btn.dataset.tab;
        if (id) history.replaceState(null, '', '#' + id);
      });
    });

    // Open from URL hash
    const hash = location.hash.slice(1);
    if (hash) {
      const target = group.querySelector(`[data-tab="${hash}"]`);
      if (target) {
        target.click();
        // Scroll to tab bar after panel becomes visible
        requestAnimationFrame(() => {
          const stickyBar = group.closest('[style*="sticky"]') || group.parentElement;
          if (stickyBar) {
            const top = stickyBar.getBoundingClientRect().top + window.scrollY - 90;
            window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
          }
        });
      }
    }
  });
}

// === CONTACT FORM ===
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('[type=submit]');
    const success = document.getElementById('form-success');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    setTimeout(() => {
      btn.textContent = 'Message Sent ✓';
      btn.style.background = '#166534';
      btn.style.color = '#fff';
      if (success) success.classList.add('show');
      form.reset();
    }, 900);
  });
}

// === SCROLL ANIMATIONS ===
function initAnimations() {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  els.forEach(el => io.observe(el));
}

// === ACTIVE NAV LINK ===
function setActiveNav() {
  const path = window.location.pathname;
  const file = path.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = (link.getAttribute('href') || '').split('#')[0];
    if (href && href !== '#' && file === href) link.classList.add('active');
    if (file === 'index.html' && (href === 'index.html' || href === '')) link.classList.add('active');
  });
}

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
  // Solid nav on inner pages
  if (!document.body.classList.contains('page-home')) {
    nav?.classList.add('solid');
  }
  initTabs();
  initContactForm();
  initAnimations();
  setActiveNav();
});
