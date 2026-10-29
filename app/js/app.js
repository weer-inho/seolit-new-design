/* SEOlit, демо-кабинет — оболочка и модули страниц. Без библиотек и сборки.
   Страница задаёт себя так: <div id="shell" data-page="projects"><main id="main">…</main></div>.
   Меню, верхняя панель, нижние вкладки, баннер демо и уведомления строятся здесь. */
(() => {
  'use strict';

  const { t, plural, money } = window.I18N;
  const I18N = window.I18N, DEMO = window.DEMO, NETS = window.SEOLIT_NETS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const tx = (o) => (o && typeof o === 'object' ? o[I18N.lang] ?? o.ru : o ?? ''); // текст из { ru, en, kk }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Значки интерфейса: линейные 24×24, обводка 2 px (пути из макетов) ---------- */
  const IC = {
    projects: '<rect x="3" y="4" width="7" height="7" rx="2"/><rect x="14" y="4" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    queue: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    templates: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/>',
    schedules: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    watermarks: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 16l4-5 3 4 2-2 3 3"/>',
    autoimg: '<rect x="3" y="5" width="8" height="8" rx="2"/><path d="M14 7h7M14 11h7M3 17h18"/>',
    balance: '<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18M7 15h4"/>',
    referrals: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M18 8v6M15 11h6"/>',
    api: '<path d="M8 9l-3 3 3 3M16 9l3 3-3 3M13 6l-2 12"/>',
    rss: '<circle cx="6" cy="18" r="1.5"/><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    stats: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    access: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2 .7 3 2.6 3 6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    back: '<path d="M15 18l-6-6 6-6"/>',
    chev: '<path d="M9 18l6-6-6-6"/>',
    down: '<path d="M6 9l6 6 6-6"/>',
    dots: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/>',
    logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    alert: '<path d="M12 3l9.5 17h-19zM12 10v4M12 17.5v.01"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    soon: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
  };
  const ico = (n, cls = '') => `<svg class="ico${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true">${IC[n] || ''}</svg>`;

  // Плашка соцсети: id из nets.js, размер 22 | 28 | 40. С подписью для экранного диктора, если не декоративная.
  function net(id, size = 28, decorative = true) {
    const n = NETS.byId(id);
    if (!n) return '';
    const label = netName(id);
    const a11y = decorative ? 'aria-hidden="true"' : `role="img" aria-label="${esc(label)}"`;
    return `<span class="net${size === 28 ? '' : ' net--' + size}" style="--c:${n.c}" ${a11y} title="${esc(label)}">${NETS.icon(n.s)}</span>`;
  }
  // Название соцсети на языке интерфейса (ключ net.<id>, иначе из nets.js)
  const netName = (id) => (I18N.has('net.' + id) ? t('net.' + id) : NETS.byId(id)?.n || id);

  /* ---------- Спрайт логотипа (тот же, что на лендинге) ---------- */
  document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="logo" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" style="fill: var(--accent)"></circle><circle cx="24" cy="24" r="12" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"></circle><path d="M24 24 L24 12 M24 24 L34.4 30 M24 24 L13.6 30" stroke="#fff" stroke-width="2.5" stroke-linecap="round"></path><circle cx="24" cy="24" r="4.5" fill="#fff"></circle><circle cx="24" cy="12" r="3.5" fill="#fff"></circle><circle cx="34.4" cy="30" r="3.5" fill="#fff"></circle><circle cx="13.6" cy="30" r="3.5" fill="#fff"></circle></symbol>
</svg>`);

  /* ---------- Тема ---------- */
  const root = document.documentElement;
  const mqDark = matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => root.dataset.theme === 'dark' || (root.dataset.theme !== 'light' && mqDark.matches);
  function toggleTheme() {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('seolit-theme', next); } catch (e) { /* ничего */ }
    syncTheme();
  }
  function syncTheme() {
    $$('[data-theme-btn]').forEach((b) => {
      const label = t(isDark() ? 'top.toLight' : 'top.toDark');
      b.innerHTML = ico(isDark() ? 'sun' : 'moon');
      b.setAttribute('aria-label', label); b.title = label;
    });
  }
  mqDark.addEventListener?.('change', syncTheme);

  /* ---------- Переключатель языка RU · EN · KZ ---------- */
  const langSeg = () => `<div class="seg" role="group" data-i18n-attr="aria-label:top.lang">${I18N.LANGS.map((l) =>
    `<button type="button" data-lang="${l}" aria-pressed="${l === I18N.lang}" lang="${l}">${I18N.LABEL[l]}</button>`).join('')}</div>`;
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lang]');
    if (b) I18N.setLang(b.dataset.lang);
    if (e.target.closest('[data-theme-btn]')) toggleTheme();
  });
  I18N.onChange((l) => {
    $$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
    syncTheme(); setTitle();
    const pb = $('[data-profile]'); if (pb) pb.setAttribute('aria-label', t('top.profile', { email: DEMO.loggedIn() || DEMO.user.email }));
  });

  /* ---------- Уведомления (toast) ---------- */
  let toastBox;
  function toast(msg) {
    if (!toastBox) { toastBox = document.createElement('div'); toastBox.className = 'toasts'; toastBox.setAttribute('role', 'status'); toastBox.setAttribute('aria-live', 'polite'); document.body.append(toastBox); }
    const el = document.createElement('div');
    el.className = 'toast'; el.textContent = msg;
    toastBox.append(el);
    setTimeout(() => { el.classList.add('is-out'); setTimeout(() => el.remove(), 220); }, 3000);
  }
  // «Демо: в настоящем SEOlit …» — для действий, которым нужен сервер
  const demo = (whatKey, v) => toast(t('demo.toast', { what: t(whatKey, v) }));

  /* ---------- Окна и шторки: role=dialog, Esc, фокус внутри и обратно на кнопку ---------- */
  const layers = [];
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
  function dialog({ title = '', titleKey, html = '', sheet = false, wide = false, cls = '', onClose } = {}) {
    const back = document.activeElement;
    const ov = document.createElement('div');
    ov.className = 'overlay' + (sheet ? ' overlay--sheet' : '');
    const id = 'dlg' + Math.random().toString(36).slice(2, 7);
    ov.innerHTML = `<div class="${sheet ? 'sheet' : 'modal'}${wide ? ' modal--wide' : ''}${cls ? ' ' + cls : ''}" role="dialog" aria-modal="true" aria-labelledby="${id}">
      ${sheet ? '<div class="sheet__grip" aria-hidden="true"></div>' : ''}
      <div class="modal__head"><h2 id="${id}" ${titleKey ? `data-i18n="${titleKey}"` : ''}>${esc(titleKey ? t(titleKey) : title)}</h2>
      <button type="button" class="x-btn" data-close data-i18n-attr="aria-label:c.close" aria-label="${esc(t('c.close'))}">${ico('close')}</button></div>
      ${html}</div>`;
    const box = ov.firstElementChild;
    const layer = { el: ov, box, close };
    function close(val) {
      const i = layers.indexOf(layer);
      if (i < 0) return;
      layers.splice(i, 1);
      ov.remove();
      if (!layers.length) document.body.style.overflow = '';
      onClose?.(val);
      if (back && back.isConnected) back.focus();
    }
    ov.addEventListener('click', (e) => { if (e.target === ov || e.target.closest('[data-close]')) close(); });
    document.body.append(ov);
    document.body.style.overflow = 'hidden';
    layers.push(layer);
    const first = box.querySelector('[autofocus]') || box.querySelector('.modal__body ' + FOCUSABLE) || box.querySelector(FOCUSABLE);
    first?.focus();
    return layer;
  }
  // Окно подтверждения: resolve(true | false)
  function confirmBox({ titleKey, text, okKey = 'c.delete', danger = true }) {
    return new Promise((res) => {
      let ok = false;
      const d = dialog({ titleKey, html: `<div class="modal__body"><p>${esc(text)}</p></div>
        <div class="modal__foot"><button type="button" class="btn" data-close>${esc(t('c.cancel'))}</button>
        <button type="button" class="btn ${danger ? 'btn--dangerp' : 'btn--p'}" data-ok>${esc(t(okKey))}</button></div>`, onClose: () => res(ok) });
      d.box.querySelector('[data-ok]').addEventListener('click', () => { ok = true; d.close(); });
    });
  }

  /* ---------- Выпадашки: кнопка [aria-expanded] + соседний .menu ---------- */
  let openPop = null;
  function closePop(focus) {
    if (!openPop) return;
    const { btn, menu } = openPop;
    menu.hidden = true; btn.setAttribute('aria-expanded', 'false');
    openPop = null;
    if (focus) btn.focus();
  }
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-pop]');
    if (btn) {
      const menu = btn.parentElement.querySelector('.menu');
      const was = openPop && openPop.btn === btn;
      closePop();
      if (!was && menu) {
        menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); openPop = { btn, menu };
        if (e.detail === 0) menu.querySelector(FOCUSABLE)?.focus(); // открыли с клавиатуры — фокус в меню
      }
      return;
    }
    if (openPop && !openPop.menu.contains(e.target)) closePop();
    else if (openPop && e.target.closest('.menu a, .menu button')) closePop();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (openPop) { closePop(true); e.preventDefault(); return; }
      if (layers.length) { layers[layers.length - 1].close(); e.preventDefault(); return; }
    }
    // Фокус не уходит из верхнего окна
    if (e.key === 'Tab' && layers.length) {
      const box = layers[layers.length - 1].box;
      const f = $$(FOCUSABLE, box).filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { f[f.length - 1].focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { f[0].focus(); e.preventDefault(); }
    }
    // Ctrl/Cmd+K — поиск
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      const s = $('#topSearch');
      if (s && s.offsetParent !== null) { s.focus(); s.select(); e.preventDefault(); }
    }
  });

  /* ==========================================================================
     Оболочка
     ========================================================================== */
  const shell = $('#shell');
  const PAGE = shell?.dataset.page || '';
  const SOON = ['templates', 'schedules', 'watermarks', 'autoimg', 'balance', 'referrals', 'api', 'rss', 'help', 'settings', 'stats', 'access', 'projectSettings'];
  const q = new URLSearchParams(location.search);
  const soonKey = PAGE === 'soon' ? (SOON.includes(q.get('s')) ? q.get('s') : 'help') : '';
  const href = (k) => ({ projects: 'projects.html', queue: 'queue.html', post: 'post.html' })[k] || `soon.html?s=${k}`;
  const active = soonKey || PAGE;
  const NAV = [
    ['nav.gWork', ['projects', 'queue', 'templates', 'schedules']],
    ['nav.gLook', ['watermarks', 'autoimg']],
    ['nav.gAccount', ['balance', 'referrals', 'api', 'rss']],
  ];
  // В меню «Очередь» — сколько постов ждёт во всех проектах
  const queueCount = () => DEMO.db.projects.reduce((s, p) => s + (p.q || 0), 0);
  const navLink = (k, cls = 'side__link') => `<a class="${cls}" href="${href(k)}"${k === active ? ' aria-current="page"' : ''}>${ico(k)}<span data-i18n="nav.${k}">${esc(t('nav.' + k))}</span>${k === 'queue' ? `<span class="count num" data-queue-count>${I18N.num(queueCount())}</span>` : ''}</a>`;

  // Крошки: [{ key | text, href }]; последняя — текущая страница
  let crumbs = [];
  let titleParts = [];
  function crumbsHtml() {
    return crumbs.map((c, i) => {
      const label = esc(c.key ? t(c.key) : tx(c.text));
      const last = i === crumbs.length - 1;
      return (i ? '<span aria-hidden="true">/</span>' : '') + (last ? `<span aria-current="page">${label}</span>` : `<a href="${c.href}">${label}</a>`);
    }).join('');
  }
  function setCrumbs(list) {
    crumbs = list;
    const nav = $('#crumbs'); if (nav) nav.innerHTML = crumbsHtml();
    const last = list[list.length - 1];
    const mt = $('#mTitle'); if (mt && last) mt.textContent = last.key ? t(last.key) : tx(last.text);
    titleParts = list.slice().reverse();
    setTitle();
  }
  function setTitle() {
    const head = titleParts[0];
    if (head) document.title = `${head.key ? t(head.key) : tx(head.text)} — ${t('title.suffix')}`;
    if (crumbs.length) { const nav = $('#crumbs'); if (nav) nav.innerHTML = crumbsHtml(); const last = crumbs[crumbs.length - 1]; const mt = $('#mTitle'); if (mt) mt.textContent = last.key ? t(last.key) : tx(last.text); }
  }

  function buildShell() {
    const main = $('#main', shell);
    main.classList.add('page');
    const email = DEMO.loggedIn() || DEMO.user.email;
    const inner = PAGE !== 'projects';
    const backHref = shell.dataset.back || 'projects.html';

    const side = `<nav class="side" data-i18n-attr="aria-label:nav.aria" aria-label="${esc(t('nav.aria'))}">
      <a class="side__logo" href="projects.html"><svg aria-hidden="true"><use href="#logo"></use></svg><span>SEOlit</span></a>
      ${NAV.map(([g, items]) => `<div class="side__grp"><span class="side__ttl" data-i18n="${g}">${esc(t(g))}</span>${items.map((k) => navLink(k)).join('')}</div>`).join('')}
      <div class="side__foot">
        <div class="bal"><span class="lbl" data-i18n="bal.lbl">${esc(t('bal.lbl'))}</span><b>${money(DEMO.user.balance)}</b>
          <span data-i18n="bal.enough">${esc(t('bal.enough'))}</span>
          <a class="btn btn--p" href="soon.html?s=balance" data-i18n="bal.topup">${esc(t('bal.topup'))}</a></div>
        ${navLink('help')}
      </div></nav>`;

    const notes = [1, 2, 3].map((i) => `<div class="note${i === 1 ? ' is-new' : ''}"><div><b data-i18n="note.${i}t">${esc(t(`note.${i}t`))}</b><span data-i18n="note.${i}">${esc(t('note.' + i))}</span></div></div>`).join('');
    const top = `<header class="top">
      <a class="ibtn top__back" href="${backHref}"${inner ? '' : ' hidden'} data-i18n-attr="aria-label:top.back" aria-label="${esc(t('top.back'))}">${ico('back')}</a>
      ${inner ? '' : '<svg class="top__mark" aria-hidden="true"><use href="#logo"></use></svg>'}
      <span class="top__title" id="mTitle"></span>
      <nav class="crumbs" id="crumbs" data-i18n-attr="aria-label:top.crumbs" aria-label="${esc(t('top.crumbs'))}"></nav>
      <label class="search">${ico('search', 'ico--sm')}<span class="vh" data-i18n="top.search">${esc(t('top.search'))}</span>
        <input id="topSearch" type="search" autocomplete="off" data-i18n-attr="placeholder:top.search" placeholder="${esc(t('top.search'))}">
        <span class="kbd" aria-hidden="true">Ctrl K</span></label>
      <div class="top__right">
        ${langSeg()}
        <button type="button" class="ibtn" data-theme-btn></button>
        <div class="pop top__bell"><button type="button" class="ibtn" data-pop aria-expanded="false" data-i18n-attr="aria-label:top.notes" aria-label="${esc(t('top.notes'))}">${ico('bell')}<span class="ibtn__dot" data-dot></span></button>
          <div class="menu notes" hidden><div class="menu__note" data-i18n="top.notesTitle">${esc(t('top.notesTitle'))}</div>${notes}</div></div>
        <a class="btn btn--p top__new" href="post.html">${ico('plus', 'ico--sm')}<span data-i18n="top.newPost">${esc(t('top.newPost'))}</span></a>
        <div class="pop top__ava"><button type="button" class="ava-btn" data-pop aria-expanded="false" data-profile aria-label="${esc(t('top.profile', { email }))}"><span class="ava" aria-hidden="true">${esc(email[0].toUpperCase())}</span></button>
          <div class="menu" hidden><div class="menu__note">${esc(email)}</div>
            <a href="soon.html?s=settings">${ico('settings')}<span data-i18n="nav.settings">${esc(t('nav.settings'))}</span></a>
            <button type="button" data-reset>${ico('reset')}<span data-i18n="top.reset">${esc(t('top.reset'))}</span></button>
            <a href="login.html" data-logout>${ico('logout')}<span data-i18n="top.logout">${esc(t('top.logout'))}</span></a></div></div>
      </div></header>`;

    const tab = (k, label, icon, h, extra = '') => `<a class="tab${extra}" href="${h}"${k === active ? ' aria-current="page"' : ''}>${ico(icon)}<span data-i18n="${label}">${esc(t(label))}</span></a>`;
    const tabs = `<nav class="tabs" data-i18n-attr="aria-label:tabs.aria" aria-label="${esc(t('tabs.aria'))}">
      ${tab('projects', 'nav.projects', 'projects', 'projects.html')}
      ${tab('queue', 'nav.queue', 'queue', 'queue.html')}
      <a class="tab tab--plus" href="post.html"${PAGE === 'post' ? ' aria-current="page"' : ''} data-i18n-attr="aria-label:top.newPost" aria-label="${esc(t('top.newPost'))}">${ico('plus')}</a>
      ${tab('balance', 'nav.balance', 'balance', 'soon.html?s=balance')}
      <button type="button" class="tab" data-more>${ico('dots')}<span data-i18n="tabs.more">${esc(t('tabs.more'))}</span></button></nav>`;

    main.insertAdjacentHTML('beforebegin', top);
    const col = document.createElement('div'); col.className = 'col';
    shell.classList.add('shell');
    shell.insertAdjacentHTML('afterbegin', side);
    col.append($('.top', shell), main);
    shell.append(col);
    shell.insertAdjacentHTML('afterend', tabs);

    // Крошки по умолчанию: раздел; на заглушке — раздел из ?s=
    const k = soonKey || PAGE;
    setCrumbs(k === 'projects' ? [{ key: 'nav.projects' }] : [{ key: 'nav.projects', href: 'projects.html' }, { key: 'nav.' + k }]);
  }

  // Шторка «Ещё» на телефоне: все разделы, язык, тема, сброс и выход
  function openMore() {
    const rest = NAV.map(([g, items]) => {
      const list = items.filter((k) => !['projects', 'queue', 'balance'].includes(k));
      return list.length ? `<span class="side__ttl" data-i18n="${g}">${esc(t(g))}</span>${list.map((k) => navLink(k)).join('')}` : '';
    }).join('');
    const d = dialog({ titleKey: 'tabs.moreTitle', sheet: true, html: `<div class="modal__body more-list">
      ${rest}${navLink('help')}${navLink('settings')}
      <div class="more-row"><span data-i18n="tabs.lang">${esc(t('tabs.lang'))}</span>${langSeg()}</div>
      <div class="more-row"><span data-i18n="tabs.theme">${esc(t('tabs.theme'))}</span><button type="button" class="ibtn" data-theme-btn></button></div>
      <div class="more-row"><button type="button" class="btn btn--q" data-reset>${ico('reset')}<span data-i18n="top.reset">${esc(t('top.reset'))}</span></button>
        <a class="btn btn--q" href="login.html" data-logout>${ico('logout')}<span data-i18n="top.logout">${esc(t('top.logout'))}</span></a></div></div>` });
    syncTheme();
    return d;
  }

  /* ---------- Баннер демо ---------- */
  function banner() {
    let hidden = false;
    try { hidden = sessionStorage.getItem('seolit-banner') === '0'; } catch (e) { /* ничего */ }
    if (hidden) return;
    const el = document.createElement('div');
    el.className = 'banner';
    el.innerHTML = `<span class="banner__txt"><span class="banner__long" data-i18n="demo.text">${esc(t('demo.text'))}</span><span class="banner__short" data-i18n="demo.short">${esc(t('demo.short'))}</span> <a href="https://seolit.ru/auth.html"><span class="banner__long" data-i18n="demo.link">${esc(t('demo.link'))}</span><span class="banner__short" data-i18n="demo.linkShort">${esc(t('demo.linkShort'))}</span></a></span>
      <button type="button" class="x-btn" data-i18n-attr="aria-label:demo.close" aria-label="${esc(t('demo.close'))}">${ico('close')}</button>`;
    el.querySelector('button').addEventListener('click', () => {
      try { sessionStorage.setItem('seolit-banner', '0'); } catch (e) { /* ничего */ }
      el.remove();
    });
    document.body.insertBefore(el, document.body.querySelector('#shell, .auth') || document.body.firstChild);
  }

  /* ---------- Поиск в верхней панели: страница подписывается через APP.onSearch ---------- */
  const searchSubs = [];
  function wireSearch() {
    const s = $('#topSearch');
    if (!s) return;
    s.addEventListener('input', () => searchSubs.forEach((fn) => fn(s.value.trim().toLowerCase())));
    // Без своего поиска на странице — ищем по проектам
    s.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !searchSubs.length && s.value.trim()) location.href = 'projects.html?q=' + encodeURIComponent(s.value.trim());
    });
  }

  /* ---------- Общие действия ---------- */
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-more]')) { openMore(); return; }
    if (e.target.closest('[data-reset]')) {
      DEMO.reset();
      toast(t('demo.reset'));
      setTimeout(() => location.reload(), 600);
      return;
    }
    if (e.target.closest('[data-logout]')) DEMO.logout();
    const dot = e.target.closest('.top__bell [data-pop]');
    if (dot) dot.querySelector('[data-dot]')?.remove();
  });

  /* ==========================================================================
     Страницы
     ========================================================================== */
  const PAGES = {};

  /* ---------- Заглушка раздела ---------- */
  PAGES.soon = () => {
    const main = $('#main');
    main.innerHTML = `<section class="card empty soon">
      <span class="empty__ico">${ico(soonKey === 'projectSettings' ? 'settings' : soonKey)}</span>
      <h1 data-i18n="nav.${soonKey}">${esc(t('nav.' + soonKey))}</h1>
      <p data-i18n="soon.text">${esc(t('soon.text'))}</p>
      <p class="field__hint" data-i18n="soon.hint">${esc(t('soon.hint'))}</p>
      <a class="btn btn--p" href="projects.html">${ico('projects', 'ico--sm')}<span data-i18n="soon.back">${esc(t('soon.back'))}</span></a>
    </section>`;
  };

  /* ---------- Запуск ---------- */
  if (shell) {
    buildShell();
    wireSearch();
  }
  banner();
  syncTheme();
  PAGES[PAGE]?.();
  I18N.apply();

  window.APP = { $, $$, esc, tx, ico, net, netName, toast, demo, dialog, confirmBox, setCrumbs, onSearch: (fn) => searchSubs.push(fn), reduce };
})();
