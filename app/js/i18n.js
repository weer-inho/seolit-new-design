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
      // Вход и регистрация
      'auth.home': 'На главную', 'auth.titleLogin': 'Вход', 'auth.titleRegister': 'Регистрация',
      'auth.loginTitle': 'Вход в SEOlit', 'auth.loginSub': 'Это демо: подойдут любой email и любой пароль.',
      'auth.email': 'Email', 'auth.password': 'Пароль', 'auth.show': 'Показать пароль', 'auth.hide': 'Скрыть пароль',
      'auth.forgot': 'Забыли пароль?', 'auth.forgotHint': 'В демо пароль не нужен — введите любой или войдите без пароля.',
      'auth.submit': 'Войти', 'auth.or': 'или', 'auth.demo': 'Войти в демо без пароля',
      'auth.noAcc': 'Нет аккаунта?', 'auth.toRegister': 'Зарегистрироваться',
      'auth.errEmail': 'Введите email', 'auth.errEmailBad': 'Проверьте email: нужен адрес вида name@example.ru',
      'auth.errPass': 'Введите пароль', 'auth.errOffer': 'Чтобы продолжить, примите условия оферты',
      'auth.regTitle': 'Регистрация в SEOlit', 'auth.regSub': 'Первые 3 дня — бесплатно. Дальше 800 ₽ в месяц за проект.',
      'auth.offer': 'Принимаю', 'auth.offerLink': 'условия оферты',
      'auth.regSubmit': 'Создать аккаунт и получить 3 дня бесплатно',
      'auth.haveAcc': 'Уже есть аккаунт?', 'auth.toLogin': 'Войти',
      'auth.doneTitle': 'Аккаунт создан', 'auth.doneText': 'Демо-аккаунт {email} готов, 3 бесплатных дня начались. Осталось завести проект и подключить соцсети.',
      'auth.doneBtn': 'Создать первый проект',
      'auth.sideTitle': 'Один пост — сразу во все соцсети', 'auth.sideAria': 'Как публикует SEOlit',
      'auth.f1': '12', 'auth.f1s': 'соцсетей', 'auth.f2': '800 ₽', 'auth.f2s': 'в месяц за проект', 'auth.f3': '3 дня', 'auth.f3s': 'бесплатно',
      'auth.c1': 'Новинки недели в каталоге', 'auth.c2': 'Как выбрать подарок', 'auth.c3': 'Акция выходного дня',
      'auth.publishing': 'публикуется…',
      'p.inNets': { one: 'в {n} соцсети', few: 'в {n} соцсетях', many: 'в {n} соцсетях', other: 'в {n} соцсети' },
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
      'auth.home': 'Home', 'auth.titleLogin': 'Sign in', 'auth.titleRegister': 'Sign up',
      'auth.loginTitle': 'Sign in to SEOlit', 'auth.loginSub': 'This is a demo: any email and any password will do.',
      'auth.email': 'Email', 'auth.password': 'Password', 'auth.show': 'Show password', 'auth.hide': 'Hide password',
      'auth.forgot': 'Forgot password?', 'auth.forgotHint': 'No password needed in the demo — type anything or sign in without one.',
      'auth.submit': 'Sign in', 'auth.or': 'or', 'auth.demo': 'Enter the demo without a password',
      'auth.noAcc': 'No account yet?', 'auth.toRegister': 'Sign up',
      'auth.errEmail': 'Enter your email', 'auth.errEmailBad': 'Check the email: it should look like name@example.com',
      'auth.errPass': 'Enter a password', 'auth.errOffer': 'Please accept the terms to continue',
      'auth.regTitle': 'Sign up for SEOlit', 'auth.regSub': 'The first 3 days are free. After that, 800 ₽ a month per project.',
      'auth.offer': 'I accept the', 'auth.offerLink': 'terms of the offer',
      'auth.regSubmit': 'Create an account and get 3 days free',
      'auth.haveAcc': 'Already have an account?', 'auth.toLogin': 'Sign in',
      'auth.doneTitle': 'Account created', 'auth.doneText': 'Demo account {email} is ready and your 3 free days have started. Next, create a project and connect your networks.',
      'auth.doneBtn': 'Create your first project',
      'auth.sideTitle': 'One post, every network at once', 'auth.sideAria': 'How SEOlit publishes',
      'auth.f1': '12', 'auth.f1s': 'social networks', 'auth.f2': '800 ₽', 'auth.f2s': 'a month per project', 'auth.f3': '3 days', 'auth.f3s': 'free',
      'auth.c1': 'This week’s new arrivals', 'auth.c2': 'How to pick a gift', 'auth.c3': 'Weekend sale',
      'auth.publishing': 'publishing…',
      'p.inNets': { one: 'to {n} network', other: 'to {n} networks' },
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
      'auth.home': 'Басты бетке', 'auth.titleLogin': 'Кіру', 'auth.titleRegister': 'Тіркелу',
      'auth.loginTitle': 'SEOlit-ке кіру', 'auth.loginSub': 'Бұл демо: кез келген email мен құпиясөз жарайды.',
      'auth.email': 'Email', 'auth.password': 'Құпиясөз', 'auth.show': 'Құпиясөзді көрсету', 'auth.hide': 'Құпиясөзді жасыру',
      'auth.forgot': 'Құпиясөзді ұмыттыңыз ба?', 'auth.forgotHint': 'Демода құпиясөз қажет емес — кез келгенін енгізіңіз немесе құпиясөзсіз кіріңіз.',
      'auth.submit': 'Кіру', 'auth.or': 'немесе', 'auth.demo': 'Демоға құпиясөзсіз кіру',
      'auth.noAcc': 'Аккаунтыңыз жоқ па?', 'auth.toRegister': 'Тіркелу',
      'auth.errEmail': 'Email енгізіңіз', 'auth.errEmailBad': 'Email-ді тексеріңіз: name@example.kz сияқты болуы керек',
      'auth.errPass': 'Құпиясөз енгізіңіз', 'auth.errOffer': 'Жалғастыру үшін оферта шарттарын қабылдаңыз',
      'auth.regTitle': 'SEOlit-те тіркелу', 'auth.regSub': 'Алғашқы 3 күн — тегін. Кейін жобаға айына 800 ₽.',
      'auth.offer': 'Қабылдаймын:', 'auth.offerLink': 'оферта шарттары',
      'auth.regSubmit': 'Аккаунт ашып, 3 күн тегін алу',
      'auth.haveAcc': 'Аккаунтыңыз бар ма?', 'auth.toLogin': 'Кіру',
      'auth.doneTitle': 'Аккаунт ашылды', 'auth.doneText': '{email} демо-аккаунты дайын, 3 тегін күн басталды. Енді жоба ашып, желілерді қосыңыз.',
      'auth.doneBtn': 'Алғашқы жобаны ашу',
      'auth.sideTitle': 'Бір жазба — бірден барлық желіге', 'auth.sideAria': 'SEOlit қалай жариялайды',
      'auth.f1': '12', 'auth.f1s': 'әлеуметтік желі', 'auth.f2': '800 ₽', 'auth.f2s': 'жобаға айына', 'auth.f3': '3 күн', 'auth.f3s': 'тегін',
      'auth.c1': 'Каталогтағы апта жаңалықтары', 'auth.c2': 'Сыйлықты қалай таңдау керек', 'auth.c3': 'Демалыс күнгі акция',
      'auth.publishing': 'жарияланып жатыр…',
      'p.inNets': { one: '{n} желіде', other: '{n} желіде' },
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
