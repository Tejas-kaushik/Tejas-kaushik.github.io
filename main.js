(() => {
  const root = document.documentElement;
  // html.motion is set in the head unless the visitor asked for reduced motion (?motion=full overrides)
  const reduce = !root.classList.contains('motion');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Hero entrance: CSS transitions keyed off .ready, started once fonts are in.
  const start = () => requestAnimationFrame(() => root.classList.add('ready'));
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start);
  setTimeout(start, 1200);

  /* ---------- The scope: a series RLC step response on the 475A's screen ---------- */
  const L = 10e-3, C = 0.68e-6;
  const w0 = 1 / Math.sqrt(L * C);
  const zetaOf = (R) => (R / 2) * Math.sqrt(C / L);

  function response(zeta, t) {
    if (t <= 0) return 0;
    if (zeta < 0.999) {
      const wd = w0 * Math.sqrt(1 - zeta * zeta);
      return 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t));
    }
    if (zeta <= 1.001) return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
    const r = Math.sqrt(zeta * zeta - 1);
    const s1 = -w0 * (zeta - r), s2 = -w0 * (zeta + r);
    return 1 + (s2 * Math.exp(s1 * t) - s1 * Math.exp(s2 * t)) / (s1 - s2);
  }

  const canvas = document.getElementById('scope-canvas');
  const range = document.getElementById('scope-r');
  const out = document.getElementById('scope-r-out');
  const readZ = document.getElementById('read-zeta');
  const readOS = document.getElementById('read-os');
  const readF = document.getElementById('read-f');

  if (canvas && range) {
    const ctx = canvas.getContext('2d');
    const SCREEN = '#1aa0a6';
    const BEAM = '#eafffd';
    const T_SPAN = 5.2e-3, T_STEP = 0.45e-3, V_MIN = -0.25, V_MAX = 2.15;
    const SWEEP_MS = 1700, HOLD_MS = 500;
    let w = 0, h = 0, dpr = 1;
    let zeta = zetaOf(+range.value), prevZeta = zeta;
    let sweepStart = performance.now();
    let running = false, visible = true, raf = 0;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.round(r.width * dpr));
      h = Math.max(1, Math.round(r.height * dpr));
      canvas.width = w; canvas.height = h;
      if (!running) draw(1);
    };

    const xOf = (t) => (t / T_SPAN) * w;
    const yOf = (v) => h - ((v - V_MIN) / (V_MAX - V_MIN)) * h;

    function trace(z, from, to, alpha, glow) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = BEAM;
      ctx.lineWidth = Math.max(1.5, 2.1 * dpr);
      ctx.lineJoin = 'round';
      ctx.shadowColor = BEAM;
      ctx.shadowBlur = glow * dpr;
      ctx.beginPath();
      const n = Math.max(2, Math.round((to - from) * 420));
      for (let i = 0; i <= n; i++) {
        const f = from + ((to - from) * i) / n;
        const t = f * T_SPAN;
        const x = xOf(t), y = yOf(response(z, t - T_STEP));
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    function graticule() {
      ctx.fillStyle = SCREEN;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 1; i < 10; i++) { const x = Math.round((w * i) / 10) + 0.5; ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      for (let i = 1; i < 8; i++) { const y = Math.round((h * i) / 8) + 0.5; ctx.moveTo(0, y); ctx.lineTo(w, y); }
      ctx.stroke();
      // the settled level: the seam the step rings around
      ctx.setLineDash([4 * dpr, 6 * dpr]);
      ctx.strokeStyle = 'rgba(161,255,203,0.55)';
      ctx.beginPath(); ctx.moveTo(0, yOf(1)); ctx.lineTo(w, yOf(1)); ctx.stroke();
      ctx.setLineDash([]);
    }

    function draw(p) {
      graticule();
      if (p < 1) trace(prevZeta, p, 1, 0.28, 0);
      trace(zeta, 0, p, 1, 8);
      if (p < 1) {
        const t = p * T_SPAN;
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = BEAM; ctx.shadowBlur = 14 * dpr;
        ctx.beginPath(); ctx.arc(xOf(t), yOf(response(zeta, t - T_STEP)), 2.6 * dpr, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // power-on, like the real CRT: a dark tube, a line across the middle, then the raster opens
    const BOOT_AT = performance.now() + 1000, BOOT_MS = 750;
    let booted = reduce;
    function boot(now) {
      const p = (now - BOOT_AT) / BOOT_MS;
      ctx.fillStyle = '#0b4e52';
      ctx.fillRect(0, 0, w, h);
      if (p <= 0) return false;
      const ease = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
      if (p < 0.45) {
        const lw = w * ease(p / 0.45);
        ctx.fillStyle = BEAM; ctx.shadowColor = BEAM; ctx.shadowBlur = 12 * dpr;
        ctx.fillRect((w - lw) / 2, h / 2 - dpr, lw, 2 * dpr);
        ctx.shadowBlur = 0;
        return false;
      }
      const q = ease((p - 0.45) / 0.55);
      ctx.save();
      ctx.beginPath(); ctx.rect(0, (h / 2) * (1 - q), w, h * q); ctx.clip();
      graticule();
      ctx.restore();
      if (p >= 1) { booted = true; sweepStart = now; return true; }
      return false;
    }

    function frame(now) {
      if (!booted) { boot(now); raf = requestAnimationFrame(frame); return; }
      const el = now - sweepStart;
      if (el > SWEEP_MS + HOLD_MS) { sweepStart = now; prevZeta = zeta; }
      draw(Math.min(1, (now - sweepStart) / SWEEP_MS));
      raf = requestAnimationFrame(frame);
    }
    const play = () => { if (!running && visible && !reduce && !document.hidden) { running = true; raf = requestAnimationFrame(frame); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    function readouts() {
      const R = +range.value;
      zeta = zetaOf(R);
      out.textContent = `${R} Ω`;
      readZ.textContent = `ζ ${zeta.toFixed(3)}`;
      if (zeta < 1) {
        const os = Math.exp((-Math.PI * zeta) / Math.sqrt(1 - zeta * zeta)) * 100;
        const fd = (w0 * Math.sqrt(1 - zeta * zeta)) / (2 * Math.PI);
        readOS.textContent = `${os.toFixed(os < 10 ? 1 : 0)}%`;
        readF.textContent = `${(fd / 1000).toFixed(2)} kHz`;
      } else {
        readOS.textContent = '0%';
        readF.textContent = zeta <= 1.001 ? 'Critical' : 'No ringing';
      }
      if (!running) draw(1);
    }
    range.addEventListener('input', () => {
      prevZeta = zeta;
      readouts();
      sweepStart = performance.now();
    });

    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? play() : stop(); }).observe(canvas);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : play()));
    resize();
    readouts();
    play();
  }

  /* ---------- Work ledger: accordion rows and hover preview ---------- */
  const ledger = document.querySelector('[data-ledger]');
  if (ledger) {
    const preview = ledger.querySelector('.preview');
    const items = preview ? [...preview.children] : [];
    const show = (row) => {
      if (!preview || !fine) return;
      preview.style.top = `${row.offsetTop}px`;
      items.forEach((el) => el.classList.toggle('is-on', el.dataset.for === row.dataset.preview && !row.classList.contains('is-open')));
    };
    const hide = () => items.forEach((el) => el.classList.remove('is-on'));
    ledger.querySelectorAll('.row').forEach((row) => {
      const head = row.querySelector('.row__head');
      head.addEventListener('click', () => {
        const open = !row.classList.contains('is-open');
        row.classList.toggle('is-open', open);
        head.setAttribute('aria-expanded', String(open));
        open ? hide() : show(row);
        setTimeout(() => window.ScrollTrigger && ScrollTrigger.refresh(), 400);
      });
      row.addEventListener('mouseenter', () => show(row));
      head.addEventListener('focus', () => show(row));
    });
    // the frame beside the ledger is never empty: it starts on the first project and keeps the last one hovered
    const first = ledger.querySelector('.row');
    if (first) show(first);
  }

  /* ---------- Scroll choreography (GSAP). Without it, everything simply shows. ---------- */
  window.addEventListener('load', () => {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const once = (trigger, start = 'top 85%') => ({ trigger, start, once: true });

    // reduced motion: fewer and gentler, so opacity only and no travel
    if (reduce) {
      gsap.utils.toArray('[data-reveal], .ledger .row, [data-rows] > *, .frame').forEach((el) => {
        gsap.from(el, { opacity: 0, duration: 0.6, ease: 'power1.out', scrollTrigger: once(el, 'top 92%') });
      });
      return;
    }

    // section headings and paragraphs rise
    gsap.utils.toArray('[data-reveal]:not(.h2)').forEach((el) => {
      gsap.from(el, { y: 24, opacity: 0, duration: 0.8, ease: 'expo.out', scrollTrigger: once(el) });
    });

    // ledger rows arrive row by row
    gsap.from('.ledger .row', { y: 18, opacity: 0, duration: 0.7, ease: 'expo.out', stagger: 0.07, scrollTrigger: once('.ledger') });

    // lists of rows (record, layers) arrive in reading order
    document.querySelectorAll('[data-rows]').forEach((list) => {
      gsap.from(list.children, { y: 16, opacity: 0, duration: 0.6, ease: 'expo.out', stagger: 0.06, scrollTrigger: once(list) });
    });
    gsap.from('.layer i', { scale: 0, duration: 0.5, ease: 'expo.out', stagger: 0.06, scrollTrigger: once('.layers') });

    // the bench: frames rise from the baseline, the lifted one opens like a shutter
    gsap.from('.bench__run .frame:not(.frame--lift)', { y: 40, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08, scrollTrigger: once('.bench__run', 'top 80%') });
    const lift = document.querySelector('.frame--lift');
    if (lift) {
      gsap.fromTo(lift, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'power4.inOut', scrollTrigger: once('.bench__run', 'top 80%') });
      gsap.fromTo(lift.querySelector('img'), { scale: 1.12 }, { scale: 1, duration: 1.5, ease: 'power2.out', scrollTrigger: once('.bench__run', 'top 80%') });
    }

    // the figure counts down from where it started
    const num = document.querySelector('[data-count-from]');
    if (num) {
      const from = +num.dataset.countFrom, to = +num.dataset.countTo, state = { v: from };
      const fmt = (v) => Math.round(v).toLocaleString('en-GB');
      ScrollTrigger.create({
        trigger: num, start: 'top 80%', once: true,
        onEnter: () => {
          num.textContent = fmt(from);
          gsap.to(state, { v: to, duration: 2.2, ease: 'power3.inOut', onUpdate: () => (num.textContent = fmt(state.v)) });
        },
      });
      gsap.from('.figure-tile', { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'power4.inOut', scrollTrigger: once('.figure-tile', 'top 90%') });
    }

    // the hero scope drifts a little as the page leaves it
    gsap.to('.scope__frame', { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // section titles rise out of their own baseline
    gsap.utils.toArray('.h2').forEach((h) => {
      h.removeAttribute('data-reveal');
      gsap.fromTo(h, { clipPath: 'inset(0 0 100% 0)', y: '0.6em' }, { clipPath: 'inset(0 0 -20% 0)', y: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: once(h) });
    });

    // the board photograph drifts slowly while the stack scrolls past it
    gsap.fromTo('.stack__pic img', { scale: 1.12, yPercent: -3 }, { scale: 1, yPercent: 3, ease: 'none', scrollTrigger: { trigger: '.stack', start: 'top bottom', end: 'bottom top', scrub: true } });

    // contact photograph settles from a slight scale
    gsap.fromTo('.contact__pic img', { scale: 1.25 }, { scale: 1, duration: 1.6, ease: 'power2.out', scrollTrigger: once('.contact') });
  });
})();
