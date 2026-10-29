/* SEOlit, демо-кабинет — языки RU · EN · KZ и ранняя установка темы.
   Подключается в <head> первым (без defer), чтобы тема и lang стояли до отрисовки.
   KZ: нужна вычитка носителем — казахские тексты черновые (из макетов и по их образцу). */
(() => {
  'use strict';

  /* ---------- Тема: общий с лендингом ключ seolit-theme ---------- */
  const root = document.documentElement;
  try {
    const th = localStorage.getItem('seolit-theme');
    if (th === 'dark' || th === 'light') root.dataset.theme = th;
  } catch (e) { /* хранилище недоступно */ }

  /* ---------- Язык: ?lang= → localStorage['seolit-lang'] → ru ---------- */
  const LANGS = ['ru', 'en', 'kk'];
  const LABEL = { ru: 'RU', en: 'EN', kk: 'KZ' };
  const LOCALE = { ru: 'ru-RU', en: 'en-US', kk: 'kk-KZ' };
  let lang = 'ru';
  try {
    const q = new URLSearchParams(location.search).get('lang');
    const saved = localStorage.getItem('seolit-lang');
    if (LANGS.includes(q)) { lang = q; localStorage.setItem('seolit-lang', q); }
    else if (LANGS.includes(saved)) lang = saved;
  } catch (e) { /* ничего */ }
  root.lang = lang;

  /* ---------- Словари. Ключи плоские, «раздел.имя». Формы числа — объект { one, few, many, other }. ---------- */
  const D = {
    ru: {
      'brand': 'SEOlit',
      'title.suffix': 'SEOlit',
      // Оболочка: меню
      'nav.aria': 'Разделы кабинета',
      'nav.gWork': 'Работа', 'nav.gLook': 'Оформление', 'nav.gAccount': 'Аккаунт',
      'nav.projects': 'Проекты', 'nav.queue': 'Очередь', 'nav.templates': 'Шаблоны', 'nav.schedules': 'Расписания',
      'nav.watermarks': 'Водяные знаки', 'nav.autoimg': 'Автокартинки', 'nav.balance': 'Баланс', 'nav.referrals': 'Рефералы',
      'nav.api': 'API', 'nav.rss': 'RSS-тест', 'nav.help': 'Помощь и инструкции', 'nav.settings': 'Настройки профиля',
      'nav.stats': 'Статистика', 'nav.access': 'Доступ', 'nav.projectSettings': 'Настройки проекта', 'nav.post': 'Новый пост',
      'bal.lbl': 'Баланс', 'bal.enough': 'Хватит примерно на 5 месяцев', 'bal.topup': 'Пополнить',
      // Верхняя панель
      'top.crumbs': 'Навигация', 'top.search': 'Поиск по проектам и аккаунтам', 'top.lang': 'Язык интерфейса',
      'top.notes': 'Уведомления: 1 новое', 'top.notesTitle': 'Уведомления', 'top.profile': 'Профиль {email}',
      'top.toDark': 'Тёмная тема', 'top.toLight': 'Светлая тема', 'top.newPost': 'Новый пост', 'top.back': 'Назад',
      'top.reset': 'Сбросить демо', 'top.logout': 'Выйти', 'top.allRead': 'Все уведомления прочитаны',
      // Уведомления в колокольчике
      'note.1t': 'Новости района', 'note.1': 'ВКонтакте просит войти заново — публикации в группу остановлены.',
      'note.2t': 'Очередь', 'note.2': 'Пост «Новинки недели в каталоге» выйдет сегодня в 15:30.',
      'note.3t': 'Новое в SEOlit', 'note.3': 'MAX.RU: каналы, чаты и собственный бот.',
      // Нижние вкладки и «Ещё»
      'tabs.aria': 'Основная навигация', 'tabs.more': 'Ещё', 'tabs.moreTitle': 'Все разделы',
      'tabs.lang': 'Язык', 'tabs.theme': 'Сменить тему', 'tabs.close': 'Закрыть',
      // Баннер демо
      'demo.text': 'Демо нового интерфейса. Данные вымышленные, ничего не сохраняется.',
      'demo.link': 'Настоящий кабинет — seolit.ru', 'demo.close': 'Скрыть плашку',
      'demo.toast': 'Демо: в настоящем SEOlit {what}',
      'demo.short': 'Демо: данные вымышленные.', 'demo.linkShort': 'Настоящий — seolit.ru',
      'demo.reset': 'Демо сброшено',
      'demo.topup': 'Демо: здесь откроется оплата — в демо деньги не списываются',
      'demo.search': 'Ничего не нашлось',
      // Заглушка раздела
      'soon.text': 'Этот раздел появится в демо позже.',
      'soon.hint': 'Макет ещё рисуется. Пока можно посмотреть проекты, очередь и новый пост.',
      'soon.back': 'К проектам',
      // Общие слова
      'c.close': 'Закрыть', 'c.cancel': 'Отмена', 'c.save': 'Сохранить', 'c.open': 'Открыть', 'c.delete': 'Удалить',
      'c.more': 'Ещё действия', 'c.today': 'Сегодня', 'c.tomorrow': 'Завтра', 'c.yesterday': 'Вчера',
      'c.rub': '₽',
      'p.days': { one: '{n} день', few: '{n} дня', many: '{n} дней', other: '{n} дня' },
      'p.errors': { one: '{n} ошибка', few: '{n} ошибки', many: '{n} ошибок', other: '{n} ошибки' },
      'p.posts': { one: '{n} пост', few: '{n} поста', many: '{n} постов', other: '{n} поста' },
      'p.projects': { one: '{n} проект', few: '{n} проекта', many: '{n} проектов', other: '{n} проекта' },
      'p.nets': { one: '{n} соцсеть', few: '{n} соцсети', many: '{n} соцсетей', other: '{n} соцсети' },
    },
    en: {
      'brand': 'SEOlit',
      'title.suffix': 'SEOlit',
      'nav.aria': 'Account sections',
      'nav.gWork': 'Work', 'nav.gLook': 'Design', 'nav.gAccount': 'Account',
      'nav.projects': 'Projects', 'nav.queue': 'Queue', 'nav.templates': 'Templates', 'nav.schedules': 'Schedules',
      'nav.watermarks': 'Watermarks', 'nav.autoimg': 'Auto images', 'nav.balance': 'Balance', 'nav.referrals': 'Referrals',
      'nav.api': 'API', 'nav.rss': 'RSS check', 'nav.help': 'Help & guides', 'nav.settings': 'Profile settings',
      'nav.stats': 'Analytics', 'nav.access': 'Team', 'nav.projectSettings': 'Project settings', 'nav.post': 'New post',
      'bal.lbl': 'Balance', 'bal.enough': 'Enough for about 5 months', 'bal.topup': 'Top up',
      'top.crumbs': 'Breadcrumbs', 'top.search': 'Search projects and accounts', 'top.lang': 'Interface language',
      'top.notes': 'Notifications: 1 new', 'top.notesTitle': 'Notifications', 'top.profile': 'Profile {email}',
      'top.toDark': 'Dark theme', 'top.toLight': 'Light theme', 'top.newPost': 'New post', 'top.back': 'Back',
      'top.reset': 'Reset demo', 'top.logout': 'Sign out', 'top.allRead': 'All caught up',
      'note.1t': 'Neighborhood News', 'note.1': 'VK asks you to sign in again — posting to the group has stopped.',
      'note.2t': 'Queue', 'note.2': '“This week’s new arrivals” goes out today at 15:30.',
      'note.3t': 'What’s new', 'note.3': 'MAX.RU: channels, chats and your own bot.',
      'tabs.aria': 'Main navigation', 'tabs.more': 'More', 'tabs.moreTitle': 'All sections',
      'tabs.lang': 'Language', 'tabs.theme': 'Switch theme', 'tabs.close': 'Close',
      'demo.text': 'A demo of the new interface. All data is made up and nothing is saved.',
      'demo.link': 'The real account is at seolit.ru', 'demo.close': 'Hide this notice',
      'demo.toast': 'Demo: in the real SEOlit {what}',
      'demo.short': 'Demo: all data is made up.', 'demo.linkShort': 'Real one: seolit.ru',
      'demo.reset': 'Demo reset',
      'demo.topup': 'Demo: payment would open here — no money is charged in the demo',
      'demo.search': 'Nothing found',
      'soon.text': 'This section is coming to the demo later.',
      'soon.hint': 'The design is still in progress. Meanwhile, try projects, the queue and a new post.',
      'soon.back': 'Back to projects',
      'c.close': 'Close', 'c.cancel': 'Cancel', 'c.save': 'Save', 'c.open': 'Open', 'c.delete': 'Delete',
      'c.more': 'More actions', 'c.today': 'Today', 'c.tomorrow': 'Tomorrow', 'c.yesterday': 'Yesterday',
      'c.rub': '₽',
      'p.days': { one: '{n} day', other: '{n} days' },
      'p.errors': { one: '{n} error', other: '{n} errors' },
      'p.posts': { one: '{n} post', other: '{n} posts' },
      'p.projects': { one: '{n} project', other: '{n} projects' },
      'p.nets': { one: '{n} network', other: '{n} networks' },
      'net.vk': 'VK', 'net.ok': 'Odnoklassniki', 'net.mm': 'My World', 'net.lj': 'LiveJournal',
    },
    kk: {
      'brand': 'SEOlit',
      'title.suffix': 'SEOlit',
      'nav.aria': 'Кабинет бөлімдері',
      'nav.gWork': 'Жұмыс', 'nav.gLook': 'Безендіру', 'nav.gAccount': 'Аккаунт',
      'nav.projects': 'Жобалар', 'nav.queue': 'Кезек', 'nav.templates': 'Үлгілер', 'nav.schedules': 'Кестелер',
      'nav.watermarks': 'Су таңбалары', 'nav.autoimg': 'Автосуреттер', 'nav.balance': 'Баланс', 'nav.referrals': 'Рефералдар',
      'nav.api': 'API', 'nav.rss': 'RSS-тексеру', 'nav.help': 'Көмек және нұсқаулар', 'nav.settings': 'Профиль баптаулары',
      'nav.stats': 'Статистика', 'nav.access': 'Қолжетімділік', 'nav.projectSettings': 'Жоба баптаулары', 'nav.post': 'Жаңа жазба',
      'bal.lbl': 'Баланс', 'bal.enough': 'Шамамен 5 айға жетеді', 'bal.topup': 'Толтыру',
      'top.crumbs': 'Навигация', 'top.search': 'Жобалар мен аккаунттарды іздеу', 'top.lang': 'Интерфейс тілі',
      'top.notes': 'Хабарламалар: 1 жаңа', 'top.notesTitle': 'Хабарламалар', 'top.profile': 'Профиль {email}',
      'top.toDark': 'Қараңғы тақырып', 'top.toLight': 'Жарық тақырып', 'top.newPost': 'Жаңа жазба', 'top.back': 'Артқа',
      'top.reset': 'Демоны қалпына келтіру', 'top.logout': 'Шығу', 'top.allRead': 'Барлық хабарлама оқылды',
      'note.1t': 'Аудан жаңалықтары', 'note.1': 'ВКонтакте қайта кіруді сұрайды — топқа жариялау тоқтады.',
      'note.2t': 'Кезек', 'note.2': '«Каталогтағы апта жаңалықтары» бүгін 15:30-да шығады.',
      'note.3t': 'SEOlit жаңалығы', 'note.3': 'MAX.RU: арналар, чаттар және жеке бот.',
      'tabs.aria': 'Негізгі навигация', 'tabs.more': 'Тағы', 'tabs.moreTitle': 'Барлық бөлімдер',
      'tabs.lang': 'Тіл', 'tabs.theme': 'Тақырыпты ауыстыру', 'tabs.close': 'Жабу',
      'demo.text': 'Жаңа интерфейстің демосы. Деректер ойдан алынған, ештеңе сақталмайды.',
      'demo.link': 'Нағыз кабинет — seolit.ru', 'demo.close': 'Жасыру',
      'demo.toast': 'Демо: нағыз SEOlit-те {what}',
      'demo.short': 'Демо: деректер ойдан алынған.', 'demo.linkShort': 'Нағызы — seolit.ru',
      'demo.reset': 'Демо қалпына келтірілді',
      'demo.topup': 'Демо: мұнда төлем ашылады — демода ақша алынбайды',
      'demo.search': 'Ештеңе табылмады',
      'soon.text': 'Бұл бөлім демода кейінірек пайда болады.',
      'soon.hint': 'Макет әлі сызылып жатыр. Әзірге жобаларды, кезекті және жаңа жазбаны көріңіз.',
      'soon.back': 'Жобаларға',
      'c.close': 'Жабу', 'c.cancel': 'Болдырмау', 'c.save': 'Сақтау', 'c.open': 'Ашу', 'c.delete': 'Жою',
      'c.more': 'Басқа әрекеттер', 'c.today': 'Бүгін', 'c.tomorrow': 'Ертең', 'c.yesterday': 'Кеше',
      'c.rub': '₽',
      'p.days': { one: '{n} күн', other: '{n} күн' },
      'p.errors': { one: '{n} қате', other: '{n} қате' },
      'p.posts': { one: '{n} жазба', other: '{n} жазба' },
      'p.projects': { one: '{n} жоба', other: '{n} жоба' },
      'p.nets': { one: '{n} желі', other: '{n} желі' },
      'net.vk': 'ВКонтакте', 'net.ok': 'Одноклассники', 'net.mm': 'Мой Мир', 'net.lj': 'LiveJournal',
    },
  };

  /* ---------- Форматы ---------- */
  // В Chrome нет данных ICU для kk (выдаёт «4,300» и «M10 29»), поэтому для KZ числа и время — как в ru-RU,
  // а названия месяцев и дней недели — свои.
  const loc = () => LOCALE[lang];
  const nloc = () => (lang === 'kk' ? 'ru-RU' : loc());
  const num = (n) => new Intl.NumberFormat(nloc()).format(n);
  const money = (n) => num(n) + ' ₽';
  const KK_M = ['қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым', 'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан'];
  const KK_WD = ['жс', 'дс', 'сс', 'ср', 'бс', 'жм', 'сб'];
  // date(d, 'num') → 18.11.2026 / Nov 18, 2026; 'dm' → 29 октября; 'dmShort' → 29.10; 'wd' → пн, 29; 'time' → 15:30
  const DF = {
    num: (l) => (l === 'en' ? { day: 'numeric', month: 'short', year: 'numeric' } : { day: '2-digit', month: '2-digit', year: 'numeric' }),
    dm: () => ({ day: 'numeric', month: 'long' }),
    dmShort: () => ({ day: '2-digit', month: '2-digit' }),
    wd: () => ({ weekday: 'short', day: 'numeric' }),
    time: () => ({ hour: '2-digit', minute: '2-digit', hour12: false }),
  };
  function date(d, f = 'num') {
    d = d instanceof Date ? d : new Date(d);
    if (lang === 'kk' && f === 'dm') return d.getDate() + ' ' + KK_M[d.getMonth()];
    if (lang === 'kk' && f === 'wd') return KK_WD[d.getDay()] + ', ' + d.getDate();
    return new Intl.DateTimeFormat(nloc(), DF[f](lang)).format(d);
  }

  /* ---------- t(), plural() ---------- */
  const fill = (s, v) => (v ? s.replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m)) : s);
  // Значение для ключа: текущий язык → русский → сам ключ (в консоль — предупреждение, чтобы хвосты были видны)
  function raw(key) {
    if (key in D[lang]) return D[lang][key];
    if (key in D.ru) { console.warn('i18n: нет перевода', lang, key); return D.ru[key]; }
    console.warn('i18n: нет ключа', key);
    return key;
  }
  const t = (key, v) => fill(String(raw(key)), v);
  const pr = {};
  // plural(n, { one, few, many, other }) или plural(n, 'p.errors'); {n} в строке — число в формате языка
  function plural(n, forms) {
    const f = typeof forms === 'string' ? raw(forms) : forms;
    const cat = (pr[lang] ||= new Intl.PluralRules(lang)).select(n);
    return fill(f[cat] ?? f.other, { n: num(n) });
  }

  /* ---------- Применение к разметке ---------- */
  // data-i18n="key" — текст; data-i18n-attr="placeholder:key;aria-label:key2" — атрибуты
  function apply(scope = document) {
    scope.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    scope.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      el.dataset.i18nAttr.split(';').forEach((pair) => {
        const [a, k] = pair.split(':').map((s) => s.trim());
        if (a && k) el.setAttribute(a, t(k));
      });
    });
  }
  const subs = [];
  function setLang(l) {
    if (!LANGS.includes(l) || l === lang) return;
    lang = l; root.lang = l;
    try { localStorage.setItem('seolit-lang', l); } catch (e) { /* ничего */ }
    // ?lang= в адресе больше не нужен — иначе после перезагрузки вернётся старый язык
    const u = new URL(location.href);
    if (u.searchParams.has('lang')) { u.searchParams.delete('lang'); history.replaceState(history.state, '', u); }
    apply();
    subs.forEach((fn) => fn(l));
  }
  window.I18N = {
    LANGS, LABEL, has: (k) => k in D[lang] || k in D.ru, get lang() { return lang; }, get locale() { return loc(); },
    t, plural, num, money, date, apply, setLang, onChange: (fn) => subs.push(fn),
  };
})();
