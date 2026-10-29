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
  const setBalance = () => { $$('[data-balance]').forEach((el) => { el.textContent = money(db().balance); }); $$('[data-enough]').forEach((el) => { el.textContent = APP.enough(); }); };
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
        db().payments.unshift({ at: Date.now(), sum: -800, what: { ru: `Продление: ${tx(P.name)}, 30 дней`, en: `Renewal: ${tx(P.name)}, 30 days`, kk: `Ұзарту: ${tx(P.name)}, 30 күн` } });
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

  /* ---------- Общее для разделов ---------- */
  const head = (titleKey, subKey, right = '') => `<div class="page__head"><div><h1>${esc(t(titleKey))}</h1>${subKey ? `<p>${esc(t(subKey))}</p>` : ''}</div>${right}</div>`;
  const csv = (name, rows) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + rows.map((r) => r.join(';')).join('\n')], { type: 'text/csv' }));
    a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const copy = async (text, okKey) => { try { await navigator.clipboard.writeText(text); } catch (e) { /* без доступа к буферу — просто сообщаем */ } toast(t(okKey)); };
  // Месячные списания: 800 ₽ за каждый свой оплаченный проект
  const paidProjects = () => db().projects.filter((p) => p.own && (p.st === 'ok' || p.st === 'err') && p.until > Date.now());
  const monthly = () => paidProjects().length * 800;

  /* ---------- Баланс ---------- */
  const BS = { amount: 800, method: 'card', filter: 'all' };
  SECTIONS.balance = (main) => {
    const methodName = (m) => t({ card: 'bal.card', sbp: 'bal.sbp', invoice: 'bal.invoice' }[m]);
    function render(focus) {
      const bal = db().balance, mon = monthly(), months = mon ? Math.floor(bal / mon) : 0;
      const pays = db().payments.filter((p) => BS.filter === 'all' || (BS.filter === 'in' ? p.sum > 0 : p.sum < 0)).sort((a, b) => b.at - a.at);
      const next = paidProjects().sort((a, b) => a.until - b.until);
      const quick = [[800, 'bal.q1'], [1600, 'bal.q2'], [Math.max(800, mon * 3), 'bal.q3']];
      main.innerHTML = `${head('bal.title', 'bal.sub')}
      <div class="bgrid">
        <section class="card card--pad bcard"><span class="lbl">${esc(t('bal.lbl'))}</span><b class="bcard__sum num" data-balance>${money(bal)}</b>
          <span class="muted">${esc(mon ? (months ? plural(months, 'p.enough') : t('bal.enoughLess')) : '')}</span>
          <div class="bcard__row"><span class="lbl">${esc(t('bal.spend'))}</span><b class="num">${money(mon)}</b><span class="muted">${esc(t('bal.spendHint', { n: plural(paidProjects().length, 'p.projects') }))}</span></div></section>
        <form class="card card--pad btop" id="topup" novalidate><h2>${esc(t('bal.topupTitle'))}</h2>
          <div class="field"><label for="bAmount">${esc(t('bal.amount'))}</label><input class="input bamount num" id="bAmount" type="number" inputmode="numeric" min="100" max="500000" step="100" value="${BS.amount}" aria-describedby="bAmErr"><span class="field__err" id="bAmErr" hidden>${esc(t('bal.amountErr'))}</span>
            <div class="chips">${quick.map(([v, k]) => `<button type="button" class="chipf" data-amount="${v}" aria-pressed="${BS.amount === v}"><b class="num">${money(v)}</b> ${esc(t(k))}</button>`).join('')}</div></div>
          <fieldset class="field"><legend class="field__lbl">${esc(t('bal.method'))}</legend><div class="seg">${['card', 'sbp', 'invoice'].map((m) => `<button type="button" data-method="${m}" aria-pressed="${BS.method === m}">${esc(methodName(m))}</button>`).join('')}</div>
            <p class="field__hint">${esc(t({ card: 'bal.cardHint', sbp: 'bal.sbpHint', invoice: 'bal.invoiceHint' }[BS.method]))}</p></fieldset>
          ${BS.method === 'invoice' ? `<div class="two"><div class="field"><label for="bInn">${esc(t('bal.inn'))}</label><input class="input num" id="bInn" inputmode="numeric" maxlength="12" aria-describedby="bInnErr"><span class="field__err" id="bInnErr" hidden>${esc(t('bal.innErr'))}</span></div>
            <div class="field"><label for="bOrg">${esc(t('bal.org'))}</label><input class="input" id="bOrg"></div></div>` : ''}
          <div class="bpromo"><div class="field"><label for="bPromo">${esc(t('bal.promo'))}</label><input class="input" id="bPromo" autocomplete="off"></div><button type="button" class="btn" data-promo>${esc(t('bal.promoApply'))}</button></div>
          <button type="submit" class="btn btn--p btn--lg">${esc(t(BS.method === 'invoice' ? 'bal.getInvoice' : 'bal.pay', { sum: money(BS.amount) }))}</button></form>
      </div>
      <section class="card"><header class="post__h"><h2>${esc(t('bal.next'))}</h2></header>
        ${next.length ? `<ul class="blist">${next.map((p) => `<li><a href="project.html?id=${p.id}"><b>${esc(tx(p.name))}</b></a><span class="muted">${esc(t('ps.paidUntil', { date: I18N.date(p.until) }))}</span><b class="num">−${money(800)}</b>
          <a class="btn btn--sm" href="project.html?id=${p.id}&tab=settings">${esc(t('bal.renew'))}</a></li>`).join('')}</ul>` : `<p class="col__none">${esc(t('bal.nextEmpty'))}</p>`}</section>
      <section class="card"><header class="post__h"><h2>${esc(t('bal.history'))}</h2>
          <div class="post__h-r"><div class="seg" role="group">${['all', 'in', 'out'].map((k) => `<button type="button" data-filter="${k}" aria-pressed="${BS.filter === k}">${esc(t('bal.f' + { all: 'All', in: 'In', out: 'Out' }[k]))}</button>`).join('')}</div>
          <button type="button" class="btn btn--sm btn--q" data-csv>${esc(t('bal.export'))}</button></div></header>
        <table class="tbl"><thead><tr><th>${esc(t('bal.date'))}</th><th>${esc(t('bal.op'))}</th><th class="num">${esc(t('bal.sum'))}</th></tr></thead>
          <tbody>${pays.map((p) => `<tr><td class="num">${esc(I18N.date(p.at))} ${esc(I18N.date(p.at, 'time'))}</td><td>${esc(tx(p.what))}</td><td class="num ${p.sum > 0 ? 'is-in' : 'is-out'}">${p.sum > 0 ? '+' : '−'}${money(Math.abs(p.sum))}</td></tr>`).join('')}</tbody></table></section>`;
      if (focus) $(focus, main)?.focus();
    }
    main.onclick = (e) => {
      const a = e.target.closest('[data-amount]'), m = e.target.closest('[data-method]'), f = e.target.closest('[data-filter]');
      if (a) { BS.amount = +a.dataset.amount; render(`[data-amount="${BS.amount}"]`); }
      else if (m) { BS.amount = +$('#bAmount', main).value || BS.amount; BS.method = m.dataset.method; render(`[data-method="${BS.method}"]`); }
      else if (f) { BS.filter = f.dataset.filter; render(`[data-filter="${BS.filter}"]`); }
      else if (e.target.closest('[data-promo]')) APP.demo('bal.promoToast');
      else if (e.target.closest('[data-csv]')) { csv('seolit-balance.csv', [[t('bal.date'), t('bal.op'), t('bal.sum')], ...db().payments.map((p) => [isoDay(p.at), tx(p.what), p.sum])]); toast(t('bal.exported')); }
    };
    main.oninput = (e) => { if (e.target.id === 'bAmount') { BS.amount = +e.target.value || 0; $$('[data-amount]', main).forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.amount === BS.amount))); $('#topup [type=submit]', main).textContent = t(BS.method === 'invoice' ? 'bal.getInvoice' : 'bal.pay', { sum: money(BS.amount) }); } };
    main.onsubmit = (e) => {
      e.preventDefault();
      const amt = +$('#bAmount', main).value, okA = amt >= 100 && amt <= 500000;
      $('#bAmErr', main).hidden = okA; $('#bAmount', main).setAttribute('aria-invalid', String(!okA));
      if (!okA) { $('#bAmount', main).focus(); return; }
      if (BS.method === 'invoice') {
        const inn = $('#bInn', main), okI = /^(\d{10}|\d{12})$/.test(inn.value.trim());
        $('#bInnErr', main).hidden = okI; inn.setAttribute('aria-invalid', String(!okI));
        if (!okI) { inn.focus(); return; }
        toast(t('bal.invoiced', { sum: money(amt), email: DEMO.loggedIn() || DEMO.user.email })); return;
      }
      db().balance += amt;
      db().payments.unshift({ at: Date.now(), sum: amt, what: { ru: `Пополнение: ${methodName(BS.method)}`, en: `Top-up: ${methodName(BS.method)}`, kk: `Толтыру: ${methodName(BS.method)}` } });
      save(); setBalance(); render('#bAmount'); toast(t('bal.paid', { sum: money(amt) }));
    };
    render();
  };

  /* ---------- Рефералы ---------- */
  SECTIONS.referrals = (main) => {
    const R = db().ref || (db().ref = { code: 'ANNA4300', clicks: 48, available: 960, invited: [
      { at: DEMO.at(-3), who: 'o***@mail.ru', st: 'paid', bonus: 160 }, { at: DEMO.at(-6), who: 'k***@yandex.ru', st: 'reg', bonus: 0 },
      { at: DEMO.at(-15), who: 'shop***@gmail.com', st: 'paid', bonus: 480 }, { at: DEMO.at(-31), who: 'd***@bk.ru', st: 'paid', bonus: 320 }] });
    const link = `https://seolit.ru/?ref=${R.code}`;
    function render(focus) {
      const paid = R.invited.filter((x) => x.st === 'paid');
      main.innerHTML = `${head('ref.title', 'ref.sub', `<a class="btn" href="https://seolit.ru/реферальная-программа.html">${esc(t('ref.terms'))} →</a>`)}
      <div class="kpis">${[['ref.clicks', R.clicks], ['ref.signups', R.invited.length], ['ref.payers', paid.length]].map(([k, v]) => `<div class="card kpi"><span class="lbl">${esc(t(k))}</span><b class="kpi__n num">${I18N.num(v)}</b><span class="kpi__s">${esc(t('ref.period'))}</span></div>`).join('')}
        <div class="card kpi"><span class="lbl">${esc(t('ref.earned'))}</span><b class="kpi__n num">${money(R.available)}</b><button type="button" class="btn btn--sm btn--p" data-withdraw${R.available ? '' : ' disabled'}>${esc(t('ref.withdraw'))}</button></div></div>
      <section class="card card--pad refl"><div class="field"><label for="refLink">${esc(t('ref.link'))}</label><div class="conn__row"><input class="input" id="refLink" readonly value="${esc(link)}"><button type="button" class="btn btn--p" data-copy="link">${ico('check', 'ico--sm')}${esc(t('ref.copy'))}</button></div></div>
        <div class="field"><label for="refCode">${esc(t('ref.code'))}</label><div class="conn__row"><input class="input num" id="refCode" readonly value="${R.code}"><button type="button" class="btn" data-copy="code">${esc(t('ref.copy'))}</button></div></div>
        <div class="field"><label for="refText">${esc(t('ref.banner'))}</label><textarea class="input" id="refText" rows="3" readonly>${esc(t('ref.bannerText', { link }))}</textarea>
          <div class="refl__share"><button type="button" class="btn btn--sm" data-copy="text">${esc(t('ref.copy'))}</button>
          <a class="btn btn--sm" href="https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(t('ref.bannerText', { link: '' }))}">${net('tg', 22)} Telegram</a>
          <a class="btn btn--sm" href="https://vk.com/share.php?url=${encodeURIComponent(link)}">${net('vk', 22)} ${esc(netName('vk'))}</a></div></div></section>
      <section class="card"><header class="post__h"><h2>${esc(t('ref.list'))}</h2></header>
        <table class="tbl"><thead><tr><th>${esc(t('ref.when'))}</th><th>${esc(t('ref.who'))}</th><th>${esc(t('ref.status'))}</th><th class="num">${esc(t('ref.bonus'))}</th></tr></thead>
        <tbody>${R.invited.map((x) => `<tr><td class="num">${esc(I18N.date(x.at))}</td><td>${esc(x.who)}</td><td><span class="pill pill--${x.st === 'paid' ? 'ok' : 'off'}">${esc(t(x.st === 'paid' ? 'ref.stPaid' : 'ref.stReg'))}</span></td><td class="num">${x.bonus ? '+' + money(x.bonus) : '—'}</td></tr>`).join('')}</tbody></table></section>`;
      if (focus) $(focus, main)?.focus();
    }
    main.onclick = (e) => {
      const c = e.target.closest('[data-copy]');
      if (c) { const k = c.dataset.copy; copy(k === 'link' ? link : k === 'code' ? R.code : t('ref.bannerText', { link }), 'ref.copied'); return; }
      if (e.target.closest('[data-withdraw]')) {
        if (!R.available) { toast(t('ref.nothing')); return; }
        const sum = R.available; db().balance += sum; R.available = 0;
        db().payments.unshift({ at: Date.now(), sum, what: { ru: 'Реферальные начисления', en: 'Referral earnings', kk: 'Рефералдық есептеулер' } });
        save(); setBalance(); render('#refLink'); toast(t('ref.withdrawn', { sum: money(sum) }));
      }
    };
    render();
  };

  /* ---------- API ---------- */
  const shown = new Set();
  SECTIONS.api = (main) => {
    const mask = (k) => k.slice(0, 8) + '•'.repeat(12) + k.slice(-4);
    function render(focus) {
      const keys = db().apiKeys;
      main.innerHTML = `${head('api.title', 'api.sub', `<button type="button" class="btn btn--p" data-new>${ico('plus', 'ico--sm')}${esc(t('api.new'))}</button>`)}
      <p class="note-box">${ico('alert', 'ico--sm')}<span>${esc(t('api.safe'))}</span></p>
      <section class="card"><header class="post__h"><h2>${esc(t('api.keys'))} · <span class="num">${keys.length}</span></h2><a href="https://seolit.ru/">${esc(t('api.docs'))} →</a></header>
        ${keys.length ? `<ul class="keys">${keys.map((k) => `<li><div class="keys__txt"><b>${esc(tx(k.name))}</b><code class="num">${esc(shown.has(k.id) ? k.key : mask(k.key))}</code>
            <span class="muted">${esc(t('api.created', { date: I18N.date(k.at) }))} · ${esc(k.used ? t('api.used', { date: `${I18N.date(k.used)} ${I18N.date(k.used, 'time')}` }) : t('api.never'))}</span></div>
          <button type="button" class="ibtn ibtn--sm" data-show="${k.id}" aria-pressed="${shown.has(k.id)}" aria-label="${esc(t(shown.has(k.id) ? 'api.hide' : 'api.show'))}">${ico(shown.has(k.id) ? 'close' : 'search')}</button>
          <button type="button" class="ibtn ibtn--sm" data-copy="${k.id}" aria-label="${esc(t('api.copy'))}">${ico('check')}</button>
          <button type="button" class="btn btn--sm btn--danger" data-revoke="${k.id}">${esc(t('api.revoke'))}</button></li>`).join('')}</ul>`
        : `<div class="empty empty--in"><span class="empty__ico">${ico('api')}</span><h3>${esc(t('api.empty'))}</h3><p>${esc(t('api.emptyHint'))}</p></div>`}</section>`;
      if (focus) $(focus, main)?.focus();
    }
    main.onclick = async (e) => {
      const b = e.target.closest('[data-new],[data-show],[data-copy],[data-revoke]');
      if (!b) return;
      if (b.dataset.show) { const id = b.dataset.show; shown.has(id) ? shown.delete(id) : shown.add(id); render(`[data-show="${id}"]`); }
      else if (b.dataset.copy) copy(db().apiKeys.find((k) => k.id === b.dataset.copy).key, 'api.copied');
      else if (b.dataset.revoke) {
        const k = db().apiKeys.find((x) => x.id === b.dataset.revoke), name = tx(k.name);
        if (!(await confirmBox({ titleKey: 'api.revokeTitle', text: t('api.revokeText', { name }), okKey: 'api.revoke' }))) return;
        db().apiKeys = db().apiKeys.filter((x) => x !== k); save(); render('[data-new]'); toast(t('api.revoked', { name }));
      } else {
        const d = dialog({ titleKey: 'api.new', html: `<form class="modal__body" novalidate><div class="field"><label for="kName">${esc(t('api.name'))}</label><input class="input" id="kName" placeholder="${esc(t('api.namePh'))}" aria-describedby="kErr"><span class="field__err" id="kErr" hidden>${esc(t('api.nameErr'))}</span></div>
          <div class="modal__foot modal__foot--in"><button type="button" class="btn" data-close>${esc(t('c.cancel'))}</button><button type="submit" class="btn btn--p">${esc(t('api.new'))}</button></div></form>` });
        $('form', d.box).onsubmit = (ev) => {
          ev.preventDefault();
          const v = $('#kName', d.box).value.trim();
          $('#kErr', d.box).hidden = !!v; if (!v) { $('#kName', d.box).focus(); return; }
          const rnd = Array.from(crypto.getRandomValues(new Uint8Array(10)), (x) => x.toString(16).padStart(2, '0')).join('');
          const k = { id: DEMO.uid('k'), name: L3(v), key: 'sl_live_' + rnd, at: Date.now(), used: 0 };
          db().apiKeys.push(k); shown.add(k.id); save(); d.close(); render(`[data-copy="${k.id}"]`); toast(t('api.made', { name: v }));
        };
      }
    };
    render();
  };

  /* ---------- RSS-тест ---------- */
  const RT = { url: 'https://example.ru/news/rss', xml: '', res: null, busy: false };
  SECTIONS.rss = (main) => {
    // Пример ответа сервера для любой ссылки (в демо ленту читать некому)
    const demoItems = () => [
      { title: tx(DEMO.sample.title), date: DEMO.at(0, 9, 10), img: true, link: true, len: tx(DEMO.sample.text).length },
      { title: tx(db().posts[1].title), date: DEMO.at(-1, 18, 0), img: true, link: true, len: 412 },
      { title: tx(db().posts[4].title), date: DEMO.at(-2, 12, 30), img: false, link: true, len: 1280 },
      { title: tx(db().posts[8].title), date: 0, img: true, link: true, len: 640 },
    ];
    function parse(xml) {
      const doc = new DOMParser().parseFromString(xml, 'application/xml');
      const err = doc.querySelector('parsererror');
      if (err) throw new Error(err.textContent.split('\n')[0].slice(0, 120));
      const atom = doc.documentElement.localName === 'feed';
      const items = [...doc.querySelectorAll(atom ? 'entry' : 'item')];
      if (!items.length && !['rss', 'feed', 'RDF'].includes(doc.documentElement.localName)) throw new Error(doc.documentElement.localName);
      const txt = (el, s) => el.querySelector(s)?.textContent.trim() || '';
      return { format: atom ? 'Atom' : 'RSS ' + (doc.documentElement.getAttribute('version') || '2.0'), items: items.map((it) => {
        const body = txt(it, 'description') || txt(it, 'content') || txt(it, 'summary');
        const d = Date.parse(txt(it, atom ? 'updated' : 'pubDate') || txt(it, 'published'));
        return { title: txt(it, 'title') || '—', date: isNaN(d) ? 0 : d, img: !!(it.querySelector('enclosure[type^="image"], content[url], thumbnail') || /<img/i.test(body)), link: !!(txt(it, 'link') || it.querySelector('link[href]')), len: body.replace(/<[^>]+>/g, '').length };
      }) };
    }
    function render(focus) {
      const r = RT.res;
      const checks = r && !r.error ? [['rss.cOk', true], ['rss.cFormat', true, { f: r.format }], ['rss.cDates', r.items.every((x) => x.date)], ['rss.cImages', r.items.every((x) => x.img)], ['rss.cLinks', r.items.every((x) => x.link)], ['rss.cText', r.items.every((x) => x.len > 0)]] : [];
      const projs = db().projects.filter((p) => p.own);
      main.innerHTML = `${head('rss.title', 'rss.sub')}
      <section class="card card--pad rsst"><form class="rsst__form" data-f="url" novalidate><div class="field"><label for="rUrl">${esc(t('rss.url'))}</label><input class="input" id="rUrl" type="url" inputmode="url" value="${esc(RT.url)}" aria-describedby="rUrlErr"><span class="field__err" id="rUrlErr" hidden>${esc(t('rss.urlErr'))}</span></div>
          <button type="submit" class="btn btn--p"${RT.busy ? ' disabled' : ''}>${RT.busy ? `<i class="mini__spin"></i>${esc(t('rss.checking'))}` : esc(t('rss.check'))}</button></form>
        <details class="adv"${RT.xml ? ' open' : ''}><summary><b>${esc(t('rss.or'))}</b>${ico('down', 'ico--sm')}</summary><form class="adv__body" data-f="xml" novalidate>
          <label class="vh" for="rXml">XML</label><textarea class="input rsst__xml" id="rXml" rows="6" spellcheck="false" placeholder="&lt;rss version=&quot;2.0&quot;&gt;…">${esc(RT.xml)}</textarea><button type="submit" class="btn">${esc(t('rss.parse'))}</button></form></details></section>
      ${r ? `<section class="card card--pad rsst__res" aria-live="polite"><h2>${esc(t('rss.result'))}</h2>
        ${r.error ? `<p class="field__err">${esc(t('rss.xmlErr', { err: r.error }))}</p>` : `${r.demo ? `<p class="muted">${esc(t('rss.demoNote'))}</p>` : ''}
          <ul class="rsst__checks">${checks.map(([k, ok, v]) => `<li class="${ok ? 'is-ok' : 'is-warn'}">${ico(ok ? 'check' : 'alert', 'ico--sm')}${esc(t(k, v))}</li>`).join('')}</ul>
          <h3>${esc(plural(r.items.length, 'rss.items'))}</h3>
          <ul class="rsst__items">${r.items.map((x) => `<li><b>${esc(x.title)}</b><span class="muted">${esc(x.date ? `${I18N.date(x.date)} ${I18N.date(x.date, 'time')}` : t('rss.noDate'))} · ${esc(t(x.img ? 'rss.img' : 'rss.noImg'))} · ${esc(plural(x.len, 'rss.chars'))}</span></li>`).join('')}</ul>
          ${r.url ? `<div class="rsst__add"><div class="field"><label for="rProj">${esc(t('rss.connectTo'))}</label>${sel('rProj', projs.map((p) => [p.id, tx(p.name)]), projs[0]?.id)}</div><button type="button" class="btn btn--p" data-connect>${ico('plus', 'ico--sm')}${esc(t('rss.connect'))}</button></div>` : ''}`}</section>` : ''}`;
      if (focus) $(focus, main)?.focus();
    }
    main.onsubmit = (e) => {
      e.preventDefault();
      if (e.target.dataset.f === 'xml') {
        RT.xml = $('#rXml', main).value;
        try { RT.res = { ...parse(RT.xml), demo: false }; } catch (er) { RT.res = { error: er.message }; }
        render('#rXml'); return;
      }
      const u = $('#rUrl', main).value.trim(), ok = /^https?:\/\/\S+\.\S+/.test(u);
      $('#rUrlErr', main).hidden = ok; $('#rUrl', main).setAttribute('aria-invalid', String(!ok));
      if (!ok) { $('#rUrl', main).focus(); return; }
      RT.url = u; RT.busy = true; render();
      setTimeout(() => { RT.busy = false; RT.res = { format: /atom/i.test(u) ? 'Atom' : 'RSS 2.0', items: demoItems(), demo: true, url: u }; render('#rUrl'); }, 900);
    };
    main.onclick = (e) => {
      if (!e.target.closest('[data-connect]')) return;
      const p = DEMO.project($('#rProj', main).value), name = RT.res.url.replace(/^https?:\/\//, '');
      db().sources.push({ id: DEMO.uid('s'), p: p.id, net: 'rss', st: 'on', name: L3(name), meta: { ru: 'Только что', en: 'Just now', kk: 'Жаңа ғана' } });
      save(); toast(t('rss.connected', { name: tx(p.name) }));
    };
    render();
  };

  /* ---------- Расписания: сетка 7 × 24, закрашивается мышью и пальцем ---------- */
  const SC = { cur: null, draft: null };
  SECTIONS.schedules = (main) => {
    const list = () => db().schedules;
    const usedBy = (id) => db().receivers.filter((r) => r.settings && r.settings.schedule === id);
    const hoursOf = (g) => g.reduce((a, row) => a + row.reduce((b, v) => b + v, 0), 0);
    const preset = (k) => Array.from({ length: 7 }, (_, d) => Array.from({ length: 24 }, (_, h) => (
      k === 'work' ? d < 5 && h >= 9 && h < 18 : k === 'day' ? h >= 8 && h < 22 : k === 'eve' ? h >= 18 && h < 23 : k === 'all' ? 1 : 0) ? 1 : 0));
    const mini = (g) => `<span class="schmini" aria-hidden="true">${g.map((row) => `<span>${row.map((v) => `<i${v ? ' class="on"' : ''}></i>`).join('')}</span>`).join('')}</span>`;
    function pick(id) {
      const s = list().find((x) => x.id === id) || list()[0];
      SC.cur = s ? s.id : null;
      SC.draft = s ? JSON.parse(JSON.stringify(s)) : null;
    }
    if (!SC.draft || !list().some((x) => x.id === SC.cur)) pick(SC.cur);
    function render(focus) {
      const D = SC.draft;
      main.innerHTML = `${head('sch.title', 'sch.sub', `<button type="button" class="btn btn--p" data-act="new">${ico('plus', 'ico--sm')}${esc(t('sch.new'))}</button>`)}
      <div class="split">
        <nav class="card split__list" aria-label="${esc(t('sch.list'))}"><ul>${list().map((s) => `<li><button type="button" class="split__item" data-pick="${s.id}" aria-current="${s.id === SC.cur}">
          ${mini(s.grid)}<span><b>${esc(tx(s.name))}</b><span class="muted">${esc(plural(hoursOf(s.grid), 'sch.hours'))} · ${esc(usedBy(s.id).length ? plural(usedBy(s.id).length, 'sch.used') : t('sch.unused'))}</span></span></button></li>`).join('')}</ul></nav>
        ${D ? `<form class="card card--pad split__edit" novalidate>
          <div class="field"><label for="scName">${esc(t('sch.name'))}</label><input class="input" id="scName" value="${esc(tx(D.name))}"></div>
          <div class="field"><span class="field__lbl" id="scGridL">${esc(t('sch.grid'))} · <span class="muted" id="scHours">${esc(plural(hoursOf(D.grid), 'sch.hours'))}</span></span>
            <p class="field__hint">${esc(t('sch.gridHint'))}</p>
            <div class="chips"><span class="muted">${esc(t('sch.presets'))}:</span>${['work', 'day', 'eve', 'all', 'clear'].map((k) => `<button type="button" class="chipf" data-preset="${k}">${esc(t('sch.p' + k[0].toUpperCase() + k.slice(1)))}</button>`).join('')}</div>
            <div class="schgrid" role="group" aria-labelledby="scGridL">
              <span></span>${Array.from({ length: 24 }, (_, h) => `<span class="schgrid__h">${h % 3 === 0 ? h : ''}</span>`).join('')}
              ${D.grid.map((row, d) => `<span class="schgrid__d">${esc(t('sch.d' + d))}</span>${row.map((v, h) => `<button type="button" class="schgrid__c" data-d="${d}" data-h="${h}" aria-pressed="${!!v}" aria-label="${esc(t('sch.cell', { day: t('sch.d' + d), h: pad(h), h2: pad(h + 1) }))}"></button>`).join('')}`).join('')}
            </div><p class="field__err" id="scEmpty"${hoursOf(D.grid) ? ' hidden' : ''}>${esc(t('sch.empty'))}</p></div>
          <div class="two"><div class="field"><label for="scLimit">${esc(t('sch.limit'))}</label><input class="input" id="scLimit" type="number" min="0" max="200" inputmode="numeric" value="${D.limit}"><span class="field__hint">${esc(t('acc.limitHint'))}</span></div>
            <div class="field"><label for="scInt">${esc(t('sch.interval'))}</label><input class="input" id="scInt" type="number" min="0" max="1440" step="5" inputmode="numeric" value="${D.interval}"></div></div>
          <div class="split__foot"><button type="button" class="btn btn--danger" data-act="del">${esc(t('sch.del'))}</button><button type="button" class="btn" data-act="assign">${esc(t('sch.assign'))}</button><button type="submit" class="btn btn--p">${esc(t('sch.save'))}</button></div>
        </form>` : ''}
      </div>`;
      if (focus) $(focus, main)?.focus();
    }
    // Рисование: нажали на клетку — запомнили, ставим или стираем; ведём — красим тем же
    let paint = null;
    const setCell = (el, v) => { const d = +el.dataset.d, h = +el.dataset.h; if (SC.draft.grid[d][h] === v) return; SC.draft.grid[d][h] = v; el.setAttribute('aria-pressed', String(!!v)); };
    const refreshHours = () => { const n = hoursOf(SC.draft.grid); $('#scHours', main).textContent = plural(n, 'sch.hours'); $('#scEmpty', main).hidden = !!n; };
    main.onpointerdown = (e) => {
      const c = e.target.closest('.schgrid__c'); if (!c) return;
      e.preventDefault(); paint = SC.draft.grid[+c.dataset.d][+c.dataset.h] ? 0 : 1; setCell(c, paint); refreshHours();
    };
    main.onpointermove = (e) => {
      if (paint === null) return;
      const c = document.elementFromPoint(e.clientX, e.clientY)?.closest('.schgrid__c');
      if (c && main.contains(c)) { setCell(c, paint); refreshHours(); }
    };
    const stop = () => { paint = null; };
    document.addEventListener('pointerup', stop); document.addEventListener('pointercancel', stop);
    main.onclick = async (e) => {
      const c = e.target.closest('.schgrid__c');
      if (c && e.detail === 0) { setCell(c, SC.draft.grid[+c.dataset.d][+c.dataset.h] ? 0 : 1); refreshHours(); return; } // с клавиатуры
      const p = e.target.closest('[data-pick]'); if (p) { pick(p.dataset.pick); render(`[data-pick="${SC.cur}"]`); return; }
      const pr = e.target.closest('[data-preset]'); if (pr) { readForm(); SC.draft.grid = preset(pr.dataset.preset); render(`[data-preset="${pr.dataset.preset}"]`); return; }
      const a = e.target.closest('[data-act]'); if (!a) return;
      if (a.dataset.act === 'new') {
        const s = { id: DEMO.uid('sc'), name: L3(t('sch.newName')), grid: preset('work'), limit: 0, interval: 60 };
        list().push(s); save(); pick(s.id); render('#scName');
      } else if (a.dataset.act === 'del') {
        const name = tx(SC.draft.name);
        if (!(await confirmBox({ titleKey: 'sch.delTitle', text: t('sch.delText', { name }) }))) return;
        usedBy(SC.cur).forEach((r) => { r.settings.schedule = ''; });
        db().schedules = list().filter((x) => x.id !== SC.cur); save(); pick(null); render('[data-act="new"]'); toast(t('sch.deleted', { name }));
      } else if (a.dataset.act === 'assign') assign();
    };
    function readForm() {
      const D = SC.draft; if (!D) return;
      const nm = $('#scName', main).value.trim(); if (nm) D.name = L3(nm);
      D.limit = Math.max(0, +$('#scLimit', main).value || 0); D.interval = Math.max(0, +$('#scInt', main).value || 0);
    }
    main.onsubmit = (e) => {
      e.preventDefault(); readForm();
      const i = list().findIndex((x) => x.id === SC.cur); list()[i] = JSON.parse(JSON.stringify(SC.draft)); save();
      render('[type=submit]'); toast(t('sch.saved', { name: tx(SC.draft.name) }));
    };
    function assign() {
      readForm();
      const projs = db().projects;
      const pid = { v: projs[0].id };
      const d = dialog({ title: t('sch.assignTitle', { name: tx(SC.draft.name) }), html: `<form class="modal__body" novalidate>
        <div class="field"><label for="asP">${esc(t('post.project'))}</label>${sel('asP', projs.map((p) => [p.id, tx(p.name)]), pid.v)}</div><div class="assign"></div>
        <div class="modal__foot modal__foot--in"><button type="button" class="btn" data-close>${esc(t('c.cancel'))}</button><button type="submit" class="btn btn--p">${esc(t('sch.assign'))}</button></div></form>` });
      const box = $('.assign', d.box);
      const fill = () => { box.innerHTML = db().receivers.filter((r) => r.p === pid.v).map((r) => `<label class="check">${net(r.net, 22)}<input type="checkbox" value="${r.id}"${r.settings?.schedule === SC.cur ? ' checked' : ''}><span>${esc(tx(r.name))}</span></label>`).join(''); };
      fill();
      $('#asP', d.box).onchange = (e) => { pid.v = e.target.value; fill(); };
      $('form', d.box).onsubmit = (e) => {
        e.preventDefault();
        let n = 0;
        $$('input[type=checkbox]', box).forEach((c) => { const r = db().receivers.find((x) => x.id === c.value); r.settings = r.settings || {}; if (c.checked) { r.settings.schedule = SC.cur; n++; } else if (r.settings.schedule === SC.cur) r.settings.schedule = ''; });
        save(); d.close(); render('[data-act="assign"]'); toast(plural(n, 'sch.assigned'));
      };
    }
    render();
  };

  /* ---------- Шаблоны: список и редактор с переменными ---------- */
  const TP = { cur: null, draft: null };
  const VARS = ['TITLE', 'TEXT', 'URL', 'TAGS'];
  const TPL_NETS = ['vk', 'tg', 'ok', 'mm', 'x', 'pi', 'in', 'tu', 'lj', 'tt', 'bl', 're', 'max', 'fb', 'ig'];
  SECTIONS.templates = (main) => {
    const list = () => db().templates;
    function pick(id) { TP.caret = TP.caretEnd = null; const s = list().find((x) => x.id === id) || list()[0]; TP.cur = s ? s.id : null; TP.draft = s ? JSON.parse(JSON.stringify(s)) : null; }
    if (!TP.draft || !list().some((x) => x.id === TP.cur)) pick(TP.cur);
    // Обрезка по словам с «…»
    const cut = (s, max) => { if (!max || s.length <= max) return s; const c = s.slice(0, max - 1); return c.slice(0, c.lastIndexOf(' ') > 0 ? c.lastIndexOf(' ') : c.length) + '…'; };
    const out = () => cut(fillTpl(TP.draft.body, DEMO.sample, I18N.lang), +TP.draft.max || 0);
    const dirty = () => JSON.stringify(TP.draft) !== JSON.stringify(list().find((x) => x.id === TP.cur));
    function live() {
      const o = out();
      $('#tpOut', main).textContent = o;
      $('#tpLen', main).textContent = plural(o.length, 'tpl.len');
      $('#tpNoVars', main).hidden = VARS.some((v) => TP.draft.body.includes(`#${v}#`));
      $('#tpDirty', main).hidden = !dirty();
    }
    function render(focus) {
      const D = TP.draft;
      main.innerHTML = `${head('tpl.title', 'tpl.sub', `<button type="button" class="btn btn--p" data-act="new">${ico('plus', 'ico--sm')}${esc(t('tpl.new'))}</button>`)}
      <div class="split">
        <nav class="card split__list" aria-label="${esc(t('tpl.list'))}"><ul>${list().map((s) => `<li><button type="button" class="split__item" data-pick="${s.id}" aria-current="${s.id === TP.cur}">
          <span class="split__ico">${ico('templates')}</span><span><b>${esc(tx(s.name))}</b><span class="muted">${s.nets.length ? s.nets.map((n) => esc(netName(n))).join(', ') : esc(t('tpl.allNets'))}${s.max ? ' · ≤ ' + I18N.num(s.max) : ''}</span></span></button></li>`).join('')}</ul></nav>
        ${D ? `<form class="card card--pad split__edit" novalidate>
          <div class="field"><label for="tpName">${esc(t('tpl.name'))} <span class="pill pill--warn" id="tpDirty" hidden>${esc(t('tpl.unsaved'))}</span></label><input class="input" id="tpName" value="${esc(tx(D.name))}"></div>
          <div class="field"><label for="tpBody">${esc(t('tpl.body'))}</label>
            <div class="chips" role="group" aria-label="${esc(t('tpl.vars'))}">${VARS.map((v) => `<button type="button" class="chipf tplvar" data-var="${v}"><b>#${v}#</b> ${esc(t('tpl.v' + v))}</button>`).join('')}</div>
            <textarea class="input tplbody" id="tpBody" rows="7" spellcheck="false">${esc(D.body)}</textarea>
            <p class="field__err" id="tpNoVars" hidden>${esc(t('tpl.noVars'))}</p></div>
          <fieldset class="field tplnets"><legend class="field__lbl">${esc(t('tpl.nets'))}</legend><div class="chips">
            <button type="button" class="chipf" data-net="" aria-pressed="${!D.nets.length}">${esc(t('tpl.allNets'))}</button>
            ${TPL_NETS.map((n) => `<button type="button" class="chipf" data-net="${n}" aria-pressed="${D.nets.includes(n)}">${net(n, 22)}${esc(netName(n))}</button>`).join('')}</div></fieldset>
          <div class="field"><label for="tpMax">${esc(t('tpl.max'))}</label><input class="input tplmax" id="tpMax" type="number" min="0" max="20000" inputmode="numeric" value="${D.max}"><span class="field__hint">${esc(t('tpl.maxHint'))}</span></div>
          <div class="field"><span class="field__lbl">${esc(t('tpl.preview'))} · <span class="muted" id="tpLen"></span></span><pre class="tplpv" id="tpOut" aria-live="polite"></pre></div>
          <div class="split__foot"><button type="button" class="btn btn--danger" data-act="del">${esc(t('tpl.del'))}</button><button type="button" class="btn btn--q" data-act="reset">${esc(t('tpl.reset'))}</button>
            <button type="button" class="btn" data-act="dup">${esc(t('tpl.dup'))}</button><button type="submit" class="btn btn--p">${esc(t('tpl.save'))}</button></div></form>` : ''}
      </div>`;
      if (D) live();
      if (focus) $(focus, main)?.focus();
    }
    // Курсор в тексте шаблона: туда вставляются переменные (без фокуса — в конец)
    const caret = (e) => { if (e.target.id === 'tpBody') { TP.caret = e.target.selectionStart; TP.caretEnd = e.target.selectionEnd; } };
    main.onkeyup = caret; main.onmouseup = caret;
    main.oninput = (e) => {
      if (!TP.draft) return;
      if (e.target.id === 'tpBody') TP.draft.body = e.target.value;
      else if (e.target.id === 'tpName') TP.draft.name = L3(e.target.value);
      else if (e.target.id === 'tpMax') TP.draft.max = Math.max(0, +e.target.value || 0);
      else return;
      live();
    };
    main.onclick = async (e) => {
      const v = e.target.closest('[data-var]');
      if (v) { // вставка переменной в позицию курсора
        const ta = $('#tpBody', main), tok = `#${v.dataset.var}#`, a = TP.caret ?? ta.value.length, b = TP.caretEnd ?? a;
        ta.setRangeText(tok, a, b, 'end'); TP.draft.body = ta.value; TP.caret = TP.caretEnd = ta.selectionStart; ta.focus(); live(); return;
      }
      const n = e.target.closest('[data-net]');
      if (n) { const k = n.dataset.net; TP.draft.nets = !k ? [] : TP.draft.nets.includes(k) ? TP.draft.nets.filter((x) => x !== k) : [...TP.draft.nets, k]; render(`[data-net="${k}"]`); return; }
      const p = e.target.closest('[data-pick]'); if (p) { pick(p.dataset.pick); render(`[data-pick="${TP.cur}"]`); return; }
      const a = e.target.closest('[data-act]'); if (!a) return;
      const act = a.dataset.act;
      if (act === 'new' || act === 'dup') {
        const s = act === 'new' ? { id: DEMO.uid('t'), name: L3(t('tpl.newName')), body: '#TITLE#\n\n#TEXT#\n#URL#', nets: [], max: 0 }
          : { ...JSON.parse(JSON.stringify(TP.draft)), id: DEMO.uid('t'), name: L3(t('tpl.dupName', { name: tx(TP.draft.name) })) };
        list().push(s); save(); pick(s.id); render('#tpName');
      } else if (act === 'reset') { pick(TP.cur); render('#tpBody'); }
      else if (act === 'del') {
        const name = tx(TP.draft.name);
        if (!(await confirmBox({ titleKey: 'tpl.delTitle', text: t('tpl.delText', { name }) }))) return;
        db().receivers.forEach((r) => { if (r.settings?.tpl === TP.cur) r.settings.tpl = ''; });
        db().templates = list().filter((x) => x.id !== TP.cur); save(); pick(null); render('[data-act="new"]'); toast(t('tpl.deleted', { name }));
      }
    };
    main.onsubmit = (e) => {
      e.preventDefault();
      const i = list().findIndex((x) => x.id === TP.cur); list()[i] = JSON.parse(JSON.stringify(TP.draft)); save();
      render('[type=submit]'); toast(t('tpl.saved', { name: tx(TP.draft.name) }));
    };
    render();
  };

  /* ---------- Общее для редакторов картинок ---------- */
  const gradStops = (i) => (APP.THUMBS[i % APP.THUMBS.length].match(/#[0-9A-Fa-f]{6}/g) || ['#2563EB', '#38BDF8']);
  function paintBg(ctx, w, h, i, img) {
    if (img) { const r = Math.max(w / img.width, h / img.height); ctx.drawImage(img, (w - img.width * r) / 2, (h - img.height * r) / 2, img.width * r, img.height * r); return; }
    const [a, b] = gradStops(i), g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, a); g.addColorStop(1, b);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }
  // Знак SEOlit (узел «один → много») на canvas
  function paintLogo(ctx, cx, cy, r, color) {
    ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = r * 0.12; ctx.lineCap = 'round';
    const pts = [[0, -0.55], [0.48, 0.28], [-0.48, 0.28]];
    pts.forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + x * r, cy + y * r); ctx.stroke(); ctx.beginPath(); ctx.arc(cx + x * r, cy + y * r, r * 0.16, 0, Math.PI * 2); ctx.fill(); });
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  const download = (canvas, name, okKey) => canvas.toBlob((b) => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); toast(t(okKey)); });
  const loadImg = (url) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = url; });
  // Список + редактор: общий каркас для водяных знаков и автокартинок
  function listEditor(main, cfg) {
    const st = cfg.state;
    const list = () => db()[cfg.key];
    const pick = (id) => { const s = list().find((x) => x.id === id) || list()[0]; st.cur = s ? s.id : null; st.draft = s ? JSON.parse(JSON.stringify(s)) : null; };
    if (!st.draft || !list().some((x) => x.id === st.cur)) pick(st.cur);
    function render(focus) {
      main.innerHTML = `${head(cfg.p + '.title', cfg.p + '.sub', `<button type="button" class="btn btn--p" data-le="new">${ico('plus', 'ico--sm')}${esc(t(cfg.p + '.new'))}</button>`)}
      <div class="split"><nav class="card split__list" aria-label="${esc(t(cfg.p + '.list'))}"><ul>${list().map((s) => `<li><button type="button" class="split__item" data-le-pick="${s.id}" aria-current="${s.id === st.cur}">
        <span class="split__ico" style="background:${APP.THUMBS[(s.bg ?? 0) % 6]}">${ico(cfg.icon)}</span><span><b>${esc(tx(s.name))}</b><span class="muted">${esc(cfg.meta(s))}</span></span></button></li>`).join('')}</ul></nav>
        ${st.draft ? `<form class="card card--pad split__edit ${cfg.p}-ed" novalidate><div class="field"><label for="leName">${esc(t(cfg.p + '.name'))}</label><input class="input" id="leName" value="${esc(tx(st.draft.name))}"></div>
          ${cfg.body(st.draft)}
          <div class="split__foot"><button type="button" class="btn btn--danger" data-le="del">${esc(t(cfg.p + '.del'))}</button>${cfg.extraFoot || ''}<button type="submit" class="btn btn--p">${esc(t(cfg.p + '.save'))}</button></div></form>` : ''}</div>`;
      if (st.draft) cfg.after(st.draft, main);
      if (focus) $(focus, main)?.focus();
    }
    main.addEventListener('click', async (e) => {
      const p = e.target.closest('[data-le-pick]'); if (p) { pick(p.dataset.lePick); render(`[data-le-pick="${st.cur}"]`); return; }
      const b = e.target.closest('[data-le]'); if (!b) return;
      if (b.dataset.le === 'new') { const s = { id: DEMO.uid(cfg.p), ...cfg.blank(), name: L3(t(cfg.p + '.newName')) }; list().push(s); save(); pick(s.id); render('#leName'); }
      else if (b.dataset.le === 'del') {
        const name = tx(st.draft.name);
        if (!(await confirmBox({ titleKey: cfg.p + '.delTitle', text: t(cfg.p + '.delText', { name }) }))) return;
        db()[cfg.key] = list().filter((x) => x.id !== st.cur); cfg.onDelete?.(st.cur); save(); pick(null); render('[data-le="new"]'); toast(t(cfg.p + '.deleted', { name }));
      }
    });
    main.addEventListener('input', (e) => { if (e.target.id === 'leName' && st.draft) st.draft.name = L3(e.target.value); });
    main.addEventListener('submit', (e) => {
      e.preventDefault();
      const i = list().findIndex((x) => x.id === st.cur); const { _img, ...clean } = st.draft; list()[i] = JSON.parse(JSON.stringify(clean)); save();
      render('[type=submit]'); toast(t(cfg.p + '.saved', { name: tx(st.draft.name) }));
    });
    render();
    return render;
  }

  /* ---------- Водяные знаки: знак перетаскивается по примеру ---------- */
  const WM = { cur: null, draft: null, sample: 0, sampleUrl: '' };
  const WM_COLORS = [['#FFFFFF', 'wm.white'], ['#0D1526', 'wm.black'], ['#2563EB', 'wm.blue']];
  const POS9 = [['tl', 0.08, 0.1], ['tc', 0.5, 0.1], ['tr', 0.92, 0.1], ['ml', 0.08, 0.5], ['mc', 0.5, 0.5], ['mr', 0.92, 0.5], ['bl', 0.08, 0.9], ['bc', 0.5, 0.9], ['br', 0.92, 0.9]];
  SECTIONS.watermarks = (main) => {
    main.replaceWith(main = main.cloneNode(false)); // сбросить слушатели прошлой отрисовки (смена языка)
    const markHtml = (D) => D.kind === 'logo' ? `<svg viewBox="0 0 48 48" aria-hidden="true"><use href="#logo"></use></svg><span>SEOlit</span>`
      : D.kind === 'image' && D._img ? `<img src="${D._img}" alt="">` : `<span>${esc(D.text || 'example.ru')}</span>`;
    function place(D) {
      const m = $('.wmmark', main); if (!m) return;
      m.style.left = D.x * 100 + '%'; m.style.top = D.y * 100 + '%'; m.style.opacity = D.opacity; m.style.color = D.color; m.style.setProperty('--s', D.size);
      m.setAttribute('aria-label', t('wm.mark', { x: Math.round(D.x * 100), y: Math.round(D.y * 100) }));
    }
    const render = listEditor(main, {
      key: 'watermarks', p: 'wm', icon: 'watermarks', state: WM, blank: () => ({ kind: 'text', text: 'example.ru', x: 0.92, y: 0.9, size: 0.06, opacity: 0.8, color: '#FFFFFF' }),
      meta: (s) => `${t({ text: 'wm.kText', logo: 'wm.kLogo', image: 'wm.kImage' }[s.kind])} · ${Math.round(s.opacity * 100)}%`,
      onDelete: (id) => db().receivers.forEach((r) => { if (r.settings?.wm === id) r.settings.wm = ''; }),
      extraFoot: `<button type="button" class="btn" data-wm="download">${ico('down', 'ico--sm')}${esc(t('wm.download'))}</button>`,
      body: (D) => `<div class="wmed"><div class="wmstage" style="${WM.sampleUrl ? `background-image:url(${WM.sampleUrl})` : `background:${APP.THUMBS[WM.sample]}`}">
            <button type="button" class="wmmark wmmark--${D.kind}">${markHtml(D)}</button></div>
          <div class="wmed__side">
            <fieldset class="field"><legend class="field__lbl">${esc(t('wm.kind'))}</legend><div class="seg">${['text', 'logo', 'image'].map((k) => `<button type="button" data-kind="${k}" aria-pressed="${D.kind === k}">${esc(t({ text: 'wm.kText', logo: 'wm.kLogo', image: 'wm.kImage' }[k]))}</button>`).join('')}</div></fieldset>
            ${D.kind === 'text' ? `<div class="field"><label for="wmText">${esc(t('wm.text'))}</label><input class="input" id="wmText" value="${esc(D.text)}" maxlength="40"></div>` : ''}
            ${D.kind === 'image' ? `<label class="drop drop--sm"><input type="file" id="wmFile" accept="image/png,image/svg+xml,image/webp" class="vh">${ico('plus')}<span>${esc(t('wm.upload'))}</span></label>` : ''}
            <div class="field"><label for="wmSize">${esc(t('wm.size'))} <span class="num muted" id="wmSizeV">${Math.round(D.size * 100)}%</span></label><input type="range" id="wmSize" min="0.03" max="0.3" step="0.01" value="${D.size}"></div>
            <div class="field"><label for="wmOp">${esc(t('wm.opacity'))} <span class="num muted" id="wmOpV">${Math.round(D.opacity * 100)}%</span></label><input type="range" id="wmOp" min="0.1" max="1" step="0.05" value="${D.opacity}"></div>
            ${D.kind !== 'image' ? `<fieldset class="field"><legend class="field__lbl">${esc(t('wm.color'))}</legend><div class="chips">${WM_COLORS.map(([c, k]) => `<button type="button" class="chipf" data-color="${c}" aria-pressed="${D.color === c}"><i class="swatch" style="background:${c}"></i>${esc(t(k))}</button>`).join('')}</div></fieldset>` : ''}
            <fieldset class="field"><legend class="field__lbl">${esc(t('wm.pos'))}</legend><div class="pos9">${POS9.map(([k, x, y]) => `<button type="button" data-pos="${k}" aria-label="${esc(t('wm.p_' + k))}" aria-pressed="${Math.abs(D.x - x) < 0.02 && Math.abs(D.y - y) < 0.02}"><i></i></button>`).join('')}</div>
              <p class="field__hint">${esc(t('wm.posHint'))}</p></fieldset>
            <fieldset class="field"><legend class="field__lbl">${esc(t('wm.sample'))}</legend><div class="chips">${[0, 1, 2, 3, 5].map((i) => `<button type="button" class="swatchbtn" data-sample="${i}" aria-pressed="${!WM.sampleUrl && WM.sample === i}" aria-label="${esc(t('wm.sample'))} ${i + 1}" style="background:${APP.THUMBS[i]}"></button>`).join('')}
              <label class="chipf"><input type="file" id="wmSample" accept="image/*" class="vh">${ico('plus', 'ico--sm')}${esc(t('wm.sampleOwn'))}</label></div></fieldset>
          </div></div>`,
      after: (D) => place(D),
    });
    const D = () => WM.draft;
    let drag = null;
    main.addEventListener('pointerdown', (e) => {
      const m = e.target.closest('.wmmark'); if (!m) return;
      e.preventDefault(); m.setPointerCapture(e.pointerId); drag = $('.wmstage', main).getBoundingClientRect(); m.focus();
    });
    main.addEventListener('pointermove', (e) => {
      if (!drag) return;
      D().x = clampN((e.clientX - drag.left) / drag.width); D().y = clampN((e.clientY - drag.top) / drag.height); place(D());
    });
    const clampN = (v) => Math.min(0.98, Math.max(0.02, Math.round(v * 100) / 100));
    main.addEventListener('pointerup', () => { if (drag) { drag = null; $$('[data-pos]', main).forEach((b) => b.setAttribute('aria-pressed', 'false')); } });
    main.addEventListener('keydown', (e) => {
      if (!e.target.classList?.contains('wmmark')) return;
      const st = e.shiftKey ? 0.1 : 0.01, k = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, -st], ArrowDown: [0, st] }[e.key];
      if (!k) return; e.preventDefault(); D().x = clampN(D().x + k[0]); D().y = clampN(D().y + k[1]); place(D());
    });
    main.addEventListener('click', (e) => {
      const b = e.target.closest('[data-kind],[data-color],[data-pos],[data-sample],[data-wm]'); if (!b || !D()) return;
      if (b.dataset.kind) { D().kind = b.dataset.kind; render(`[data-kind="${D().kind}"]`); }
      else if (b.dataset.color) { D().color = b.dataset.color; render(`[data-color="${D().color}"]`); }
      else if (b.dataset.pos) { const [, x, y] = POS9.find((p) => p[0] === b.dataset.pos); D().x = x; D().y = y; render(`[data-pos="${b.dataset.pos}"]`); }
      else if (b.dataset.sample) { WM.sample = +b.dataset.sample; WM.sampleUrl = ''; render(`[data-sample="${WM.sample}"]`); }
      else if (b.dataset.wm === 'download') exportWm();
    });
    main.addEventListener('input', (e) => {
      if (!D()) return;
      if (e.target.id === 'wmText') { D().text = e.target.value; $('.wmmark span', main).textContent = D().text || 'example.ru'; }
      else if (e.target.id === 'wmSize') { D().size = +e.target.value; $('#wmSizeV', main).textContent = Math.round(D().size * 100) + '%'; place(D()); }
      else if (e.target.id === 'wmOp') { D().opacity = +e.target.value; $('#wmOpV', main).textContent = Math.round(D().opacity * 100) + '%'; place(D()); }
    });
    main.addEventListener('change', (e) => {
      const f = e.target.files?.[0]; if (!f) return;
      if (e.target.id === 'wmFile') { D()._img = URL.createObjectURL(f); render(); }
      else if (e.target.id === 'wmSample') { WM.sampleUrl = URL.createObjectURL(f); render(); }
    });
    async function exportWm() {
      const W = 1200, H = 800, c = document.createElement('canvas'); c.width = W; c.height = H; const ctx = c.getContext('2d'), d = D();
      paintBg(ctx, W, H, WM.sample, WM.sampleUrl ? await loadImg(WM.sampleUrl) : null);
      ctx.globalAlpha = d.opacity; const px = d.x * W, py = d.y * H, fs = d.size * W;
      if (d.kind === 'image' && d._img) { const im = await loadImg(d._img); if (im) { const w = fs * 3, h = w * im.height / im.width; ctx.drawImage(im, px - w / 2, py - h / 2, w, h); } }
      else {
        ctx.fillStyle = d.color; ctx.font = `800 ${fs}px Manrope, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if (d.kind === 'logo') { paintLogo(ctx, px - fs * 2, py, fs * 0.8, d.color); ctx.textAlign = 'left'; ctx.fillText('SEOlit', px - fs * 1.1, py); }
        else ctx.fillText(d.text || 'example.ru', px, py);
      }
      download(c, 'seolit-watermark.png', 'wm.downloaded');
    }
  };

  /* ---------- Автокартинки: картинка из заголовка ---------- */
  const AI = { cur: null, draft: null, text: '', ratio: 'r1' };
  const RATIO = { r1: [1080, 1080], r2: [1280, 720], r3: [720, 1280] };
  SECTIONS.autoimg = (main) => {
    main.replaceWith(main = main.cloneNode(false));
    if (!AI.text) AI.text = tx(DEMO.sample.title);
    function paint() {
      const cv = $('#aiCanvas', main); if (!cv) return;
      const d = AI.draft, [W, H] = RATIO[AI.ratio]; cv.width = W; cv.height = H;
      const ctx = cv.getContext('2d'); paintBg(ctx, W, H, d.bg);
      ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(0, 0, W, H);
      const pad0 = W * 0.08, fs = Math.round(Math.min(W, H) * 0.075 * d.font);
      ctx.fillStyle = '#FFFFFF'; ctx.font = `800 ${fs}px Manrope, sans-serif`; ctx.textBaseline = 'top'; ctx.textAlign = d.align === 'center' ? 'center' : 'left';
      // Перенос по словам
      const words = (AI.text || ' ').split(/\s+/), lines = []; let line = '';
      words.forEach((w) => { const tr = line ? line + ' ' + w : w; if (ctx.measureText(tr).width > W - pad0 * 2 && line) { lines.push(line); line = w; } else line = tr; });
      lines.push(line);
      const lh = fs * 1.2, total = lines.length * lh, y0 = (H - total) / 2, x0 = d.align === 'center' ? W / 2 : pad0;
      lines.forEach((l, i) => ctx.fillText(l, x0, y0 + i * lh));
      if (d.logo) {
        const r = fs * 0.55; paintLogo(ctx, pad0 + r, H - pad0 - r * 0.4, r, '#FFFFFF');
        ctx.font = `700 ${Math.round(fs * 0.5)}px Manrope, sans-serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('example.ru', pad0 + r * 2.4, H - pad0 - r * 0.4);
      }
      cv.setAttribute('aria-label', t('aimg.preview', { text: AI.text }));
    }
    const render = listEditor(main, {
      key: 'autoimg', p: 'aimg', icon: 'autoimg', state: AI, blank: () => ({ bg: 0, align: 'left', font: 1, logo: true }),
      meta: (s) => `${t('aimg.bgN', { n: (s.bg ?? 0) + 1 })} · ${t(s.align === 'center' ? 'aimg.center' : 'aimg.left')}`,
      extraFoot: `<button type="button" class="btn" data-ai="download">${ico('down', 'ico--sm')}${esc(t('aimg.download'))}</button>`,
      body: (d) => `<div class="wmed"><div class="aistage aistage--${AI.ratio}"><canvas id="aiCanvas" role="img"></canvas></div>
        <div class="wmed__side">
          <div class="field"><label for="aiText">${esc(t('aimg.text'))}</label><textarea class="input" id="aiText" rows="2">${esc(AI.text)}</textarea></div>
          <fieldset class="field"><legend class="field__lbl">${esc(t('aimg.ratio'))}</legend><div class="seg">${Object.keys(RATIO).map((k) => `<button type="button" data-ratio="${k}" aria-pressed="${AI.ratio === k}">${esc(t('aimg.' + k))}</button>`).join('')}</div></fieldset>
          <fieldset class="field"><legend class="field__lbl">${esc(t('aimg.bg'))}</legend><div class="chips">${APP.THUMBS.map((g, i) => `<button type="button" class="swatchbtn" data-bg="${i}" aria-pressed="${d.bg === i}" aria-label="${esc(t('aimg.bgN', { n: i + 1 }))}" style="background:${g}"></button>`).join('')}</div></fieldset>
          <fieldset class="field"><legend class="field__lbl">${esc(t('aimg.align'))}</legend><div class="seg">${['left', 'center'].map((k) => `<button type="button" data-align="${k}" aria-pressed="${d.align === k}">${esc(t('aimg.' + k))}</button>`).join('')}</div></fieldset>
          <div class="field"><label for="aiFont">${esc(t('aimg.font'))} <span class="num muted" id="aiFontV">${Math.round(d.font * 100)}%</span></label><input type="range" id="aiFont" min="0.7" max="1.5" step="0.05" value="${d.font}"></div>
          <label class="check"><input type="checkbox" id="aiLogo"${d.logo ? ' checked' : ''}><span>${esc(t('aimg.logo'))}</span></label>
        </div></div>`,
      after: () => paint(),
    });
    main.addEventListener('click', (e) => {
      const b = e.target.closest('[data-ratio],[data-bg],[data-align],[data-ai]'); if (!b || !AI.draft) return;
      if (b.dataset.ratio) { AI.ratio = b.dataset.ratio; render(`[data-ratio="${AI.ratio}"]`); }
      else if (b.dataset.bg) { AI.draft.bg = +b.dataset.bg; render(`[data-bg="${AI.draft.bg}"]`); }
      else if (b.dataset.align) { AI.draft.align = b.dataset.align; render(`[data-align="${AI.draft.align}"]`); }
      else download($('#aiCanvas', main), 'seolit-autoimage.png', 'aimg.downloaded');
    });
    main.addEventListener('input', (e) => {
      if (!AI.draft) return;
      if (e.target.id === 'aiText') { AI.text = e.target.value; paint(); }
      else if (e.target.id === 'aiFont') { AI.draft.font = +e.target.value; $('#aiFontV', main).textContent = Math.round(AI.draft.font * 100) + '%'; paint(); }
    });
    main.addEventListener('change', (e) => { if (e.target.id === 'aiLogo') { AI.draft.logo = e.target.checked; paint(); } });
    // Шрифт мог догрузиться позже — перерисовать
    document.fonts?.ready.then(paint);
  };

  /* ---------- Помощь: вопросы с поиском и обращение в поддержку ---------- */
  const HELP = [[1, [1, 2]], [2, [3, 4, 5]], [3, [6, 7, 8, 9]], [4, []]];
  const HS = { q: '', open: new Set([1]) };
  SECTIONS.help = (main) => {
    const qa = (n) => ({ n, q: t('help.q' + n), a: t('help.a' + n) });
    function list() {
      const s = HS.q.toLowerCase();
      return HELP.map(([c, ns]) => ({ c, items: (c === 4 ? [2] : ns).map(qa).filter((x) => !s || (x.q + ' ' + x.a).toLowerCase().includes(s)) })).filter((g) => g.items.length && !(g.c === 4 && !s));
    }
    function faq() {
      const L = list();
      return L.length ? L.map((g) => `<section class="faq"><h2 class="sec-t">${esc(t('help.c' + g.c))}</h2>${g.items.map((x) => `<details class="faq__item" data-n="${x.n}"${HS.open.has(x.n) || HS.q ? ' open' : ''}>
        <summary><b>${esc(x.q)}</b>${ico('down', 'ico--sm')}</summary><p>${esc(x.a)}</p>${x.n === 9 ? `<p><a href="https://www.bitrix24.ru/apps/app/advina.seolit/" target="_blank" rel="noopener">${esc(t('help.b24'))} →</a></p>` : ''}</details>`).join('')}</section>`).join('')
        : `<p class="card col__none">${esc(t('help.none'))}</p>`;
    }
    main.innerHTML = `${head('help.title', 'help.sub')}
      <div class="helpg"><div class="helpg__main"><label class="search search--lg"><span class="vh">${esc(t('help.search'))}</span>${ico('search', 'ico--sm')}<input type="search" id="hSearch" autocomplete="off" placeholder="${esc(t('help.search'))}" value="${esc(HS.q)}"></label>
        <div id="faq">${faq()}</div></div>
      <aside class="helpg__side"><nav class="card card--pad helplinks"><a href="https://seolit.ru/autoposting-5-minutes.html">${ico('help', 'ico--sm')}${esc(t('help.guide'))}</a><a href="https://seolit.ru/price.html">${ico('balance', 'ico--sm')}${esc(t('help.price'))}</a>
          <a href="https://seolit.ru/contacts.html">${ico('referrals', 'ico--sm')}${esc(t('help.contacts'))}</a><a href="https://www.bitrix24.ru/apps/app/advina.seolit/" target="_blank" rel="noopener">${ico('projects', 'ico--sm')}${esc(t('help.b24'))}</a></nav>
        <form class="card card--pad helpask" novalidate><h2>${esc(t('help.ask'))}</h2><div class="field"><label for="hTopic">${esc(t('help.topic'))}</label>${sel('hTopic', [1, 2, 3, 4].map((n) => [n, t('help.t' + n)]), 1)}</div>
          <div class="field"><label for="hMsg">${esc(t('help.msg'))}</label><textarea class="input" id="hMsg" rows="4" placeholder="${esc(t('help.msgPh'))}" aria-describedby="hErr"></textarea><span class="field__err" id="hErr" hidden>${esc(t('help.msgErr'))}</span></div>
          <button type="submit" class="btn btn--p">${esc(t('help.send'))}</button></form></aside></div>`;
    main.oninput = (e) => { if (e.target.id === 'hSearch') { HS.q = e.target.value.trim(); $('#faq', main).innerHTML = faq(); } };
    main.ontoggle = null;
    main.addEventListener('toggle', (e) => { const d = e.target.closest?.('.faq__item'); if (d && !HS.q) d.open ? HS.open.add(+d.dataset.n) : HS.open.delete(+d.dataset.n); }, true);
    main.onsubmit = (e) => {
      e.preventDefault();
      const m = $('#hMsg', main), ok = !!m.value.trim();
      $('#hErr', main).hidden = ok; m.setAttribute('aria-invalid', String(!ok)); if (!ok) { m.focus(); return; }
      m.value = ''; toast(t('help.sent', { email: DEMO.loggedIn() || DEMO.user.email }));
    };
  };

  /* ---------- Новости ---------- */
  SECTIONS.news = (main) => {
    const read = db().newsRead || (db().newsRead = []);
    const items = DEMO.news.map((n, i) => ({ ...n, i })).sort((a, b) => b.at - a.at);
    main.innerHTML = `${head('news.title', 'news.sub', `<div class="post__h-r"><button type="button" class="btn" data-mark>${esc(t('news.markAll'))}</button><a class="btn btn--p" href="https://seolit.ru/blog.html">${esc(t('news.all'))} →</a></div>`)}
      <div class="newsl">${items.map((n) => `<article class="card card--pad newsl__item${read.includes(n.i) ? '' : ' is-new'}"><time class="muted num">${esc(I18N.date(n.at))}</time>${read.includes(n.i) ? '' : `<span class="pill pill--info">${esc(t('news.unread'))}</span>`}
        <h2>${esc(tx(n.title))}</h2><a href="https://seolit.ru/blog.html" data-read="${n.i}">${esc(t('news.more'))} →</a></article>`).join('')}</div>`;
    main.onclick = (e) => {
      const r = e.target.closest('[data-read]'); if (r && !read.includes(+r.dataset.read)) { read.push(+r.dataset.read); save(); }
      if (e.target.closest('[data-mark]')) { items.forEach((n) => { if (!read.includes(n.i)) read.push(n.i); }); save(); SECTIONS.news(main); toast(t('news.marked')); }
    };
  };

  /* ---------- Настройки профиля ---------- */
  SECTIONS.settings = (main) => {
    const P = db().profile || (db().profile = { tz: 'Europe/Moscow', n: { err: true, bal: true, exp: true, news: false, digest: true }, ch: { email: true, tg: false } });
    const theme = document.documentElement.dataset.theme || 'system';
    main.innerHTML = `${head('prof.title', 'prof.sub')}
      <form class="profile" novalidate>
        <section class="card card--pad psettings"><h2 class="sec-t">${esc(t('prof.account'))}</h2>
          <div class="field"><label for="pfEmail">${esc(t('prof.email'))}</label><input class="input" id="pfEmail" value="${esc(DEMO.loggedIn() || DEMO.user.email)}" readonly></div>
          <button type="button" class="btn" data-pass style="align-self:flex-start">${esc(t('prof.pass'))}</button></section>
        <section class="card card--pad psettings"><div class="two"><div class="field"><label for="pfLang">${esc(t('prof.lang'))}</label>${sel('pfLang', I18N.LANGS.map((l) => [l, { ru: 'Русский', en: 'English', kk: 'Қазақша' }[l]]), I18N.lang)}</div>
          <div class="field"><label for="pfTheme">${esc(t('prof.theme'))}</label>${sel('pfTheme', [['system', t('prof.tSystem')], ['light', t('prof.tLight')], ['dark', t('prof.tDark')]], theme)}</div></div>
          <div class="field"><label for="pfTz">${esc(t('prof.tz'))}</label>${sel('pfTz', TZ.map(([id, off, city]) => [id, `${city} (UTC+${off})`]), P.tz)}</div></section>
        <section class="card card--pad psettings"><h2 class="sec-t">${esc(t('prof.notify'))}</h2>
          ${['err', 'bal', 'exp', 'news', 'digest'].map((k) => chk('pfN_' + k, t('prof.n' + k[0].toUpperCase() + k.slice(1)), P.n[k])).join('')}
          <fieldset class="field accset__grp"><legend>${esc(t('prof.channels'))}</legend>${chk('pfC_email', t('prof.chEmail'), P.ch.email)}
            <div class="psettings__row">${chk('pfC_tg', t('prof.chTg'), P.ch.tg)}<button type="button" class="btn btn--sm" data-tg>${net('tg', 22)}${esc(t('prof.tgConnect'))}</button></div></fieldset></section>
        <div class="split__foot"><button type="submit" class="btn btn--p">${esc(t('prof.save'))}</button></div>
      </form>`;
    main.onclick = (e) => { if (e.target.closest('[data-pass]')) APP.demo('prof.passToast'); else if (e.target.closest('[data-tg]')) APP.demo('prof.tgToast'); };
    main.onchange = (e) => {
      if (e.target.id === 'pfLang') I18N.setLang(e.target.value);
      else if (e.target.id === 'pfTheme') {
        const v = e.target.value, root = document.documentElement;
        if (v === 'system') { delete root.dataset.theme; try { localStorage.removeItem('seolit-theme'); } catch (er) { /* ничего */ } }
        else { root.dataset.theme = v; try { localStorage.setItem('seolit-theme', v); } catch (er) { /* ничего */ } }
        document.dispatchEvent(new Event('theme-changed'));
      }
    };
    main.onsubmit = (e) => {
      e.preventDefault();
      P.tz = $('#pfTz', main).value;
      ['err', 'bal', 'exp', 'news', 'digest'].forEach((k) => { P.n[k] = $('#pfN_' + k, main).checked; });
      P.ch.email = $('#pfC_email', main).checked; P.ch.tg = $('#pfC_tg', main).checked;
      save(); toast(t('prof.saved'));
    };
  };

  function soon(main) {
    main.innerHTML = `<section class="card empty soon"><span class="empty__ico">${ico(PAGE)}</span><h1>${esc(t('nav.' + PAGE))}</h1>
      <p>${esc(t('soon.text'))}</p><a class="btn btn--p" href="projects.html">${ico('projects', 'ico--sm')}${esc(t('soon.back'))}</a></section>`;
  }

  window.SECTIONS = { accSettings, projectTab, fillTpl, add: (k, fn) => { SECTIONS[k] = fn; } };

  const main = $('#main');
  if (main && PAGE && !['projects', 'project', 'queue', 'post', 'soon', 'login', 'register'].includes(PAGE)) {
    // #main ищем каждый раз: редакторы картинок заменяют его чистой копией, чтобы сбросить слушатели
    const run = () => { const m = $('#main'); SECTIONS[PAGE] ? SECTIONS[PAGE](m) : soon(m); };
    run();
    I18N.onChange(run);
  }
  document.dispatchEvent(new Event('sections-ready'));
  APP._sec = { db, save, sel, chk, radios, isoDay, fromIso, L3, setBalance, hash, SECTIONS };
})();
