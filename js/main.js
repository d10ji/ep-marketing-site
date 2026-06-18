/* ==========================================================
   Easy Prayogshala — Marketing Site JS
   Animations: particles, prayer flags, counters, scroll reveals,
                chart bars, module tabs, navbar, form
   ========================================================== */

(function () {
  'use strict';

  /* ── Utils ─────────────────────────────────────────────── */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  /* ── Navbar scroll behaviour ────────────────────────────── */
  const navbar = $('#navbar');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    highlightActiveNav();
  }, { passive: true });

  /* ── Mobile menu ────────────────────────────────────────── */
  const menuBtn    = $('#menu-btn');
  const mobileMenu = $('#mobile-menu');
  menuBtn.addEventListener('click', function () {
    const open = mobileMenu.classList.toggle('hidden');
    // Flip the hamburger icon to ✕
    menuBtn.innerHTML = open
      ? '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>'
      : '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';
  });

  // Close on mobile link click
  $$('.mobile-link').forEach(function (lnk) {
    lnk.addEventListener('click', function () {
      mobileMenu.classList.add('hidden');
      menuBtn.innerHTML = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>';
    });
  });

  /* ── Smooth scroll for all anchor links ─────────────────── */
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const offset = 72; // navbar height
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });

  /* ── Active nav highlight on scroll ─────────────────────── */
  const sections = $$('section[id]');
  function highlightActiveNav() {
    const y = window.scrollY + 100;
    let current = '';
    sections.forEach(function (s) {
      if (s.offsetTop <= y) current = s.id;
    });
    $$('.nav-link').forEach(function (l) {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  }

  /* ── Prayer flags ───────────────────────────────────────── */
  function buildPrayerFlags() {
    const container = $('#flag-container');
    if (!container) return;
    const colors = ['#003F87', 'rgba(255,255,255,.85)', '#B8001F', '#1a6b1a', '#D4A017'];
    const count = Math.ceil(window.innerWidth / 19) + 6;
    for (let i = 0; i < count; i++) {
      const f = document.createElement('div');
      f.className = 'prayer-flag';
      f.style.background = colors[i % 5];
      container.appendChild(f);
    }
  }
  buildPrayerFlags();
  window.addEventListener('resize', function () {
    const c = $('#flag-container');
    if (c) { c.innerHTML = ''; buildPrayerFlags(); }
  });

  /* ── Canvas Particles ───────────────────────────────────── */
  (function initParticles() {
    const canvas = $('#particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles;

    function resize() {
      W = canvas.width  = canvas.parentElement.offsetWidth;
      H = canvas.height = canvas.parentElement.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function makeParticle() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2.5 + 0.8,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(Math.random() * 0.5 + 0.2),
        alpha: Math.random() * 0.4 + 0.1
      };
    }

    particles = Array.from({ length: 70 }, makeParticle);

    function tick() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -4) {
          p.y = H + 4;
          p.x = Math.random() * W;
        }
        if (p.x < -4) p.x = W + 4;
        if (p.x > W + 4) p.x = -4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,' + p.alpha + ')';
        ctx.fill();
      });
      requestAnimationFrame(tick);
    }
    tick();
  })();

  /* ── Scroll Reveal (Intersection Observer) ──────────────── */
  const revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal-up, .reveal-left, .reveal-right, .reveal-fade').forEach(function (el) {
    revealObs.observe(el);
  });

  /* ── Animated Counters ──────────────────────────────────── */
  function animateCounter(el, target, suffix, duration) {
    let start = null;
    function step(ts) {
      if (!start) start = ts;
      const progress = clamp((ts - start) / duration, 0, 1);
      const val = Math.floor(easeOut(progress) * target);
      // Format large numbers
      let display = val >= 1000 ? Math.floor(val / 1000) + 'K' : String(val);
      el.textContent = display + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const counterObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const item = entry.target;
      const numEl = item.querySelector('.stat-num');
      const target = parseInt(item.dataset.target, 10);
      const suffix = item.dataset.suffix || '';
      animateCounter(numEl, target, suffix, 1800);
      counterObs.unobserve(item);
    });
  }, { threshold: 0.5 });

  $$('.stat-item[data-target]').forEach(function (el) { counterObs.observe(el); });

  /* ── Module Tabs ────────────────────────────────────────── */
  const tabBtns   = $$('.mod-tab');
  const tabPanels = $$('.mod-panel');

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const id = btn.dataset.tab;
      tabBtns.forEach(function (b)   { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
      tabPanels.forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const panel = $('#tab-' + id);
      if (panel) {
        panel.classList.add('active');
        // Animate funnel bars when patient-report tab opens
        if (id === 'patient-report') animatePfBars(panel);
      }
    });
  });

  function animatePfBars(panel) {
    $$('.pf-bar', panel).forEach(function (b) {
      b.style.width = '0';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          b.style.width = b.style.getPropertyValue('--pw') || getComputedStyle(b).getPropertyValue('--pw');
        });
      });
    });
  }

  /* ── Dashboard filter tabs ──────────────────────────────── */
  $$('.fd-f').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $$('.fd-f').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });

  /* ── Animate Dashboard bars on scroll ───────────────────── */
  function animateRevBars() {
    $$('.fd-rb').forEach(function (bar) {
      bar.style.height = '0';
      setTimeout(function () {
        const h = bar.style.getPropertyValue('--rh');
        bar.style.transition = 'height 1.2s cubic-bezier(0.4,0,0.2,1)';
        bar.style.height = h || '0';
      }, 100);
    });
  }

  function animateFunnelBars(container) {
    $$(container + ' .fd-wf-b').forEach(function (bar) {
      bar.style.width = '0';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          const fw = getComputedStyle(bar).getPropertyValue('--fw').trim();
          const maxW = parseFloat(fw) / 100;
          bar.style.maxWidth = (maxW * 100) + '%';
          bar.style.width = (maxW * 100) + '%';
        });
      });
    });
  }

  function animateInvBars() {
    $$('.fd-inv-b').forEach(function (bar) {
      bar.style.width = '0';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          bar.style.transition = 'width 1.2s cubic-bezier(0.4,0,0.2,1)';
          const iw = getComputedStyle(bar).getPropertyValue('--iw').trim();
          bar.style.width = iw;
        });
      });
    });
  }

  const dashObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      animateRevBars();
      animateFunnelBars('.fd-funnel-card');
      animateInvBars();
      dashObs.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  const dashEl = $('#dashboard');
  if (dashEl) dashObs.observe(dashEl);

  /* ── Animate hero dashboard card bars ───────────────────── */
  setTimeout(function () {
    $$('.dc-bar').forEach(function (bar) {
      bar.style.height = '0';
      setTimeout(function () {
        bar.style.transition = 'height 1s cubic-bezier(0.4,0,0.2,1)';
        bar.style.height = bar.style.getPropertyValue('--h');
      }, 500 + Math.random() * 400);
    });
  }, 800);

  /* ── Animate funnel / wf bars when they enter view ──────── */
  function setupWidthAnims() {
    // Module funnel bars (.pf-bar)
    const pfObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        $$('.pf-bar', entry.target).forEach(function (bar) {
          bar.style.width = '0';
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              bar.style.transition = 'width 1s cubic-bezier(0.4,0,0.2,1)';
              const pw = getComputedStyle(bar).getPropertyValue('--pw').trim();
              bar.style.width = pw;
            });
          });
        });
        pfObs.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    const pfSection = $('#tab-patient-report');
    if (pfSection) pfObs.observe(pfSection);

    // WF funnel bars in dashboard
    const wfObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        $$('.fd-wf-b', entry.target).forEach(function (bar) {
          const fw = getComputedStyle(bar).getPropertyValue('--fw').trim() || '100%';
          bar.style.maxWidth = fw;
          bar.style.width = '0';
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              bar.style.transition = 'width 1.3s cubic-bezier(0.4,0,0.2,1)';
              bar.style.width = fw;
            });
          });
        });
        wfObs.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    const wfEl = $('#wf-bars');
    if (wfEl) wfObs.observe(wfEl);

    // Investigation bars
    const invObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        $$('.fd-inv-b', entry.target).forEach(function (bar, i) {
          bar.style.width = '0';
          setTimeout(function () {
            bar.style.transition = 'width 1s cubic-bezier(0.4,0,0.2,1)';
            const iw = getComputedStyle(bar).getPropertyValue('--iw').trim();
            bar.style.width = iw;
          }, i * 120);
        });
        invObs.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    const invEl = $('#inv-bars');
    if (invEl) invObs.observe(invEl);

    // Revenue bars
    const revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        $$('.fd-rb', entry.target).forEach(function (bar, i) {
          bar.style.height = '0';
          setTimeout(function () {
            bar.style.transition = 'height 1s cubic-bezier(0.4,0,0.2,1)';
            const rh = getComputedStyle(bar).getPropertyValue('--rh').trim();
            bar.style.height = rh;
          }, i * 80);
        });
        revObs.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    const revEl = $('#rev-bars');
    if (revEl) revObs.observe(revEl);
  }
  setupWidthAnims();

  /* ── Hero type-writer effect (optional polish) ──────────── */
  const heroAccent = document.querySelector('.hero-accent');
  if (heroAccent) {
    const phrases = ['Lab Management', 'LIMS Software', 'Lab Solution'];
    let pi = 0, ci = 0, deleting = false;
    function typeWriter() {
      const phrase = phrases[pi % phrases.length];
      if (!deleting) {
        heroAccent.textContent = phrase.slice(0, ci + 1);
        ci++;
        if (ci === phrase.length) {
          deleting = true;
          setTimeout(typeWriter, 2000);
          return;
        }
      } else {
        heroAccent.textContent = phrase.slice(0, ci - 1);
        ci--;
        if (ci === 0) {
          deleting = false;
          pi++;
        }
      }
      setTimeout(typeWriter, deleting ? 60 : 100);
    }
    setTimeout(typeWriter, 2500);
  }

  /* ── Contact form ───────────────────────────────────────── */
  const form   = $('#demo-form');
  const formOk = $('#form-ok');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = form.querySelector('.form-btn');
      btn.textContent = 'Sending…';
      btn.disabled = true;
      // Simulate async submit (replace with real endpoint)
      setTimeout(function () {
        formOk.classList.remove('hidden');
        form.reset();
        btn.textContent = 'Request Sent ✓';
        btn.style.background = '#16a34a';
      }, 1200);
    });
  }

  /* ── Parallax on scroll for mountains ───────────────────── */
  const mtFront = document.querySelector('.mt-front');
  const mtMid   = document.querySelector('.mt-mid');
  const mtBack  = document.querySelector('.mt-back');
  window.addEventListener('scroll', function () {
    const y = window.scrollY;
    if (y > 600) return; // only while hero is visible
    if (mtFront) mtFront.style.transform = 'translateY(' + (y * 0.06) + 'px)';
    if (mtMid)   mtMid.style.transform   = 'translateY(' + (y * 0.04) + 'px)';
    if (mtBack)  mtBack.style.transform  = 'translateY(' + (y * 0.02) + 'px)';
  }, { passive: true });

  /* ── Stagger reveal for children of a section ───────────── */
  $$('.grid .feat-card, .grid .step-card, .grid .testi-card').forEach(function (el, i) {
    el.style.setProperty('--d', (i * 0.06) + 's');
  });

  /* ── Init call ──────────────────────────────────────────── */
  highlightActiveNav();

})();
