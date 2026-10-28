/* Демо: пять вариантов 3D для экрана «Битрикс24». Без библиотек.
   Демо всегда в полном движении — это страница для выбора, не сайт. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const TAU = Math.PI * 2, RAD = Math.PI / 180;
  const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

  /* ---------- Соцсети и значки: копия из js/main.js. Поменяли значки там — скопируйте и сюда ---------- */
  const NETS = [
    { s: 'ВК', n: 'ВКонтакте', c: '#0060D1' },
    { s: 'TG', n: 'Telegram', c: '#1B7DB0' },
    { s: 'OK', n: 'Одноклассники', c: '#C2560A' },
    { s: 'ММ', n: 'Мой Мир', c: '#1268B3' },
    { s: 'X', n: 'X (Twitter)', c: '#16181C' },
    { s: 'Pi', n: 'Pinterest', c: '#C8001E' },
    { s: 'Tu', n: 'Tumblr', c: '#36465D' },
    { s: 'In', n: 'LinkedIn', c: '#0A66C2' },
    { s: 'ЖЖ', n: 'Живой Журнал', c: '#004359' },
    { s: 'TT', n: 'TikTok', c: '#C4113F' },
    { s: 'Bl', n: 'Blogger', c: '#A23B10' },
    { s: 'Re', n: 'Reddit', c: '#C93800' },
  ];

  // Значки соцсетей — только белый знак, без своей подложки. Строка — path для viewBox 0 0 24 24, объект — { v: viewBox, d: path }.
  // Источники: Simple Icons (CC0); Telegram, Pinterest, Blogger — CoreUI Brands (CC0); ВК, Reddit — Boxicons (MIT);
  // LinkedIn — Remix Icon (Apache-2.0). Значка «Мой Мир» в открытых наборах нет — стоит знак Mail.ru, чей это сервис.
  const ICONS = {
    'ВК': { v: '0 0 24 24', d: 'M21.579 6.855c.14-.465 0-.806-.662-.806h-2.193c-.558 0-.813.295-.953.619c0 0-1.115 2.719-2.695 4.482c-.51.513-.743.675-1.021.675c-.139 0-.341-.162-.341-.627V6.855c0-.558-.161-.806-.626-.806H9.642c-.348 0-.558.258-.558.504c0 .528.79.65.871 2.138v3.228c0 .707-.127.836-.407.836c-.743 0-2.551-2.729-3.624-5.853c-.209-.607-.42-.852-.98-.852H2.752c-.627 0-.752.295-.752.619c0 .582.743 3.462 3.461 7.271c1.812 2.601 4.363 4.011 6.687 4.011c1.393 0 1.565-.313 1.565-.853v-1.966c0-.626.133-.752.574-.752c.324 0 .882.164 2.183 1.417c1.486 1.486 1.732 2.153 2.567 2.153h2.192c.626 0 .939-.313.759-.931c-.197-.615-.907-1.51-1.849-2.569c-.512-.604-1.277-1.254-1.51-1.579c-.325-.419-.231-.604 0-.976c.001.001 2.672-3.761 2.95-5.04' },
    'TG': { v: '0 0 32 32', d: 'm29.919 6.163l-4.225 19.925c-.319 1.406-1.15 1.756-2.331 1.094l-6.438-4.744l-3.106 2.988c-.344.344-.631.631-1.294.631l.463-6.556L24.919 8.72c.519-.462-.113-.719-.806-.256l-14.75 9.288l-6.35-1.988c-1.381-.431-1.406-1.381.288-2.044l24.837-9.569c1.15-.431 2.156.256 1.781 2.013z' },
    'OK': 'M12 0a6.2 6.2 0 0 0-6.194 6.195 6.2 6.2 0 0 0 6.195 6.192 6.2 6.2 0 0 0 6.193-6.192A6.2 6.2 0 0 0 12.001 0zm0 3.63a2.567 2.567 0 0 1 2.565 2.565 2.568 2.568 0 0 1-2.564 2.564 2.568 2.568 0 0 1-2.565-2.564 2.567 2.567 0 0 1 2.565-2.564zM6.807 12.6a1.814 1.814 0 0 0-.91 3.35 11.611 11.611 0 0 0 3.597 1.49l-3.462 3.463a1.815 1.815 0 0 0 2.567 2.566L12 20.066l3.405 3.403a1.813 1.813 0 0 0 2.564 0c.71-.709.71-1.858 0-2.566l-3.462-3.462a11.593 11.593 0 0 0 3.596-1.49 1.814 1.814 0 1 0-1.932-3.073 7.867 7.867 0 0 1-8.34 0c-.318-.2-.674-.29-1.024-.278z',
    'ММ': 'M15.61 12c0 1.99-1.62 3.61-3.61 3.61-1.99 0-3.61-1.62-3.61-3.61 0-1.99 1.62-3.61 3.61-3.61 1.99 0 3.61 1.62 3.61 3.61M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12c2.424 0 4.761-.722 6.76-2.087l.034-.024-1.617-1.879-.027.017A9.494 9.494 0 0 1 12 21.54c-5.26 0-9.54-4.28-9.54-9.54 0-5.26 4.28-9.54 9.54-9.54 5.26 0 9.54 4.28 9.54 9.54a9.63 9.63 0 0 1-.225 2.05c-.301 1.239-1.169 1.618-1.82 1.568-.654-.053-1.42-.52-1.426-1.661V12A6.076 6.076 0 0 0 12 5.93 6.076 6.076 0 0 0 5.93 12 6.076 6.076 0 0 0 12 18.07a6.02 6.02 0 0 0 4.3-1.792 3.9 3.9 0 0 0 3.32 1.805c.874 0 1.74-.292 2.437-.821.719-.547 1.256-1.336 1.553-2.285.047-.154.135-.504.135-.507l.002-.013c.175-.76.253-1.52.253-2.457 0-6.617-5.383-12-12-12',
    'X': 'M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z',
    'Pi': { v: '0 0 32 32', d: 'M16.75.406C10.337.406 4 4.681 4 11.6c0 4.4 2.475 6.9 3.975 6.9c.619 0 .975-1.725.975-2.212c0-.581-1.481-1.819-1.481-4.238c0-5.025 3.825-8.588 8.775-8.588c4.256 0 7.406 2.419 7.406 6.863c0 3.319-1.331 9.544-5.644 9.544c-1.556 0-2.888-1.125-2.888-2.737c0-2.363 1.65-4.65 1.65-7.088c0-4.137-5.869-3.387-5.869 1.613c0 1.05.131 2.212.6 3.169c-.863 3.713-2.625 9.244-2.625 13.069c0 1.181.169 2.344.281 3.525c.212.238.106.213.431.094c3.15-4.313 3.038-5.156 4.463-10.8c.769 1.463 2.756 2.25 4.331 2.25c6.637 0 9.619-6.469 9.619-12.3c0-6.206-5.363-10.256-11.25-10.256z' },
    'Tu': 'M14.563 24c-5.093 0-7.031-3.756-7.031-6.411V9.747H5.116V6.648c3.63-1.313 4.512-4.596 4.71-6.469C9.84.051 9.941 0 9.999 0h3.517v6.114h4.801v3.633h-4.82v7.47c.016 1.001.375 2.371 2.207 2.371h.09c.631-.02 1.486-.205 1.936-.419l1.156 3.425c-.436.636-2.4 1.374-4.156 1.404h-.178l.011.002z',
    'ЖЖ': 'M18.09 14.696c-1.512.664-2.726 1.885-3.381 3.399l4.27.883-.886-4.282h-.003zM2.475 8.317L0 5.85C1.125 3.237 3.216 1.14 5.823 0h.006l2.469 2.463c1.368-.591 2.876-.921 4.463-.921C18.967 1.542 24 6.569 24 12.771 24 18.973 18.967 24 12.761 24 6.551 24 1.52 18.976 1.52 12.771c0-1.591.355-3.081.952-4.451l9.143 9.114c1.125-2.613 3.218-4.71 5.823-5.85l-9.135-9.12h-.008c-2.606 1.14-4.695 3.24-5.823 5.85l.003.003z',
    'TT': 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
    'Bl': { v: '0 0 32 32', d: 'M29.913 13.919c-.113-.5-.425-.962-.781-1.156c-.113-.063-.813-.137-1.563-.169c-1.256-.056-1.394-.081-1.794-.313c-.631-.369-.8-.769-.806-1.844c-.006-2.063-.863-3.981-2.556-5.706C21.207 3.5 19.857 2.668 18.319 2.2c-.369-.113-1.194-.15-3.956-.181c-4.338-.05-5.3.037-6.775.625c-2.719 1.075-4.669 3.363-5.381 6.287c-.131.55-.163 1.431-.194 6.494c-.037 6.344.006 7.275.4 8.531c.975 3.1 3.744 5.394 6.525 5.894c.925.169 12.331.206 13.5.05c2.031-.275 3.625-1.094 5.119-2.619c1.081-1.106 1.756-2.3 2.2-3.881c.306-1.1.281-8.925.156-9.481M9.781 9.944c.488-.494.625-.513 3.675-.513c2.744 0 2.837.006 3.238.213c.581.294.837.706.837 1.369c0 .594-.238 1.012-.769 1.35c-.287.181-.456.194-3.144.206c-1.656.012-2.981-.025-3.175-.075c-1.038-.294-1.425-1.781-.663-2.55zm11.988 12.487l-.931.15l-4.844.056c-4.256.05-5.456-.025-5.681-.125c-.444-.194-.863-.731-.931-1.212c-.069-.456.162-1.081.512-1.4c.444-.4.637-.412 6.081-.419c5.6-.006 5.569-.006 6.1.488c.756.706.594 1.95-.306 2.462' },
    'Re': { v: '0 0 24 24', d: 'M15.09 11.65c-.65 0-1.15.69-1.11 1.53c.04.85.53 1.15 1.18 1.15s1.23-.34 1.19-1.19s-.6-1.5-1.26-1.5Zm-.78 3.45c-.72-.07-1.5-.11-2.31-.11s-1.59.04-2.31.11c-.12.01-.2.14-.15.25a2.666 2.666 0 0 0 4.92 0c.05-.11-.03-.24-.15-.25m-4.28-1.92c.04-.85-.46-1.53-1.11-1.53s-1.22.65-1.26 1.5s.53 1.19 1.19 1.19s1.14-.31 1.18-1.15Z M12 2C6.48 2 2 6.48 2 12c0 2.76 1.12 5.26 2.93 7.07l-1.9 1.9a.596.596 0 0 0 .42 1.02H12c5.52 0 10-4.48 10-10S17.52 2 12 2m6.67 11.77c-.07 2.71-3.03 4.9-6.66 4.9s-6.59-2.18-6.66-4.89a2.33 2.33 0 0 1-1.34-2.11c0-1.29 1.05-2.34 2.34-2.34c.54 0 1.03.18 1.43.49c1.06-.66 2.4-1.08 3.87-1.14A2.69 2.69 0 0 1 14.05 6c.16-.76.83-1.33 1.63-1.33c.92 0 1.67.75 1.67 1.67s-.75 1.67-1.67 1.67c-.79 0-1.45-.55-1.62-1.28c-.96.14-1.69.96-1.69 1.95c1.48.06 2.83.48 3.91 1.14a2.343 2.343 0 0 1 3.76 1.86c0 .93-.55 1.73-1.33 2.11Z' },
    'In': 'M6.94 5a2 2 0 1 1-4-.002a2 2 0 0 1 4 .002M7 8.48H3V21h4zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91z',
  };
  // Значок вместо подписи; если значка нет — остаётся подпись
  const icon = (s) => {
    const i = ICONS[s];
    if (!i) return s;
    const [v, d] = typeof i === 'string' ? ['0 0 24 24', i] : [i.v, i.d];
    return `<svg viewBox="${v}" aria-hidden="true"><path d="${d}"></path></svg>`;
  };
  const by = (s) => NETS.find((n) => n.s === s);
  const chip = (n, cls = '') => `<span class="chip ${cls}" style="--c:${n.c}" title="${n.n}">${icon(n.s)}</span>`;
  const flash = (el) => { el.classList.remove('is-hit'); void el.offsetWidth; el.classList.add('is-hit'); setTimeout(() => el.classList.remove('is-hit'), 600); };

  /* ---------- Тема ---------- */
  const root = document.documentElement;
  $('#themeBtn').addEventListener('click', () => {
    const dark = root.dataset.theme === 'dark' || (root.dataset.theme !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
    root.dataset.theme = dark ? 'light' : 'dark';
  });

  /* ---------- Цикл: модуль тикает, только пока его сцена видна ---------- */
  const mods = [];
  function reg(el, tick) {
    const m = { tick, on: false };
    new IntersectionObserver((es) => { m.on = es[0].isIntersecting; }).observe(el);
    mods.push(m);
  }
  let last = performance.now();
  requestAnimationFrame(function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    for (const m of mods) if (m.on) m.tick(dt, now);
    requestAnimationFrame(frame);
  });

  // Перетаскивание с оценкой скорости; tap — короткое касание без сдвига
  function drag(el, h) {
    let on = false, lx = 0, ly = 0, lt = 0, vx = 0, vy = 0, moved = 0, target = null;
    el.addEventListener('pointerdown', (e) => {
      on = true; moved = 0; vx = vy = 0; lx = e.clientX; ly = e.clientY; lt = performance.now(); target = e.target;
      try { el.setPointerCapture(e.pointerId); } catch (_) { /* ничего */ }
    });
    el.addEventListener('pointermove', (e) => {
      if (!on) { if (h.hover) h.hover(e); return; }
      const now = performance.now(), dts = Math.max(8, now - lt) / 1000, dx = e.clientX - lx, dy = e.clientY - ly;
      moved += Math.abs(dx) + Math.abs(dy);
      vx = lerp(vx, dx / dts, 0.5); vy = lerp(vy, dy / dts, 0.5);
      lx = e.clientX; ly = e.clientY; lt = now;
      h.move(dx, dy);
    });
    const end = () => {
      if (!on) return;
      on = false;
      if (performance.now() - lt > 100) vx = vy = 0;
      if (h.up) h.up(vx, vy, moved < 6, target);
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('pointerleave', () => { if (!on && h.leave) h.leave(); });
    return () => on;
  }

  /* ==========================================================
     1. Слои: Битрикс24 → SEOlit → соцсети
     ========================================================== */
  (function layers() {
    const st = $('#v1'), sc = $('#v1Scene'), netsEl = $('#v1Nets');
    netsEl.innerHTML = NETS.map((n) => chip(n)).join('');
    const chips = $$('.chip', netsEl);
    let rz = -38, rx = 58, vz = 0, gap = 72, t = 0, hover = false, acc = 0;
    const pks = [];
    const held = drag(st, {
      move(dx, dy) { rz += dx * 0.4; rx = clamp(rx - dy * 0.25, 28, 75); },
      up(vx) { vz = clamp(vx * 0.4, -320, 320); },
      hover() { hover = true; },
      leave() { hover = false; },
    });
    function emit() {
      const el = document.createElement('span');
      el.className = 'v1-pk';
      sc.appendChild(el);
      pks.push({ el, to: chips[(Math.random() * chips.length) | 0], t: 0 });
    }
    reg(st, (dt) => {
      t += dt;
      if (!held()) {
        rz += (8 + vz) * dt; // медленный поворот, как на подставке
        vz *= Math.exp(-dt * 2);
        rx = lerp(rx, 58, 1 - Math.exp(-dt * 1.5));
      }
      gap = lerp(gap, hover || held() ? 108 : 72 + 6 * Math.sin(t * 1.3), 1 - Math.exp(-dt * 5));
      sc.style.setProperty('--rz', rz.toFixed(2) + 'deg');
      sc.style.setProperty('--rx', rx.toFixed(2) + 'deg');
      sc.style.setProperty('--gap', gap.toFixed(1) + 'px');
      acc += dt;
      if (acc > 0.45) { acc = 0; emit(); }
      const c = sc.offsetWidth / 2;
      for (let i = pks.length - 1; i >= 0; i--) {
        const p = pks[i];
        p.t += dt / 1.3;
        if (p.t >= 1) { flash(p.to); p.el.remove(); pks.splice(i, 1); continue; }
        let x = c, y = c, z;
        if (p.t < 0.45) z = gap * ease(p.t / 0.45); // вверх: Битрикс24 → SEOlit
        else {
          // от SEOlit к соцсети на верхнем слое
          const k = ease((p.t - 0.45) / 0.55);
          const tx = p.to.offsetLeft + p.to.offsetWidth / 2, ty = p.to.offsetTop + p.to.offsetHeight / 2;
          x = lerp(c, tx, k); y = lerp(c, ty, k); z = lerp(gap, gap * 2, k) + Math.sin(k * Math.PI) * 30;
        }
        p.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px)`;
      }
    });
  })();

  /* ==========================================================
     2. Шестигранная призма: один пост, шесть оформлений
     ========================================================== */
  (function prism() {
    const st = $('#v2'), pr = $('#v2Prism');
    // h — высота картинки: у каждой соцсети своя подача
    const faces = [
      { s: 'ВК', h: 96, lines: 3, tags: true },
      { s: 'TG', h: 64, lines: 4, tags: false },
      { s: 'OK', h: 120, lines: 2, tags: false },
      { s: 'Pi', h: 168, lines: 1, tags: false },
      { s: 'X', h: 0, lines: 4, tags: true },
      { s: 'ММ', h: 96, lines: 3, tags: false },
    ];
    pr.innerHTML = faces.map((f) => {
      const n = by(f.s);
      return `<div class="v2-face" style="--c:${n.c}"><div class="v2-head">${chip(n)}${n.n}</div><div class="v2-body">` +
        (f.h ? `<div class="v2-img" style="height:${f.h}px"></div>` : '') +
        '<span class="v2-t">Как выбрать подарок и не ошибиться</span>' +
        '<i class="v2-l"></i>'.repeat(f.lines) +
        (f.tags ? '<span class="v2-tags">#подарки #идеи</span>' : '') + '</div></div>';
    }).join('');
    const els = $$('.v2-face', pr);
    let ry = 0, vy = 0, snap = null, pause = 0;
    const place = () => {
      const a = (pr.offsetWidth / 2) / Math.tan(Math.PI / 6); // апофема шестиугольника
      els.forEach((el, i) => { el.style.transform = `rotateY(${i * 60}deg) translateZ(${a.toFixed(1)}px)`; });
    };
    place();
    const held = drag(st, {
      move(dx) { ry += dx * 0.45; snap = null; },
      up(vx, vy0, tap) {
        if (tap) { snap = Math.round(ry / 60) * 60 - 60; pause = 2.5; return; } // клик — следующая грань
        vy = clamp(vx * 0.45, -500, 500);
      },
    });
    reg(st, (dt) => {
      if (!held()) {
        if (snap !== null) { ry = lerp(ry, snap, 1 - Math.exp(-dt * 6)); if (Math.abs(ry - snap) < 0.1) snap = null; }
        else if (pause > 0) pause -= dt;
        else { ry += (-18 + vy) * dt; vy *= Math.exp(-dt * 1.8); }
      }
      pr.style.transform = `rotateX(-8deg) rotateY(${ry.toFixed(2)}deg)`;
    });
  })();

  /* ==========================================================
     3. Веер: из задачи Битрикс24 разлетаются посты
     ========================================================== */
  (function fan() {
    const st = $('#v3'), deck = $('#v3Deck'), front = $('.v3-front', deck);
    const nets = ['ВК', 'TG', 'OK', 'Pi', 'X', 'ММ'].map(by);
    nets.forEach((n) => {
      const c = document.createElement('div');
      c.className = 'v3-card v3-post';
      c.style.setProperty('--c', n.c);
      c.innerHTML = `<span class="v3-h">${chip(n)}${n.n}</span><span class="v3-img"></span><i class="v3-l"></i><i class="v3-l" style="width:70%"></i>`;
      deck.insertBefore(c, front);
    });
    const cards = $$('.v3-post', deck);
    let p = 0, pT = 0, auto = 0, pause = 0, lit = 0, litT = 0;
    drag(st, {
      move() {},
      up(vx, vy, tap) { if (tap) { pT = pT ? 0 : 1; pause = 6; } },
      hover(e) {
        const r = st.getBoundingClientRect();
        deck.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 24).toFixed(1) + 'deg');
        deck.style.setProperty('--rx', (10 + ((e.clientY - r.top) / r.height - 0.5) * -14).toFixed(1) + 'deg');
      },
      leave() { deck.style.setProperty('--ry', '0deg'); deck.style.setProperty('--rx', '10deg'); },
    });
    reg(st, (dt) => {
      if (pause > 0) pause -= dt;
      else {
        auto += dt;
        if (auto > (pT ? 3.2 : 1.8)) { auto = 0; pT = pT ? 0 : 1; }
      }
      p = lerp(p, pT, 1 - Math.exp(-dt * 4));
      const e = ease(clamp(p, 0, 1));
      cards.forEach((c, i) => {
        const k = i - (cards.length - 1) / 2;
        const tx = lerp(k * 3, k * 62, e), ty = lerp(-i * 2, -Math.abs(k) * -14 - 30, e), tz = lerp(-12 - i * 4, -60 - Math.abs(k) * 26, e);
        c.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, ${tz.toFixed(1)}px) rotateZ(${(k * 9 * e).toFixed(2)}deg) rotateY(${(-k * 12 * e).toFixed(2)}deg)`;
      });
      front.style.transform = `translate3d(0, ${(e * 40).toFixed(1)}px, ${(e * 70).toFixed(1)}px)`;
      // в раскрытом веере карточки подсвечиваются по очереди
      litT += dt;
      if (e > 0.8 && litT > 0.5) { litT = 0; cards.forEach((c, i) => c.classList.toggle('is-lit', i === lit)); lit = (lit + 1) % cards.length; }
      if (e < 0.3) cards.forEach((c) => c.classList.remove('is-lit'));
    });
  })();

  /* ==========================================================
     4. Сфера из значков вокруг SEOlit
     ========================================================== */
  (function sphere() {
    const st = $('#v4'), sp = $('#v4Sphere');
    const N = 44, R = 150, golden = Math.PI * (3 - Math.sqrt(5));
    const chipAt = new Map(NETS.map((n, j) => [Math.floor(((j + 0.5) * N) / NETS.length), n]));
    const pts = [];
    for (let i = 0; i < N; i++) {
      const y = 1 - ((i + 0.5) * 2) / N, r = Math.sqrt(1 - y * y), ph = i * golden;
      const n = chipAt.get(i);
      const el = document.createElement('span');
      if (n) { el.className = 'v4-pt chip'; el.style.setProperty('--c', n.c); el.title = n.n; el.innerHTML = icon(n.s); }
      else el.className = 'v4-pt v4-dot';
      sp.appendChild(el);
      pts.push({ el, x: Math.cos(ph) * r, y, z: Math.sin(ph) * r });
    }
    let ay = 0, ax = 0.35, vay = 0.35, vax = 0, t = 0;
    const held = drag(st, {
      move(dx, dy) { ay += dx * 0.008; ax += dy * 0.008; },
      up(vx, vy, tap, target) {
        if (tap) { const c = target && target.closest('.v4-pt.chip'); if (c) flash(c); return; }
        vay = clamp(vx * 0.008, -6, 6); vax = clamp(vy * 0.008, -6, 6);
      },
    });
    reg(st, (dt) => {
      t += dt;
      if (!held()) {
        vay = lerp(vay, 0.35, 1 - Math.exp(-dt * 0.8)); vax = lerp(vax, 0, 1 - Math.exp(-dt * 1.2));
        ay += vay * dt; ax += vax * dt;
        ax = lerp(ax, 0.35 + Math.sin(t * 0.4) * 0.15, 1 - Math.exp(-dt * 0.5));
      }
      const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
      for (const p of pts) {
        const x1 = p.x * cy + p.z * sy, z1 = -p.x * sy + p.z * cy;
        const y2 = p.y * cx - z1 * sx, z2 = p.y * sx + z1 * cx;
        p.el.style.transform = `translate3d(${(x1 * R).toFixed(1)}px, ${(y2 * R).toFixed(1)}px, ${(z2 * R).toFixed(1)}px)`;
        p.el.style.opacity = (0.3 + 0.7 * (z2 + 1) / 2).toFixed(2);
      }
    });
  })();

  /* ==========================================================
     5. Телефон: пост из Битрикс24 падает в ленту
     ========================================================== */
  (function phone() {
    const st = $('#v5'), sc = $('#v5Scene'), ph = $('#v5Phone'), feed = $('#v5Feed'), b24 = $('#v5B24');
    const order = ['TG', 'OK', 'Pi', 'ММ', 'X', 'Tu', 'ЖЖ', 'In', 'ВК'];
    const titles = ['Анонс статьи «Как выбрать подарок»', 'Новинки недели в каталоге', 'Акция выходного дня', 'Отзыв покупателя недели'];
    let oi = 0, ti = 0, ry = -22, off = 0, t = 0, acc = 2;
    const post = (n, title) => `<div class="v5-h">${chip(n)}${n.n}</div><div class="v5-img"></div><div class="v5-t">${title}</div>`;
    ['ВК', 'OK', 'TG', 'Pi'].forEach((s, i) => {
      const d = document.createElement('div');
      d.className = 'v5-post'; d.style.setProperty('--c', by(s).c); d.innerHTML = post(by(s), titles[(i + 1) % titles.length]);
      feed.appendChild(d);
    });
    const held = drag(st, { move(dx) { off = clamp(off + dx * 0.3, -40, 40); } });
    function drop() {
      const n = by(order[oi++ % order.length]), title = titles[ti++ % titles.length];
      const fly = document.createElement('div');
      fly.className = 'v5-fly'; fly.style.setProperty('--c', n.c); fly.innerHTML = post(n, title);
      fly.classList.add('v5-post');
      sc.appendChild(fly);
      // куда: верх ленты на повёрнутом телефоне
      const a = ry * RAD, cx = ph.offsetLeft + ph.offsetWidth / 2, lx = -ph.offsetWidth / 2 + 18;
      const x = cx + lx * Math.cos(a), z = -lx * Math.sin(a), y = ph.offsetTop + 40;
      const from = `translate3d(${b24.offsetLeft + 10}px, ${b24.offsetTop + 20}px, 90px) rotateY(14deg) scale(.9)`;
      const to = `translate3d(${x.toFixed(1)}px, ${y}px, ${z.toFixed(1)}px) rotateY(${ry.toFixed(1)}deg) scale(.95)`;
      fly.animate([{ transform: from, opacity: 0 }, { transform: from, opacity: 1, offset: 0.12 }, { transform: to, opacity: 1, offset: 0.9 }, { transform: to, opacity: 0 }],
        { duration: 1100, easing: 'cubic-bezier(.6,0,.3,1)' }).finished.then(() => {
        fly.remove();
        const d = document.createElement('div');
        d.className = 'v5-post'; d.style.setProperty('--c', n.c); d.innerHTML = post(n, title);
        feed.prepend(d);
        const h = d.offsetHeight + 8;
        feed.animate([{ transform: `translateY(-${h}px)` }, { transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.22,1,.36,1)' });
        d.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350 });
        while (feed.children.length > 6) feed.lastElementChild.remove();
      });
    }
    reg(st, (dt) => {
      t += dt;
      if (!held()) off = lerp(off, 0, 1 - Math.exp(-dt * 3));
      ry = -22 + Math.sin(t * 0.6) * 8 + off;
      ph.style.setProperty('--ry', ry.toFixed(2) + 'deg');
      acc += dt;
      if (acc > 3.2) { acc = 0; drop(); }
    });
  })();
})();
