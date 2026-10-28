/* SEOlit — интерактив лендинга. Без библиотек и сборки. */
(() => {
  'use strict';

  /* ---------- Утилиты ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const TAU = Math.PI * 2;

  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mqDark = matchMedia('(prefers-color-scheme: dark)');
  const fine = matchMedia('(pointer: fine)').matches;
  // «Уменьшение движения» — два режима (SPEC.md):
  // still — крупное движение выключено: параллакс, вращения, полёты пакетов, конфетти, магнит, перелёт карточек;
  // fade  — смена состояний остаётся, но вместо движения элемент проявляется на месте (opacity, FADE мс).
  let still = mqReduce.matches, fade = mqReduce.matches;
  mqReduce.addEventListener?.('change', (e) => { still = fade = e.matches; });
  const FADE = 350;
  const fadeIn = (el) => el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE, easing: 'ease-out' });

  // Цвета соцсетей (подписи вместо логотипов)
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

  // Значки соцсетей (path для viewBox 0 0 24 24): Simple Icons, лицензия CC0; LinkedIn — Remix Icon, Apache-2.0.
  // Значка «Мой Мир» в открытых наборах нет — стоит знак Mail.ru, чей это сервис.
  const ICONS = {
    'ВК': 'm9.489.004.729-.003h3.564l.73.003.914.01.433.007.418.011.403.014.388.016.374.021.36.025.345.03.333.033c1.74.196 2.933.616 3.833 1.516.9.9 1.32 2.092 1.516 3.833l.034.333.029.346.025.36.02.373.025.588.012.41.013.644.009.915.004.98-.001 3.313-.003.73-.01.914-.007.433-.011.418-.014.403-.016.388-.021.374-.025.36-.03.345-.033.333c-.196 1.74-.616 2.933-1.516 3.833-.9.9-2.092 1.32-3.833 1.516l-.333.034-.346.029-.36.025-.373.02-.588.025-.41.012-.644.013-.915.009-.98.004-3.313-.001-.73-.003-.914-.01-.433-.007-.418-.011-.403-.014-.388-.016-.374-.021-.36-.025-.345-.03-.333-.033c-1.74-.196-2.933-.616-3.833-1.516-.9-.9-1.32-2.092-1.516-3.833l-.034-.333-.029-.346-.025-.36-.02-.373-.025-.588-.012-.41-.013-.644-.009-.915-.004-.98.001-3.313.003-.73.01-.914.007-.433.011-.418.014-.403.016-.388.021-.374.025-.36.03-.345.033-.333c.196-1.74.616-2.933 1.516-3.833.9-.9 2.092-1.32 3.833-1.516l.333-.034.346-.029.36-.025.373-.02.588-.025.41-.012.644-.013.915-.009ZM6.79 7.3H4.05c.13 6.24 3.25 9.99 8.72 9.99h.31v-3.57c2.01.2 3.53 1.67 4.14 3.57h2.84c-.78-2.84-2.83-4.41-4.11-5.01 1.28-.74 3.08-2.54 3.51-4.98h-2.58c-.56 1.98-2.22 3.78-3.8 3.95V7.3H10.5v6.92c-1.6-.4-3.62-2.34-3.71-6.92Z',
    'TG': 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z',
    'OK': 'M12 0a6.2 6.2 0 0 0-6.194 6.195 6.2 6.2 0 0 0 6.195 6.192 6.2 6.2 0 0 0 6.193-6.192A6.2 6.2 0 0 0 12.001 0zm0 3.63a2.567 2.567 0 0 1 2.565 2.565 2.568 2.568 0 0 1-2.564 2.564 2.568 2.568 0 0 1-2.565-2.564 2.567 2.567 0 0 1 2.565-2.564zM6.807 12.6a1.814 1.814 0 0 0-.91 3.35 11.611 11.611 0 0 0 3.597 1.49l-3.462 3.463a1.815 1.815 0 0 0 2.567 2.566L12 20.066l3.405 3.403a1.813 1.813 0 0 0 2.564 0c.71-.709.71-1.858 0-2.566l-3.462-3.462a11.593 11.593 0 0 0 3.596-1.49 1.814 1.814 0 1 0-1.932-3.073 7.867 7.867 0 0 1-8.34 0c-.318-.2-.674-.29-1.024-.278z',
    'ММ': 'M15.61 12c0 1.99-1.62 3.61-3.61 3.61-1.99 0-3.61-1.62-3.61-3.61 0-1.99 1.62-3.61 3.61-3.61 1.99 0 3.61 1.62 3.61 3.61M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12c2.424 0 4.761-.722 6.76-2.087l.034-.024-1.617-1.879-.027.017A9.494 9.494 0 0 1 12 21.54c-5.26 0-9.54-4.28-9.54-9.54 0-5.26 4.28-9.54 9.54-9.54 5.26 0 9.54 4.28 9.54 9.54a9.63 9.63 0 0 1-.225 2.05c-.301 1.239-1.169 1.618-1.82 1.568-.654-.053-1.42-.52-1.426-1.661V12A6.076 6.076 0 0 0 12 5.93 6.076 6.076 0 0 0 5.93 12 6.076 6.076 0 0 0 12 18.07a6.02 6.02 0 0 0 4.3-1.792 3.9 3.9 0 0 0 3.32 1.805c.874 0 1.74-.292 2.437-.821.719-.547 1.256-1.336 1.553-2.285.047-.154.135-.504.135-.507l.002-.013c.175-.76.253-1.52.253-2.457 0-6.617-5.383-12-12-12',
    'X': 'M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z',
    'Pi': 'M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z',
    'Tu': 'M14.563 24c-5.093 0-7.031-3.756-7.031-6.411V9.747H5.116V6.648c3.63-1.313 4.512-4.596 4.71-6.469C9.84.051 9.941 0 9.999 0h3.517v6.114h4.801v3.633h-4.82v7.47c.016 1.001.375 2.371 2.207 2.371h.09c.631-.02 1.486-.205 1.936-.419l1.156 3.425c-.436.636-2.4 1.374-4.156 1.404h-.178l.011.002z',
    'ЖЖ': 'M18.09 14.696c-1.512.664-2.726 1.885-3.381 3.399l4.27.883-.886-4.282h-.003zM2.475 8.317L0 5.85C1.125 3.237 3.216 1.14 5.823 0h.006l2.469 2.463c1.368-.591 2.876-.921 4.463-.921C18.967 1.542 24 6.569 24 12.771 24 18.973 18.967 24 12.761 24 6.551 24 1.52 18.976 1.52 12.771c0-1.591.355-3.081.952-4.451l9.143 9.114c1.125-2.613 3.218-4.71 5.823-5.85l-9.135-9.12h-.008c-2.606 1.14-4.695 3.24-5.823 5.85l.003.003z',
    'TT': 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
    'Bl': 'M21.976 24H2.026C.9 24 0 23.1 0 21.976V2.026C0 .9.9 0 2.025 0H22.05C23.1 0 24 .9 24 2.025v19.95C24 23.1 23.1 24 21.976 24zM12 3.975H9c-2.775 0-5.025 2.25-5.025 5.025v6c0 2.774 2.25 5.024 5.025 5.024h6c2.774 0 5.024-2.25 5.024-5.024v-3.975c0-.6-.45-1.05-1.05-1.05H18c-.524 0-.976-.45-.976-.976 0-2.776-2.25-5.026-5.024-5.026zm3.074 12H9c-.525 0-.975-.45-.975-.975s.45-.976.975-.976h6.074c.526 0 .977.45.977.976s-.45.976-.975.976zm-2.55-7.95c.527 0 .976.45.976.975s-.45.975-.975.975h-3.6c-.525 0-.976-.45-.976-.975s.45-.975.975-.975h3.6z',
    'Re': 'M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z',
    'In': 'M6.94 5a2 2 0 1 1-4-.002a2 2 0 0 1 4 .002M7 8.48H3V21h4zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91z',
  };
  // Значок вместо подписи; если значка нет — остаётся подпись
  const icon = (s) => (ICONS[s] ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[s]}"></path></svg>` : s);
  // Статичные плашки из разметки (сайдбар, доска, куб, декор): подпись → значок
  $$('.chip, .face, .deco--chip > i').forEach((el) => {
    const n = NETS.find((x) => x.s === el.textContent.trim());
    if (!n || !ICONS[n.s]) return;
    el.innerHTML = icon(n.s);
    if (el.classList.contains('chip') && !el.closest('[aria-hidden="true"]')) { el.setAttribute('role', 'img'); el.setAttribute('aria-label', n.n); }
  });

  /* ---------- Цветовые токены для canvas ---------- */
  const root = document.documentElement;
  const T = {};
  function readTokens() {
    const cs = getComputedStyle(root);
    ['accent', 'fg', 'bg', 'muted', 'line', 'soft', 'surface', 'coral', 'mint'].forEach((k) => {
      T[k] = cs.getPropertyValue('--' + k).trim();
    });
  }
  readTokens();

  /* ---------- Тема ---------- */
  const themeBtn = $('#themeBtn');
  const isDark = () => root.dataset.theme === 'dark' || (root.dataset.theme !== 'light' && mqDark.matches);
  try {
    const saved = localStorage.getItem('seolit-theme');
    if (saved === 'dark' || saved === 'light') root.dataset.theme = saved;
  } catch (e) { /* хранилище недоступно */ }
  function syncTheme() {
    const d = isDark();
    themeBtn.classList.toggle('is-dark', d);
    themeBtn.setAttribute('aria-label', d ? 'Включить светлую тему' : 'Включить тёмную тему');
    readTokens();
  }
  themeBtn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('seolit-theme', next); } catch (e) { /* ничего */ }
    syncTheme();
  });
  mqDark.addEventListener?.('change', syncTheme);
  new MutationObserver(syncTheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  syncTheme();

  /* ---------- Canvas с учётом плотности пикселей ---------- */
  function regCanvas(cv) {
    const o = { cv, ctx: cv.getContext('2d'), w: 1, h: 1 };
    const size = () => {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      o.w = Math.max(1, r.width); o.h = Math.max(1, r.height);
      cv.width = Math.round(o.w * dpr); cv.height = Math.round(o.h * dpr);
      o.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    if ('ResizeObserver' in window) new ResizeObserver(size).observe(cv);
    else addEventListener('resize', size);
    return o;
  }

  /* ---------- Главный цикл и видимость модулей ---------- */
  const modules = [];
  function watch(el, m) {
    m.active = false;
    new IntersectionObserver((es) => { m.active = es[0].isIntersecting; }, { rootMargin: '120px' }).observe(el);
    modules.push(m);
    return m;
  }

  /* ---------- Кнопки: магнит, свечение, волна ---------- */
  $$('.btn').forEach((b) => {
    let ox = 0, oy = 0;
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      b.style.setProperty('--mx', x + 'px');
      b.style.setProperty('--my', y + 'px');
      if (fine && !still && b.classList.contains('magnetic')) {
        const cx = r.left - ox + r.width / 2, cy = r.top - oy + r.height / 2;
        ox = (e.clientX - cx) * 0.18; oy = (e.clientY - cy) * 0.3;
        b.style.transform = `translate(${ox.toFixed(1)}px, ${oy.toFixed(1)}px)`;
      }
    });
    b.addEventListener('pointerleave', () => { ox = 0; oy = 0; b.style.transform = ''; });
    b.addEventListener('pointerdown', (e) => {
      const r = b.getBoundingClientRect();
      const s = document.createElement('span');
      s.className = 'ripple';
      s.style.left = e.clientX - r.left + 'px';
      s.style.top = e.clientY - r.top + 'px';
      b.appendChild(s);
      setTimeout(() => s.remove(), 700);
    });
  });

  /* ---------- Прокрутка: прогресс, шапка, параллакс, точки ---------- */
  const hdr = $('#hdr'), prog = $('#progress');
  const sections = $$('main > section');
  const dotLinks = $$('#dots a');
  const par = $$('[data-speed]').map((el) => ({ el, sp: parseFloat(el.dataset.speed) || 0, sec: el.closest('section') }));
  let scrollDirty = true;
  addEventListener('scroll', () => { scrollDirty = true; }, { passive: true });
  addEventListener('resize', () => { scrollDirty = true; });

  function updateScroll() {
    const y = scrollY, max = root.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${max > 0 ? (y / max).toFixed(4) : 0})`;
    hdr.classList.toggle('is-scrolled', y > 8);
    // still: параллакс остаётся, но вдвое слабее (решение владельца, SPEC.md)
    const vh = innerHeight, k = (innerWidth < 900 ? 0.55 : 1) * (still ? 0.5 : 1);
    const rects = new Map();
    for (const p of par) {
      let r = rects.get(p.sec);
      if (!r) { r = p.sec.getBoundingClientRect(); rects.set(p.sec, r); }
      if (r.bottom < -300 || r.top > vh + 300) continue;
      const d = r.top + r.height / 2 - vh / 2;
      // свойство translate не конфликтует с transform-анимациями
      p.el.style.translate = `0 ${(d * p.sp * k).toFixed(1)}px`;
    }
  }

  const dotIO = new IntersectionObserver((es) => {
    es.forEach((en) => {
      if (!en.isIntersecting) return;
      const id = '#' + en.target.id;
      dotLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === id));
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach((s) => dotIO.observe(s));

  /* ---------- Пошаговая прокрутка по экранам ---------- */
  // Колесо, свайп, PageDown/PageUp, стрелки, пробел = соседний экран за STEP мс.
  // Экран выше окна сначала прокручивается внутри себя, на краю — переход дальше.
  // Окно ниже 600 px — обычная прокрутка. Плавно в обоих режимах движения: это действие пользователя.
  (function pager() {
    const STEP = 700, NEAR = 400;
    const GRAB = '.ball, #cubeScene, input[type="range"]'; // пока их тянут мышью — не листаем
    const NO_TOUCH = '.ball, #cubeScene, input[type="range"]'; // у них свои жесты пальцем
    const FIELD = 'input, textarea, select, [contenteditable]';
    const inOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
    const out = (k) => 1 - Math.pow(1 - k, 3);
    let on = false, anim = null, grab = false;
    let locked = false, wheelT = 0, wheelAbs = 0, pred = 0, settle = false, scrollT = 0;

    const sync = () => { on = innerHeight >= 600; root.classList.toggle('paged', on); };
    sync();
    addEventListener('resize', sync);
    addEventListener('scroll', () => { scrollT = performance.now(); }, { passive: true });

    // Границы экранов в координатах scrollY: a — верх экрана под шапкой, b — низ экрана у низа окна
    function stops() {
      const hh = hdr.offsetHeight, vh = innerHeight - hh, y0 = scrollY, max = root.scrollHeight - innerHeight;
      return sections.map((s) => {
        const r = s.getBoundingClientRect(), a = Math.min(max, Math.round(r.top + y0 - hh));
        return { a, b: Math.min(max, Math.max(a, Math.round(a + r.height - vh))) };
      });
    }
    const where = (y, st) => st.reduce((c, s, i) => (s.a <= y + 2 ? i : c), 0);
    // Куда ехать из y в сторону dir. inside — высокий экран ещё не докручен до края, to — этот край.
    function aim(dir, y, st) {
      const c = where(y, st), s = st[c];
      if (dir > 0) return y < s.b - 2 ? { inside: true, to: s.b } : { to: c + 1 < st.length ? st[c + 1].a : s.b };
      if (y > s.b + 2) return { to: s.b }; // между экранами — к низу текущего
      return y > s.a + 2 ? { inside: true, to: s.a } : { to: c > 0 ? st[c - 1].b : 0 };
    }
    const jump = (y) => scrollTo(0, Math.round(y));
    function go(to, ms, ease = inOut) {
      if (Math.abs(to - scrollY) < 1) { anim = null; return; }
      anim = { from: scrollY, to, t0: performance.now(), ms: ms || (Math.abs(to - scrollY) < innerHeight / 2 ? NEAR : STEP), ease };
    }
    // Шаг с клавиатуры: внутри высокого экрана — на 85% окна, но не дальше края
    function step(dir) {
      const st = stops(), y = anim ? anim.to : scrollY, t = aim(dir, y, st), d = innerHeight * 0.85;
      go(t.inside ? (dir > 0 ? Math.min(t.to, y + d) : Math.max(t.to, y - d)) : t.to);
    }

    addEventListener('pointerdown', (e) => { grab = !!e.target.closest?.(GRAB); }, true);
    addEventListener('pointerup', () => { grab = false; }, true);
    addEventListener('pointercancel', () => { grab = false; }, true);

    // Колесо и тачпад: после шага глушим «хвост» инерции, пока не будет паузы или нового рывка
    addEventListener('wheel', (e) => {
      if (!on || grab || e.ctrlKey || !e.deltaY || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const now = performance.now(), gap = now - wheelT, abs = Math.abs(e.deltaY);
      wheelT = now;
      if (locked && !anim && (gap > 300 || abs > wheelAbs * 2 + 10)) locked = false;
      wheelAbs = abs;
      if (locked || anim) { e.preventDefault(); return; }
      const dir = Math.sign(e.deltaY), y = scrollY, st = stops(), t = aim(dir, y, st);
      if (t.inside) {
        const d = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? innerHeight : 1);
        pred = (gap < 150 ? pred : y) + d; // браузер прокручивает колесо плавно — копим ожидаемую позицию
        if (dir > 0 ? pred <= t.to : pred >= t.to) { settle = true; return; } // обычная прокрутка
      }
      if (Math.abs(t.to - y) < 1) return;
      e.preventDefault();
      locked = true;
      go(t.to);
    }, { passive: false });

    addEventListener('keydown', (e) => {
      if (!on || grab || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const el = e.target instanceof Element ? e.target : document.body;
      if (el.closest(FIELD)) return;
      let dir = 0;
      if (e.key === 'PageDown' || e.key === 'ArrowDown') dir = 1;
      else if (e.key === 'PageUp' || e.key === 'ArrowUp') dir = -1;
      else if (e.key === ' ' && !el.closest('a, button, summary, [role="button"]')) dir = e.shiftKey ? -1 : 1;
      if (!dir) return;
      e.preventDefault();
      step(dir);
    });

    // Свайп: внутри высокого экрана страница идёт за пальцем (с докатом), на краю — переход
    let tch = null;
    addEventListener('touchstart', (e) => {
      tch = null;
      if (!on || e.touches.length > 1 || e.target.closest?.(NO_TOUCH)) return;
      anim = null;
      const p = e.touches[0];
      tch = { x: p.clientX, y: p.clientY, sy: scrollY, st: stops(), axis: '', pts: [{ y: p.clientY, t: e.timeStamp }] };
    }, { passive: true });
    addEventListener('touchmove', (e) => {
      if (!tch) return;
      if (e.touches.length > 1) { tch = null; return; }
      const p = e.touches[0], dx = p.clientX - tch.x, dy = p.clientY - tch.y;
      if (!tch.axis) {
        tch.axis = Math.abs(dy) >= Math.abs(dx) ? 'y' : 'x';
        tch.dir = dy < 0 ? 1 : -1;
        tch.in = aim(tch.dir, tch.sy, tch.st).inside;
        tch.c = where(tch.sy, tch.st);
      }
      if (tch.axis !== 'y') return; // горизонтальный жест не наш
      if (e.cancelable) e.preventDefault();
      if (tch.in) {
        const s = tch.st[tch.c];
        jump(clamp(tch.sy - dy, s.a, s.b));
        tch.pts.push({ y: p.clientY, t: e.timeStamp });
        if (tch.pts.length > 5) tch.pts.shift();
      } else if (!tch.done && Math.abs(dy) > 40) {
        tch.done = true;
        step(tch.dir);
      }
    }, { passive: false });
    addEventListener('touchend', (e) => {
      if (!tch || tch.axis !== 'y') { tch = null; return; }
      if (tch.in) {
        const a = tch.pts[0], b = tch.pts[tch.pts.length - 1], s = tch.st[tch.c];
        const v = e.timeStamp - b.t < 80 && b.t > a.t ? (b.y - a.y) / (b.t - a.t) : 0;
        if (Math.abs(v) > 0.2) go(clamp(scrollY - v * 320, s.a, s.b), 650, out);
      } else if (!tch.done) {
        // короткий быстрый взмах тоже считается
        const dy = (e.changedTouches[0]?.clientY ?? tch.y) - tch.y, a = tch.pts[0];
        if (Math.abs(dy) > 16 && e.timeStamp - a.t < 300) step(tch.dir);
      }
      tch = null;
    });
    addEventListener('touchcancel', () => { tch = null; });

    // Ссылки на экраны (точки, меню, «Попробовать») — тем же плавным переходом и с учётом шапки
    document.addEventListener('click', (e) => {
      const a = e.target.closest?.('a[href^="#"]');
      if (!on || !a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const i = sections.findIndex((s) => '#' + s.id === a.hash);
      if (i < 0) return;
      e.preventDefault();
      go(stops()[i].a, STEP);
      history.replaceState(null, '', a.hash);
    });

    modules.push({
      always: true,
      tick(dt, now) {
        if (anim) {
          const k = clamp((now - anim.t0) / anim.ms, 0, 1);
          jump(lerp(anim.from, anim.to, anim.ease(k)));
          if (k >= 1) anim = null;
          return;
        }
        // После обычной прокрутки колесом не оставляем страницу «между экранами»
        if (settle && !tch && now - scrollT > 160 && now - wheelT > 160) {
          settle = false;
          const st = stops(), y = scrollY, c = where(y, st), s = st[c];
          if (y > s.b + 2 && c + 1 < st.length) go(y - s.b < st[c + 1].a - y ? s.b : st[c + 1].a, NEAR);
        }
      },
    });
  })();

  /* ---------- Конфетти ---------- */
  const cf = regCanvas($('#confetti'));
  const pieces = [];
  let cfDirty = false;
  function confetti(x, y, n = 110) {
    if (still) return;
    const cols = [T.accent, '#F5B83D', '#0B8A5F', '#E5484D', '#2FC6F6', '#7C3AED'];
    for (let i = 0; i < n; i++) {
      const a = rnd(0, TAU), sp = rnd(220, 720);
      pieces.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 300, r: rnd(0, TAU), vr: rnd(-12, 12), w: rnd(6, 11), h: rnd(8, 15), c: cols[i % cols.length], l: rnd(1.4, 2.4) });
    }
  }
  modules.push({
    always: true,
    tick(dt) {
      if (!pieces.length && !cfDirty) return;
      const { ctx, w, h } = cf;
      ctx.clearRect(0, 0, w, h);
      cfDirty = pieces.length > 0;
      for (let i = pieces.length - 1; i >= 0; i--) {
        const p = pieces[i];
        p.l -= dt; p.vy += 900 * dt; p.vx *= Math.exp(-dt * 1.2);
        p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
        if (p.l <= 0 || p.y > h + 40) { pieces.splice(i, 1); continue; }
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.globalAlpha = Math.min(1, p.l * 2);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 1.3)) + 1);
        ctx.restore();
      }
    },
  });

  /* ==========================================================
     1. Hero: живое слово в плашке и доска контент-плана
     ========================================================== */
  (function heroWord() {
    const roller = $('#roller');
    if (!roller) return;
    const win = $('.roller__win', roller);
    let word = $('#rollerWord');
    const words = ['сразу', 'по расписанию', 'без копипаста', 'с адаптацией'];
    let wi = 0, acc = 0;
    // в режиме fade слова сменяются проявлением (CSS), ширина подстраивается за то же время
    const setTr = () => { win.style.transition = `width ${fade ? FADE : 550}ms cubic-bezier(.22,1,.36,1)`; };
    setTr();

    function measure(text) {
      const probe = document.createElement('span');
      probe.className = 'roller__word';
      probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap';
      probe.textContent = text;
      win.appendChild(probe);
      const w = probe.getBoundingClientRect().width;
      probe.remove();
      return Math.ceil(w) + 2;
    }
    const fit = () => { win.style.width = measure(words[wi]) + 'px'; };
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    addEventListener('resize', fit);

    function next() {
      wi = (wi + 1) % words.length;
      const old = word;
      old.style.position = 'absolute';
      old.classList.replace('is-in', 'is-out') || old.classList.add('is-out'); // is-in объявлен в CSS позже и перебил бы уход
      setTimeout(() => old.remove(), 460);
      word = document.createElement('span');
      word.className = 'roller__word is-in';
      word.textContent = words[wi];
      win.appendChild(word);
      setTr(); fit();
    }
    win.style.position = 'relative';

    watch(roller, {
      tick(dt) {
        acc += dt;
        if (acc > 2.6) { acc = 0; next(); }
      },
    });
  })();

  (function heroBoard() {
    const board = $('#board');
    if (!board) return;
    const cols = $$('.col', board);
    const lists = cols.map((c) => $('.col__list', c));
    const counters = cols.map((c) => $('.col__h em', c));
    const cnt = counters.map((e) => +e.dataset.count || 0);
    const addBtn = $('#appAdd');
    const by = (s) => NETS.find((n) => n.s === s);
    const demo = [
      { t: 'Новинки недели в каталоге', n: ['ВК', 'TG', 'OK'] },
      { t: 'Анонс вебинара', n: ['ВК', 'In', 'TG'] },
      { t: 'Скидка выходного дня', n: ['OK', 'ММ', 'Pi', 'ВК'] },
      { t: 'Отзыв покупателя недели', n: ['TG', 'X'] },
    ];
    const userPosts = [
      { t: 'Ваш новый пост', n: ['ВК', 'TG', 'OK', 'ММ'] },
      { t: 'Подборка недели', n: ['ВК', 'Pi'] },
      { t: 'Анонс статьи', n: ['TG', 'In', 'X'] },
    ];
    const times = ['12:00', '15:30', '18:00', '20:15'];
    let di = 0, ui = 0, ti = 0;
    const travelers = [];

    const colHidden = (i) => getComputedStyle(cols[i]).display === 'none';
    function label(card, ci) {
      const st = $('.bcard__st', card);
      const map = { 0: ['d', 'черновик'], 1: ['0', card._time], 2: ['1', 'публикуется…'], 3: ['2', `✓ в ${card._n} соцсетях`] };
      const [s, txt] = map[ci];
      card.dataset.s = s; st.dataset.s = s; st.textContent = txt;
    }
    function makeCard(p) {
      const d = document.createElement('div');
      d.className = 'bcard bcard--live is-new';
      d.appendChild(document.createTextNode(p.t));
      const nets = document.createElement('span');
      nets.className = 'bcard__nets';
      nets.innerHTML = p.n.map((s) => { const n = by(s); return `<span class="chip chip--xs" style="--c:${n.c}" role="img" aria-label="${n.n}">${icon(n.s)}</span>`; }).join('') + '<span class="bcard__st"></span>';
      d.appendChild(nets);
      const bar = document.createElement('span');
      bar.className = 'bcard__bar';
      d.appendChild(bar);
      d._n = p.n.length;
      d._time = times[ti++ % times.length];
      return d;
    }
    function setCount(i, delta) { cnt[i] += delta; counters[i].textContent = cnt[i]; }
    // FLIP: карточки плавно переезжают из старого места в новое.
    // В режиме still перелёта нет: карточка в новой колонке проявляется на месте.
    function flip(change) {
      const before = new Map($$('.bcard', board).map((c) => [c, { r: c.getBoundingClientRect(), p: c.parentNode }]));
      change();
      $$('.bcard', board).forEach((c) => {
        const f = before.get(c);
        if (!f) return;
        if (still) { if (f.p !== c.parentNode) fadeIn(c); return; }
        const l = c.getBoundingClientRect();
        const dx = f.r.left - l.left, dy = f.r.top - l.top;
        if (Math.abs(dx) + Math.abs(dy) > 0.5) {
          c.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 650, easing: 'cubic-bezier(.6,0,.3,1)' });
        }
      });
    }
    function trim(i, max) {
      const extra = $$('.bcard:not(.bcard--live)', lists[i]);
      while (lists[i].children.length > max && extra.length) extra.pop().remove();
    }
    function spawn(p, ci, isDemo) {
      const card = makeCard(p);
      label(card, ci);
      flip(() => { lists[ci].prepend(card); trim(ci, 3); });
      setCount(ci, 1);
      travelers.push({ card, ci, t: 0, demo: isDemo });
    }

    // Стартовое состояние: демо-карточка уже на доске
    spawn(demo[di++], 1, true);
    $$('.bcard.is-new', board).forEach((c) => c.classList.remove('is-new'));

    addBtn.addEventListener('click', () => {
      if (travelers.filter((t) => !t.demo).length >= 2) return;
      spawn(userPosts[ui++ % userPosts.length], colHidden(0) ? 1 : 0, false);
    });

    watch(board, {
      tick(dt) {
        for (let k = travelers.length - 1; k >= 0; k--) {
          const tr = travelers[k];
          tr.t += dt;
          const hold = tr.ci === 3 ? 2.6 : 2.2;
          if (tr.t < hold) continue;
          tr.t = 0;
          if (tr.ci < 3) {
            const from = tr.ci, to = tr.ci + 1;
            flip(() => { lists[to].prepend(tr.card); label(tr.card, to); trim(to, 3); });
            tr.ci = to;
            setCount(from, -1); setCount(to, 1);
          } else {
            travelers.splice(k, 1);
            tr.card.classList.remove('bcard--live');
            if (tr.demo) spawn(demo[di++ % demo.length], 1, true);
          }
        }
      },
    });
  })();

  (function netstrip() {
    const track = $('#netstrip');
    if (!track) return;
    // Два одинаковых набора: дорожка сдвигается на −50% и стык совпадает пиксель в пиксель
    const one = NETS.map((n) => `<span class="netstrip__item"><span class="chip chip--sm" style="--c:${n.c}" aria-hidden="true">${icon(n.s)}</span>${n.n}</span>`).join('<b>·</b>');
    track.innerHTML = `<span class="netstrip__set">${one}<b>·</b></span><span class="netstrip__set" aria-hidden="true">${one}<b>·</b></span>`;
  })();

  /* ==========================================================
     2. Автопостинг: публикация разлетается по ленте
     ========================================================== */
  (function autopost() {
    const box = $('#autoDemo'), btn = $('#autoBtn'), hub = $('#autoHub'), feed = $('#autoFeed');
    const cnt = $('#autoCount'), art = $('#autoArt'), title = $('#autoTitle');
    const titles = ['Новинки недели в каталоге', 'Статья: как выбрать подарок', 'Отзыв покупателя', 'Акция выходного дня', 'Свежий кейс в блоге', 'Обзор новой модели'];
    let ti = 0, ni = 0, count = 0, busy = false, lastUser = -1e9, acc = 2.5;

    const center = (el) => {
      const a = box.getBoundingClientRect(), r = el.getBoundingClientRect();
      return { x: r.left - a.left + r.width / 2, y: r.top - a.top + r.height / 2 };
    };
    // still: пакет не летит, но ритм тот же — следующий шаг через dur
    function fly(from, to, dur) {
      if (still) return wait(dur);
      const p = document.createElement('span');
      p.className = 'packet';
      box.appendChild(p);
      const an = p.animate(
        [{ transform: `translate(${from.x}px, ${from.y}px) scale(.5)`, opacity: 0.5 },
         { transform: `translate(${to.x}px, ${to.y}px) scale(1)`, opacity: 1 }],
        { duration: dur, easing: 'cubic-bezier(.6,0,.3,1)' });
      return an.finished.then(() => p.remove(), () => p.remove());
    }
    function addItem(n, t) {
      const li = document.createElement('li');
      li.className = 'feed__item';
      li.innerHTML = `<span class="chip" style="--c:${n.c}" aria-hidden="true">${icon(n.s)}</span><span class="feed__txt"><b>${n.n}</b><span></span></span><svg class="feed__ok" width="22" height="22" role="img" aria-label="Опубликовано"><use href="#check"></use></svg>`;
      li.querySelector('.feed__txt span').textContent = t;
      feed.prepend(li);
      while (feed.children.length > 4) feed.lastElementChild.remove();
    }
    async function publish() {
      if (busy) return;
      busy = true;
      art.classList.add('is-flash');
      setTimeout(() => art.classList.remove('is-flash'), 700);
      await fly(center(btn), center(hub), 650);
      hub.classList.remove('is-pulse'); void hub.offsetWidth; hub.classList.add('is-pulse');
      const a = box.getBoundingClientRect(), f = feed.getBoundingClientRect();
      const top = { x: f.left - a.left + f.width / 2, y: f.top - a.top + 28 };
      await Promise.all([0, 1, 2].map((k) => wait(k * 120).then(() => fly(center(hub), top, 520))));
      const t = titles[ti % titles.length];
      for (let k = 0; k < 3; k++) {
        addItem(NETS[ni % NETS.length], t);
        ni++;
        await wait(150);
      }
      count += 3;
      cnt.textContent = count;
      ti++;
      title.textContent = titles[ti % titles.length];
      busy = false;
    }

    // Лента уже заполнена при загрузке
    [[8, 'Свежий кейс в блоге'], [2, 'Отзыв покупателя'], [1, 'Отзыв покупателя'], [0, 'Отзыв покупателя']]
      .forEach(([i, t]) => addItem(NETS[i], t));
    ni = 3;

    btn.addEventListener('click', () => { lastUser = performance.now(); publish(); });

    watch(box, {
      tick(dt, now) {
        if (busy || now - lastUser < 9000) return;
        acc += dt;
        if (acc > 4.2) { acc = 0; publish(); }
      },
    });
  })();

  /* ==========================================================
     3. Песочница: поймай соцсеть и закинь в SEOlit
     ========================================================== */
  (function sandbox() {
    const box = $('#sandbox'), hubEl = $('#sbHub'), cntEl = $('#sbCount'), msg = $('#sbMsg'), hud = $('.sb-hud', box);
    const balls = NETS.slice(1).map((n, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'ball'; b.innerHTML = icon(n.s); b.title = n.n;
      b.style.setProperty('--c', n.c);
      b.setAttribute('aria-label', `${n.n}: подключить`);
      box.appendChild(b);
      return { el: b, n, i, x: 0, y: 0, vx: 0, vy: 0, state: 'free', thrown: 0, s: 1, samples: [] };
    });
    let W = 0, H = 0, r = 28, top = 0, hub = { x: 0, y: 0, R: 60 };
    let caught = 0, spin = 0, msgTimer = 0;

    function layout() {
      W = box.clientWidth; H = box.clientHeight;
      r = W < 560 ? 23 : 29;
      const hs = W < 560 ? 112 : 140;
      top = hud.offsetTop + hud.offsetHeight + 4;
      box.style.setProperty('--hub', hs + 'px');
      hub = { x: W / 2, y: top + (H - top) / 2, R: hs / 2 };
      hubEl.style.top = hub.y + 'px';
      balls.forEach((b) => {
        b.el.style.width = b.el.style.height = 2 * r + 'px';
        b.x = clamp(b.x, r, W - r); b.y = clamp(b.y, top + r, H - r);
      });
    }
    function showMsg(t, sticky) {
      msg.textContent = t; msg.classList.remove('is-hidden');
      clearTimeout(msgTimer);
      if (!sticky) msgTimer = setTimeout(() => msg.classList.add('is-hidden'), 2400);
    }
    function setCount() { cntEl.textContent = caught; }
    function markFree(b) {
      b.state = 'free'; b.el.classList.remove('is-caught');
      b.el.setAttribute('aria-label', `${b.n.n}: подключить`);
    }
    // Случайное место подальше от узла и случайное направление; в still — медленнее и с проявлением
    function place(b) {
      let tries = 0;
      do { b.x = rnd(r, W - r); b.y = rnd(top + r, H - r); tries++; }
      while (tries < 60 && Math.hypot(b.x - hub.x, b.y - hub.y) < hub.R + r + 24);
      b.s = 1; b.thrown = 0;
      const a = rnd(0, TAU), sp = still ? rnd(25, 45) : rnd(60, 150);
      b.vx = Math.cos(a) * sp; b.vy = Math.sin(a) * sp;
      if (still) fadeIn(b.el);
    }
    function scatter() {
      balls.forEach((b) => {
        markFree(b);
        place(b);
      });
      caught = 0; setCount();
      msg.classList.add('is-hidden');
    }
    // Место пойманного мяча на круге вокруг узла. В still место постоянное, без кружения.
    function slot(b, k, n) {
      const a = still ? -Math.PI / 2 + (b.i * TAU) / balls.length : spin + (k * TAU) / n;
      const orR = hub.R + r * 0.72 + 8;
      return { x: hub.x + Math.cos(a) * orR, y: hub.y + Math.sin(a) * orR };
    }
    function capture(b) {
      if (b.state === 'caught') return;
      b.state = 'caught'; b.el.classList.add('is-caught');
      b.el.setAttribute('aria-label', `${b.n.n}: подключено, нажмите, чтобы отключить`);
      if (still) { Object.assign(b, slot(b), { s: 0.72 }); fadeIn(b.el); }
      caught++; setCount();
      hubEl.classList.remove('is-pulse'); void hubEl.offsetWidth; hubEl.classList.add('is-pulse');
      setTimeout(() => hubEl.classList.remove('is-pulse'), 420);
      if (caught === balls.length) {
        showMsg('Все 11 подключены. Цена та же: 800 ₽ в месяц', true);
        const br = box.getBoundingClientRect();
        confetti(br.left + hub.x, br.top + hub.y, 120);
      } else {
        showMsg(caught === 1 ? `${b.n.n} подключён. Цена: 800 ₽` : `Подключено ${caught}. Цена всё ещё 800 ₽`);
      }
    }
    function pushOut(b) {
      markFree(b);
      if (still) { place(b); return; }
      const a = Math.atan2(b.y - hub.y, b.x - hub.x);
      b.vx = Math.cos(a) * 460; b.vy = Math.sin(a) * 460; b.thrown = 0;
    }

    balls.forEach((b) => {
      b.el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const br = box.getBoundingClientRect();
        b.wasCaught = b.state === 'caught';
        b.state = 'drag'; b.el.classList.add('is-drag');
        b.offX = e.clientX - br.left - b.x; b.offY = e.clientY - br.top - b.y;
        b.downT = performance.now(); b.downX = e.clientX; b.downY = e.clientY;
        b.samples = [{ x: e.clientX, y: e.clientY, t: b.downT }];
        try { b.el.setPointerCapture(e.pointerId); } catch (_) { /* ничего */ }
      });
      b.el.addEventListener('pointermove', (e) => {
        if (b.state !== 'drag') return;
        const br = box.getBoundingClientRect();
        b.x = clamp(e.clientX - br.left - b.offX, r, W - r);
        b.y = clamp(e.clientY - br.top - b.offY, top + r, H - r);
        b.samples.push({ x: e.clientX, y: e.clientY, t: performance.now() });
        if (b.samples.length > 6) b.samples.shift();
      });
      const up = (e) => {
        if (b.state !== 'drag') return;
        b.el.classList.remove('is-drag');
        const now = performance.now();
        const dist = Math.hypot(e.clientX - b.downX, e.clientY - b.downY);
        if (b.wasCaught) { caught--; setCount(); }
        if (dist < 6 && now - b.downT < 400) {
          // касание: подключить или отключить
          if (b.wasCaught) pushOut(b); else { markFree(b); b.state = 'home'; }
          return;
        }
        markFree(b);
        const s0 = b.samples[0], s1 = b.samples[b.samples.length - 1];
        const dtv = Math.max(16, s1.t - s0.t) / 1000;
        b.vx = clamp((s1.x - s0.x) / dtv, -1600, 1600);
        b.vy = clamp((s1.y - s0.y) / dtv, -1600, 1600);
        if (now - s1.t > 120) { b.vx *= 0.2; b.vy *= 0.2; }
        b.thrown = 1.2;
        if (Math.hypot(b.x - hub.x, b.y - hub.y) < hub.R + r * 0.5) capture(b);
      };
      b.el.addEventListener('pointerup', up);
      b.el.addEventListener('pointercancel', up);
      b.el.addEventListener('click', (e) => {
        if (e.detail !== 0) return; // клавиатура
        if (b.state === 'caught') { caught--; setCount(); pushOut(b); }
        else b.state = 'home';
      });
    });

    $('#sbAll').addEventListener('click', () => {
      balls.filter((b) => b.state === 'free').forEach((b, k) => setTimeout(() => { if (b.state === 'free') b.state = 'home'; }, k * 110));
    });
    $('#sbReset').addEventListener('click', scatter);

    layout(); scatter();
    if ('ResizeObserver' in window) new ResizeObserver(layout).observe(box);

    function render() {
      for (const b of balls) {
        b.el.style.transform = `translate3d(${(b.x - r).toFixed(1)}px, ${(b.y - r).toFixed(1)}px, 0) scale(${b.s.toFixed(3)})`;
      }
    }
    render();

    watch(box, {
      tick(dt) {
        dt = Math.min(dt, 0.033);
        spin += dt * 0.5;
        const minSp = still ? 25 : 45; // мячи плавают сами в обоих режимах
        for (const b of balls) {
          if (b.state === 'home') {
            // still: без полёта к узлу — сразу на место и проявление
            if (still) { capture(b); continue; }
            const dx = hub.x - b.x, dy = hub.y - b.y, d = Math.hypot(dx, dy) || 1;
            b.vx = lerp(b.vx, (dx / d) * 900, 0.18); b.vy = lerp(b.vy, (dy / d) * 900, 0.18);
            b.x += b.vx * dt; b.y += b.vy * dt;
            if (d < hub.R) capture(b);
          } else if (b.state === 'free') {
            b.x += b.vx * dt; b.y += b.vy * dt;
            const sp = Math.hypot(b.vx, b.vy);
            const jit = still ? 35 : 70;
            b.vx += (Math.random() - 0.5) * jit * dt; b.vy += (Math.random() - 0.5) * jit * dt;
            if (still && sp > 60) { const f = Math.exp(-dt * 2); b.vx *= f; b.vy *= f; } // брошенный мяч быстро успокаивается
            else if (sp > 190) { const f = Math.exp(-dt * 1.4); b.vx *= f; b.vy *= f; }
            else if (sp < minSp && sp > 0.01) { b.vx *= minSp / sp; b.vy *= minSp / sp; }
            if (b.x < r) { b.x = r; b.vx = Math.abs(b.vx) * 0.9; }
            if (b.x > W - r) { b.x = W - r; b.vx = -Math.abs(b.vx) * 0.9; }
            if (b.y < top + r) { b.y = top + r; b.vy = Math.abs(b.vy) * 0.9; }
            if (b.y > H - r) { b.y = H - r; b.vy = -Math.abs(b.vy) * 0.9; }
            const dx = b.x - hub.x, dy = b.y - hub.y, d = Math.hypot(dx, dy) || 1, lim = hub.R + r * 0.6;
            if (d < lim) {
              if (b.thrown > 0) capture(b);
              else {
                const nx = dx / d, ny = dy / d;
                b.x = hub.x + nx * lim; b.y = hub.y + ny * lim;
                const vn = b.vx * nx + b.vy * ny;
                if (vn < 0) { b.vx -= 2 * vn * nx; b.vy -= 2 * vn * ny; }
              }
            }
            b.thrown = Math.max(0, b.thrown - dt);
          }
        }
        // Столкновения свободных мячей
        for (let i = 0; i < balls.length; i++) {
          const a = balls[i];
          if (a.state !== 'free') continue;
          for (let j = i + 1; j < balls.length; j++) {
            const c = balls[j];
            if (c.state !== 'free') continue;
            const dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy);
            if (d > 0 && d < 2 * r) {
              const nx = dx / d, ny = dy / d, ov = (2 * r - d) / 2;
              a.x -= nx * ov; a.y -= ny * ov; c.x += nx * ov; c.y += ny * ov;
              const va = a.vx * nx + a.vy * ny, vc = c.vx * nx + c.vy * ny;
              if (va - vc > 0) {
                a.vx += (vc - va) * nx; a.vy += (vc - va) * ny;
                c.vx += (va - vc) * nx; c.vy += (va - vc) * ny;
              }
            }
          }
        }
        // Подключённые кружат вокруг SEOlit
        const cs = balls.filter((b) => b.state === 'caught');
        cs.forEach((b, k) => {
          const p = slot(b, k, cs.length);
          if (still) { b.x = p.x; b.y = p.y; b.s = 0.72; return; }
          b.x = lerp(b.x, p.x, 0.15);
          b.y = lerp(b.y, p.y, 0.15);
          b.s = lerp(b.s, 0.72, 0.15);
        });
        balls.forEach((b) => { if (b.state !== 'caught') b.s = lerp(b.s, b.state === 'drag' && !still ? 1.12 : 1, 0.2); });
        render();
      },
    });
  })();

  /* ==========================================================
     4. Как это работает: выбор источника
     ========================================================== */
  (function how() {
    const box = $('#howBox'), btns = $$('.seg button', box), title = $('#howTitle'), text = $('#howText');
    const D = {
      site: { t: 'Ваш сайт', x: 'Подключаем RSS-Atom ленту или API постинга. Новые материалы сайта сами уходят в соцсети.' },
      social: { t: 'Ваша соцсеть', x: 'Выбираем ведущую соцсеть. Каждый новый пост копируется в остальные с адаптацией под каждую.' },
      head: { t: 'Ваши идеи', x: 'Пишем пост прямо в SEOlit: шаблоны, водяные знаки, подгонка изображений и расписание.' },
    };
    const order = ['site', 'social', 'head'];
    let cur = 'site', tc = 999, user = false, acc = 0;
    text.textContent = D.site.x;
    text.classList.remove('typing');

    function pick(k, byUser) {
      cur = k; tc = 0; acc = 0;
      if (byUser) user = true;
      box.dataset.src = k;
      btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.src === k)));
      title.textContent = D[k].t;
      // fade: текст не печатается, а проявляется целиком вместе с заголовком
      if (fade) { text.textContent = D[k].x; tc = D[k].x.length + 1; fadeIn(title); fadeIn(text); return; }
      text.textContent = '';
      text.classList.add('typing');
    }
    btns.forEach((b) => b.addEventListener('click', () => pick(b.dataset.src, true)));

    watch(box, {
      tick(dt) {
        const full = D[cur].x;
        if (tc < full.length + 1) {
          tc += dt * 40;
          const n = Math.min(full.length, Math.floor(tc));
          if (text.textContent.length !== n) text.textContent = full.slice(0, n);
          if (n >= full.length) text.classList.remove('typing');
        }
        if (!user) {
          acc += dt;
          if (acc > 7.5) pick(order[(order.indexOf(cur) + 1) % order.length]);
        }
      },
    });
  })();

  /* ==========================================================
     5. Цена: калькулятор, 3D-наклон, бегущие строки
     ========================================================== */
  (function price() {
    const card = $('#pcard'), range = $('#extra'), out = $('#extraOut'), sum = $('#priceSum');
    let shown = 800, target = 800, hover = false, t = 0;
    range.addEventListener('input', () => {
      const n = +range.value;
      out.textContent = n;
      target = 800 + 100 * n;
    });
    if (fine) {
      card.addEventListener('pointerenter', () => { hover = true; });
      card.addEventListener('pointermove', (e) => {
        if (still) return; // наклон в 3D — крупное движение
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--ry', ((px - 0.5) * 14).toFixed(1) + 'deg');
        card.style.setProperty('--rx', ((0.5 - py) * 12).toFixed(1) + 'deg');
        card.style.setProperty('--gx', (px * 100).toFixed(0) + '%');
        card.style.setProperty('--gy', (py * 100).toFixed(0) + '%');
      });
      card.addEventListener('pointerleave', () => { hover = false; });
    }
    watch(card, {
      tick(dt) {
        if (shown !== target) {
          shown = Math.abs(target - shown) < 1 ? target : lerp(shown, target, 1 - Math.exp(-dt * 10));
          sum.textContent = Math.round(shown).toLocaleString('ru-RU');
        }
        if (!hover && !still) {
          t += dt;
          card.style.setProperty('--ry', (Math.sin(t * 0.8) * 6).toFixed(2) + 'deg');
          card.style.setProperty('--rx', (Math.cos(t * 0.6) * 4).toFixed(2) + 'deg');
          card.style.setProperty('--gx', (50 + Math.sin(t * 0.8) * 30).toFixed(0) + '%');
        }
      },
    });

    // Бегущие строки возможностей
    const G = [
      ['Настраиваем', ['Автопостинг', 'Кросспостинг', 'Совместную работу', 'Работу с товарами', 'RSS-Atom ленты', 'API постинга', 'UTM-метки', 'Геометки']],
      ['Постим красиво', ['Шаблоны для постов', 'Водяные знаки', 'Подгонка изображений', 'Наложение текста на фото', 'Автокартинки', 'Публикация альбомов', 'Видео и его кросспостинг']],
      ['Планируем', ['Аналитика постинга', 'Настройка расписания', 'Фильтрация материалов', 'Частота постинга', 'Лимит на количество постов', 'Бесконечный повтор', 'Автоочистка очереди', 'Отложенный постинг', 'Автоудаление постов']],
      ['Работаем удобно', ['Техподдержка 24/7', 'Реферальная система', 'Безналичная оплата', 'Нестандартные решения']],
    ];
    const mq = $('#marquee');
    const tick = '<svg width="16" height="16" aria-hidden="true"><use href="#check"></use></svg>';
    G.forEach(([head, items], gi) => {
      const row = document.createElement('div');
      row.className = 'mq' + (gi % 2 ? ' mq--rev' : '');
      const track = document.createElement('div');
      track.className = 'mq__track';
      track.style.setProperty('--dur', 18 + items.length * 4 + 's');
      const reps = items.length < 6 ? 4 : 2;
      let html = '';
      for (let k = 0; k < reps; k++) {
        const hidden = k > 0 ? ' aria-hidden="true"' : '';
        html += `<span class="tag tag--head"${hidden}>${head}</span>`;
        html += items.map((it) => `<span class="tag"${hidden}>${tick}${it}</span>`).join('');
      }
      track.innerHTML = html;
      row.appendChild(track);
      mq.appendChild(row);
    });
  })();

  /* ==========================================================
     6. Живой график с лимитом публикаций
     ========================================================== */
  (function chart() {
    const cvEl = $('#chart'), lim = $('#limit'), limOut = $('#limitOut'), stPub = $('#stPub'), stQ = $('#stQ');
    const cv = regCanvas(cvEl);
    const N = 24, step = 0.9, maxV = 12;
    let limit = 4, queue = 0, pubTotal = 0, hour = 0, phase = 0, hoverX = -1, fresh = 1, acc = 0;
    const bars = [];
    function newHour() {
      hour++;
      const inc = Math.max(0, Math.round(3.6 + 2.8 * Math.sin(hour * 0.55) + rnd(-1.8, 2.2)));
      const total = inc + queue;
      const pub = Math.min(limit, total);
      queue = Math.min(99, total - pub);
      pubTotal += pub;
      bars.push({ pub, q: queue });
      if (bars.length > N + 1) bars.shift();
    }
    for (let i = 0; i <= N; i++) newHour();
    lim.addEventListener('input', () => { limit = +lim.value; limOut.textContent = limit; });
    cvEl.addEventListener('pointermove', (e) => { hoverX = e.clientX - cvEl.getBoundingClientRect().left; });
    cvEl.addEventListener('pointerleave', () => { hoverX = -1; });

    function rr(ctx, x, y, w, h, rad) {
      if (h <= 0) return;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, w, h, [rad, rad, 0, 0]); else ctx.rect(x, y, w, h);
      ctx.fill();
    }
    function draw() {
      const { ctx, w, h } = cv;
      ctx.clearRect(0, 0, w, h);
      const padL = 28, padB = 22, padT = 12;
      const ch = h - padB - padT, cw = w - padL - 4;
      const y = (v) => padT + ch - (Math.min(v, maxV) / maxV) * ch;
      ctx.font = '600 11px Manrope, system-ui, sans-serif';
      ctx.lineWidth = 1; ctx.strokeStyle = T.line; ctx.fillStyle = T.muted;
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      [0, 4, 8, 12].forEach((v) => {
        ctx.beginPath(); ctx.moveTo(padL, Math.round(y(v)) + 0.5); ctx.lineTo(w, Math.round(y(v)) + 0.5); ctx.stroke();
        ctx.fillText(String(v), padL - 8, y(v));
      });
      const slot = cw / N, bw = Math.max(4, slot * 0.62);
      // still: столбцы не едут, сетка стоит со сдвигом в один час, новый столбец проявляется
      const ph = still ? 1 : phase;
      let hov = null;
      ctx.save();
      ctx.beginPath(); ctx.rect(padL, 0, cw + 4, h); ctx.clip();
      bars.forEach((b, i) => {
        const x = padL + (i - ph) * slot + (slot - bw) / 2;
        ctx.globalAlpha = still && i === bars.length - 1 ? fresh : 1;
        ctx.fillStyle = T.accent;
        rr(ctx, x, y(b.pub), bw, y(0) - y(b.pub), 4);
        if (b.q > 0) {
          const topV = b.pub + b.q;
          ctx.setLineDash([3, 3]); ctx.strokeStyle = T.muted;
          ctx.strokeRect(x + 0.5, y(topV) + 0.5, bw - 1, Math.max(0, y(b.pub) - y(topV) - 2));
          ctx.setLineDash([]);
        }
        if (hoverX >= x && hoverX <= x + bw) hov = { b, x };
      });
      ctx.restore();
      ctx.globalAlpha = 1;

      ctx.strokeStyle = T.coral; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(padL, y(limit)); ctx.lineTo(w, y(limit)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = T.coral; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
      ctx.font = '800 11px Manrope, system-ui, sans-serif';
      ctx.fillText('лимит ' + limit, w - 6, y(limit) - 4);
      ctx.fillStyle = T.muted; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.font = '600 11px Manrope, system-ui, sans-serif';
      ctx.fillText('часы →', padL, h - 5);

      if (hov) {
        const txt = `Опубликовано ${hov.b.pub} · в очереди ${hov.b.q}`;
        ctx.font = '700 12px Manrope, system-ui, sans-serif';
        const tw = ctx.measureText(txt).width + 18;
        const tx = clamp(hov.x - tw / 2, padL, w - tw);
        ctx.fillStyle = T.fg;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(tx, 4, tw, 26, 8); else ctx.rect(tx, 4, tw, 26);
        ctx.fill();
        ctx.fillStyle = T.bg; ctx.textBaseline = 'middle';
        ctx.fillText(txt, tx + 9, 17);
      }
      stPub.textContent = pubTotal;
      stQ.textContent = queue;
    }
    draw();
    watch(cvEl, {
      tick(dt) {
        if (still) {
          // обновление раз в 2 с без сдвига
          acc += dt;
          if (acc >= 2) { acc = 0; fresh = 0; newHour(); }
          fresh = Math.min(1, fresh + (dt * 1000) / FADE);
        } else {
          phase += dt / step;
          while (phase >= 1) { phase -= 1; newHour(); }
        }
        draw();
      },
    });
  })();

  /* ==========================================================
     7. ИИ-соавтор: модели по очереди, запрос → ответ → в пост
     ========================================================== */
  (function aiCoauthor() {
    const box = $('#aiBox');
    if (!box) return;
    const btns = $$('[data-m]', box), names = $$('.ai__pill', box).map((b) => b.textContent);
    const prompt = $('#aiPrompt'), send = $('#aiSend'), ans = $('#aiAns'), ansModel = $('#aiAnsModel');
    const text = $('#aiText'), range = $('#aiTemp');
    const ANSWER = 'Не знаете, что подарить? Собрали 7 идей для близких и коллег — от уютных мелочей до полезной техники. Всё с ценами и ссылками в статье на сайте.';
    const EMPTY_ANS = ans.textContent, EMPTY_TEXT = text.textContent;
    // Сценарий, секунды: свечение запроса → нажатие → «Пишу анонс…» → печать 35 симв/с → перенос в форму
    const T_PRESS = 1.3, T_WAIT = 1.5, T_TYPE = 2.7, CPS = 35;
    let model = 0, picked = false, mAcc = 0, t = 0, stage = 0, autoRange = true, rt = 0;
    const typeEnd = () => T_TYPE + (fade ? 0 : ANSWER.length / CPS);

    function setModel(i) {
      model = i;
      btns.forEach((b) => { const on = +b.dataset.m === i; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
      ansModel.textContent = names[i];
    }
    function setAns(txt, cls) { ans.textContent = txt; ans.className = 'ai__ans-t' + (cls ? ' ' + cls : ''); }
    function restart() {
      t = 0; stage = 0;
      setAns(EMPTY_ANS, 'is-empty');
      text.textContent = EMPTY_TEXT; text.classList.add('is-empty');
      prompt.classList.add('is-glow');
    }
    function setRange(v) { range.value = Math.round(v); range.style.setProperty('--v', range.value + '%'); }

    btns.forEach((b) => b.addEventListener('click', () => { picked = true; setModel(+b.dataset.m); restart(); }));
    // Кнопка запускает цикл сразу; во время цикла повторный клик ничего не делает
    send.addEventListener('click', () => {
      if (stage >= 1 && stage < 5) return;
      restart(); t = T_PRESS;
    });
    const stopAuto = () => { autoRange = false; };
    range.addEventListener('pointerdown', stopAuto);
    range.addEventListener('keydown', stopAuto);
    range.addEventListener('input', () => { autoRange = false; setRange(+range.value); });

    setRange(38);
    restart();

    watch(box, {
      tick(dt) {
        t += dt;
        if (stage === 0 && t >= T_PRESS) {
          stage = 1;
          send.classList.add('is-press');
          setTimeout(() => send.classList.remove('is-press'), 200);
        }
        if (stage === 1 && t >= T_WAIT) { stage = 2; setAns('Пишу анонс…', 'is-wait'); }
        if (stage === 2 && t >= T_TYPE) {
          stage = 3;
          setAns(fade ? ANSWER : '');
          if (fade) fadeIn(ans);
        }
        if (stage === 3) {
          // fade: ответ появляется целиком, без печати
          if (!fade) {
            const n = Math.min(ANSWER.length, Math.floor((t - T_TYPE) * CPS));
            if (ans.textContent.length !== n) ans.textContent = ANSWER.slice(0, n);
          }
          if (t >= typeEnd()) stage = 4;
        }
        if (stage === 4 && t >= typeEnd() + 0.4) {
          // ответ переносится в «Текст публикации» с короткой подсветкой
          stage = 5;
          prompt.classList.remove('is-glow');
          text.textContent = ANSWER;
          text.classList.remove('is-empty');
          text.classList.add('is-new');
          fadeIn(text);
          requestAnimationFrame(() => requestAnimationFrame(() => text.classList.remove('is-new')));
        }
        if (stage === 5 && t >= Math.max(9, typeEnd() + 2.6)) restart();

        // Модели подсвечиваются по очереди, пока посетитель не выбрал свою
        if (!picked) {
          mAcc += dt;
          if (mAcc >= 2) { mAcc = 0; setModel((model + 1) % names.length); }
        }
        // Ползунок «Случайность» ходит 38 % ↔ 62 % за 5 с, пока его не тронули
        if (autoRange) { rt += dt; setRange(50 - 12 * Math.cos((rt * TAU) / 5)); }
      },
    });
  })();

  /* ==========================================================
     8. 3D-куб Битрикс24
     ========================================================== */
  (function cube() {
    const scene = $('#cubeScene'), cubeEl = $('#cube');
    let rx = -18, ry = 32, vx = 0, vy = still ? 0 : 26, drag = false, lx = 0, ly = 0, lt = 0;
    const apply = () => { cubeEl.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`; };
    apply();
    scene.addEventListener('pointerdown', (e) => {
      drag = true; lx = e.clientX; ly = e.clientY; lt = performance.now();
      scene.style.cursor = 'grabbing';
      try { scene.setPointerCapture(e.pointerId); } catch (_) { /* ничего */ }
    });
    scene.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const now = performance.now(), dts = Math.max(0.008, (now - lt) / 1000);
      const dx = e.clientX - lx, dy = e.clientY - ly;
      ry += dx * 0.5; rx -= dy * 0.5;
      vy = lerp(vy, (dx * 0.5) / dts, 0.5); vx = lerp(vx, (-dy * 0.5) / dts, 0.5);
      lx = e.clientX; ly = e.clientY; lt = now;
      apply();
    });
    const end = () => { drag = false; scene.style.cursor = ''; vx = clamp(vx, -600, 600); vy = clamp(vy, -600, 600); };
    scene.addEventListener('pointerup', end);
    scene.addEventListener('pointercancel', end);
    watch(scene, {
      tick(dt) {
        if (drag) return;
        // still: сам не вращается, после поворота пальцем быстро останавливается там, где оставили
        if (still && Math.abs(vx) + Math.abs(vy) < 0.05) return;
        const k = 1 - Math.exp(-dt * (still ? 6 : 1.4));
        vy = lerp(vy, still ? 0 : 26, k);
        vx = lerp(vx, 0, k);
        ry += vy * dt; rx += vx * dt;
        if (!still) rx = lerp(rx, -18, 1 - Math.exp(-dt * 0.8));
        apply();
      },
    });
  })();

  /* ==========================================================
     9. Старт: искры за курсором и конфетти
     ========================================================== */
  (function start() {
    const panel = $('.start-panel'), btn = $('#startBtn');
    const cv = regCanvas($('#startFx'));
    const ps = [];
    let px = -1, py = -1, t = 0, emit = 0;
    panel.addEventListener('pointermove', (e) => {
      const r = panel.getBoundingClientRect();
      px = e.clientX - r.left; py = e.clientY - r.top;
    });
    panel.addEventListener('pointerleave', () => { px = -1; });
    btn.addEventListener('click', () => {
      const r = btn.getBoundingClientRect();
      confetti(r.left + r.width / 2, r.top + r.height / 2, 150);
    });
    watch(panel, {
      tick(dt) {
        const { ctx, w, h } = cv;
        t += dt;
        let x = px, y = py;
        if (x < 0) { x = w * (0.5 + 0.42 * Math.sin(t * 0.7)); y = h * (0.5 + 0.34 * Math.sin(t * 1.3)); }
        if (!still) {
          emit += dt;
          while (emit > 0.018) { emit -= 0.018; ps.push({ x, y, vx: rnd(-50, 50), vy: rnd(-70, 20), l: 1, r: rnd(1.5, 4.2) }); }
        }
        if (ps.length > 360) ps.splice(0, ps.length - 360);
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#fff';
        for (let i = ps.length - 1; i >= 0; i--) {
          const p = ps[i];
          p.l -= dt * 0.9;
          if (p.l <= 0) { ps.splice(i, 1); continue; }
          p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 30 * dt;
          ctx.globalAlpha = p.l * 0.55;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * p.l, 0, TAU); ctx.fill();
        }
        ctx.globalAlpha = 1;
      },
    });
  })();

  /* ---------- Запуск ---------- */
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (scrollDirty) { scrollDirty = false; updateScroll(); }
    for (const m of modules) if (m.always || m.active) m.tick(dt, now);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
