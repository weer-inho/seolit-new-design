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
      'demo.text': 'Демо нового интерфейса. Данные демонстрационные, ничего не сохраняется.',
      'demo.link': 'Настоящий кабинет — seolit.ru', 'demo.close': 'Скрыть плашку',
      'demo.toast': 'Демо: в настоящем SEOlit {what}',
      'demo.short': 'Демо: данные демонстрационные.', 'demo.linkShort': 'Настоящий — seolit.ru',
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
      // Проекты
      'prj.title': 'Проекты', 'prj.newProject': 'Новый проект',
      'prj.newHint': '800 ₽ за 30 дней. По 1 аккаунту каждой соцсети и любое число лент',
      'prj.attention': 'Требует внимания', 'prj.attentionN': 'Требует внимания: {n}', 'prj.mine': 'Мои проекты', 'prj.shared': 'Доступны мне',
      'prj.inQueue': 'в очереди', 'prj.paused': 'на паузе', 'prj.open': 'Открыть', 'prj.post': 'Новый пост',
      'prj.st.ok': 'Работает', 'prj.st.demo': 'Демо', 'prj.st.off': 'Отключён',
      'prj.paidUntil': 'Оплачен до {date}', 'prj.demoUntil': 'Демо до {date}', 'prj.ended': 'Закончился {date}',
      'prj.pay': 'Оплатить 800 ₽', 'prj.renew': 'Продлить за 800 ₽',
      'prj.payToast': 'открылась бы оплата 800 ₽ за 30 дней',
      'prj.role.editor': 'Редактор', 'prj.owner': 'Владелец: {email}',
      'prj.newsLbl': 'Новое в SEOlit', 'prj.allNews': 'Все новости',
      'prj.tip': 'Совет: заводите отдельный проект для каждого сайта — так проще следить за очередью и оплатой.',
      'prj.reconnect': 'Переподключить', 'prj.demoEnds': '{name}: демо закончится {when}', 'prj.demoEnds0': 'сегодня', 'prj.demoEnds1': 'завтра',
      'prj.errAlert': '{name} · {net}: {text}',
      'prj.netsMore': '+{n}', 'prj.netsAria': 'Соцсети проекта',
      'prj.searchNone': 'Ничего не нашлось по запросу «{q}»', 'prj.searchHint': 'Поиск идёт по названию проекта и адресу сайта.', 'prj.searchReset': 'Сбросить поиск',
      'prj.newTitle': 'Новый проект', 'prj.newName': 'Название', 'prj.newNamePh': 'Например, Магазин «Пример»',
      'prj.newSite': 'Сайт', 'prj.newSitePh': 'example.ru', 'prj.newSiteHint': 'Необязательно. Можно указать позже в настройках проекта.',
      'prj.newErr': 'Введите название проекта', 'prj.create': 'Создать', 'prj.created': 'Проект «{name}» создан — 3 дня демо',
      'prj.newText': '800 ₽ за 30 дней. Первые 3 дня — демо: можно подключить соцсети и проверить автопостинг.',
      'prj.empty': 'Проектов пока нет', 'prj.emptyText': 'Создайте первый проект — подключите сайт и соцсети, куда публиковать.',
      'p.own': { one: '{n} свой проект', few: '{n} своих проекта', many: '{n} своих проектов', other: '{n} своего проекта' },
      'p.sharedYou': { one: '{n} доступен вам', few: '{n} доступны вам', many: '{n} доступны вам', other: '{n} доступны вам' },
      'p.errWord': { one: 'ошибка', few: 'ошибки', many: 'ошибок', other: 'ошибки' },
      'p.inQueue': { one: '{n} в очереди', few: '{n} в очереди', many: '{n} в очереди', other: '{n} в очереди' },
      // Проект
      'proj.settings': 'Настройки', 'proj.sections': 'Разделы проекта', 'proj.overview': 'Обзор', 'proj.sources': 'Источники', 'proj.dests': 'Приёмники',
      'proj.queue': 'Очередь', 'proj.stats': 'Статистика', 'proj.access': 'Доступ', 'proj.site': '{site} · {paid}',
      'proj.k1': 'Опубликовано за 7 дней', 'proj.k1m': 'Вышло за 7 дней', 'proj.k1s': '{d} к прошлой неделе', 'proj.k2': 'В очереди', 'proj.k2s': 'Ближайший — {when}', 'proj.k2none': 'Очередь пуста',
      'proj.k3': 'На паузе', 'proj.k3s': 'Приёмник выключен', 'proj.k3none': 'Ничего не стоит на паузе', 'proj.k4': 'Ошибки', 'proj.k4none': 'Всё работает', 'proj.review': 'Разобрать',
      'proj.sourcesHint': 'Откуда брать материалы', 'proj.destsHint': 'Куда публиковать', 'proj.connect': 'Подключить',
      'proj.toggle': 'Включить или выключить: {name}', 'proj.find': 'Найти аккаунт', 'proj.filter': 'Фильтр по состоянию',
      'proj.fAll': 'Все', 'proj.fErr': 'Ошибки', 'proj.fOn': 'Работают', 'proj.fOff': 'Выключены',
      'proj.moreSources': 'Показать ещё {n}', 'proj.moreNets': 'Ещё {n}', 'proj.less': 'Свернуть', 'proj.groupToggle': 'Показать или скрыть аккаунты: {name}',
      'proj.justNow': 'Только что', 'proj.fixToast': '«{action}» открыло бы {net}. Считаем, что всё исправлено',
      'proj.rowMenu': 'Действия: {name}', 'proj.rowSettings': 'Настройки', 'proj.rowQueue': 'Очередь этого аккаунта', 'proj.rowDelete': 'Удалить',
      'proj.delTitle': 'Удалить приёмник?', 'proj.delSrcTitle': 'Удалить источник?', 'proj.delText': '«{name}» больше не будет получать посты этого проекта. Посты в очереди для него снимутся.',
      'proj.delSrcText': 'SEOlit перестанет брать материалы из «{name}».', 'proj.deleted': 'Удалено: {name}',
      'proj.on': 'Включено: {name}', 'proj.off': 'Выключено: {name}',
      'proj.noSources': 'Источников пока нет', 'proj.noSourcesText': 'Для автоматической публикации подключите RSS-ленту сайта или аккаунт соцсети.', 'proj.connectSource': 'Подключить источник',
      'proj.noDests': 'Приёмников пока нет', 'proj.noDestsText': 'Подключите соцсети, куда SEOlit будет публиковать посты проекта.', 'proj.connectDest': 'Подключить приёмник',
      'proj.nothing': 'Ничего не нашлось', 'proj.view': 'Что показать', 'proj.back': 'Назад к проектам',
      'p.works': { one: '{n} работает', few: '{n} работают', many: '{n} работают', other: '{n} работают' },
      'p.recvs': { one: '{n} приёмник', few: '{n} приёмника', many: '{n} приёмников', other: '{n} приёмника' },
      'p.srcs': { one: '{n} источник', few: '{n} источника', many: '{n} источников', other: '{n} источника' },
      // Окно «Подключить»
      'conn.title': 'Подключить приёмник', 'conn.sub': 'Выберите соцсеть, куда SEOlit будет публиковать посты этого проекта.',
      'conn.titleSrc': 'Подключить источник', 'conn.subSrc': 'Выберите, откуда SEOlit будет брать материалы для этого проекта.',
      'conn.step1': 'Соцсеть', 'conn.step2': 'Вход в аккаунт', 'conn.step3': 'Страница или группа', 'conn.step1Src': 'Источник', 'conn.step2Rss': 'Адрес ленты',
      'conn.search': 'Найти соцсеть', 'conn.cats': 'Категории', 'conn.all': 'Все', 'conn.social': 'Соцсети', 'conn.msg': 'Мессенджеры', 'conn.blogs': 'Блоги', 'conn.video': 'Видео', 'conn.feeds': 'Ленты',
      'conn.included': 'Входит в тариф', 'conn.extra': 'Уже подключён: {n} · ещё +100 ₽/мес', 'conn.includedShort': 'В тарифе', 'conn.extraShort': '+100 ₽/мес',
      'conn.nothing': 'Ничего не нашлось. Напишите нам — добавим нужную соцсеть.',
      'conn.note': 'В тариф проекта входит 1 аккаунт каждой соцсети. Дополнительный — 100 ₽ за 30 дней.', 'conn.noteSrc': 'Источников можно подключить сколько угодно — это входит в тариф.',
      'conn.meta': '* Meta признана экстремистской организацией и запрещена в РФ.',
      'conn.go': 'Продолжить с {net}', 'conn.pick': 'Выберите соцсеть', 'conn.back': 'Назад',
      'conn.loginText': 'Сейчас откроется окно входа в {net}. Войдите в аккаунт и разрешите SEOlit публиковать.', 'conn.loginBtn': 'Войти в {net}', 'conn.waiting': 'Ждём вход…',
      'conn.pageText': 'Выберите, куда публиковать:', 'conn.pageTextSrc': 'Выберите, откуда брать материалы:', 'conn.add': 'Подключить',
      'conn.page1': '{name}', 'conn.page2': '{name} — новости', 'conn.page3': 'Тестовая группа',
      'conn.rssLabel': 'Адрес RSS или Atom-ленты', 'conn.rssPh': 'https://example.ru/rss', 'conn.rssCheck': 'Проверить', 'conn.rssErr': 'Введите адрес ленты',
      'conn.rssToast': 'лента была бы прочитана и проверена', 'conn.done': 'Приёмник подключён', 'conn.doneSrc': 'Источник подключён',
      'net.vkGoods': 'ВК-товары', 'net.rssFeed': 'RSS/Atom-лента',
      // Очередь
      'q.title': 'Очередь публикаций', 'q.sub': 'Все посты проекта: что, куда и когда выйдет', 'q.subAll': 'Посты всех проектов: что, куда и когда выйдет',
      'q.view': 'Вид', 'q.list': 'Список', 'q.calendar': 'Календарь', 'q.status': 'Статус',
      'q.plan': 'Запланировано', 'q.paused': 'На паузе', 'q.err': 'Ошибки', 'q.done': 'Опубликовано',
      'q.search': 'Найти пост по тексту', 'q.allProjects': 'Все проекты', 'q.allDests': 'Все приёмники', 'q.allSources': 'Все источники',
      'q.week': 'Ближайшие 7 дней', 'q.weekPast': 'Последние 7 дней', 'q.anyDate': 'Все даты', 'q.filters': 'Фильтры',
      'q.fProject': 'Проект', 'q.fDest': 'Приёмник', 'q.fSource': 'Источник', 'q.fPeriod': 'Период',
      'q.publishNow': 'Опубликовать сейчас', 'q.retry': 'Повторить', 'q.edit': 'Изменить', 'q.more': 'Ещё действия: {title}',
      'q.select': 'Выбрать пост «{title}»', 'q.selectDay': 'Выбрать все посты дня', 'q.bulk': 'Действия с выбранными', 'q.selected': 'Выбрано: {n}',
      'q.reschedule': 'Перенести', 'q.pause': 'На паузу', 'q.resume': 'Вернуть в очередь', 'q.del': 'Удалить', 'q.clear': 'Снять выбор',
      'q.noErrors': 'Ошибок нет', 'q.noErrorsHint': 'Все посты уходят по плану. Если что-то сломается, пришлём уведомление.',
      'q.empty': 'Здесь пока пусто', 'q.emptyHint': 'Создайте пост или подключите источник — посты появятся в очереди.', 'q.none': 'Ничего не нашлось',
      'q.noneHint': 'Попробуйте другой текст или сбросьте фильтры.', 'q.reset': 'Сбросить фильтры',
      'q.inTime': 'по расписанию', 'q.manual': 'Вручную', 'q.publishedAt': 'опубликован', 'q.pausedSt': 'на паузе', 'q.route': 'Откуда и куда',
      'q.pubToast': 'пост ушёл бы прямо сейчас', 'q.published': { one: 'Опубликован {n} пост', few: 'Опубликовано {n} поста', many: 'Опубликовано {n} постов', other: 'Опубликовано {n} поста' },
      'q.pausedN': { one: '{n} пост на паузе', few: '{n} поста на паузе', many: '{n} постов на паузе', other: '{n} поста на паузе' },
      'q.resumedN': { one: '{n} пост вернулся в очередь', few: '{n} поста вернулись в очередь', many: '{n} постов вернулись в очередь', other: '{n} поста вернулись в очередь' },
      'q.deletedN': { one: 'Удалён {n} пост', few: 'Удалено {n} поста', many: 'Удалено {n} постов', other: 'Удалено {n} поста' },
      'q.movedN': { one: 'Перенесён {n} пост', few: 'Перенесено {n} поста', many: 'Перенесено {n} постов', other: 'Перенесено {n} поста' },
      'q.delTitle': 'Удалить посты?', 'q.delText': { one: '{n} пост будет удалён из очереди. В соцсетях ничего не изменится.', few: '{n} поста будут удалены из очереди. В соцсетях ничего не изменится.', many: '{n} постов будут удалены из очереди. В соцсетях ничего не изменится.', other: '{n} поста будут удалены из очереди.' },
      'q.moveTitle': 'Перенести публикацию', 'q.moveDate': 'Дата', 'q.moveTime': 'Время', 'q.moveHint': 'Пост выйдет в это время во всех выбранных приёмниках.', 'q.move': 'Перенести',
      'q.thumb': 'Картинка поста', 'q.calEmpty': 'Нет постов',
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
      'demo.text': 'A demo of the new interface. All data is for demonstration only and nothing is saved.',
      'demo.link': 'The real account is at seolit.ru', 'demo.close': 'Hide this notice',
      'demo.toast': 'Demo: in the real SEOlit {what}',
      'demo.short': 'Demo: sample data only.', 'demo.linkShort': 'Real one: seolit.ru',
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
      'prj.title': 'Projects', 'prj.newProject': 'New project',
      'prj.newHint': '800 ₽ per 30 days. One account in every network and unlimited feeds',
      'prj.attention': 'Needs attention', 'prj.attentionN': 'Needs attention: {n}', 'prj.mine': 'My projects', 'prj.shared': 'Shared with me',
      'prj.inQueue': 'queued', 'prj.paused': 'paused', 'prj.open': 'Open', 'prj.post': 'New post',
      'prj.st.ok': 'Active', 'prj.st.demo': 'Trial', 'prj.st.off': 'Disabled',
      'prj.paidUntil': 'Paid until {date}', 'prj.demoUntil': 'Trial until {date}', 'prj.ended': 'Expired {date}',
      'prj.pay': 'Pay 800 ₽', 'prj.renew': 'Renew for 800 ₽',
      'prj.payToast': 'the 800 ₽ payment for 30 days would open',
      'prj.role.editor': 'Editor', 'prj.owner': 'Owner: {email}',
      'prj.newsLbl': 'What’s new', 'prj.allNews': 'All news',
      'prj.tip': 'Tip: create a separate project for each website — queues and billing stay easy to follow.',
      'prj.reconnect': 'Reconnect', 'prj.demoEnds': '{name}: trial ends {when}', 'prj.demoEnds0': 'today', 'prj.demoEnds1': 'tomorrow',
      'prj.errAlert': '{name} · {net}: {text}',
      'prj.netsMore': '+{n}', 'prj.netsAria': 'Project networks',
      'prj.searchNone': 'Nothing found for “{q}”', 'prj.searchHint': 'Search looks at project names and website addresses.', 'prj.searchReset': 'Clear search',
      'prj.newTitle': 'New project', 'prj.newName': 'Name', 'prj.newNamePh': 'For example, Example Store',
      'prj.newSite': 'Website', 'prj.newSitePh': 'example.com', 'prj.newSiteHint': 'Optional. You can add it later in project settings.',
      'prj.newErr': 'Enter a project name', 'prj.create': 'Create', 'prj.created': 'Project “{name}” created — 3-day trial',
      'prj.newText': '800 ₽ per 30 days. The first 3 days are a trial: connect your networks and test autoposting.',
      'prj.empty': 'No projects yet', 'prj.emptyText': 'Create your first project — add a website and the networks to post to.',
      'p.own': { one: '{n} own project', other: '{n} own projects' },
      'p.sharedYou': { one: '{n} shared with you', other: '{n} shared with you' },
      'p.errWord': { one: 'error', other: 'errors' },
      'p.inQueue': { one: '{n} queued', other: '{n} queued' },
      'proj.settings': 'Settings', 'proj.sections': 'Project sections', 'proj.overview': 'Overview', 'proj.sources': 'Sources', 'proj.dests': 'Destinations',
      'proj.queue': 'Queue', 'proj.stats': 'Analytics', 'proj.access': 'Team', 'proj.site': '{site} · {paid}',
      'proj.k1': 'Published · 7 days', 'proj.k1m': 'Published · 7 days', 'proj.k1s': '{d} vs last week', 'proj.k2': 'In queue', 'proj.k2s': 'Next: {when}', 'proj.k2none': 'Queue is empty',
      'proj.k3': 'Paused', 'proj.k3s': 'A destination is turned off', 'proj.k3none': 'Nothing is paused', 'proj.k4': 'Errors', 'proj.k4none': 'Everything works', 'proj.review': 'Review',
      'proj.sourcesHint': 'Where posts come from', 'proj.destsHint': 'Where posts go', 'proj.connect': 'Connect',
      'proj.toggle': 'Turn on or off: {name}', 'proj.find': 'Find an account', 'proj.filter': 'Filter by state',
      'proj.fAll': 'All', 'proj.fErr': 'Errors', 'proj.fOn': 'Active', 'proj.fOff': 'Off',
      'proj.moreSources': 'Show {n} more', 'proj.moreNets': 'More: {n}', 'proj.less': 'Show less', 'proj.groupToggle': 'Show or hide accounts: {name}',
      'proj.justNow': 'Just now', 'proj.fixToast': '“{action}” would open {net}. Let’s say it’s fixed',
      'proj.rowMenu': 'Actions: {name}', 'proj.rowSettings': 'Settings', 'proj.rowQueue': 'Queue for this account', 'proj.rowDelete': 'Delete',
      'proj.delTitle': 'Delete this destination?', 'proj.delSrcTitle': 'Delete this source?', 'proj.delText': '“{name}” will stop receiving this project’s posts. Queued posts for it will be removed.',
      'proj.delSrcText': 'SEOlit will stop taking posts from “{name}”.', 'proj.deleted': 'Deleted: {name}',
      'proj.on': 'Turned on: {name}', 'proj.off': 'Turned off: {name}',
      'proj.noSources': 'No sources yet', 'proj.noSourcesText': 'To publish automatically, connect your website’s RSS feed or a social account.', 'proj.connectSource': 'Connect a source',
      'proj.noDests': 'No destinations yet', 'proj.noDestsText': 'Connect the networks where SEOlit will publish this project’s posts.', 'proj.connectDest': 'Connect a destination',
      'proj.nothing': 'Nothing found', 'proj.view': 'Show', 'proj.back': 'Back to projects',
      'p.works': { one: '{n} active', other: '{n} active' },
      'p.recvs': { one: '{n} destination', other: '{n} destinations' },
      'p.srcs': { one: '{n} source', other: '{n} sources' },
      'conn.title': 'Connect a destination', 'conn.sub': 'Choose the network where SEOlit will publish this project’s posts.',
      'conn.titleSrc': 'Connect a source', 'conn.subSrc': 'Choose where SEOlit will take posts from for this project.',
      'conn.step1': 'Network', 'conn.step2': 'Sign in', 'conn.step3': 'Page or group', 'conn.step1Src': 'Source', 'conn.step2Rss': 'Feed address',
      'conn.search': 'Find a network', 'conn.cats': 'Categories', 'conn.all': 'All', 'conn.social': 'Social', 'conn.msg': 'Messengers', 'conn.blogs': 'Blogs', 'conn.video': 'Video', 'conn.feeds': 'Feeds',
      'conn.included': 'Included in your plan', 'conn.extra': '{n} connected · next one +100 ₽/mo', 'conn.includedShort': 'In your plan', 'conn.extraShort': '+100 ₽/mo',
      'conn.nothing': 'Nothing found. Write to us and we’ll add the network you need.',
      'conn.note': 'Your project plan includes one account in every network. Each extra account is 100 ₽ per 30 days.', 'conn.noteSrc': 'You can connect as many sources as you like — it’s included in the plan.',
      'conn.meta': '* Meta is designated an extremist organization and banned in Russia.',
      'conn.go': 'Continue with {net}', 'conn.pick': 'Choose a network', 'conn.back': 'Back',
      'conn.loginText': 'A {net} sign-in window will open now. Sign in and allow SEOlit to post.', 'conn.loginBtn': 'Sign in to {net}', 'conn.waiting': 'Waiting for sign-in…',
      'conn.pageText': 'Choose where to post:', 'conn.pageTextSrc': 'Choose where to take posts from:', 'conn.add': 'Connect',
      'conn.page1': '{name}', 'conn.page2': '{name} — news', 'conn.page3': 'Test group',
      'conn.rssLabel': 'RSS or Atom feed address', 'conn.rssPh': 'https://example.com/rss', 'conn.rssCheck': 'Check', 'conn.rssErr': 'Enter the feed address',
      'conn.rssToast': 'the feed would be read and checked', 'conn.done': 'Destination connected', 'conn.doneSrc': 'Source connected',
      'net.vkGoods': 'VK products', 'net.rssFeed': 'RSS/Atom feed',
      'q.title': 'Publishing queue', 'q.sub': 'Every post in the project: what goes where, and when', 'q.subAll': 'Posts from all projects: what goes where, and when',
      'q.view': 'View', 'q.list': 'List', 'q.calendar': 'Calendar', 'q.status': 'Status',
      'q.plan': 'Scheduled', 'q.paused': 'Paused', 'q.err': 'Errors', 'q.done': 'Published',
      'q.search': 'Search posts', 'q.allProjects': 'All projects', 'q.allDests': 'All destinations', 'q.allSources': 'All sources',
      'q.week': 'Next 7 days', 'q.weekPast': 'Last 7 days', 'q.anyDate': 'Any date', 'q.filters': 'Filters',
      'q.fProject': 'Project', 'q.fDest': 'Destination', 'q.fSource': 'Source', 'q.fPeriod': 'Period',
      'q.publishNow': 'Publish now', 'q.retry': 'Retry', 'q.edit': 'Edit', 'q.more': 'More actions: {title}',
      'q.select': 'Select “{title}”', 'q.selectDay': 'Select all posts of the day', 'q.bulk': 'Bulk actions', 'q.selected': 'Selected: {n}',
      'q.reschedule': 'Reschedule', 'q.pause': 'Pause', 'q.resume': 'Back to queue', 'q.del': 'Delete', 'q.clear': 'Clear selection',
      'q.noErrors': 'No errors', 'q.noErrorsHint': 'Everything goes out on schedule. We’ll notify you if something breaks.',
      'q.empty': 'Nothing here yet', 'q.emptyHint': 'Create a post or connect a source — posts will show up in the queue.', 'q.none': 'Nothing found',
      'q.noneHint': 'Try other words or reset the filters.', 'q.reset': 'Reset filters',
      'q.inTime': 'on schedule', 'q.manual': 'Manual', 'q.publishedAt': 'published', 'q.pausedSt': 'paused', 'q.route': 'From and to',
      'q.pubToast': 'the post would go out right now', 'q.published': { one: '{n} post published', other: '{n} posts published' },
      'q.pausedN': { one: '{n} post paused', other: '{n} posts paused' },
      'q.resumedN': { one: '{n} post back in the queue', other: '{n} posts back in the queue' },
      'q.deletedN': { one: '{n} post deleted', other: '{n} posts deleted' },
      'q.movedN': { one: '{n} post rescheduled', other: '{n} posts rescheduled' },
      'q.delTitle': 'Delete posts?', 'q.delText': { one: '{n} post will be removed from the queue. Nothing changes in the networks.', other: '{n} posts will be removed from the queue. Nothing changes in the networks.' },
      'q.moveTitle': 'Reschedule', 'q.moveDate': 'Date', 'q.moveTime': 'Time', 'q.moveHint': 'The post goes out at this time in every selected destination.', 'q.move': 'Reschedule',
      'q.thumb': 'Post image', 'q.calEmpty': 'No posts',
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
      'demo.text': 'Жаңа интерфейстің демосы. Деректер демонстрациялық, ештеңе сақталмайды.',
      'demo.link': 'Нағыз кабинет — seolit.ru', 'demo.close': 'Жасыру',
      'demo.toast': 'Демо: нағыз SEOlit-те {what}',
      'demo.short': 'Демо: деректер демонстрациялық.', 'demo.linkShort': 'Нағызы — seolit.ru',
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
      'prj.title': 'Жобалар', 'prj.newProject': 'Жаңа жоба',
      'prj.newHint': '30 күнге 800 ₽. Әр желіде 1 аккаунт және кез келген таспа саны',
      'prj.attention': 'Назар аударыңыз', 'prj.attentionN': 'Назар аударыңыз: {n}', 'prj.mine': 'Менің жобаларым', 'prj.shared': 'Маған қолжетімді',
      'prj.inQueue': 'кезекте', 'prj.paused': 'кідірісте', 'prj.open': 'Ашу', 'prj.post': 'Жаңа жазба',
      'prj.st.ok': 'Жұмыс істеп тұр', 'prj.st.demo': 'Демо', 'prj.st.off': 'Өшірулі',
      'prj.paidUntil': '{date} дейін төленген', 'prj.demoUntil': 'Демо {date} дейін', 'prj.ended': '{date} аяқталды',
      'prj.pay': '800 ₽ төлеу', 'prj.renew': '800 ₽-ге ұзарту',
      'prj.payToast': '30 күнге 800 ₽ төлем ашылар еді',
      'prj.role.editor': 'Редактор', 'prj.owner': 'Иесі: {email}',
      'prj.newsLbl': 'SEOlit жаңалығы', 'prj.allNews': 'Барлық жаңалықтар',
      'prj.tip': 'Кеңес: әр сайтқа жеке жоба ашыңыз — кезек пен төлемді бақылау оңайырақ.',
      'prj.reconnect': 'Қайта қосу', 'prj.demoEnds': '{name}: демо {when} аяқталады', 'prj.demoEnds0': 'бүгін', 'prj.demoEnds1': 'ертең',
      'prj.errAlert': '{name} · {net}: {text}',
      'prj.netsMore': '+{n}', 'prj.netsAria': 'Жоба желілері',
      'prj.searchNone': '«{q}» бойынша ештеңе табылмады', 'prj.searchHint': 'Іздеу жоба атауы мен сайт мекенжайы бойынша жүреді.', 'prj.searchReset': 'Іздеуді тазарту',
      'prj.newTitle': 'Жаңа жоба', 'prj.newName': 'Атауы', 'prj.newNamePh': 'Мысалы, «Мысал» дүкені',
      'prj.newSite': 'Сайт', 'prj.newSitePh': 'example.kz', 'prj.newSiteHint': 'Міндетті емес. Кейін жоба баптауларында көрсетуге болады.',
      'prj.newErr': 'Жоба атауын енгізіңіз', 'prj.create': 'Құру', 'prj.created': '«{name}» жобасы құрылды — 3 күн демо',
      'prj.newText': '30 күнге 800 ₽. Алғашқы 3 күн — демо: желілерді қосып, автопостингті тексеріңіз.',
      'prj.empty': 'Әзірге жоба жоқ', 'prj.emptyText': 'Алғашқы жобаны ашыңыз — сайт пен жариялайтын желілерді қосыңыз.',
      'p.own': { one: '{n} жеке жоба', other: '{n} жеке жоба' },
      'p.sharedYou': { one: '{n} сізге қолжетімді', other: '{n} сізге қолжетімді' },
      'p.errWord': { one: 'қате', other: 'қате' },
      'p.inQueue': { one: '{n} кезекте', other: '{n} кезекте' },
      'proj.settings': 'Баптаулар', 'proj.sections': 'Жоба бөлімдері', 'proj.overview': 'Шолу', 'proj.sources': 'Дереккөздер', 'proj.dests': 'Қабылдағыштар',
      'proj.queue': 'Кезек', 'proj.stats': 'Статистика', 'proj.access': 'Қолжетімділік', 'proj.site': '{site} · {paid}',
      'proj.k1': '7 күнде жарияланды', 'proj.k1m': '7 күнде шықты', 'proj.k1s': 'Өткен аптадан {d}', 'proj.k2': 'Кезекте', 'proj.k2s': 'Келесісі — {when}', 'proj.k2none': 'Кезек бос',
      'proj.k3': 'Кідірісте', 'proj.k3s': 'Қабылдағыш өшірулі', 'proj.k3none': 'Кідірісте ештеңе жоқ', 'proj.k4': 'Қателер', 'proj.k4none': 'Бәрі жұмыс істейді', 'proj.review': 'Қарау',
      'proj.sourcesHint': 'Материал қайдан алынады', 'proj.destsHint': 'Қайда жарияланады', 'proj.connect': 'Қосу',
      'proj.toggle': 'Қосу немесе өшіру: {name}', 'proj.find': 'Аккаунтты табу', 'proj.filter': 'Күйі бойынша сүзгі',
      'proj.fAll': 'Барлығы', 'proj.fErr': 'Қателер', 'proj.fOn': 'Жұмыста', 'proj.fOff': 'Өшірулі',
      'proj.moreSources': 'Тағы {n} көрсету', 'proj.moreNets': 'Тағы {n}', 'proj.less': 'Жию', 'proj.groupToggle': 'Аккаунттарды көрсету немесе жасыру: {name}',
      'proj.justNow': 'Жаңа ғана', 'proj.fixToast': '«{action}» {net} ашар еді. Түзелді деп есептейік',
      'proj.rowMenu': 'Әрекеттер: {name}', 'proj.rowSettings': 'Баптаулар', 'proj.rowQueue': 'Осы аккаунттың кезегі', 'proj.rowDelete': 'Жою',
      'proj.delTitle': 'Қабылдағышты жою керек пе?', 'proj.delSrcTitle': 'Дереккөзді жою керек пе?', 'proj.delText': '«{name}» бұдан былай осы жобаның жазбаларын алмайды. Оған арналған кезектегі жазбалар алынады.',
      'proj.delSrcText': 'SEOlit «{name}» көзінен материал алуды тоқтатады.', 'proj.deleted': 'Жойылды: {name}',
      'proj.on': 'Қосылды: {name}', 'proj.off': 'Өшірілді: {name}',
      'proj.noSources': 'Әзірге дереккөз жоқ', 'proj.noSourcesText': 'Автоматты жариялау үшін сайттың RSS-таспасын немесе әлеуметтік желі аккаунтын қосыңыз.', 'proj.connectSource': 'Дереккөз қосу',
      'proj.noDests': 'Әзірге қабылдағыш жоқ', 'proj.noDestsText': 'SEOlit жоба жазбаларын жариялайтын желілерді қосыңыз.', 'proj.connectDest': 'Қабылдағыш қосу',
      'proj.nothing': 'Ештеңе табылмады', 'proj.view': 'Көрсету', 'proj.back': 'Жобаларға оралу',
      'p.works': { one: '{n} жұмыста', other: '{n} жұмыста' },
      'p.recvs': { one: '{n} қабылдағыш', other: '{n} қабылдағыш' },
      'p.srcs': { one: '{n} дереккөз', other: '{n} дереккөз' },
      'conn.title': 'Қабылдағышты қосу', 'conn.sub': 'SEOlit осы жобаның жазбаларын жариялайтын желіні таңдаңыз.',
      'conn.titleSrc': 'Дереккөз қосу', 'conn.subSrc': 'SEOlit осы жобаға материалды қайдан алатынын таңдаңыз.',
      'conn.step1': 'Желі', 'conn.step2': 'Аккаунтқа кіру', 'conn.step3': 'Бет немесе топ', 'conn.step1Src': 'Дереккөз', 'conn.step2Rss': 'Таспа мекенжайы',
      'conn.search': 'Желіні іздеу', 'conn.cats': 'Санаттар', 'conn.all': 'Барлығы', 'conn.social': 'Әлеуметтік желілер', 'conn.msg': 'Мессенджерлер', 'conn.blogs': 'Блогтар', 'conn.video': 'Бейне', 'conn.feeds': 'Таспалар',
      'conn.included': 'Тарифке кіреді', 'conn.extra': '{n} қосылған · келесісі +100 ₽/ай', 'conn.includedShort': 'Тарифте', 'conn.extraShort': '+100 ₽/ай',
      'conn.nothing': 'Ештеңе табылмады. Бізге жазыңыз — қажетті желіні қосамыз.',
      'conn.note': 'Жоба тарифіне әр желіден 1 аккаунт кіреді. Қосымша аккаунт — 30 күнге 100 ₽.', 'conn.noteSrc': 'Дереккөзді қанша болса да қосуға болады — бұл тарифке кіреді.',
      'conn.meta': '* Meta экстремистік ұйым деп танылған және РФ-та тыйым салынған.',
      'conn.go': 'Жалғастыру: {net}', 'conn.pick': 'Желіні таңдаңыз', 'conn.back': 'Артқа',
      'conn.loginText': 'Қазір {net} кіру терезесі ашылады. Аккаунтқа кіріп, SEOlit-ке жариялауға рұқсат беріңіз.', 'conn.loginBtn': '{net} кіру', 'conn.waiting': 'Кіруді күтудеміз…',
      'conn.pageText': 'Қайда жариялау керегін таңдаңыз:', 'conn.pageTextSrc': 'Материалды қайдан алу керегін таңдаңыз:', 'conn.add': 'Қосу',
      'conn.page1': '{name}', 'conn.page2': '{name} — жаңалықтар', 'conn.page3': 'Сынақ тобы',
      'conn.rssLabel': 'RSS немесе Atom-таспа мекенжайы', 'conn.rssPh': 'https://example.kz/rss', 'conn.rssCheck': 'Тексеру', 'conn.rssErr': 'Таспа мекенжайын енгізіңіз',
      'conn.rssToast': 'таспа оқылып, тексерілер еді', 'conn.done': 'Қабылдағыш қосылды', 'conn.doneSrc': 'Дереккөз қосылды',
      'net.vkGoods': 'ВК-тауарлар', 'net.rssFeed': 'RSS/Atom-таспа',
      'q.title': 'Жариялау кезегі', 'q.sub': 'Жобаның барлық жазбалары: не, қайда және қашан шығады', 'q.subAll': 'Барлық жобалардың жазбалары: не, қайда және қашан шығады',
      'q.view': 'Көрініс', 'q.list': 'Тізім', 'q.calendar': 'Күнтізбе', 'q.status': 'Күйі',
      'q.plan': 'Жоспарланған', 'q.paused': 'Кідірісте', 'q.err': 'Қателер', 'q.done': 'Жарияланған',
      'q.search': 'Жазбаны мәтін бойынша іздеу', 'q.allProjects': 'Барлық жобалар', 'q.allDests': 'Барлық қабылдағыштар', 'q.allSources': 'Барлық дереккөздер',
      'q.week': 'Алдағы 7 күн', 'q.weekPast': 'Соңғы 7 күн', 'q.anyDate': 'Кез келген күн', 'q.filters': 'Сүзгілер',
      'q.fProject': 'Жоба', 'q.fDest': 'Қабылдағыш', 'q.fSource': 'Дереккөз', 'q.fPeriod': 'Кезең',
      'q.publishNow': 'Қазір жариялау', 'q.retry': 'Қайталау', 'q.edit': 'Өзгерту', 'q.more': 'Басқа әрекеттер: {title}',
      'q.select': '«{title}» жазбасын таңдау', 'q.selectDay': 'Күннің барлық жазбасын таңдау', 'q.bulk': 'Таңдалғандармен әрекеттер', 'q.selected': 'Таңдалды: {n}',
      'q.reschedule': 'Ауыстыру', 'q.pause': 'Кідірту', 'q.resume': 'Кезекке қайтару', 'q.del': 'Жою', 'q.clear': 'Таңдауды алу',
      'q.noErrors': 'Қате жоқ', 'q.noErrorsHint': 'Барлық жазба жоспар бойынша шығады. Ақау болса, хабарлаймыз.',
      'q.empty': 'Әзірге бос', 'q.emptyHint': 'Жазба жасаңыз немесе дереккөз қосыңыз — жазбалар кезекте пайда болады.', 'q.none': 'Ештеңе табылмады',
      'q.noneHint': 'Басқа мәтінмен іздеңіз немесе сүзгілерді тазартыңыз.', 'q.reset': 'Сүзгілерді тазарту',
      'q.inTime': 'кесте бойынша', 'q.manual': 'Қолмен', 'q.publishedAt': 'жарияланды', 'q.pausedSt': 'кідірісте', 'q.route': 'Қайдан және қайда',
      'q.pubToast': 'жазба дәл қазір шығар еді', 'q.published': { one: '{n} жазба жарияланды', other: '{n} жазба жарияланды' },
      'q.pausedN': { one: '{n} жазба кідіртілді', other: '{n} жазба кідіртілді' },
      'q.resumedN': { one: '{n} жазба кезекке қайтты', other: '{n} жазба кезекке қайтты' },
      'q.deletedN': { one: '{n} жазба жойылды', other: '{n} жазба жойылды' },
      'q.movedN': { one: '{n} жазба ауыстырылды', other: '{n} жазба ауыстырылды' },
      'q.delTitle': 'Жазбаларды жою керек пе?', 'q.delText': { one: '{n} жазба кезектен жойылады. Желілерде ештеңе өзгермейді.', other: '{n} жазба кезектен жойылады. Желілерде ештеңе өзгермейді.' },
      'q.moveTitle': 'Жариялауды ауыстыру', 'q.moveDate': 'Күні', 'q.moveTime': 'Уақыты', 'q.moveHint': 'Жазба таңдалған барлық қабылдағышта осы уақытта шығады.', 'q.move': 'Ауыстыру',
      'q.thumb': 'Жазба суреті', 'q.calEmpty': 'Жазба жоқ',
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
  const KK_WDL = ['жексенбі', 'дүйсенбі', 'сейсенбі', 'сәрсенбі', 'бейсенбі', 'жұма', 'сенбі'];
  const KK_WD = ['жс', 'дс', 'сс', 'ср', 'бс', 'жм', 'сб'];
  // date(d, 'num') → 18.11.2026 / Nov 18, 2026; 'dm' → 29 октября; 'dmShort' → 29.10; 'wd' → пн, 29; 'time' → 15:30
  const DF = {
    num: (l) => (l === 'en' ? { day: 'numeric', month: 'short', year: 'numeric' } : { day: '2-digit', month: '2-digit', year: 'numeric' }),
    dm: () => ({ day: 'numeric', month: 'long' }),
    dmShort: () => ({ day: '2-digit', month: '2-digit' }),
    wd: () => ({ weekday: 'short', day: 'numeric' }),
    wdl: () => ({ weekday: 'long' }),
    time: () => ({ hour: '2-digit', minute: '2-digit', hour12: false }),
  };
  function date(d, f = 'num') {
    d = d instanceof Date ? d : new Date(d);
    if (lang === 'kk' && f === 'dm') return d.getDate() + ' ' + KK_M[d.getMonth()];
    if (lang === 'kk' && f === 'wdl') return KK_WDL[d.getDay()];
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
