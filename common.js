document.addEventListener('DOMContentLoaded', () => {

  // ===== Hamburger menu =====
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });

    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }

  // ===== Mega menu =====
  const backdrop = document.getElementById('megaBackdrop');
  const dropdownItems = document.querySelectorAll('.nav-item-dropdown');
  let closeTimer = null;

  function openMega(li) {
    clearTimeout(closeTimer);
    // Close any other open dropdown first
    dropdownItems.forEach(item => {
      if (item !== li) {
        item.classList.remove('open');
        const m = item.querySelector('.mega-menu');
        if (m) m.classList.remove('open');
      }
    });
    li.classList.add('open');
    const menu = li.querySelector('.mega-menu');
    if (menu) menu.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
  }

  function closeMega() {
    closeTimer = setTimeout(() => {
      dropdownItems.forEach(item => {
        item.classList.remove('open');
        const m = item.querySelector('.mega-menu');
        if (m) m.classList.remove('open');
      });
      if (backdrop) backdrop.classList.remove('open');
    }, 80);
  }

  dropdownItems.forEach(li => {
    const menu = li.querySelector('.mega-menu');
    li.addEventListener('mouseenter', () => openMega(li));
    li.addEventListener('mouseleave', closeMega);
    if (menu) {
      menu.addEventListener('mouseenter', () => openMega(li));
      menu.addEventListener('mouseleave', closeMega);
    }
  });

  // Close on backdrop click
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      clearTimeout(closeTimer);
      dropdownItems.forEach(item => {
        item.classList.remove('open');
        const m = item.querySelector('.mega-menu');
        if (m) m.classList.remove('open');
      });
      backdrop.classList.remove('open');
    });
  }

  // Auto-detect active nav item based on current page
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  // Direct links (TOP, 掲示板)
  document.querySelectorAll('.nav-links > li > a').forEach(a => {
    if (a.getAttribute('href') === currentFile) {
      a.classList.add('active');
    }
  });
  // Mega-item links → highlight parent trigger
  document.querySelectorAll('.mega-item').forEach(a => {
    const href = (a.getAttribute('href') || '').split('#')[0];
    if (href === currentFile) {
      const parentLi = a.closest('.nav-item-dropdown');
      if (parentLi) {
        const trigger = parentLi.querySelector('.nav-trigger');
        if (trigger) trigger.classList.add('active');
      }
    }
  });

  // ===== Scroll reveal =====
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  if (revealEls.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
  }

  // ===== Nav scroll effect =====
  const navEl = document.querySelector('nav');
  if (navEl) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        navEl.style.background = 'rgba(5,5,15,0.97)';
        navEl.style.boxShadow = '0 4px 30px rgba(0,0,0,0.5)';
      } else {
        navEl.style.background = 'rgba(5,5,15,0.92)';
        navEl.style.boxShadow = 'none';
      }
    }, { passive: true });
  }

});
