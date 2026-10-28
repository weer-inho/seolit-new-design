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
  let reduced = mqReduce.matches;
  mqReduce.addEventListener?.('change', (e) => { reduced = e.matches; });

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
      if (fine && !reduced && b.classList.contains('magnetic')) {
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
    if (reduced) { par.forEach((p) => { p.el.style.translate = ''; }); return; }
    const vh = innerHeight, k = innerWidth < 900 ? 0.55 : 1;
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

  /* ---------- Конфетти ---------- */
  const cf = regCanvas($('#confetti'));
  const pieces = [];
  let cfDirty = false;
  function confetti(x, y, n = 110) {
    if (reduced) n = Math.min(n, 30);
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
    win.style.transition = 'width .55s cubic-bezier(.22,1,.36,1)';

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
      old.classList.add('is-out');
      setTimeout(() => old.remove(), 460);
      word = document.createElement('span');
      word.className = 'roller__word is-in';
      word.textContent = words[wi];
      win.appendChild(word);
      fit();
    }
    win.style.position = 'relative';

    watch(roller, {
      tick(dt) {
        if (reduced) return;
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
      nets.innerHTML = p.n.map((s) => { const n = by(s); return `<span class="chip chip--xs" style="--c:${n.c}">${n.s}</span>`; }).join('') + '<span class="bcard__st"></span>';
      d.appendChild(nets);
      const bar = document.createElement('span');
      bar.className = 'bcard__bar';
      d.appendChild(bar);
      d._n = p.n.length;
      d._time = times[ti++ % times.length];
      return d;
    }
    function setCount(i, delta) { cnt[i] += delta; counters[i].textContent = cnt[i]; }
    // FLIP: карточки плавно переезжают из старого места в новое
    function flip(change) {
      const before = new Map($$('.bcard', board).map((c) => [c, c.getBoundingClientRect()]));
      change();
      if (reduced) return;
      $$('.bcard', board).forEach((c) => {
        const f = before.get(c);
        if (!f) return;
        const l = c.getBoundingClientRect();
        const dx = f.left - l.left, dy = f.top - l.top;
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
        if (reduced) return;
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
    const one = NETS.map((n) => `<span>${n.n}</span>`).join('<b>·</b>');
    track.innerHTML = `<span class="netstrip__set">${one}<b>·</b></span><span class="netstrip__set" aria-hidden="true">${one}<b>·</b></span>`;
  })();

  /* ==========================================================
     2. Орбита соцсетей (псевдо-3D, крутится сама и пальцем)
     ========================================================== */
  (function orbit() {
    const el = $('#orbit'), core = $('#orbitCore'), cap = $('#postCap'), sentEl = $('#postSent');
    const fx = regCanvas($('#orbitFx'));
    const nodes = NETS.map((n, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'node'; b.textContent = n.s; b.title = n.n;
      b.style.setProperty('--c', n.c);
      b.setAttribute('aria-label', `${n.n}: отправить пост`);
      el.appendChild(b);
      return { el: b, i, net: n, x: 0, y: 0, z: 0 };
    });

    let W = 0, H = 0, R = 0;
    let rot = 0, vel = 0.35, tilt = 0.42, tiltT = 0.42;
    let drag = false, lastX = 0, lastT = 0, moved = 0, downNode = null;
    const base = 0.35;
    const packets = [];
    const hitSet = new Set();
    let emitAcc = 0;

    const caps = ['Новинки недели уже на сайте', 'Статья: как выбрать подарок', 'Акция выходного дня', 'Отзыв покупателя недели', 'Свежий кейс в блоге'];
    let capI = 0, capT = 99;

    function size() { W = el.clientWidth; H = el.clientHeight; R = W * 0.43; }
    size();
    if ('ResizeObserver' in window) new ResizeObserver(size).observe(el);

    function fire(node, n = 3) { for (let k = 0; k < n; k++) packets.push({ to: node, t: -k * 0.14, dur: 0.75 }); }
    function hit(node) {
      node.el.classList.remove('is-hit'); void node.el.offsetWidth; node.el.classList.add('is-hit');
      hitSet.add(node.i);
      sentEl.textContent = hitSet.size >= 12 ? '✓ все 12 соцсетей' : `→ ${hitSet.size} из 12`;
    }

    el.addEventListener('pointerdown', (e) => {
      drag = true; moved = 0; lastX = e.clientX; lastT = performance.now();
      downNode = e.target.closest('.node');
      el.classList.add('is-drag');
      try { el.setPointerCapture(e.pointerId); } catch (_) { /* ничего */ }
    });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      if (fine && !drag) {
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        tiltT = 0.32 + 0.2 * clamp(py, 0, 1);
        core.style.setProperty('--rx', ((0.5 - py) * 16).toFixed(1) + 'deg');
        core.style.setProperty('--ry', ((px - 0.5) * 22).toFixed(1) + 'deg');
      }
      if (!drag) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      moved += Math.abs(dx);
      const dth = dx / (R || 1);
      rot += dth;
      vel = lerp(vel, dth / Math.max(0.008, (now - lastT) / 1000), 0.5);
      lastX = e.clientX; lastT = now;
    });
    const end = () => {
      if (!drag) return;
      drag = false; el.classList.remove('is-drag');
      vel = clamp(vel, -7, 7);
      if (moved < 6 && downNode) {
        const nd = nodes.find((n) => n.el === downNode);
        if (nd) fire(nd);
      }
      downNode = null;
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', () => { drag = false; el.classList.remove('is-drag'); downNode = null; });
    el.addEventListener('pointerleave', () => {
      if (!fine || drag) return;
      tiltT = 0.42;
      core.style.setProperty('--rx', '0deg'); core.style.setProperty('--ry', '0deg');
    });
    // Клавиатура: Enter/пробел на соцсети
    nodes.forEach((n) => n.el.addEventListener('click', (e) => { if (e.detail === 0) fire(n); }));

    watch(el, {
      tick(dt) {
        if (!drag) {
          const target = reduced ? 0 : base * (vel < 0 ? -1 : 1);
          vel = lerp(vel, target, 1 - Math.exp(-dt * 1.2));
          rot += vel * dt;
        }
        tilt = lerp(tilt, tiltT, 0.06);
        el.style.setProperty('--tilt-ratio', tilt.toFixed(3));

        const cx = W / 2, cy = H / 2;
        for (const n of nodes) {
          const th = rot + (n.i * TAU) / nodes.length;
          const x = Math.cos(th) * R, z = Math.sin(th), y = z * R * tilt;
          const s = 0.64 + 0.36 * (z + 1) / 2;
          n.x = cx + x; n.y = cy + y; n.z = z;
          n.el.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${s.toFixed(3)})`;
          n.el.style.zIndex = String(z > 0 ? 51 + Math.round(z * 40) : 10 + Math.round((z + 1) * 30));
          n.el.style.opacity = (0.5 + 0.5 * (z + 1) / 2).toFixed(2);
        }

        if (!reduced) {
          emitAcc += dt;
          if (emitAcc > 0.42) {
            emitAcc = 0;
            const front = nodes.filter((n) => n.z > -0.15);
            if (front.length) fire(front[(Math.random() * front.length) | 0], 1);
          }
        }

        const { ctx } = fx;
        ctx.clearRect(0, 0, fx.w, fx.h);
        ctx.lineCap = 'round';
        for (let k = packets.length - 1; k >= 0; k--) {
          const p = packets[k];
          p.t += dt / p.dur;
          if (p.t < 0) continue;
          if (p.t >= 1) { hit(p.to); packets.splice(k, 1); continue; }
          const e1 = 1 - Math.pow(1 - p.t, 3), e0 = 1 - Math.pow(1 - Math.max(0, p.t - 0.1), 3);
          const x = lerp(cx, p.to.x, e1), y = lerp(cy, p.to.y, e1);
          const tx = lerp(cx, p.to.x, e0), ty = lerp(cy, p.to.y, e0);
          ctx.globalAlpha = 0.45; ctx.strokeStyle = T.accent; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
          ctx.globalAlpha = 1; ctx.fillStyle = T.accent;
          ctx.beginPath(); ctx.arc(x, y, 4.5, 0, TAU); ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Подпись поста печатается
        const full = caps[capI];
        if (reduced) { if (cap.textContent !== full) cap.textContent = full; return; }
        capT += dt * 28;
        const shown = Math.min(full.length, Math.floor(capT));
        if (cap.textContent.length !== shown) cap.textContent = full.slice(0, shown);
        if (capT > full.length + 60) { capI = (capI + 1) % caps.length; capT = 0; }
      },
    });
    // стартовое значение: подпись уже напечатана
    capT = caps[0].length;
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
    function fly(from, to, dur) {
      const p = document.createElement('span');
      p.className = 'packet';
      box.appendChild(p);
      const an = p.animate(
        [{ transform: `translate(${from.x}px, ${from.y}px) scale(.5)`, opacity: 0.5 },
         { transform: `translate(${to.x}px, ${to.y}px) scale(1)`, opacity: 1 }],
        { duration: reduced ? 1 : dur, easing: 'cubic-bezier(.6,0,.3,1)' });
      return an.finished.then(() => p.remove(), () => p.remove());
    }
    function addItem(n, t) {
      const li = document.createElement('li');
      li.className = 'feed__item';
      li.innerHTML = `<span class="chip" style="--c:${n.c}">${n.s}</span><span class="feed__txt"><b>${n.n}</b><span></span></span><svg class="feed__ok" width="22" height="22" role="img" aria-label="Опубликовано"><use href="#check"></use></svg>`;
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
        if (busy || reduced || now - lastUser < 9000) return;
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
    const balls = NETS.slice(1).map((n) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'ball'; b.textContent = n.s; b.title = n.n;
      b.style.setProperty('--c', n.c);
      b.setAttribute('aria-label', `${n.n}: подключить`);
      box.appendChild(b);
      return { el: b, n, x: 0, y: 0, vx: 0, vy: 0, state: 'free', thrown: 0, s: 1, samples: [] };
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
    function scatter() {
      balls.forEach((b) => {
        markFree(b);
        let tries = 0;
        do { b.x = rnd(r, W - r); b.y = rnd(top + r, H - r); tries++; }
        while (tries < 60 && Math.hypot(b.x - hub.x, b.y - hub.y) < hub.R + r + 24);
        const a = rnd(0, TAU), sp = rnd(60, 150);
        b.vx = Math.cos(a) * sp; b.vy = Math.sin(a) * sp; b.s = 1; b.thrown = 0;
      });
      caught = 0; setCount();
      msg.classList.add('is-hidden');
    }
    function capture(b) {
      if (b.state === 'caught') return;
      b.state = 'caught'; b.el.classList.add('is-caught');
      b.el.setAttribute('aria-label', `${b.n.n}: подключено, нажмите, чтобы отключить`);
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
        spin += dt * (reduced ? 0 : 0.5);
        const minSp = reduced ? 0 : 45;
        for (const b of balls) {
          if (b.state === 'home') {
            const dx = hub.x - b.x, dy = hub.y - b.y, d = Math.hypot(dx, dy) || 1;
            b.vx = lerp(b.vx, (dx / d) * 900, 0.18); b.vy = lerp(b.vy, (dy / d) * 900, 0.18);
            b.x += b.vx * dt; b.y += b.vy * dt;
            if (d < hub.R) capture(b);
          } else if (b.state === 'free') {
            b.x += b.vx * dt; b.y += b.vy * dt;
            if (!reduced) { b.vx += (Math.random() - 0.5) * 70 * dt; b.vy += (Math.random() - 0.5) * 70 * dt; }
            const sp = Math.hypot(b.vx, b.vy);
            if (sp > 190) { const f = Math.exp(-dt * 1.4); b.vx *= f; b.vy *= f; }
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
        const orR = hub.R + r * 0.72 + 8;
        cs.forEach((b, k) => {
          const a = spin + (k * TAU) / cs.length;
          b.x = lerp(b.x, hub.x + Math.cos(a) * orR, 0.15);
          b.y = lerp(b.y, hub.y + Math.sin(a) * orR, 0.15);
          b.s = lerp(b.s, 0.72, 0.15);
        });
        balls.forEach((b) => { if (b.state !== 'caught') b.s = lerp(b.s, b.state === 'drag' ? 1.12 : 1, 0.2); });
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
      if (reduced) { text.textContent = D[k].x; return; }
      text.textContent = '';
      text.classList.add('typing');
    }
    btns.forEach((b) => b.addEventListener('click', () => pick(b.dataset.src, true)));

    watch(box, {
      tick(dt) {
        const full = D[cur].x;
        if (!reduced && tc < full.length + 1) {
          tc += dt * 40;
          const n = Math.min(full.length, Math.floor(tc));
          if (text.textContent.length !== n) text.textContent = full.slice(0, n);
          if (n >= full.length) text.classList.remove('typing');
        }
        if (!user && !reduced) {
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
        if (!hover && !reduced) {
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
    let limit = 4, queue = 0, pubTotal = 0, hour = 0, phase = 0, hoverX = -1;
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
      let hov = null;
      ctx.save();
      ctx.beginPath(); ctx.rect(padL, 0, cw + 4, h); ctx.clip();
      bars.forEach((b, i) => {
        const x = padL + (i - phase) * slot + (slot - bw) / 2;
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
        if (!reduced) phase += dt / step;
        while (phase >= 1) { phase -= 1; newHour(); }
        draw();
      },
    });
  })();

  /* ==========================================================
     7. 3D-куб Битрикс24
     ========================================================== */
  (function cube() {
    const scene = $('#cubeScene'), cubeEl = $('#cube');
    let rx = -18, ry = 32, vx = 0, vy = 26, drag = false, lx = 0, ly = 0, lt = 0;
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
        const k = 1 - Math.exp(-dt * 1.4);
        vy = lerp(vy, reduced ? 0 : 26, k);
        vx = lerp(vx, 0, k);
        ry += vy * dt; rx += vx * dt;
        rx = lerp(rx, -18, 1 - Math.exp(-dt * 0.8));
        apply();
      },
    });
  })();

  /* ==========================================================
     8. Старт: искры за курсором и конфетти
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
        if (!reduced) {
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
