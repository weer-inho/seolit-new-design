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
  const lcFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);
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
  // Выбор языка: кнопка с текущим языком, по нажатию — меню с остальными
  const LANG_NAME = { ru: 'Русский', en: 'English', kk: 'Қазақша' };
  const langLabel = () => `${t('top.lang')}: ${LANG_NAME[I18N.lang]}`;
  const langSeg = () => `<div class="pop lang"><button type="button" class="ibtn lang__btn" data-pop data-lang-btn aria-expanded="false" aria-label="${esc(langLabel())}" title="${esc(langLabel())}">${I18N.LABEL[I18N.lang]}${ico('down', 'ico--sm')}</button>
    <div class="menu menu--lang" hidden>${I18N.LANGS.map((l) => `<button type="button" data-lang="${l}" aria-pressed="${l === I18N.lang}" lang="${l}"><b>${I18N.LABEL[l]}</b>${LANG_NAME[l]}${ico('check', 'ico--sm lang__ok')}</button>`).join('')}</div></div>`;
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lang]');
    if (b) I18N.setLang(b.dataset.lang);
    if (e.target.closest('[data-theme-btn]')) toggleTheme();
  });
  I18N.onChange((l) => {
    $$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
    $$('[data-lang-btn]').forEach((b) => { b.innerHTML = I18N.LABEL[l] + ico('down', 'ico--sm'); b.setAttribute('aria-label', langLabel()); b.title = langLabel(); });
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
  const PAGE = (shell || $('[data-page]'))?.dataset.page || '';
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
  const queueCount = () => DEMO.stats().plan;
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
    if (k !== 'project') setCrumbs(k === 'projects' ? [{ key: 'nav.projects' }] : [{ key: 'nav.projects', href: 'projects.html' }, { key: 'nav.' + k }]);
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

  /* ---------- Вход и регистрация ---------- */
  function authPage(kind) {
    document.title = `${t(kind === 'login' ? 'auth.titleLogin' : 'auth.titleRegister')} — ${t('title.suffix')}`;
    I18N.onChange(() => { document.title = `${t(kind === 'login' ? 'auth.titleLogin' : 'auth.titleRegister')} — ${t('title.suffix')}`; });

    // Сверху: «← На главную», язык, тема
    $('[data-auth-tools]').innerHTML = `<a class="btn btn--q auth__home" href="../index.html">${ico('back', 'ico--sm')}<span data-i18n="auth.home">${esc(t('auth.home'))}</span></a>
      <div class="auth__tools">${langSeg()}<button type="button" class="ibtn" data-theme-btn></button></div>`;
    authSide();

    // Показать / скрыть пароль
    const pass = $('#password'), eye = $('[data-eye]');
    const syncEye = () => {
      const on = pass.type === 'text';
      eye.innerHTML = on ? '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 6.1A9.6 9.6 0 0 1 12 6c5 0 9 4.5 10 6-.4.7-1.4 2-2.8 3.3M6.6 6.6C4.4 8 2.7 10.2 2 12c1 1.5 5 6 10 6 1.8 0 3.4-.6 4.8-1.4M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>'
        : '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
      eye.setAttribute('aria-pressed', String(on));
      eye.dataset.i18nAttr = 'aria-label:' + (on ? 'auth.hide' : 'auth.show');
      eye.setAttribute('aria-label', t(on ? 'auth.hide' : 'auth.show'));
    };
    eye.addEventListener('click', () => { pass.type = pass.type === 'password' ? 'text' : 'password'; syncEye(); pass.focus(); });
    syncEye();

    // Ошибки под полями: текст по ключу, aria-invalid, при смене языка перерисовываются
    const setErr = (input, errEl, key) => {
      input.setAttribute('aria-invalid', String(!!key));
      errEl.hidden = !key;
      if (key) { errEl.dataset.i18n = key; errEl.textContent = t(key); } else delete errEl.dataset.i18n;
      return !key;
    };
    const email = $('#email'), form = $('#authForm');
    const emailKey = () => (!email.value.trim() ? 'auth.errEmail' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()) ? '' : 'auth.errEmailBad');
    email.addEventListener('input', () => { if (email.getAttribute('aria-invalid') === 'true') setErr(email, $('#emailErr'), emailKey()); });
    pass.addEventListener('input', () => { if (pass.value) setErr(pass, $('#passErr'), ''); });

    const enter = (addr) => { DEMO.login(addr); location.href = 'projects.html'; };
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const bad = [];
      if (!setErr(email, $('#emailErr'), emailKey())) bad.push(email);
      if (!setErr(pass, $('#passErr'), pass.value ? '' : 'auth.errPass')) bad.push(pass);
      const offer = $('#offer');
      if (offer && !setErr(offer, $('#offerErr'), offer.checked ? '' : 'auth.errOffer')) bad.push(offer);
      if (bad.length) { bad[0].focus(); return; }
      const addr = email.value.trim();
      if (kind === 'login') { enter(addr); return; }
      // Регистрация: экран «Аккаунт создан»
      DEMO.login(addr);
      $('#regBox').hidden = true;
      const done = $('#regDone');
      done.hidden = false;
      $('.auth__ok', done).innerHTML = ico('check');
      const txt = $('#doneText');
      const fillDone = () => { txt.textContent = t('auth.doneText', { email: addr }); };
      fillDone(); I18N.onChange(fillDone);
      $('h1', done).focus();
    });
    $('#offer')?.addEventListener('change', (e) => { if (e.target.checked) setErr(e.target, $('#offerErr'), ''); });
    $('#demoLogin')?.addEventListener('click', () => { email.value = DEMO.user.email; enter(DEMO.user.email); });
    $('#forgot')?.addEventListener('click', (e) => {
      const h = $('#forgotHint');
      h.hidden = !h.hidden;
      e.currentTarget.setAttribute('aria-expanded', String(!h.hidden));
    });
  }

  // Правая панель: три мини-карточки постов, статус идёт «12:00 → публикуется… → ✓ в N соцсетях», и три факта
  function authSide() {
    const side = $('[data-auth-side]');
    if (!side) return;
    const cards = [
      { key: 'auth.c1', time: '12:00', nets: ['vk', 'tg', 'ok'] },
      { key: 'auth.c2', time: '15:30', nets: ['tg', 'pi', 'mm', 'x'] },
      { key: 'auth.c3', time: '18:00', nets: ['vk', 'ok', 'in', 'tt', 're'] },
    ];
    side.setAttribute('aria-label', t('auth.sideAria'));
    side.dataset.i18nAttr = 'aria-label:auth.sideAria';
    side.innerHTML = `<div class="aside__in">
      <h2 data-i18n="auth.sideTitle">${esc(t('auth.sideTitle'))}</h2>
      <ul class="mini" aria-hidden="true">${cards.map((c, i) => `<li class="mini__card"><span class="mini__thumb mini__thumb--${i}"></span>
        <span class="mini__body"><b data-i18n="${c.key}">${esc(t(c.key))}</b><span class="nets">${c.nets.map((n) => net(n, 22)).join('')}</span></span>
        <span class="mini__st" data-st></span></li>`).join('')}</ul>
      <ul class="facts">${[1, 2, 3].map((i) => `<li><b data-i18n="auth.f${i}">${esc(t('auth.f' + i))}</b><span data-i18n="auth.f${i}s">${esc(t(`auth.f${i}s`))}</span></li>`).join('')}</ul></div>`;
    const els = $$('.mini__card', side);
    // Каждая карточка — свой шаг: 0 — время, 1 — публикуется, 2 — опубликовано
    const step = cards.map((c, i) => (i === 0 ? 1 : i === 1 ? 2 : 0));
    const draw = (i, anim) => {
      const st = $('[data-st]', els[i]), s = step[i];
      st.className = 'mini__st' + (s === 1 ? ' is-run' : s === 2 ? ' is-done' : '');
      st.innerHTML = s === 0 ? `${ico('clock', 'ico--sm')}<span>${cards[i].time}</span>`
        : s === 1 ? `<i class="mini__spin"></i><span>${esc(t('auth.publishing'))}</span>`
        : `${ico('check', 'ico--sm')}<span>${esc(plural(cards[i].nets.length, 'p.inNets'))}</span>`;
      if (anim) st.animate(reduce.matches ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: reduce.matches ? 350 : 250, easing: 'ease-out' });
    };
    cards.forEach((c, i) => draw(i));
    let k = 0;
    setInterval(() => {
      if (document.hidden) return;
      const i = k++ % cards.length;
      step[i] = (step[i] + 1) % 3;
      draw(i, true);
    }, 2000);
    I18N.onChange(() => cards.forEach((c, i) => draw(i)));
  }
  /* ---------- Проекты ---------- */
  const DAY = 864e5;
  const daysLeft = (p) => Math.ceil((p.until - DEMO.D0) / DAY);
  // Статус-пилюля проекта: ok / err (N ошибок) / demo / off
  function projPill(p) {
    const st = DEMO.stats(p.id);
    if (p.st === 'err' && st.err) return `<span class="pill pill--err"><i></i>${esc(plural(st.err, 'p.errors'))}</span>`;
    const cls = { ok: 'ok', err: 'ok', demo: 'info', off: 'off' }[p.st];
    return `<span class="pill pill--${cls}"><i></i>${esc(t('prj.st.' + (p.st === 'err' ? 'ok' : p.st)))}</span>`;
  }
  function projPaid(p) {
    const d = I18N.date(p.until);
    return t(p.st === 'demo' ? 'prj.demoUntil' : p.st === 'off' ? 'prj.ended' : 'prj.paidUntil', { date: d });
  }
  const projNets = (p, max) => {
    const more = p.nets.length - max;
    return `<span class="nets" role="list" aria-label="${esc(t('prj.netsAria'))}">${p.nets.slice(0, max).map((n) => `<span role="listitem">${net(n, 28, false)}</span>`).join('')}${more > 0 ? `<span class="nets__more" role="listitem">${esc(t('prj.netsMore', { n: more }))}</span>` : ''}</span>`;
  };

  PAGES.projects = () => {
    const main = $('#main');
    let query = (q.get('q') || '').toLowerCase();
    if (query) $('#topSearch').value = q.get('q');

    // Что требует внимания: ошибки публикации (первый приёмник с ошибкой) и демо, которое кончается
    function alerts() {
      const list = [];
      DEMO.db.projects.filter((p) => p.own).forEach((p) => {
        const st = DEMO.stats(p.id);
        if (st.err) {
          const r = DEMO.db.receivers.find((x) => x.p === p.id && x.st === 'err');
          list.push({ net: r ? r.net : p.nets[0], text: t('prj.errAlert', { name: tx(p.name), net: netName(r ? r.net : p.nets[0]), text: lcFirst(tx(r ? r.meta : '')) }),
            btn: `<a class="btn btn--sm btn--line" href="project.html?id=${p.id}&filter=err">${esc(t('prj.reconnect'))}</a>` });
        }
        const left = daysLeft(p);
        if (p.st === 'demo' && left >= 0 && left <= 1) {
          list.push({ net: p.nets[0], text: t('prj.demoEnds', { name: tx(p.name), when: t(left ? 'prj.demoEnds1' : 'prj.demoEnds0') }),
            btn: `<button type="button" class="btn btn--sm btn--line" data-pay>${esc(t('prj.pay'))}</button>` });
        }
      });
      return list;
    }

    function card(p) {
      const st = DEMO.stats(p.id), left = daysLeft(p);
      const pct = Math.max(0, Math.min(100, Math.round((left / p.period) * 100)));
      const cta = p.st === 'demo' ? 'prj.pay' : p.st === 'off' ? 'prj.renew' : '';
      const leftTxt = left > 0 ? plural(left, 'p.days') : '';
      return `<article class="card pcard pcard--${p.st}">
        <div class="pcard__head"><div class="pcard__name"><h3><a href="project.html?id=${p.id}">${esc(tx(p.name))}</a></h3><span class="pcard__site">${esc(p.site || '')}</span></div>${projPill(p)}</div>
        <div class="pcard__nets d-only">${projNets(p, 6)}</div>
        <div class="pcard__nets m-only">${projNets(p, 5)}<span class="pcard__q"><b class="num">${I18N.num(st.plan)}</b> ${esc(t('prj.inQueue'))}</span></div>
        <dl class="pcard__nums d-only">
          <div><dt>${esc(t('prj.inQueue'))}</dt><dd class="num">${I18N.num(st.plan)}</dd></div>
          <div><dt>${esc(t('prj.paused'))}</dt><dd class="num">${I18N.num(st.paused)}</dd></div>
          <div${st.err ? ' class="is-err"' : ''}><dt>${esc(plural(st.err, 'p.errWord'))}</dt><dd class="num">${I18N.num(st.err)}</dd></div>
        </dl>
        <div class="pcard__paid"><span>${esc(projPaid(p))}</span><b class="d-only${p.st === 'demo' ? ' is-warn' : ''}">${esc(leftTxt)}</b></div>
        <div class="bar d-only" aria-hidden="true"><span class="bar--${p.st}" style="width:${pct}%"></span></div>
        <div class="pcard__acts d-only">
          ${cta ? `<button type="button" class="btn btn--p btn--sm" data-pay="${cta}">${esc(t(cta))}</button>` : ''}
          <a class="btn btn--sm btn--line" href="project.html?id=${p.id}">${esc(t('prj.open'))}</a>
          <a class="btn btn--sm btn--q" href="post.html?project=${p.id}">${esc(t('prj.post'))}</a>
        </div>
      </article>`;
    }

    function render() {
      const own = DEMO.db.projects.filter((p) => p.own), shared = DEMO.db.projects.filter((p) => !p.own);
      const match = (p) => !query || [tx(p.name), p.site].some((s) => String(s || '').toLowerCase().includes(query));
      const ownF = own.filter(match), sharedF = shared.filter(match);
      const al = alerts();
      const none = query && !ownF.length && !sharedF.length;
      main.innerHTML = `
        <div class="page__head d-only"><div><h1>${esc(t('prj.title'))}</h1>
          <p>${esc(plural(own.length, 'p.own'))} · ${esc(plural(shared.length, 'p.sharedYou'))}</p></div>
          <button type="button" class="btn" data-new>${ico('plus', 'ico--sm')}${esc(t('prj.newProject'))}</button></div>
        <section class="card mbal m-only"><div><span class="lbl">${esc(t('bal.lbl'))}</span><b class="num">${money(DEMO.user.balance)}</b><span class="muted">${esc(t('bal.enough'))}</span></div>
          <a class="btn btn--p" href="soon.html?s=balance">${esc(t('bal.topup'))}</a></section>
        ${al.length && !query ? `<section class="attn" aria-labelledby="attnT">
          <h2 class="attn__t d-only" id="attnT">${ico('alert', 'ico--sm')}${esc(t('prj.attention'))} · ${al.length}</h2>
          <button type="button" class="attn__sum m-only" aria-expanded="false" aria-controls="attnList"><span class="attn__ico">${ico('alert')}</span>
            <span><b>${esc(t('prj.attentionN', { n: al.length }))}</b><span>${esc(al[0].text)}</span></span>${ico('chev')}</button>
          <ul class="attn__list" id="attnList">${al.map((a) => `<li>${net(a.net, 28)}<span>${esc(a.text)}</span>${a.btn}</li>`).join('')}</ul></section>` : ''}
        ${none ? `<section class="card empty"><span class="empty__ico">${ico('search')}</span><h3>${esc(t('prj.searchNone', { q: query }))}</h3>
          <p>${esc(t('prj.searchHint'))}</p><button type="button" class="btn" data-clear>${esc(t('prj.searchReset'))}</button></section>` : ''}
        ${ownF.length || !query ? `<section aria-labelledby="mineT"><h2 class="sec-t" id="mineT">${esc(t('prj.mine'))}<span class="sec-t__n">${ownF.length}</span></h2>
          <div class="pgrid">${ownF.map(card).join('')}
          ${query ? '' : `<button type="button" class="pnew" data-new><span class="pnew__plus">${ico('plus')}</span><b>${esc(t('prj.newProject'))}</b><span class="d-only">${esc(t('prj.newHint'))}</span></button>`}</div></section>` : ''}
        ${sharedF.length ? `<section class="d-only" aria-labelledby="sharedT"><h2 class="sec-t" id="sharedT">${esc(t('prj.shared'))}<span class="sec-t__n">${sharedF.length}</span></h2>
          ${sharedF.map((p) => { const st = DEMO.stats(p.id); return `<article class="card prow">
            <div class="prow__name"><h3><a href="project.html?id=${p.id}">${esc(tx(p.name))}</a></h3><span class="pill pill--info">${esc(t('prj.role.' + p.role))}</span>
              <span class="prow__owner">${esc(t('prj.owner', { email: p.owner }))}</span></div>
            <div class="prow__nums"><span><b class="num">${I18N.num(st.plan)}</b> ${esc(t('prj.inQueue'))}</span><span><b class="num">${I18N.num(st.paused)}</b> ${esc(t('prj.paused'))}</span>
              <span${st.err ? ' class="is-err"' : ''}><b class="num">${I18N.num(st.err)}</b> ${esc(plural(st.err, 'p.errWord'))}</span></div>
            <a class="btn btn--sm btn--line" href="project.html?id=${p.id}">${esc(t('prj.open'))}</a></article>`; }).join('')}</section>` : ''}
        ${query ? '' : `<section class="card news d-only"><span class="pill pill--info">${esc(t('prj.newsLbl'))}</span>
          <div class="news__list">${DEMO.news.map((n) => `<span><b>${esc(tx(n.title))}</b> <time class="muted">${esc(I18N.date(n.at))}</time></span>`).join('')}</div>
          <a class="news__all" href="https://seolit.ru/blog.html">${esc(t('prj.allNews'))} →</a></section>
        <p class="tip d-only">${esc(t('prj.tip'))}</p>`}`;
    }

    // Окно «Новый проект»
    function newProject() {
      const d = dialog({ titleKey: 'prj.newTitle', html: `<form class="modal__body" novalidate>
        <p class="muted">${esc(t('prj.newText'))}</p>
        <div class="field"><label for="npName">${esc(t('prj.newName'))}</label><input class="input" id="npName" autocomplete="off" placeholder="${esc(t('prj.newNamePh'))}" aria-describedby="npErr"><span class="field__err" id="npErr" hidden>${esc(t('prj.newErr'))}</span></div>
        <div class="field"><label for="npSite">${esc(t('prj.newSite'))}</label><input class="input" id="npSite" inputmode="url" autocomplete="off" placeholder="${esc(t('prj.newSitePh'))}" aria-describedby="npHint"><span class="field__hint" id="npHint">${esc(t('prj.newSiteHint'))}</span></div>
        <div class="modal__foot modal__foot--in"><button type="button" class="btn" data-close>${esc(t('c.cancel'))}</button><button type="submit" class="btn btn--p">${esc(t('prj.create'))}</button></div></form>` });
      const form = $('form', d.box), name = $('#npName', d.box);
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = name.value.trim();
        name.setAttribute('aria-invalid', String(!v)); $('#npErr', d.box).hidden = !!v;
        if (!v) { name.focus(); return; }
        const site = $('#npSite', d.box).value.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
        DEMO.db.projects.splice(DEMO.db.projects.filter((p) => p.own).length, 0,
          { id: DEMO.uid('p'), name: { ru: v, en: v, kk: v }, site, st: 'demo', nets: [], published: 0, until: DEMO.at(3), period: 3, own: true });
        DEMO.save();
        d.close();
        render();
        toast(t('prj.created', { name: v }));
      });
    }

    main.addEventListener('click', (e) => {
      if (e.target.closest('[data-new]')) newProject();
      else if (e.target.closest('[data-pay]')) demo('prj.payToast');
      else if (e.target.closest('[data-clear]')) { query = ''; $('#topSearch').value = ''; render(); }
      const sum = e.target.closest('.attn__sum');
      if (sum) { const open = sum.getAttribute('aria-expanded') !== 'true'; sum.setAttribute('aria-expanded', String(open)); sum.parentElement.classList.toggle('is-open', open); }
    });
    searchSubs.push((v) => { query = v; render(); });
    I18N.onChange(render);
    render();
    // ?new=1 — сразу окно «Новый проект» (после регистрации); из адреса убираем, чтобы не открылось снова
    if (q.get('new')) { const u = new URL(location.href); u.searchParams.delete('new'); history.replaceState(null, '', u); newProject(); }
  };

  /* ---------- Проект: обзор, источники, приёмники ---------- */
  // Что можно подключить: приёмники (15 соцсетей) и источники (SPEC 4.5). plate — какая плашка, cat — категория в окне.
  const DEST_LIST = [['vk', 'social'], ['ok', 'social'], ['mm', 'social'], ['tg', 'msg'], ['max', 'msg'], ['x', 'social'], ['pi', 'social'], ['in', 'social'],
    ['tt', 'video'], ['lj', 'blogs'], ['tu', 'blogs'], ['bl', 'blogs'], ['re', 'blogs'], ['fb', 'social'], ['ig', 'social']].map(([id, cat]) => ({ id, plate: id, cat }));
  const SRC_LIST = [['rss', 'rss', 'feeds', 'net.rssFeed'], ['vk', 'vk', 'social'], ['vkg', 'vk', 'social', 'net.vkGoods'], ['yt', 'yt', 'video'], ['tg', 'tg', 'msg'],
    ['tt', 'tt', 'video'], ['tu', 'tu', 'blogs'], ['bl', 'bl', 'blogs'], ['ok', 'ok', 'social'], ['fb', 'fb', 'social'], ['ig', 'ig', 'social']].map(([id, plate, cat, key]) => ({ id, plate, cat, key }));
  const itemName = (it) => (it.key ? t(it.key) : netName(it.plate));
  const JUST = () => ({ ru: 'Только что', en: 'Just now', kk: 'Жаңа ғана' });
  const OFFTXT = () => ({ ru: 'Выключен', en: 'Off', kk: 'Өшірулі' });

  PAGES.project = () => {
    const main = $('#main');
    const P = DEMO.project(q.get('id')) || DEMO.project('shop');
    const S = { view: ['sources', 'dests'].includes(q.get('tab')) ? q.get('tab') : 'overview', filter: q.get('filter') === 'err' ? 'err' : 'all',
      search: '', open: new Set(), allGroups: false, allSrc: false, m: 'dests' };
    const recvs = () => DEMO.db.receivers.filter((r) => r.p === P.id);
    const srcs = () => DEMO.db.sources.filter((r) => r.p === P.id);
    // Группы по соцсетям — в порядке появления; первые две раскрыты, как в макете
    [...new Set(recvs().map((r) => r.net))].slice(0, 2).forEach((n) => S.open.add(n));
    setCrumbs([{ key: 'nav.projects', href: 'projects.html' }, { text: P.name }]);

    const byState = (r) => S.filter === 'all' || r.st === S.filter;
    const bySearch = (r) => !S.search || tx(r.name).toLowerCase().includes(S.search);
    const counts = () => { const c = { all: 0, err: 0, on: 0, off: 0 }; recvs().forEach((r) => { c.all++; c[r.st]++; }); return c; };

    // Строка аккаунта: имя, мета, переключатель или кнопка исправления, меню «⋯»
    function row(r, kind, plate) {
      const name = tx(r.name), err = r.st === 'err';
      return `<li class="acc${err ? ' is-err' : ''}">${plate ? net(r.net, 28, false) : ''}
        <div class="acc__txt"><b>${esc(name)}</b><span>${esc(tx(r.meta))}</span></div>
        ${err ? `<button type="button" class="btn btn--sm" data-act="fix" data-id="${r.id}">${esc(tx(r.fix))}</button>`
          : `<button type="button" class="tog" role="switch" aria-checked="${r.st === 'on'}" data-act="tog" data-id="${r.id}" aria-label="${esc(t('proj.toggle', { name }))}"></button>`}
        <div class="pop"><button type="button" class="ibtn ibtn--sm" data-pop aria-expanded="false" aria-label="${esc(t('proj.rowMenu', { name }))}">${ico('dots')}</button>
          <div class="menu" hidden><a href="soon.html?s=projectSettings">${ico('settings')}${esc(t('proj.rowSettings'))}</a>
            ${kind === 'dest' ? `<a href="queue.html?project=${P.id}&dest=${r.id}">${ico('queue')}${esc(t('proj.rowQueue'))}</a>` : ''}
            <button type="button" class="danger" data-act="del" data-kind="${kind}" data-id="${r.id}">${ico('close')}${esc(t('proj.rowDelete'))}</button></div></div></li>`;
    }

    function kpis() {
      const st = DEMO.stats(P.id);
      const week = P.week || [0, 0, 0, 0, 0, 0, 0], sum = week.reduce((a, b) => a + b, 0), delta = sum - (P.weekPrev || 0);
      const mx = Math.max(...week, 1);
      const pts = week.map((v, i) => `${(i * 96) / 6 + 2},${30 - (v / mx) * 26}`).join(' ');
      const next = DEMO.db.posts.filter((x) => x.p === P.id && x.st === 'plan').sort((a, b) => a.at - b.at)[0];
      const dayDiff = next ? Math.floor((next.at - DEMO.D0) / DAY) : 0;
      const when = next ? `${dayDiff === 0 ? lcFirst(t('c.today')) : dayDiff === 1 ? lcFirst(t('c.tomorrow')) : I18N.date(next.at, 'dm')}, ${I18N.date(next.at, 'time')}` : '';
      const eR = recvs().filter((r) => r.st === 'err').length, eS = srcs().filter((r) => r.st === 'err').length, eAll = eR + eS;
      const sign = delta > 0 ? '+' : delta < 0 ? '−' : '';
      return `<div class="kpis">
        <div class="card kpi"><span class="lbl"><span class="d-only">${esc(t('proj.k1'))}</span><span class="m-only">${esc(t('proj.k1m'))}</span></span>
          <b class="kpi__n num">${I18N.num(sum)}</b><svg class="spark d-only" viewBox="0 0 100 32" aria-hidden="true"><polyline points="${pts}"/></svg>
          <span class="kpi__s kpi__s--${delta >= 0 ? 'ok' : 'err'}">${esc(t('proj.k1s', { d: sign + I18N.num(Math.abs(delta)) }))}</span></div>
        <div class="card kpi"><span class="lbl">${esc(t('proj.k2'))}</span><b class="kpi__n num">${I18N.num(st.plan)}</b>
          <span class="kpi__s">${esc(next ? t('proj.k2s', { when }) : t('proj.k2none'))}</span></div>
        <div class="card kpi"><span class="lbl">${esc(t('proj.k3'))}</span><b class="kpi__n num">${I18N.num(st.paused)}</b>
          <span class="kpi__s">${esc(t(st.paused ? 'proj.k3s' : 'proj.k3none'))}</span></div>
        <div class="card kpi${eAll ? ' kpi--err' : ''}"><span class="lbl">${esc(t('proj.k4'))}</span><b class="kpi__n num">${I18N.num(eAll)}</b>
          <span class="kpi__s">${esc(eAll ? [eR && plural(eR, 'p.recvs'), eS && plural(eS, 'p.srcs')].filter(Boolean).join(' · ') : t('proj.k4none'))}</span>
          ${eAll ? `<button type="button" class="btn btn--sm kpi__btn" data-act="review">${esc(t('proj.review'))}</button>` : ''}</div></div>`;
    }

    function sourcesCol() {
      const all = srcs(), list = all.filter(bySearch);
      const lim = S.view === 'overview' && !S.allSrc && !S.search ? 6 : Infinity;
      const body = !all.length ? `<div class="empty empty--in"><span class="empty__ico">${ico('rss')}</span><h3>${esc(t('proj.noSources'))}</h3>
          <p>${esc(t('proj.noSourcesText'))}</p><button type="button" class="btn btn--p" data-act="connect" data-mode="source">${ico('plus', 'ico--sm')}${esc(t('proj.connectSource'))}</button></div>`
        : !list.length ? `<p class="col__none">${esc(t('proj.nothing'))}</p>`
        : `<ul class="accs">${list.slice(0, lim).map((r) => row(r, 'source', true)).join('')}</ul>
          ${list.length > lim ? `<button type="button" class="col__more" data-act="more-src">${esc(t('proj.moreSources', { n: list.length - lim }))}</button>` : ''}
          ${S.allSrc && S.view === 'overview' ? `<button type="button" class="col__more" data-act="more-src">${esc(t('proj.less'))}</button>` : ''}`;
      return `<section class="card pcol pcol--src" aria-labelledby="srcT">
        <header class="pcol__head"><div><h2 id="srcT">${esc(t('proj.sources'))} · <span class="num">${all.length}</span></h2><p>${esc(t('proj.sourcesHint'))}</p></div>
          <button type="button" class="btn btn--sm" data-act="connect" data-mode="source">${ico('plus', 'ico--sm')}${esc(t('proj.connect'))}</button></header>${body}</section>`;
    }

    function destsCol() {
      const all = recvs(), c = counts();
      const nets = [...new Set(all.map((r) => r.net))];
      const narrowed = S.filter !== 'all' || !!S.search;
      const groups = nets.map((n) => ({ n, rows: all.filter((r) => r.net === n), shown: all.filter((r) => r.net === n && byState(r) && bySearch(r)) }))
        .filter((g) => !narrowed || g.shown.length);
      const lim = S.view === 'overview' && !S.allGroups && !narrowed ? 6 : Infinity;
      const grp = (g) => {
        const open = narrowed || S.open.has(g.n), nOn = g.rows.filter((r) => r.st === 'on').length, nErr = g.rows.filter((r) => r.st === 'err').length;
        return `<li class="grp${open ? ' is-open' : ''}"><button type="button" class="grp__head" data-act="grp" data-id="${g.n}" aria-expanded="${open}" aria-label="${esc(t('proj.groupToggle', { name: netName(g.n) }))}">
          ${net(g.n, 28)}<b>${esc(netName(g.n))}</b><span class="grp__meta">${I18N.num(g.rows.length)} · ${esc(plural(nOn, 'p.works'))}</span>
          ${nErr ? `<span class="pill pill--err">${esc(plural(nErr, 'p.errors'))}</span>` : ''}${ico('down', 'grp__chev')}</button>
          ${open ? `<ul class="accs accs--in">${g.shown.map((r) => row(r, 'dest', false)).join('')}</ul>` : ''}</li>`;
      };
      const flat = all.filter((r) => byState(r) && bySearch(r)).sort((a, b) => (b.st === 'err') - (a.st === 'err'));
      const chip = (k) => `<button type="button" class="chipf" data-act="filter" data-id="${k}" aria-pressed="${S.filter === k}">${esc(t('proj.f' + { all: 'All', err: 'Err', on: 'On', off: 'Off' }[k]))} <b class="num">${I18N.num(c[k])}</b></button>`;
      const body = !all.length ? `<div class="empty empty--in"><span class="empty__ico">${ico('plus')}</span><h3>${esc(t('proj.noDests'))}</h3>
          <p>${esc(t('proj.noDestsText'))}</p><button type="button" class="btn btn--p" data-act="connect" data-mode="dest">${ico('plus', 'ico--sm')}${esc(t('proj.connectDest'))}</button></div>`
        : `<div class="pcol__tools"><label class="search"><span class="vh">${esc(t('proj.find'))}</span>${ico('search', 'ico--sm')}<input type="search" id="accSearch" autocomplete="off" placeholder="${esc(t('proj.find'))}" value="${esc(S.search)}"></label>
          <div class="chips chips--scroll" role="group" aria-label="${esc(t('proj.filter'))}">${['all', 'err', 'on', 'off'].map(chip).join('')}</div></div>
          ${groups.length ? `<ul class="grps d-only">${groups.slice(0, lim).map(grp).join('')}</ul>
          ${groups.length > lim ? `<button type="button" class="col__more d-only" data-act="more-grp">${esc(t('proj.moreNets', { n: plural(groups.length - lim, 'p.nets') }))}</button>` : ''}
          ${S.allGroups && S.view === 'overview' && !narrowed ? `<button type="button" class="col__more d-only" data-act="more-grp">${esc(t('proj.less'))}</button>` : ''}
          <ul class="accs m-only">${flat.map((r) => row(r, 'dest', true)).join('')}</ul>` : `<p class="col__none">${esc(t('proj.nothing'))}</p>`}`;
      return `<section class="card pcol pcol--dst" aria-labelledby="dstT">
        <header class="pcol__head"><div><h2 id="dstT">${esc(t('proj.dests'))} · <span class="num">${all.length}</span></h2><p>${esc(t('proj.destsHint'))}</p></div>
          <button type="button" class="btn btn--sm btn--p" data-act="connect" data-mode="dest">${ico('plus', 'ico--sm')}${esc(t('proj.connect'))}</button></header>${body}</section>`;
    }

    function render() {
      const st = DEMO.stats(P.id), nS = srcs().length, nR = recvs().length;
      const tab = (k, label, n) => `<button type="button" class="ptab" data-act="view" data-id="${k}"${S.view === k ? ' aria-current="page"' : ''}>${esc(t(label))}${n != null ? ` <span class="num">${I18N.num(n)}</span>` : ''}</button>`;
      const link = (h, label, n) => `<a class="ptab" href="${h}">${esc(t(label))}${n != null ? ` <span class="num">${I18N.num(n)}</span>` : ''}</a>`;
      const cols = S.view === 'sources' ? sourcesCol() : S.view === 'dests' ? destsCol() : sourcesCol() + destsCol();
      main.innerHTML = `<div class="page__head"><div><div class="proj__title"><h1 class="d-only">${esc(tx(P.name))}</h1>${projPill(P)}</div>
          <p class="proj__site">${esc(t('proj.site', { site: P.site || '—', paid: lcFirst(projPaid(P)) }))}</p></div>
          <a class="btn d-only" href="soon.html?s=projectSettings">${ico('settings', 'ico--sm')}${esc(t('proj.settings'))}</a></div>
        <nav class="ptabs d-only" aria-label="${esc(t('proj.sections'))}">${tab('overview', 'proj.overview')}${tab('sources', 'proj.sources', nS)}${tab('dests', 'proj.dests', nR)}
          ${link(`queue.html?project=${P.id}`, 'proj.queue', st.plan)}${link('soon.html?s=stats', 'proj.stats')}${link('soon.html?s=access', 'proj.access', P.team || 1)}</nav>
        ${S.view === 'overview' ? kpis() : ''}
        <div class="seg seg--m m-only" role="group" aria-label="${esc(t('proj.view'))}">
          <button type="button" data-act="m" data-id="dests" aria-pressed="${S.m === 'dests'}">${esc(t('proj.dests'))} <span class="num">${I18N.num(nR)}</span></button>
          <button type="button" data-act="m" data-id="sources" aria-pressed="${S.m === 'sources'}">${esc(t('proj.sources'))} <span class="num">${I18N.num(nS)}</span></button></div>
        <div class="pcols pcols--${S.view}" data-m="${S.m}">${cols}</div>
        <button type="button" class="pnew m-only" data-act="connect" data-mode="${S.m === 'sources' ? 'source' : 'dest'}">${ico('plus', 'ico--sm')}<b>${esc(t('proj.connect'))}</b></button>`;
    }

    // Перерисовать и вернуть фокус на тот же элемент (по data-act + data-id)
    function rerender(focusSel) {
      const a = document.activeElement;
      const sel = focusSel || (a && a.dataset && a.dataset.act ? `[data-act="${a.dataset.act}"][data-id="${a.dataset.id}"]` : a && a.id ? '#' + a.id : '');
      const caret = a && a.id === 'accSearch' ? a.selectionStart : null;
      render();
      const el = sel && $$(sel, main).find((x) => x.offsetParent !== null);
      if (el) { el.focus(); if (caret != null) el.setSelectionRange(caret, caret); }
    }
    const find = (kind, id) => (kind === 'source' ? DEMO.db.sources : DEMO.db.receivers).find((r) => r.id === id);

    main.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const { act, id } = b.dataset;
      if (act === 'view') { S.view = id; rerender(); }
      else if (act === 'm') { S.m = id; rerender(); }
      else if (act === 'filter') { S.filter = id; rerender(); }
      else if (act === 'grp') { S.open.has(id) ? S.open.delete(id) : S.open.add(id); rerender(); }
      else if (act === 'more-src') { S.allSrc = !S.allSrc; rerender('[data-act="more-src"]'); }
      else if (act === 'more-grp') { S.allGroups = !S.allGroups; rerender('[data-act="more-grp"]'); }
      else if (act === 'review') {
        S.filter = 'err'; S.m = 'dests'; if (S.view === 'sources') S.view = 'overview';
        rerender('[data-act="filter"][data-id="err"]');
        $('.pcol--dst', main)?.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'start' });
      } else if (act === 'connect') openConnect(b.dataset.mode);
      else if (act === 'tog' || act === 'fix') {
        const kind = b.closest('.pcol--src') ? 'source' : 'dest', r = find(kind, id);
        if (!r) return;
        if (act === 'fix') {
          demo('proj.fixToast', { action: tx(r.fix), net: netName(r.net) });
          r.st = 'on'; r.meta = JUST(); delete r.fix;
          DEMO.save(); rerender(`[data-act="tog"][data-id="${id}"]`);
        } else {
          r.st = r.st === 'on' ? 'off' : 'on'; r.meta = r.st === 'on' ? JUST() : OFFTXT();
          DEMO.save(); rerender();
        }
      } else if (act === 'del') {
        const kind = b.dataset.kind, r = find(kind, id);
        if (!r) return;
        const name = tx(r.name);
        const ok = await confirmBox({ titleKey: kind === 'source' ? 'proj.delSrcTitle' : 'proj.delTitle', text: t(kind === 'source' ? 'proj.delSrcText' : 'proj.delText', { name }) });
        if (!ok) return;
        const arr = kind === 'source' ? DEMO.db.sources : DEMO.db.receivers;
        arr.splice(arr.indexOf(r), 1);
        DEMO.save(); render(); toast(t('proj.deleted', { name }));
      }
    });
    main.addEventListener('input', (e) => { if (e.target.id === 'accSearch') { S.search = e.target.value.trim().toLowerCase(); rerender(); } });
    searchSubs.push((v) => { S.search = v; rerender(); });

    /* Окно «Подключить приёмник / источник»: 1 — выбор, 2 — вход (или адрес ленты), 3 — страница или группа */
    function openConnect(mode) {
      const src = mode === 'source', LIST = src ? SRC_LIST : DEST_LIST;
      const mobile = matchMedia('(max-width: 899.98px)').matches;
      const C = { cat: 'all', q: '', sel: null, step: 1, page: 0, busy: false };
      const d = dialog({ titleKey: src ? 'conn.titleSrc' : 'conn.title', sheet: mobile, wide: !mobile, cls: 'conn',
        html: `<p class="conn__sub">${esc(t(src ? 'conn.subSrc' : 'conn.sub'))}</p><ol class="steps"></ol><div class="conn__body"></div><div class="conn__foot"></div>` });
      const box = d.box, body = $('.conn__body', box), foot = $('.conn__foot', box), stepsEl = $('.steps', box);
      const selItem = () => LIST.find((x) => x.id === C.sel);
      const isRss = () => C.sel === 'rss';
      const have = (it) => recvs().filter((r) => r.net === it.plate).length;

      function drawSteps() {
        const names = [src ? 'conn.step1Src' : 'conn.step1', isRss() ? 'conn.step2Rss' : 'conn.step2', 'conn.step3'].slice(0, isRss() ? 2 : 3);
        stepsEl.innerHTML = names.map((k, i) => `<li class="${i + 1 === C.step ? 'is-cur' : i + 1 < C.step ? 'is-done' : ''}"${i + 1 === C.step ? ' aria-current="step"' : ''}><span>${i + 1 < C.step ? ico('check', 'ico--sm') : i + 1}</span>${esc(t(k))}</li>`).join('');
      }
      function drawTiles() {
        const cats = ['all', ...new Set(LIST.map((x) => x.cat))];
        $('.chips', body).innerHTML = cats.map((k) => `<button type="button" class="chipf" data-cat="${k}" aria-pressed="${C.cat === k}">${esc(t('conn.' + k))} <b class="num">${k === 'all' ? LIST.length : LIST.filter((x) => x.cat === k).length}</b></button>`).join('');
        const list = LIST.filter((x) => (C.cat === 'all' || x.cat === C.cat) && (!C.q || itemName(x).toLowerCase().includes(C.q) || x.id.includes(C.q)));
        $('.tiles-wrap', body).innerHTML = list.length ? `<div class="tiles">${list.map((x) => {
          const n = src ? 0 : have(x);
          return `<button type="button" class="tile" data-pick="${x.id}" aria-pressed="${C.sel === x.id}">${net(x.plate, 40)}<b>${esc(itemName(x))}</b>
            <span class="tile__sub${n ? '' : ' is-ok'}"><span class="d-txt">${esc(n ? t('conn.extra', { n }) : t('conn.included'))}</span><span class="m-txt">${esc(t(n ? 'conn.extraShort' : 'conn.includedShort'))}</span></span></button>`;
        }).join('')}</div>` : `<p class="conn__none">${esc(t('conn.nothing'))}</p>`;
      }
      function draw() {
        drawSteps();
        const it = selItem(), name = it ? itemName(it) : '';
        if (C.step === 1) {
          body.innerHTML = `<label class="search search--lg"><span class="vh">${esc(t('conn.search'))}</span>${ico('search', 'ico--sm')}<input type="search" data-q autocomplete="off" placeholder="${esc(t('conn.search'))}" value="${esc(C.q)}"></label>
            <div class="chips chips--scroll" role="group" aria-label="${esc(t('conn.cats'))}"></div><div class="tiles-wrap"></div>`;
          drawTiles();
          foot.innerHTML = `<div class="conn__note"><p>${esc(t(src ? 'conn.noteSrc' : 'conn.note'))}</p><p>${esc(t('conn.meta'))}</p></div>
            <button type="button" class="btn btn--p btn--lg" data-next${it ? '' : ' disabled'}>${esc(it ? t('conn.go', { net: name }) : t('conn.pick'))}</button>`;
        } else if (C.step === 2 && isRss()) {
          body.innerHTML = `<div class="conn__step"><div class="field"><label for="rssUrl">${esc(t('conn.rssLabel'))}</label>
            <div class="conn__row"><input class="input" id="rssUrl" type="url" inputmode="url" placeholder="${esc(t('conn.rssPh'))}" aria-describedby="rssErr"><button type="button" class="btn" data-rss-check>${esc(t('conn.rssCheck'))}</button></div>
            <span class="field__err" id="rssErr" hidden>${esc(t('conn.rssErr'))}</span></div></div>`;
          foot.innerHTML = `<button type="button" class="btn" data-back>${esc(t('conn.back'))}</button><button type="button" class="btn btn--p btn--lg" data-add>${esc(t('conn.add'))}</button>`;
          $('#rssUrl', body).focus();
        } else if (C.step === 2) {
          body.innerHTML = `<div class="conn__step conn__login">${net(it.plate, 40)}<p>${esc(t('conn.loginText', { net: name }))}</p>
            <button type="button" class="btn btn--p btn--lg" data-login${C.busy ? ' disabled' : ''}>${C.busy ? `<i class="mini__spin"></i>${esc(t('conn.waiting'))}` : esc(t('conn.loginBtn', { net: name }))}</button></div>`;
          foot.innerHTML = `<button type="button" class="btn" data-back>${esc(t('conn.back'))}</button>`;
          $('[data-login]', body).focus();
        } else {
          const pn = tx(P.name);
          const pages = [t('conn.page1', { name: pn }), t('conn.page2', { name: pn }), t('conn.page3')];
          body.innerHTML = `<fieldset class="conn__step conn__pages"><legend>${esc(t(src ? 'conn.pageTextSrc' : 'conn.pageText'))}</legend>
            ${pages.map((p, i) => `<label class="check conn__page">${net(it.plate, 28)}<span>${esc(p)}</span><input type="radio" name="cpage" value="${i}"${C.page === i ? ' checked' : ''}></label>`).join('')}</fieldset>`;
          foot.innerHTML = `<button type="button" class="btn" data-back>${esc(t('conn.back'))}</button><button type="button" class="btn btn--p btn--lg" data-add>${esc(t('conn.add'))}</button>`;
          $('input[type="radio"]:checked', body)?.focus();
        }
      }
      function add() {
        const it = selItem();
        let name;
        if (isRss()) {
          const inp = $('#rssUrl', body), v = inp.value.trim();
          inp.setAttribute('aria-invalid', String(!v)); $('#rssErr', body).hidden = !!v;
          if (!v) { inp.focus(); return; }
          name = v.replace(/^https?:\/\//, '');
        } else {
          const pn = tx(P.name);
          name = [t('conn.page1', { name: pn }), t('conn.page2', { name: pn }), t('conn.page3')][C.page];
        }
        const rec = { id: DEMO.uid(src ? 's' : 'r'), p: P.id, net: it.plate, st: 'on', name: { ru: name, en: name, kk: name }, meta: JUST() };
        (src ? DEMO.db.sources : DEMO.db.receivers).push(rec);
        if (!src && !P.nets.includes(it.plate)) P.nets.push(it.plate);
        DEMO.save();
        S.filter = 'all'; S.search = ''; S.open.add(it.plate); S.m = src ? 'sources' : 'dests';
        d.close();
        render();
        $$('[data-act="connect"]', main).find((x) => x.offsetParent !== null)?.focus();
        toast(t(src ? 'conn.doneSrc' : 'conn.done'));
      }
      box.addEventListener('click', (e) => {
        const tile = e.target.closest('[data-pick]');
        if (tile) { C.sel = tile.dataset.pick; drawTiles(); const it = selItem(); const go = $('[data-next]', foot); go.disabled = false; go.textContent = t('conn.go', { net: itemName(it) }); $(`[data-pick="${C.sel}"]`, body)?.focus(); return; }
        const cat = e.target.closest('[data-cat]');
        if (cat) { C.cat = cat.dataset.cat; drawTiles(); $(`[data-cat="${C.cat}"]`, body)?.focus(); return; }
        if (e.target.closest('[data-next]') && C.sel) { C.step = 2; draw(); return; }
        if (e.target.closest('[data-back]')) { C.step = C.step === 3 ? 2 : 1; C.busy = false; draw(); if (C.step === 1) $(`[data-pick="${C.sel}"]`, body)?.focus(); return; }
        if (e.target.closest('[data-login]') && !C.busy) {
          C.busy = true; draw();
          setTimeout(() => { if (!box.isConnected) return; C.busy = false; C.step = 3; draw(); }, 1000);
          return;
        }
        if (e.target.closest('[data-rss-check]')) {
          const inp = $('#rssUrl', body), v = inp.value.trim();
          inp.setAttribute('aria-invalid', String(!v)); $('#rssErr', body).hidden = !!v;
          if (v) demo('conn.rssToast'); else inp.focus();
          return;
        }
        if (e.target.closest('[data-add]')) add();
      });
      box.addEventListener('input', (e) => { if (e.target.matches('[data-q]')) { C.q = e.target.value.trim().toLowerCase(); drawTiles(); } });
      box.addEventListener('change', (e) => { if (e.target.name === 'cpage') C.page = +e.target.value; });
      draw();
      $('[data-q]', body)?.focus();
    }

    I18N.onChange(() => { setCrumbs([{ key: 'nav.projects', href: 'projects.html' }, { text: P.name }]); render(); });
    render();
    if (location.hash === '#connect') openConnect('dest');
    else if (location.hash === '#connect-source') openConnect('source');
  };

  PAGES.login = () => authPage('login');
  PAGES.register = () => authPage('register');

  /* ---------- Запуск ---------- */
  if (shell) {
    buildShell();
    wireSearch();
  }
  banner();
  PAGES[PAGE]?.();
  syncTheme();
  I18N.apply();

  window.APP = { $, $$, esc, tx, ico, net, netName, toast, demo, dialog, confirmBox, setCrumbs, onSearch: (fn) => searchSubs.push(fn), reduce };
})();
