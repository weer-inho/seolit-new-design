/* SEOlit, демо-кабинет — разделы этапа 2 (без макетов, по prompts/08 и скриншотам реального кабинета).
   Подключается после app.js и пользуется его помощниками (window.APP). Тексты — в i18n.js, данные — в data.js. */
(() => {
  'use strict';

  const { t, plural, money } = window.I18N;
  const I18N = window.I18N, DEMO = window.DEMO, APP = window.APP;
  const { $, $$, esc, tx, ico, net, netName, toast, dialog, confirmBox, setCrumbs } = APP;
  const PAGE = APP.PAGE;
  const db = () => DEMO.db;
  const save = () => DEMO.save();
  const pad = (n) => String(n).padStart(2, '0');
  const isoDay = (ts) => { const d = new Date(ts); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const fromIso = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d).getTime(); };
  const L3 = (v) => ({ ru: v, en: v, kk: v });
  const sel = (id, opts, cur, attrs = '') => `<span class="sel sel--full"><select id="${id}" ${attrs}>${opts.map(([v, l]) => `<option value="${esc(v)}"${String(v) === String(cur) ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>${ico('down', 'ico--sm')}</span>`;
  const chk = (id, label, on) => `<label class="check"><input type="checkbox" id="${id}"${on ? ' checked' : ''}><span>${esc(label)}</span></label>`;
  const radios = (name, opts, cur) => opts.map(([v, l]) => `<label class="check"><input type="radio" name="${name}" value="${v}"${v === cur ? ' checked' : ''}><span>${esc(l)}</span></label>`).join('');
  const setBalance = () => $$('[data-balance]').forEach((el) => { el.textContent = money(db().balance); });
  // Псевдослучайное число по строке — чтобы демо-статистика была одинаковой при каждом открытии
  const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; };

  /* ==========================================================================
     Настройки приёмника или источника — окно с вкладками, как в кабинете seolit.ru
     ========================================================================== */
  function accSettings(kind, r, P, onSave) {
    const src = kind === 'source';
    const S = { tab: 'main', ...JSON.parse(JSON.stringify(r.settings || {})) };
    const def = { on: r.st !== 'off', schedule: '', limit: 0, wm: '', interval: 2, iv: false, link: 'arrow', utm: false, short: 'host', silent: false,
      autoimg: true, covers: 'noimg', imgs: 'all', imgAuto: false, imgWithVideo: false, imgMode: 'caption', video: 'caption', vFail: 'tpl', tpl: '', dests: 'all' };
    Object.keys(def).forEach((k) => { if (S[k] === undefined) S[k] = def[k]; });
    const name = tx(r.name);
    const d = dialog({ title: t('acc.title', { name }), wide: true, cls: 'accset', html: `<div class="seg seg--tabs accset__tabs" role="tablist"></div><form class="modal__body accset__body" novalidate></form>
      <div class="modal__foot"><button type="button" class="btn" data-close>${esc(t('c.cancel'))}</button><button type="button" class="btn btn--p" data-save>${esc(t('c.save'))}</button></div>` });
    const body = $('.accset__body', d.box), tabs = $('.accset__tabs', d.box);
    const tabList = src ? ['main'] : ['main', 'more', 'tpl'];
    const tpls = db().templates;
    function read() {
      const v = (id) => $('#' + id, body);
      if (S.tab === 'main') {
        S.name = v('asName').value.trim() || name; S.on = v('asOn').checked;
        if (src) { S.interval = +v('asInt').value; S.dests = v('asDests').value; }
        else { S.schedule = v('asSch').value; S.limit = Math.max(0, +v('asLim').value || 0); S.wm = v('asWm').value; }
      } else if (S.tab === 'more') {
        ['iv', 'utm', 'silent', 'autoimg', 'imgAuto', 'imgWithVideo'].forEach((k) => { const el = v('as_' + k); if (el) S[k] = el.checked; });
        S.link = v('asLink').value; S.short = v('asShort').value; S.covers = v('asCovers').value;
        ['imgs', 'imgMode', 'video', 'vFail'].forEach((k) => { const el = $(`input[name="as_${k}"]:checked`, body); if (el) S[k] = el.value; });
      } else if (S.tab === 'tpl') S.tpl = v('asTpl').value;
    }
    function draw() {
      tabs.innerHTML = tabList.length > 1 ? tabList.map((k) => `<button type="button" role="tab" data-tab="${k}" aria-selected="${S.tab === k}" aria-pressed="${S.tab === k}">${esc(t('acc.t' + { main: 'Main', more: 'More', tpl: 'Tpl' }[k]))}</button>`).join('') : '';
      tabs.hidden = tabList.length < 2;
      const isTg = r.net === 'tg';
      if (S.tab === 'main') {
        body.innerHTML = `<div class="field"><label for="asName">${esc(t('acc.name'))}</label><input class="input" id="asName" value="${esc(S.name || name)}"></div>
          <label class="check accset__sw"><input type="checkbox" id="asOn"${S.on ? ' checked' : ''}><span>${esc(t(src ? 'acc.readOn' : 'acc.on'))}</span></label>
          ${src ? `<div class="two"><div class="field"><label for="asInt">${esc(t('acc.interval'))}</label>${sel('asInt', [2, 5, 15, 30, 60].map((n) => [n, t('acc.min', { n })]), S.interval)}</div>
            <div class="field"><label for="asDests">${esc(t('acc.dests'))}</label>${sel('asDests', [['all', t('acc.allDests')]], S.dests)}</div></div>`
          : `<div class="two"><div class="field"><label for="asSch">${esc(t('acc.schedule'))}</label>${sel('asSch', [['', t('acc.noSchedule')], ...db().schedules.map((s) => [s.id, tx(s.name)])], S.schedule)}</div>
            <div class="field"><label for="asLim">${esc(t('acc.limit'))}</label><input class="input" id="asLim" type="number" min="0" max="200" inputmode="numeric" value="${S.limit}" aria-describedby="asLimH"><span class="field__hint" id="asLimH">${esc(t('acc.limitHint'))}</span></div></div>
            <div class="field"><label for="asWm">${esc(t('acc.wm'))}</label>${sel('asWm', [['', t('acc.noWm')], ...db().watermarks.map((w) => [w.id, tx(w.name)])], S.wm)}</div>`}`;
      } else if (S.tab === 'more') {
        body.innerHTML = `${isTg ? chk('as_iv', t('acc.iv'), S.iv) : ''}
          <div class="two"><div class="field"><label for="asLink">${esc(t('acc.addLink'))}</label>${sel('asLink', [['arrow', t('acc.linkArrow')], ['end', t('acc.linkEnd')], ['no', t('acc.linkNo')]], S.link)}</div>
          <div class="field"><label for="asShort">${esc(t('acc.short'))}</label>${sel('asShort', [['host', t('acc.shortHost')], ['full', t('acc.shortFull')]], S.short)}</div></div>
          ${chk('as_utm', t('acc.utm'), S.utm)}${isTg ? chk('as_silent', t('acc.silent'), S.silent) : ''}${chk('as_autoimg', t('acc.autoimg'), S.autoimg)}
          <div class="field"><label for="asCovers">${esc(t('acc.covers'))}</label>${sel('asCovers', [['noimg', t('acc.coverNoImg')], ['always', t('acc.coverAlways')], ['no', t('acc.coverNo')]], S.covers)}</div>
          <fieldset class="accset__grp"><legend>${esc(t('acc.imgs'))}</legend>${radios('as_imgs', [['all', t('acc.imgAll')], ['first', t('acc.imgFirst')], ['none', t('acc.imgNone')]], S.imgs)}
            ${chk('as_imgAuto', t('acc.imgAuto'), S.imgAuto)}${chk('as_imgWithVideo', t('acc.imgWithVideo'), S.imgWithVideo)}</fieldset>
          <fieldset class="accset__grp"><legend>${esc(t('acc.imgMode'))}</legend>${radios('as_imgMode', [['caption', t('acc.imgCaption')], ['separate', t('acc.imgSeparate')], ['albumText', t('acc.imgAlbumText')]], S.imgMode)}</fieldset>
          <fieldset class="accset__grp"><legend>${esc(t('acc.video'))}</legend>${radios('as_video', [['caption', t('acc.vCaption')], ['separate', t('acc.vSeparate')], ['albumText', t('acc.vAlbumText')], ['none', t('acc.vNone')]], S.video)}</fieldset>
          <fieldset class="accset__grp"><legend>${esc(t('acc.vFail'))}</legend>${radios('as_vFail', [['noVideo', t('acc.vFailNoVideo')], ['stop', t('acc.vFailStop')], ['tpl', t('acc.vFailTpl')]], S.vFail)}</fieldset>`;
      } else {
        const tp = tpls.find((x) => x.id === S.tpl) || tpls[0];
        body.innerHTML = `<div class="field"><label for="asTpl">${esc(t('acc.tpl'))}</label>${sel('asTpl', [['', t('acc.tplDefault')], ...tpls.map((x) => [x.id, tx(x.name)])], S.tpl)}</div>
          <div class="field"><span class="field__lbl">${esc(t('acc.tplPreview'))}</span><pre class="tplpv">${esc(fillTpl(tp.body, DEMO.sample, I18N.lang))}</pre></div>
          <a href="templates.html">${esc(t('acc.tplEdit'))} →</a>`;
      }
    }
    tabs.addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (!b) return; read(); S.tab = b.dataset.tab; draw(); $(`[data-tab="${S.tab}"]`, tabs)?.focus(); });
    body.addEventListener('change', (e) => { if (e.target.id === 'asTpl') { read(); draw(); $('#asTpl', body).focus(); } });
    $('[data-save]', d.box).addEventListener('click', () => {
      read();
      const { tab, name: nm, ...rest } = S;
      r.settings = rest;
      if (nm && nm !== name) r.name = L3(nm);
      if (r.st !== 'err') r.st = S.on ? 'on' : 'off';
      save(); d.close(); onSave?.(); toast(t('acc.saved'));
    });
    draw();
    $('#asName', body)?.focus();
  }
  // Подстановка переменных шаблона: #TITLE#, #TEXT#, #URL#, #TAGS#
  function fillTpl(body, smp, lang) {
    return body.replace(/#TITLE#/g, tx(smp.title)).replace(/#TEXT#/g, tx(smp.text)).replace(/#URL#/g, smp.link).replace(/#TAGS#/g, (smp.tags[lang] || smp.tags.ru).join(' '));
  }

  /* ==========================================================================
     Вкладки проекта: статистика, доступ, настройки
     ========================================================================== */
  const TZ = [['Europe/Kaliningrad', 2, 'Калининград'], ['Europe/Moscow', 3, 'Москва'], ['Europe/Samara', 4, 'Самара'], ['Asia/Yekaterinburg', 5, 'Екатеринбург'],
    ['Asia/Almaty', 5, 'Алматы'], ['Asia/Omsk', 6, 'Омск'], ['Asia/Novosibirsk', 7, 'Новосибирск'], ['Asia/Irkutsk', 8, 'Иркутск'], ['Asia/Vladivostok', 10, 'Владивосток']];
  const SERIES = [['posts', 'var(--accent)'], ['likes', 'var(--warn)'], ['reposts', 'var(--ok)'], ['comments', 'var(--atext)'], ['views', 'var(--muted)'], ['errors', 'var(--err)']];

  function projectTab(view, P, el, back) {
    if (view === 'stats') statsTab(P, el);
    else if (view === 'access') accessTab(P, el);
    else settingsTab(P, el, back);
  }

  function statsTab(P, el) {
    const S = P._stats || (P._stats = { from: DEMO.at(-7), to: +DEMO.D0, on: new Set(['posts', 'likes', 'reposts', 'views', 'errors']) });
    const nets = [...new Set(db().receivers.filter((r) => r.p === P.id && r.st === 'on').map((r) => r.net))];
    const week = P.week || [0, 0, 0, 0, 0, 0, 0];
    function dayData(ts) {
      const k = P.id + isoDay(ts), di = Math.round((ts - DEMO.D0) / APP.DAY);
      const posts = di > -7 && di <= 0 ? week[6 + di] : Math.round(hash(k) * (Math.max(...week) || 1));
      const views = Math.round(posts * (60 + hash(k + 'v') * 140));
      return { posts, likes: Math.round(views * (0.02 + hash(k + 'l') * 0.04)), reposts: Math.round(views * 0.004 * (1 + hash(k + 'r'))), comments: Math.round(views * 0.003 * (1 + hash(k + 'c'))), views, errors: hash(k + 'e') > 0.8 ? 1 : 0 };
    }
    function render() {
      const days = []; for (let ts = S.from; ts <= S.to; ts += APP.DAY) days.push([ts, dayData(ts)]);
      const tot = {}; SERIES.forEach(([k]) => { tot[k] = days.reduce((a, [, v]) => a + v[k], 0); });
      const W = 640, H = 220, pad0 = 28;
      const lines = SERIES.filter(([k]) => S.on.has(k)).map(([k, c]) => {
        const mx = Math.max(1, ...days.map(([, v]) => v[k]));
        const pts = days.map(([, v], i) => `${pad0 + (i * (W - pad0 * 2)) / Math.max(1, days.length - 1)},${H - pad0 - (v[k] / mx) * (H - pad0 * 2)}`).join(' ');
        return `<polyline points="${pts}" style="stroke:${c}"/>`;
      }).join('');
      const labels = days.map(([ts], i) => (days.length <= 10 || i % Math.ceil(days.length / 8) === 0) ? `<text x="${pad0 + (i * (W - pad0 * 2)) / Math.max(1, days.length - 1)}" y="${H - 6}">${esc(I18N.date(ts, 'dmShort'))}</text>` : '').join('');
      el.innerHTML = `<section class="card card--pad stats">
        <div class="stats__bar"><div class="field"><label for="stFrom">${esc(t('st.from'))}</label><input class="input" type="date" id="stFrom" value="${isoDay(S.from)}"></div>
          <div class="field"><label for="stTo">${esc(t('st.to'))}</label><input class="input" type="date" id="stTo" value="${isoDay(S.to)}"></div>
          <button type="button" class="btn" data-st="refresh">${ico('reset', 'ico--sm')}${esc(t('st.refresh'))}</button>
          <button type="button" class="btn btn--q" data-st="csv">${ico('down', 'ico--sm')}${esc(t('st.download'))}</button></div>
        <div class="stats__legend" role="group" aria-label="${esc(t('st.chart'))}">${SERIES.map(([k, c]) => `<button type="button" class="chipf" data-series="${k}" aria-pressed="${S.on.has(k)}"><i style="background:${c}"></i>${esc(t('st.' + k))} <b class="num">${I18N.num(tot[k])}</b></button>`).join('')}</div>
        <svg class="stats__chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t('st.chart'))}"><line x1="${pad0}" y1="${H - pad0}" x2="${W - pad0}" y2="${H - pad0}"/>${lines}${labels}</svg>
      </section>
      <section class="card card--pad"><h2 class="sec-t">${esc(t('st.byNet'))}</h2>
        <ul class="stats__nets">${nets.length ? nets.map((n) => { const share = 0.2 + hash(P.id + n) * 0.8; return `<li>${net(n, 28)}<b>${esc(netName(n))}</b><span class="bar"><span style="width:${Math.round(share * 100)}%"></span></span><span class="num">${I18N.num(Math.round(tot.views * share / nets.length))}</span></li>`; }).join('') : `<li class="muted">—</li>`}</ul></section>`;
    }
    el.onclick = (e) => {
      const b = e.target.closest('[data-st], [data-series]');
      if (!b) return;
      if (b.dataset.series) { const k = b.dataset.series; S.on.has(k) ? S.on.delete(k) : S.on.add(k); render(); $(`[data-series="${k}"]`, el).focus(); return; }
      if (b.dataset.st === 'refresh') {
        const f = fromIso($('#stFrom', el).value), to = fromIso($('#stTo', el).value);
        if (!f || !to) return;
        if (f > to) { toast(t('st.badRange')); return; }
        S.from = f; S.to = Math.min(to, f + 92 * APP.DAY); render(); $('[data-st="refresh"]', el).focus();
      } else {
        const rows = [['date', ...SERIES.map(([k]) => k)].join(';')];
        for (let ts = S.from; ts <= S.to; ts += APP.DAY) { const v = dayData(ts); rows.push([isoDay(ts), ...SERIES.map(([k]) => v[k])].join(';')); }
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' }));
        a.download = `seolit-${P.id}-${isoDay(S.from)}-${isoDay(S.to)}.csv`;
        a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        toast(t('st.downloaded'));
      }
    };
    render();
  }

  function accessTab(P, el) {
    const list = db().team[P.id] || (db().team[P.id] = [{ email: DEMO.loggedIn() || DEMO.user.email, role: 'owner' }]);
    const me = DEMO.loggedIn() || DEMO.user.email;
    function render(focus) {
      el.innerHTML = `<section class="card card--pad access"><h2 class="sec-t">${esc(t('ac.title'))}</h2><p class="muted">${esc(t('ac.hint'))}</p>
        <form class="access__form" novalidate><div class="field"><label for="acEmail">${esc(t('ac.email'))}</label><input class="input" id="acEmail" type="email" inputmode="email" autocomplete="off" placeholder="name@example.ru" aria-describedby="acErr"><span class="field__err" id="acErr" hidden></span></div>
          <div class="field"><label for="acRole">${esc(t('ac.role'))}</label>${sel('acRole', [['editor', t('ac.editor')], ['viewer', t('ac.viewer')]], 'editor')}</div>
          <button type="submit" class="btn btn--p">${ico('plus', 'ico--sm')}${esc(t('ac.invite'))}</button></form>
        <ul class="access__list">${list.map((m, i) => `<li><span class="ava" aria-hidden="true">${esc(m.email[0].toUpperCase())}</span><span class="access__who"><b>${esc(m.email)}</b>${m.email === me ? ` <span class="muted">(${esc(t('ac.you'))})</span>` : ''}</span>
          ${m.role === 'owner' ? `<span class="pill pill--info">${esc(t('ac.owner'))}</span>` : `${sel('acR' + i, [['editor', t('ac.editor')], ['viewer', t('ac.viewer')]], m.role, `data-role="${i}" aria-label="${esc(t('ac.role'))}: ${esc(m.email)}"`)}
            <button type="button" class="ibtn ibtn--sm" data-rm="${i}" aria-label="${esc(t('ac.remove', { email: m.email }))}">${ico('close')}</button>`}</li>`).join('')}</ul></section>`;
      if (focus) $(focus, el)?.focus();
    }
    el.onsubmit = (e) => {
      e.preventDefault();
      const inp = $('#acEmail', el), v = inp.value.trim().toLowerCase(), err = $('#acErr', el);
      const bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'ac.bad' : list.some((m) => m.email === v) ? 'ac.exists' : '';
      inp.setAttribute('aria-invalid', String(!!bad)); err.hidden = !bad; if (bad) { err.textContent = t(bad); inp.focus(); return; }
      list.push({ email: v, role: $('#acRole', el).value }); P.team = list.length; save(); render('#acEmail'); toast(t('ac.invited', { email: v }));
    };
    el.onclick = (e) => { const b = e.target.closest('[data-rm]'); if (!b) return; const [m] = list.splice(+b.dataset.rm, 1); P.team = list.length; save(); render('#acEmail'); toast(t('ac.removed', { email: m.email })); };
    el.onchange = (e) => { const r = e.target.dataset.role; if (r != null) { list[+r].role = e.target.value; save(); } };
    render();
  }

  function settingsTab(P, el, back) {
    const S = { name: tx(P.name), site: P.site || '', mode: P.mode || 'auto', tz: P.tz || 'Europe/Moscow', auto: !!P.autoRenew };
    function render() {
      el.innerHTML = `<form class="card card--pad psettings" novalidate><h2 class="sec-t">${esc(t('ps.title'))}</h2>
        <div class="two"><div class="field"><label for="psName">${esc(t('ps.name'))}</label><input class="input" id="psName" value="${esc(S.name)}"></div>
          <div class="field"><label for="psSite">${esc(t('ps.site'))}</label><input class="input" id="psSite" inputmode="url" value="${esc(S.site)}"></div></div>
        <fieldset class="field psettings__mode"><legend class="field__lbl">${esc(t('ps.mode'))}</legend>
          <div class="seg" role="group">${['auto', 'manual'].map((k) => `<button type="button" data-mode="${k}" aria-pressed="${S.mode === k}">${ico(k === 'auto' ? 'rss' : 'edit', 'ico--sm')}${esc(t('ps.' + k))}</button>`).join('')}</div>
          <p class="field__hint">${esc(t(S.mode === 'auto' ? 'ps.autoHint' : 'ps.manualHint'))}</p></fieldset>
        <div class="field"><label for="psTz">${esc(t('ps.tz'))}</label>${sel('psTz', TZ.map(([id, off, city]) => [id, `${city} (UTC+${off})`]), S.tz)}</div>
        <div class="modal__foot modal__foot--in"><button type="submit" class="btn btn--p">${esc(t('ps.save'))}</button></div></form>
        <section class="card card--pad psettings"><h2 class="sec-t">${esc(t('ps.paid'))}</h2>
          <p><b>${esc(t('ps.paidUntil', { date: I18N.date(P.until) }))}</b></p>
          <div class="psettings__row"><button type="button" class="btn btn--p" data-ps="renew">${esc(t('ps.renew'))}</button>${chk('psAuto', t('ps.autoRenew'), S.auto)}</div></section>
        ${P.own ? `<section class="card card--pad psettings psettings--danger"><h2 class="sec-t">${esc(t('ps.danger'))}</h2><button type="button" class="btn btn--danger" data-ps="del">${ico('close', 'ico--sm')}${esc(t('ps.delete'))}</button></section>` : ''}`;
    }
    el.onclick = async (e) => {
      const m = e.target.closest('[data-mode]');
      if (m) { S.name = $('#psName', el).value; S.site = $('#psSite', el).value; S.tz = $('#psTz', el).value; S.mode = m.dataset.mode; render(); $(`[data-mode="${S.mode}"]`, el).focus(); return; }
      const b = e.target.closest('[data-ps]');
      if (!b) return;
      if (b.dataset.ps === 'renew') {
        if (db().balance < 800) { toast(t('ps.noMoney')); return; }
        db().balance -= 800;
        P.until = Math.max(P.until, Date.now()) + 30 * APP.DAY; P.period = 30; if (P.st === 'off' || P.st === 'demo') P.st = 'ok';
        db().payments.unshift({ at: Date.now(), sum: -800, what: { ru: `Продление «${tx(P.name)}» на 30 дней`, en: `${tx(P.name)} renewed for 30 days`, kk: `«${tx(P.name)}» 30 күнге ұзартылды` } });
        save(); setBalance(); render(); toast(t('ps.renewed', { date: I18N.date(P.until) }));
      } else {
        const name = tx(P.name);
        if (!(await confirmBox({ titleKey: 'ps.delTitle', text: t('ps.delText', { name }) }))) return;
        db().projects = db().projects.filter((x) => x !== P);
        ['sources', 'receivers', 'posts'].forEach((k) => { db()[k] = db()[k].filter((x) => x.p !== P.id); });
        save();
        try { sessionStorage.setItem('seolit-toast', t('ps.deleted', { name })); } catch (er) { /* ничего */ }
        location.href = 'projects.html';
      }
    };
    el.onchange = (e) => { if (e.target.id === 'psAuto') { P.autoRenew = e.target.checked; save(); } };
    el.onsubmit = (e) => {
      e.preventDefault();
      const nm = $('#psName', el).value.trim();
      if (nm) P.name = L3(nm);
      P.site = $('#psSite', el).value.trim().replace(/^https?:\/\//, '').replace(/\/$/, ''); P.mode = S.mode; P.tz = $('#psTz', el).value;
      save(); back?.(); toast(t('ps.saved'));
    };
    render();
  }

  /* ==========================================================================
     Разделы. Пока раздел не сделан — заглушка, как soon.html
     ========================================================================== */
  const SECTIONS = {};

  function soon(main) {
    main.innerHTML = `<section class="card empty soon"><span class="empty__ico">${ico(PAGE)}</span><h1>${esc(t('nav.' + PAGE))}</h1>
      <p>${esc(t('soon.text'))}</p><a class="btn btn--p" href="projects.html">${ico('projects', 'ico--sm')}${esc(t('soon.back'))}</a></section>`;
  }

  window.SECTIONS = { accSettings, projectTab, fillTpl, add: (k, fn) => { SECTIONS[k] = fn; } };

  const main = $('#main');
  if (main && PAGE && !['projects', 'project', 'queue', 'post', 'soon', 'login', 'register'].includes(PAGE)) {
    const run = () => (SECTIONS[PAGE] ? SECTIONS[PAGE](main) : soon(main));
    run();
    I18N.onChange(run);
  }
  document.dispatchEvent(new Event('sections-ready'));
  APP._sec = { db, save, sel, chk, radios, isoDay, fromIso, L3, setBalance, hash, SECTIONS };
})();
