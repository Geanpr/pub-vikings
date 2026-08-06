/* ============================================================================
   VIKINGS NIGHT · ST. JOHN'S IRISH PUB
   script.js — JavaScript Vanilla, modular, sem dependências
   ----------------------------------------------------------------------------
   MÓDULOS
   01. Utilitários
   03. Cursor personalizado (machado)
   04. Header + navegação mobile + link ativo
   05. Parallax e luz volumétrica (rAF único)
   06. Reveal on scroll (Intersection Observer)
   07. Contadores animados
   08. Timeline progressiva
   09. FAQ acordeão acessível
   10. Cards — glow que segue o mouse + tilt 3D
   11. Brasas em canvas (partículas)
   12. Diversos (ano, imagens ausentes, sticky CTA, âncoras)
   ========================================================================== */

(function () {
  'use strict';

  /* ==========================================================
     00. CONFIGURAÇÃO — É AQUI QUE VOCÊ MEXE
     ----------------------------------------------------------
     Cole entre as aspas o link do checkout da plataforma de
     ingressos. Todos os botões de compra do site passam a
     apontar para ele automaticamente e abrem em nova aba.

     Deixando vazio (''), os botões apenas rolam a página até
     a seção final, como estão hoje.
     ========================================================== */
  const LINK_INGRESSOS = 'https://www.sympla.com.br/evento/noite-dos-vikings-no-st-johns/3531587';

  /* ==========================================================
     01. UTILITÁRIOS
     ========================================================== */
  const $  = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.prototype.slice.call((ctx || document).querySelectorAll(sel));

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const lerp  = (a, b, t) => a + (b - a) * t;

  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }


  /* ==========================================================
     03. CURSOR PERSONALIZADO (MACHADO)
     ========================================================== */
  const Cursor = (function () {
    const axe = $('#cursor');
    const ring = $('#cursorDot');
    let mx = -100, my = -100, rx = -100, ry = -100, raf = null;

    const HOVERABLE = 'a, button, .card, .faq__q, .stat, .chip, [data-hover]';

    function render() {
      rx = lerp(rx, mx, 0.18);
      ry = lerp(ry, my, 0.18);
      if (axe)  axe.style.transform  = 'translate3d(' + mx + 'px,' + my + 'px,0) rotate(-18deg)';
      if (ring) ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
      raf = requestAnimationFrame(render);
    }

    function init() {
      if (!FINE_POINTER || REDUCED || !axe || !ring) return;
      document.body.classList.add('has-cursor');

      document.addEventListener('mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        if (!axe.classList.contains('is-active')) {
          axe.classList.add('is-active');
          ring.classList.add('is-active');
          rx = mx; ry = my;
        }
      }, { passive: true });

      document.addEventListener('mouseleave', () => {
        axe.classList.remove('is-active');
        ring.classList.remove('is-active');
      });

      document.addEventListener('mouseover', (e) => {
        const hit = e.target.closest && e.target.closest(HOVERABLE);
        axe.classList.toggle('is-hover', !!hit);
        ring.classList.toggle('is-hover', !!hit);
      }, { passive: true });

      document.addEventListener('mousedown', (e) => {
        axe.classList.add('is-down');
        // Onda metálica
        const ripple = document.createElement('span');
        ripple.className = 'click-ring';
        ripple.style.left = e.clientX + 'px';
        ripple.style.top  = e.clientY + 'px';
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 620);
      });
      document.addEventListener('mouseup', () => {
        setTimeout(() => axe.classList.remove('is-down'), 320);
      });

      render();
    }

    return { init: init };
  })();


  /* ==========================================================
     04. HEADER · NAV MOBILE · LINK ATIVO
     ========================================================== */
  const Header = (function () {
    const header = $('#header');
    const burger = $('#burger');
    const nav    = $('#nav');
    const links  = $$('.nav__list a');
    const sections = links
      .map(a => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);

    function closeNav() {
      if (!nav) return;
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Abrir menu');
      document.body.classList.remove('nav-open');
    }

    function toggleNav() {
      const open = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      document.body.classList.toggle('nav-open', open);
    }

    function onScroll(y) {
      if (header) header.classList.toggle('is-stuck', y > 60);

      // Link ativo
      let currentId = null;
      const probe = y + window.innerHeight * 0.35;
      sections.forEach(sec => {
        if (sec.offsetTop <= probe) currentId = sec.id;
      });
      links.forEach(a => {
        a.classList.toggle('is-current', a.getAttribute('href') === '#' + currentId);
      });
    }

    function init() {
      if (burger) burger.addEventListener('click', toggleNav);
      links.forEach(a => a.addEventListener('click', closeNav));
      const navCta = $('.nav__cta');
      if (navCta) navCta.addEventListener('click', closeNav);
      document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });
      window.addEventListener('resize', () => { if (window.innerWidth > 900) closeNav(); });
    }

    return { init: init, onScroll: onScroll };
  })();


  /* ==========================================================
     05. PARALLAX + LUZ VOLUMÉTRICA (loop único de rAF)
     ========================================================== */
  const Motion = (function () {
    const layers = $$('[data-parallax]');
    const lights = $$('[data-light]');
    let ticking = false;
    let lastY = 0;

    function update() {
      const y = lastY;
      const vh = window.innerHeight;

      if (!REDUCED) {
        layers.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.bottom < -200 || rect.top > vh + 200) return;
          const speed = parseFloat(el.dataset.parallax) || 0.1;
          const offset = (rect.top + rect.height / 2 - vh / 2) * speed;
          el.style.transform = 'translate3d(0,' + (-offset).toFixed(2) + 'px,0)';
        });

        lights.forEach(el => {
          const parent = el.parentElement;
          const rect = parent.getBoundingClientRect();
          const p = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
          el.style.transform = 'translate(-50%,' + (p * rect.height - 200).toFixed(1) + 'px)';
        });
      }

      Header.onScroll(y);
      Timeline.onScroll();
      StickyCTA.onScroll(y);

      ticking = false;
    }

    function onScroll() {
      lastY = window.pageYOffset || document.documentElement.scrollTop;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    function init() {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      onScroll();
    }

    return { init: init, update: update };
  })();


  /* ==========================================================
     06. REVEAL ON SCROLL
     ========================================================== */
  const Reveal = (function () {
    function init() {
      const items = $$('.reveal');
      if (!items.length) return;

      if (REDUCED || !('IntersectionObserver' in window)) {
        items.forEach(el => el.classList.add('is-visible'));
        return;
      }

      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = parseInt(el.dataset.delay || '0', 10);
          setTimeout(() => el.classList.add('is-visible'), delay);
          obs.unobserve(el);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

      items.forEach(el => io.observe(el));
    }
    return { init: init };
  })();


  /* ==========================================================
     07. CONTADORES ANIMADOS
     ========================================================== */
  const Counters = (function () {
    function animate(el) {
      const target = parseFloat(el.dataset.count) || 0;
      const pad    = parseInt(el.dataset.pad || '0', 10);
      const suffix = el.dataset.suffix || '';
      const dur    = 1700;
      const start  = performance.now();

      function frame(now) {
        const t = clamp((now - start) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - t, 3);          // easeOutCubic
        let val = Math.round(target * eased);
        let str = String(val);
        if (pad) while (str.length < pad) str = '0' + str;
        el.textContent = str + suffix;
        if (t < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    function init() {
      const nums = $$('[data-count]');
      if (!nums.length) return;

      if (REDUCED || !('IntersectionObserver' in window)) {
        nums.forEach(el => {
          const pad = parseInt(el.dataset.pad || '0', 10);
          let s = String(el.dataset.count);
          while (s.length < pad) s = '0' + s;
          el.textContent = s + (el.dataset.suffix || '');
        });
        return;
      }

      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          animate(e.target);
          obs.unobserve(e.target);
        });
      }, { threshold: 0.5 });

      nums.forEach(el => io.observe(el));
    }

    return { init: init };
  })();


  /* ==========================================================
     08. TIMELINE PROGRESSIVA
     ========================================================== */
  const Timeline = (function () {
    let steps = [], progressEl = null, wrap = null;

    function init() {
      wrap = $('#timeline');
      if (!wrap) return;
      steps = $$('.tl-step', wrap);
      progressEl = $('#timelineProgress');
      onScroll();
    }

    function onScroll() {
      if (!wrap || !steps.length) return;
      const vh = window.innerHeight;
      let lit = 0;

      steps.forEach(step => {
        const r = step.getBoundingClientRect();
        const isLit = r.top < vh * 0.72;
        step.classList.toggle('is-lit', isLit);
        if (isLit) lit++;
      });

      if (progressEl) {
        const pct = (lit / steps.length) * 100;
        progressEl.style.width = pct + '%';
      }
    }

    return { init: init, onScroll: onScroll };
  })();


  /* ==========================================================
     09. FAQ ACORDEÃO
     ========================================================== */
  const Faq = (function () {
    function close(item) {
      const btn = $('.faq__q', item);
      const panel = $('.faq__a', item);
      item.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      panel.style.height = panel.scrollHeight + 'px';
      requestAnimationFrame(() => { panel.style.height = '0px'; });
    }

    function open(item) {
      const btn = $('.faq__q', item);
      const panel = $('.faq__a', item);
      const inner = $('.faq__a-inner', panel);
      item.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      panel.style.height = inner.offsetHeight + 'px';
      panel.addEventListener('transitionend', function handler(e) {
        if (e.propertyName !== 'height') return;
        if (item.classList.contains('is-open')) panel.style.height = 'auto';
        panel.removeEventListener('transitionend', handler);
      });
    }

    function init() {
      const list = $('#faqList');
      if (!list) return;
      const items = $$('.faq__item', list);

      items.forEach(item => {
        const btn = $('.faq__q', item);
        btn.addEventListener('click', () => {
          const isOpen = item.classList.contains('is-open');
          items.forEach(other => { if (other !== item && other.classList.contains('is-open')) close(other); });
          isOpen ? close(item) : open(item);
        });
      });

      // Navegação por setas entre perguntas
      const buttons = items.map(i => $('.faq__q', i));
      buttons.forEach((btn, i) => {
        btn.addEventListener('keydown', e => {
          let next = null;
          if (e.key === 'ArrowDown') next = buttons[(i + 1) % buttons.length];
          if (e.key === 'ArrowUp')   next = buttons[(i - 1 + buttons.length) % buttons.length];
          if (e.key === 'Home')      next = buttons[0];
          if (e.key === 'End')       next = buttons[buttons.length - 1];
          if (next) { e.preventDefault(); next.focus(); }
        });
      });

      window.addEventListener('resize', () => {
        items.forEach(item => {
          if (item.classList.contains('is-open')) $('.faq__a', item).style.height = 'auto';
        });
      }, { passive: true });
    }

    return { init: init };
  })();


  /* ==========================================================
     10. CARDS — GLOW QUE SEGUE O MOUSE + TILT 3D
     ========================================================== */
  const Cards = (function () {
    function init() {
      if (!FINE_POINTER || REDUCED) return;
      $$('.card.tilt').forEach(card => {
        card.addEventListener('mousemove', e => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
          card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
          const rotY = (px - 0.5) * 8;
          const rotX = (0.5 - py) * 8;
          card.style.transform =
            'translateY(-10px) perspective(900px) rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg)';
        }, { passive: true });

        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
      });
    }
    return { init: init };
  })();


  /* ==========================================================
     11. BRASAS EM CANVAS
     ========================================================== */
  const Embers = (function () {
    const instances = [];

    function create(canvas, opts) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const cfg = Object.assign({ count: 46, speed: 1, size: 2.2, glow: true }, opts || {});
      let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
      let particles = [];
      let visible = false;

      function resize() {
        const r = canvas.getBoundingClientRect();
        w = r.width; h = r.height;
        canvas.width  = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      function spawn(initial) {
        return {
          x: Math.random() * w,
          y: initial ? Math.random() * h : h + Math.random() * 40,
          r: Math.random() * cfg.size + 0.6,
          vy: -(Math.random() * 0.55 + 0.22) * cfg.speed,
          vx: (Math.random() - 0.5) * 0.34,
          life: 0,
          maxLife: Math.random() * 260 + 180,
          hue: Math.random() > 0.7 ? 42 : 32,
          alpha: Math.random() * 0.55 + 0.25,
          drift: Math.random() * Math.PI * 2
        };
      }

      function build() {
        particles = [];
        const n = Math.round(cfg.count * clamp(w / 1200, 0.45, 1.5));
        for (let i = 0; i < n; i++) particles.push(spawn(true));
      }

      function draw() {
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.life++;
          p.drift += 0.014;
          p.x += p.vx + Math.sin(p.drift) * 0.32;
          p.y += p.vy;

          const fade = 1 - p.life / p.maxLife;
          if (p.life > p.maxLife || p.y < -20) { particles[i] = spawn(false); continue; }

          const a = p.alpha * clamp(fade, 0, 1);
          ctx.beginPath();
          ctx.fillStyle = 'hsla(' + p.hue + ', 88%, ' + (55 + p.r * 4) + '%, ' + a + ')';
          if (cfg.glow) {
            ctx.shadowBlur = 12 + p.r * 3;
            ctx.shadowColor = 'rgba(255,170,60,' + (a * 0.85) + ')';
          }
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      resize();
      build();

      return {
        canvas: canvas,
        resize: function () { resize(); build(); },
        tick: function () { if (visible) draw(); },
        setVisible: function (v) { visible = v; if (!v) ctx.clearRect(0, 0, w, h); }
      };
    }

    let running = false;
    function loop() {
      instances.forEach(i => i.tick());
      if (running) requestAnimationFrame(loop);
    }

    function init() {
      if (REDUCED) return;

      // Aparelho modesto / tela pequena: menos partículas e sem shadowBlur,
      // que é de longe a operação mais cara do canvas.
      const LIGHT = window.innerWidth < 900 ||
                    (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
                    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

      const defs = LIGHT ? [
        { id: 'embersHero',  opts: { count: 18, speed: 1,    size: 2.2, glow: false } },
        { id: 'embersFinal', opts: { count: 22, speed: 1.15, size: 2.4, glow: false } }
      ] : [
        { id: 'embersHero',  opts: { count: 54, speed: 1,   size: 2.4 } },
        { id: 'embersCards', opts: { count: 26, speed: .75, size: 1.8, glow: false } },
        { id: 'embersFinal', opts: { count: 72, speed: 1.25, size: 2.8 } }
      ];

      defs.forEach(d => {
        const cv = document.getElementById(d.id);
        if (!cv) return;
        const inst = create(cv, d.opts);
        if (inst) instances.push(inst);
      });

      if (!instances.length) return;

      // Pausa quando fora da viewport (performance)
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(entries => {
          entries.forEach(e => {
            const inst = instances.find(i => i.canvas === e.target);
            if (inst) inst.setVisible(e.isIntersecting);
          });
        }, { threshold: 0 });
        instances.forEach(i => io.observe(i.canvas));
      } else {
        instances.forEach(i => i.setVisible(true));
      }

      let rt = null;
      window.addEventListener('resize', () => {
        clearTimeout(rt);
        rt = setTimeout(() => instances.forEach(i => i.resize()), 180);
      }, { passive: true });

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) { running = false; }
        else if (!running) { running = true; loop(); }
      });

      running = true;
      loop();
    }

    return { init: init };
  })();


  /* ==========================================================
     12. DIVERSOS
     ========================================================== */
  const StickyCTA = (function () {
    const el = $('#stickyCta');
    const final = $('#ingressos');

    function onScroll(y) {
      if (!el) return;
      const past = y > window.innerHeight * 0.85;
      const inFinal = final ? final.getBoundingClientRect().top < window.innerHeight * 0.8 : false;
      el.classList.toggle('is-visible', past && !inFinal);
    }
    return { onScroll: onScroll };
  })();

  const Misc = (function () {
    function init() {
      // Aplica o link de compra em todos os botões marcados com data-cta
      if (LINK_INGRESSOS) {
        $$('a[data-cta]').forEach(a => {
          a.href = LINK_INGRESSOS;
          a.target = '_blank';
          a.rel = 'noopener';
        });
      }

      // Ano no rodapé
      const y = $('#year');
      if (y) y.textContent = new Date().getFullYear();

      // Hero: revela a foto só quando ela termina de baixar (fade sobre o placeholder)
      const heroBg = $('.hero__bg');
      if (heroBg) {
        const reveal = () => heroBg.classList.add('is-ready');
        const src = (getComputedStyle(heroBg).backgroundImage || '').match(/url\(["']?(.*?)["']?\)/);
        if (src && src[1] && src[1] !== 'none') {
          const probe = new Image();
          probe.onload = reveal;
          probe.onerror = () => {
            // Conversor indisponível: cai para a imagem original do servidor
            const fb = heroBg.dataset.fallback;
            if (fb && !heroBg.dataset.fellBack) {
              heroBg.dataset.fellBack = '1';
              heroBg.style.setProperty('--img', "url('" + fb + "')");
              const again = new Image();
              again.onload = reveal;
              again.onerror = reveal;
              again.src = fb;
            } else { reveal(); }
          };
          probe.src = src[1];
          if (probe.complete) reveal();
          setTimeout(reveal, 8000); // rede ruim: não deixa o Hero sem imagem para sempre
        } else {
          reveal();
        }
      }

      // Placeholder elegante quando a imagem real ainda não existe
      $$('img[data-img]').forEach(img => {
        img.addEventListener('error', () => img.classList.add('is-broken'));
        if (img.complete && img.naturalWidth === 0) img.classList.add('is-broken');
      });

      // Rolagem suave com compensação do header fixo
      $$('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
          const id = a.getAttribute('href');
          if (!id || id.charAt(0) !== '#') return;   // virou link externo
          if (!id || id === '#') return;
          const target = document.querySelector(id);
          if (!target) return;
          e.preventDefault();
          const header = $('#header');
          const offset = header ? header.offsetHeight - 4 : 0;
          const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: top, behavior: REDUCED ? 'auto' : 'smooth' });
          if (history.replaceState) history.replaceState(null, '', id);
        });
      });
    }
    return { init: init };
  })();


  /* ==========================================================
     BOOT
     ========================================================== */
  onReady(function () {
    Cursor.init();
    Header.init();
    Reveal.init();
    Counters.init();
    Timeline.init();
    Faq.init();
    Cards.init();
    Misc.init();
    Motion.init();
    Embers.init();
  });

})();
