/* SEOlit, демо-кабинет — вымышленные данные. Даты считаются от сегодняшнего дня, чтобы демо не устаревало.
   Действия посетителя (новый пост, выключенный приёмник…) живут в sessionStorage['seolit-demo'] до закрытия вкладки. */
(() => {
  'use strict';

  const KEY = 'seolit-demo';
  const L = (ru, en, kk) => ({ ru, en, kk });
  const D0 = new Date(); D0.setHours(0, 0, 0, 0);
  // at(дней от сегодня, ч, мин) → отметка времени
  const at = (d, h = 0, m = 0) => new Date(D0.getFullYear(), D0.getMonth(), D0.getDate() + d, h, m).getTime();

  /* ---------- Пользователь ---------- */
  const user = { email: 'anna@example.ru', balance: 4300, months: 5 };

  /* ---------- Проекты: 4 своих + 1 чужой ---------- */
  // st: ok — работает, err — есть ошибки, demo — пробный период, off — отключён. until — оплачен до, period — дней в периоде,
  // published — сколько постов вышло раньше (к ним добавляются опубликованные из очереди). Очередь, пауза и ошибки считаются по постам.
  // week — опубликовано по дням за последние 7 дней (спарклайн), weekPrev — за неделю до этого, team — людей с доступом.
  const projects = [
    { id: 'shop', name: L('Магазин «Пример»', 'Example Store', '«Мысал» дүкені'), site: 'example.ru', st: 'ok',
      nets: ['vk', 'tg', 'ok', 'mm', 'pi', 'in', 'x', 'tu', 'lj', 'tt', 'bl', 're', 'max', 'ig'], published: 1201, week: [16, 18, 21, 19, 22, 23, 23], weekPrev: 124, team: 3,
      until: at(20), period: 30, own: true },
    { id: 'news', name: L('Новости района', 'Neighborhood News', 'Аудан жаңалықтары'), site: 'news-rayon.ru', st: 'err',
      nets: ['vk', 'tg', 'x'], published: 640, week: [9, 10, 8, 11, 9, 10, 8], weekPrev: 61, team: 2, until: at(86), period: 93, own: true },
    { id: 'travel', name: L('test 2', 'test 2', 'test 2'), site: 'seolit.ru', st: 'demo', real: true,
      nets: ['tg'], published: 0, week: [0, 0, 0, 0, 1, 2, 1], weekPrev: 0, team: 1, until: at(1, 10, 4), period: 3, own: true },
    { id: 'cook', name: L('Кулинарный канал', 'Cooking Channel', 'Аспаздық арна'), site: 'cook.ru', st: 'off',
      nets: ['vk', 'ok'], published: 312, week: [0, 0, 0, 0, 0, 0, 0], weekPrev: 6, team: 1, until: at(-14), period: 30, own: true },
    { id: 'signal', name: L('test123', 'test123', 'test123'), site: 'seolit.ru', st: 'ok', real: true,
      nets: ['vk'], published: 2210, week: [30, 28, 35, 31, 33, 29, 34], weekPrev: 215, team: 5, until: at(41), period: 30, own: false,
      role: 'editor', owner: 'ivan@example.ru' },
  ];

  // Реальные проекты со скриншотов кабинета seolit.ru (docs/real_projects): названия, аккаунты и состояния — как там
  projects.splice(1, 0,
    { id: 'srt', name: L('seolit_ru test', 'seolit_ru test', 'seolit_ru test'), site: 'seolit.ru', st: 'ok', real: true,
      nets: [], published: 5120, week: [21, 17, 24, 19, 26, 22, 25], weekPrev: 141, team: 4, pausedExtra: 2558,
      until: at(20, 9, 55), period: 30, own: true },
    { id: 'tgs', name: L('Телеграм Сеолит', 'Телеграм Сеолит', 'Телеграм Сеолит'), site: 'seolit.ru', st: 'ok', real: true,
      nets: ['tg'], published: 860, week: [3, 2, 4, 3, 2, 3, 4], weekPrev: 19, team: 2, until: at(20, 12, 0), period: 30, own: true });
  projects.splice(projects.findIndex((p) => p.id === 'cook') + 1, 0,
    { id: 'fbsrc', name: L('фб источник', 'фб источник', 'фб источник'), site: 'seolit.ru', st: 'off', real: true,
      nets: ['tg'], published: 54, week: [0, 0, 0, 0, 0, 0, 0], weekPrev: 0, team: 1, until: at(-279, 10, 44), period: 30, own: true });

  // Подпись строки аккаунта из частей, как в кабинете seolit.ru: дата, «чтение отключено», «в паузе: N»…
  const W = {
    off: L('чтение отключено', 'reading off', 'оқу өшірулі'), empty: L('очередь пуста', 'queue empty', 'кезек бос'),
    never: L('не было публикаций', 'no posts yet', 'жарияланым болмаған'), noread: L('не было обращений', 'never read', 'оқылмаған'),
    now: L('только что', 'just now', 'жаңа ғана'), pubOff: L('публикация отключена', 'posting off', 'жариялау өшірулі'),
    seen: L('замечены ошибки', 'errors spotted', 'қателер байқалды'), err: L('серьёзная ошибка', 'serious error', 'елеулі қате'),
  };
  const RM = (...parts) => {
    const one = (p, l) => {
      if (typeof p === 'string') return W[p] ? W[p][l] : p;
      const [k, n] = p;
      return { p: { ru: `в паузе: ${n}`, en: `paused: ${n}`, kk: `кідірісте: ${n}` }, q: { ru: `в очереди: ${n}`, en: `queued: ${n}`, kk: `кезекте: ${n}` },
        m: { ru: `${n} мин назад`, en: `${n} min ago`, kk: `${n} мин бұрын` }, h: { ru: `${n} ч назад`, en: `${n} h ago`, kk: `${n} сағ бұрын` },
        d: { ru: `${n} дн. назад`, en: `${n} days ago`, kk: `${n} күн бұрын` }, r: { ru: `чтение через ${n} мин`, en: `next read in ${n} min`, kk: `${n} мин кейін оқу` } }[k][l];
    };
    const o = {};
    ['ru', 'en', 'kk'].forEach((l) => { const t = parts.map((p) => one(p, l)).join(', '); o[l] = t.charAt(0).toUpperCase() + t.slice(1); });
    return o;
  };
  const FIX = L('Переподключить', 'Reconnect', 'Қайта қосу');
  // [проект, соцсеть, название, состояние, ...части подписи]
  const REAL_SRC = [
    ['tgs', 'rss', 'Новости проекта', 'on', ['m', 27], ['r', 2], 'empty'], ['tgs', 'rss', 'HowTo rss', 'on', ['m', 28], ['r', 2], 'empty'],
    ['signal', 'tu', 'Мой Tumblr', 'on', ['m', 27], ['r', 2], ['p', 76]], ['signal', 'vk', 'Мой VK (товары)', 'err', 'err', 'off', 'empty', 'seen'], ['signal', 'vk', '123', 'off', '12.07.2017', 'off', 'empty'],
    ['fbsrc', 'fb', 'Facebook Seolit', 'err', 'err', 'off', ['p', 111]],
    ['srt', 'rss', 'Мой RSS/ATOM Youtube', 'off', '27.05.2022', 'off', 'empty'], ['srt', 'fb', 'Facebook Seolit', 'err', 'err', 'off', ['p', 111]],
    ['srt', 'fb', 'Мой Facebook', 'off', '28.01.2020', 'off', 'empty'], ['srt', 'ig', 'InstaFeed2', 'off', '19.10.2017', 'off', 'empty'],
    ['srt', 'ig', 'fitstarstv', 'off', '27.05.2022', 'off', ['p', 10], 'seen'], ['srt', 'ig', 'shop_odegda_genskaya', 'off', '02.04.2021', 'off', ['p', 20], 'seen'],
    ['srt', 'ig', 'video.prikol', 'off', '20.04.2021', 'off', ['p', 125]], ['srt', 'rss', 'Seolit News', 'off', '16.02.2022', 'off', ['p', 9]],
    ['srt', 'rss', 'https://newspik.ru/feed/rss2/', 'off', '12.11.2020', 'off', 'empty'], ['srt', 'rss', 'rss 1 new1', 'off', '15.03.2018', 'off', 'empty'],
    ['srt', 'rss', 'rss domguru 2', 'off', 'noread', 'off', 'empty'], ['srt', 'rss', 'Брянск', 'off', '15.03.2018', 'off', 'empty'],
    ['srt', 'tg', 'Мой Telegram. Test123', 'on', 'now', ['r', 29], ['p', 2]], ['srt', 'tt', 'Мой TikTok', 'off', 'noread', 'off', 'empty'],
    ['srt', 'vk', 'КВН', 'off', '04.04.2022', 'off', 'empty'], ['srt', 'yt', 'Мой Youtube', 'off', '02.04.2021', 'off', ['p', 17]],
    ['srt', 'yt', 'Мой Youtube 2', 'off', '28.02.2020', 'off', ['p', 10]], ['srt', 'vk', 'Калинина Мария', 'off', '21.05.2019', 'off', 'empty'],
    ['srt', 'vk', 'Мой VK (товары)', 'off', '02.04.2021', 'off', ['p', 226]], ['srt', 'vk', 'SMM MEDIA Test', 'off', '17.12.2021', 'off', 'empty'],
    ['srt', 'vk', 'SMM-тусовочка', 'err', 'err', 'off', 'empty', 'seen'], ['srt', 'vk', 'Видео-приколы', 'off', '29.04.2019', 'off', ['p', 99]],
    ['srt', 'vk', 'ВК исходник', 'off', '24.11.2018', 'off', ['p', 4]], ['srt', 'vk', 'Из тестовой группы', 'off', '20.12.2018', 'off', 'empty'],
    ['srt', 'vk', 'Мой Вконтакте альбом', 'err', 'err', 'off', ['p', 1]], ['srt', 'vk', 'право-на-руль', 'off', '24.04.2019', 'off', ['p', 377]],
    ['srt', 'vk', 'Свой акк', 'off', 'noread', 'off', 'empty'], ['srt', 'vk', 'Сланди', 'off', '20.06.2019', 'off', ['p', 1]],
    ['srt', 'vk', 'Тёркин (товары)', 'off', '25.09.2019', 'off', 'empty'], ['srt', 'vk', 'Удачные гифки', 'err', 'err', 'off', ['p', 1471], 'seen'],
    ['srt', 'vk', 'Чей-то ЛК', 'off', '06.05.2019', 'off', 'empty'], ['srt', 'vk', 'Эксперименты', 'on', ['m', 2], ['r', 12], 'empty'],
    ['srt', 'vk', 'Эксперименты 2', 'err', 'err', 'off', 'empty', 'seen'], ['srt', 'ok', 'Мой Одноклассники', 'err', 'err', 'off', 'empty', 'seen'],
  ];
  const REAL_DST = [
    ['tgs', 'tg', 'Мой Telegram', 'on', ['h', 8], 'empty'], ['travel', 'tg', 'Мой Telegram', 'on', ['h', 8], 'empty'], ['fbsrc', 'tg', 'Мой Telegram', 'off', 'never', 'empty'],
    ['signal', 'vk', '123', 'err', 'err', ['q', 36], ['p', 76], 'pubOff', 'seen'],
    ['srt', 'fb', 'Facebook TestСтраница', 'err', 'err', ['q', 2], 'pubOff'], ['srt', 'fb', 'Facebook Группа, просто группа', 'off', '13.03.2019', 'empty'],
    ['srt', 'fb', 'Мой Facebook (test user, test group)', 'off', 'never', ['p', 12]], ['srt', 'ig', 'academia_sporta10', 'off', 'never', 'empty'],
    ['srt', 'ig', 'safhome', 'err', 'err', ['q', 1], ['p', 308], 'pubOff', 'seen'], ['srt', 'ig', 'safwork1', 'off', 'never', 'empty'],
    ['srt', 'ig', 'Мой Instagram', 'off', 'never', 'empty'], ['srt', 'in', 'LiTest4', 'off', '18.02.2019', ['p', 230]],
    ['srt', 'in', 'safhome v2', 'off', '22.02.2019', ['p', 100]], ['srt', 'lj', 'LJ 1', 'off', '25.01.2019', ['p', 2]],
    ['srt', 'lj', 'Мой Livejournal saf_test', 'off', 'never', 'empty'], ['srt', 'max', 'Мой Max.ru', 'off', 'never', 'empty'],
    ['srt', 'max', 'Мой Max.ru тест 3', 'off', 'never', 'empty'], ['srt', 'pi', 'Pinterest-Tests', 'off', '05.03.2021', ['p', 18]],
    ['srt', 'pi', 'TestPi 2', 'off', '13.03.2017', 'empty'], ['srt', 'pi', 'Мой Pinterest', 'off', 'never', 'empty'],
    ['srt', 're', 'Мой Reddit', 'off', 'never', 'empty'], ['srt', 'tg', 'TeleTest', 'off', '04.04.2023', ['p', 209]],
    ['srt', 'tg', 'Группа Telegram', 'off', '27.12.2022', 'empty', 'seen'], ['srt', 'tt', 'Мой TikTok', 'off', 'never', 'empty'],
    ['srt', 'tt', 'Мой TikTok 2', 'off', 'never', 'empty'], ['srt', 'tu', 'Мой Tumblr', 'off', 'never', ['p', 215]],
    ['srt', 'x', '2915113595', 'off', 'never', 'empty'], ['srt', 'x', 'Seolit Publisher', 'off', 'never', 'empty'],
    ['srt', 'x', 'Twitter Safhome new', 'off', '06.05.2021', 'empty'], ['srt', 'x', 'Twitter Seolit', 'off', '21.06.2018', 'empty'],
    ['srt', 'x', 'Twitter saf', 'off', '14.01.2020', ['p', 109]], ['srt', 'x', 'Мой Twitter 2', 'off', 'never', 'empty'],
    ['srt', 'vk', 'Test123', 'on', '30.01.2021', ['q', 19], ['p', 143]], ['srt', 'vk', 'safhome', 'off', '06.05.2019', ['p', 99], 'seen'],
    ['srt', 'vk', 'ВК страница', 'off', 'never', 'empty'], ['srt', 'vk', 'Мой Вконтакте', 'on', '03.04.2019', ['q', 3], ['p', 2]],
    ['srt', 'vk', 'Мой Вконтакте 2', 'off', 'never', 'empty'], ['srt', 'vk', 'Мой Вконтакте test', 'on', ['d', 24], 'empty', 'seen'],
    ['srt', 'vk', 'Мой Вконтакте альбом', 'off', '01.03.2019', 'empty'], ['srt', 'vk', 'тест-группа', 'on', '25.09.2019', ['q', 1], ['p', 690]],
    ['srt', 'vk', 'Эксперименты', 'on', ['d', 24], 'empty'], ['srt', 'mm', '123', 'off', 'never', 'empty'],
    ['srt', 'mm', 'Мой Мой мир', 'off', 'never', 'empty'], ['srt', 'ok', 'Мой Одноклассники', 'off', '02.11.2017', 'empty'],
    ['srt', 'ok', 'Мой Одноклассники 2', 'off', '01.11.2017', ['p', 1], 'seen'], ['srt', 'ok', 'Мой Одноклассники (альбом)', 'off', '31.01.2020', ['p', 359]],
    ['srt', 'ok', 'Мой Одноклассники (тестовая группа)', 'on', '08.09.2020', ['q', 2]],
  ];
  const realRow = ([p, net, name, st, ...parts]) => ({ p, net, st, name: L(name, name, name), meta: RM(...parts), ...(st === 'err' ? { fix: FIX } : {}) });

  /* ---------- Источники (откуда брать) ---------- */
  const ago = (m) => L(`${m} мин назад`, `${m} min ago`, `${m} мин бұрын`);
  const sources = [
    { id: 's1', p: 'shop', net: 'rss', name: L('example.ru/news', 'example.ru/news', 'example.ru/news'), st: 'on', meta: L('Чтение через 2 мин · очередь пуста', 'Next read in 2 min · queue empty', '2 мин кейін оқу · кезек бос') },
    { id: 's2', p: 'shop', net: 'rss', name: L('example.ru/blog', 'example.ru/blog', 'example.ru/blog'), st: 'on', meta: L('29 мин назад · 4 в очереди', '29 min ago · 4 queued', '29 мин бұрын · 4 кезекте') },
    { id: 's3', p: 'shop', net: 'vk', name: L('Группа «Пример»', 'Example group', '«Мысал» тобы'), st: 'err', meta: L('Нужно заново войти в аккаунт', 'Sign in again to keep reading', 'Аккаунтқа қайта кіру қажет'), fix: L('Переподключить', 'Reconnect', 'Қайта қосу') },
    { id: 's4', p: 'shop', net: 'yt', name: L('Канал магазина', 'Store channel', 'Дүкен арнасы'), st: 'on', meta: L('Вчера · очередь пуста', 'Yesterday · queue empty', 'Кеше · кезек бос') },
    { id: 's5', p: 'shop', net: 'tt', name: L('@example_store', '@example_store', '@example_store'), st: 'err', meta: L('Ссылка устарела', 'Feed link expired', 'Сілтеме ескірген'), fix: L('Обновить', 'Update', 'Жаңарту') },
    { id: 's6', p: 'shop', net: 'tg', name: L('Канал «Новинки»', 'New arrivals channel', '«Жаңалықтар» арнасы'), st: 'off', meta: L('Чтение выключено', 'Reading is off', 'Оқу өшірулі') },
    { id: 's7', p: 'shop', net: 'rss', name: L('example.ru/sale', 'example.ru/sale', 'example.ru/sale'), st: 'on', meta: ago(14) },
    { id: 's8', p: 'shop', net: 'rss', name: L('example.ru/reviews', 'example.ru/reviews', 'example.ru/reviews'), st: 'on', meta: L('Сегодня 09:10 · 2 в очереди', 'Today 09:10 · 2 queued', 'Бүгін 09:10 · 2 кезекте') },
    { id: 's9', p: 'shop', net: 'vk', name: L('ВК-товары «Пример»', 'Example VK products', '«Мысал» ВК-тауарлары'), st: 'on', meta: ago(52) },
    { id: 's10', p: 'shop', net: 'ok', name: L('Группа «Пример»', 'Example group', '«Мысал» тобы'), st: 'on', meta: L('Вчера · очередь пуста', 'Yesterday · queue empty', 'Кеше · кезек бос') },
    { id: 's11', p: 'shop', net: 'tu', name: L('example-store.tumblr.com', 'example-store.tumblr.com', 'example-store.tumblr.com'), st: 'off', meta: L('Чтение выключено', 'Reading is off', 'Оқу өшірулі') },
    { id: 's12', p: 'shop', net: 'bl', name: L('Блог магазина', 'Store blog', 'Дүкен блогы'), st: 'on', meta: ago(35) },
    { id: 's13', p: 'shop', net: 'rss', name: L('example.ru/video', 'example.ru/video', 'example.ru/video'), st: 'off', meta: L('Чтение выключено', 'Reading is off', 'Оқу өшірулі') },
    { id: 's14', p: 'shop', net: 'tg', name: L('Канал «Скидки»', 'Deals channel', '«Жеңілдіктер» арнасы'), st: 'on', meta: ago(8) },
    { id: 's15', p: 'news', net: 'rss', name: L('news-rayon.ru/rss', 'news-rayon.ru/rss', 'news-rayon.ru/rss'), st: 'on', meta: ago(6) },
    { id: 's16', p: 'cook', net: 'rss', name: L('cook.ru/feed', 'cook.ru/feed', 'cook.ru/feed'), st: 'off', meta: L('Проект отключён', 'Project is disabled', 'Жоба өшірулі') },
  ];

  /* ---------- Приёмники (куда публиковать) ---------- */
  // Магазин: 62 аккаунта — 4 с ошибкой, 18 работают, 40 выключены. Первые строки — из макета, остальные дописаны до этих чисел.
  const OFF = L('Выключен', 'Off', 'Өшірулі');
  const receivers = [
    { p: 'shop', net: 'vk', st: 'err', name: L('Сообщество скидок', 'Deals community', 'Жеңілдіктер қауымдастығы'), meta: L('Нет прав на публикацию', 'No permission to post', 'Жариялау құқығы жоқ'), fix: L('Проверить права', 'Check access', 'Құқықты тексеру') },
    { p: 'shop', net: 'vk', st: 'on', name: L('Страница магазина', 'Store page', 'Дүкен беті'), meta: L('Сегодня 12:40 · 4 в очереди', 'Today 12:40 · 4 queued', 'Бүгін 12:40 · 4 кезекте') },
    { p: 'shop', net: 'vk', st: 'on', name: L('Группа «Пример»', 'Example group', '«Мысал» тобы'), meta: ago(5) },
    { p: 'shop', net: 'vk', st: 'off', name: L('Архив 2019', 'Archive 2019', '2019 мұрағаты'), meta: L('Выключен · 1 на паузе', 'Off · 1 paused', 'Өшірулі · 1 кідірісте') },
    { p: 'shop', net: 'tg', st: 'err', name: L('Чат покупателей', 'Customers chat', 'Сатып алушылар чаты'), meta: L('Бота удалили из чата', 'The bot was removed from the chat', 'Бот чаттан шығарылды'), fix: L('Добавить бота', 'Add the bot', 'Ботты қосу') },
    { p: 'shop', net: 'tg', st: 'on', name: L('Канал магазина', 'Store channel', 'Дүкен арнасы'), meta: ago(3) },
    { p: 'shop', net: 'tg', st: 'off', name: L('Тестовый канал', 'Test channel', 'Сынақ арнасы'), meta: OFF },
    { p: 'shop', net: 'ok', st: 'on', name: L('Группа «Пример»', 'Example group', '«Мысал» тобы'), meta: ago(18) },
    { p: 'shop', net: 'ok', st: 'off', name: L('Альбом товаров', 'Product album', 'Тауар альбомы'), meta: L('Выключен · 2 на паузе', 'Off · 2 paused', 'Өшірулі · 2 кідірісте') },
    { p: 'shop', net: 'x', st: 'err', name: L('@example_store', '@example_store', '@example_store'), meta: L('Превышен дневной лимит соцсети', 'Daily network limit reached', 'Желінің күндік лимиті асты'), fix: L('Настроить лимит', 'Set a limit', 'Лимитті баптау') },
    { p: 'shop', net: 'x', st: 'off', name: L('@example_sale', '@example_sale', '@example_sale'), meta: OFF },
    { p: 'shop', net: 'pi', st: 'err', name: L('Доска «Идеи»', 'Ideas board', '«Идеялар» тақтасы'), meta: L('Доска удалена в Pinterest', 'Board was deleted in Pinterest', 'Тақта Pinterest-те жойылды'), fix: L('Выбрать доску', 'Pick a board', 'Тақтаны таңдау') },
    { p: 'shop', net: 'pi', st: 'on', name: L('Доска «Новинки»', 'New arrivals board', '«Жаңалар» тақтасы'), meta: ago(40) },
    { p: 'shop', net: 'mm', st: 'on', name: L('Страница магазина', 'Store page', 'Дүкен беті'), meta: ago(12) },
  ];
  // Дописываем магазин до 62: [соцсеть, всего в группе, из них работают (сверх строк макета)]
  [['vk', 9, 0], ['tg', 4, 0], ['ok', 6, 1], ['x', 8, 0], ['pi', 5, 0], ['mm', 3, 0], ['in', 4, 2], ['tu', 3, 1],
   ['lj', 3, 1], ['tt', 4, 2], ['bl', 3, 1], ['re', 3, 1], ['max', 4, 2], ['ig', 3, 1]].forEach(([net, total, on]) => {
    let have = receivers.filter((r) => r.net === net).length;
    for (let k = have + 1; k <= total; k++, on--) {
      receivers.push({ p: 'shop', net, st: on > 0 ? 'on' : 'off',
        name: L(`Страница ${k}`, `Page ${k}`, `${k}-бет`), meta: on > 0 ? ago(7 + k * 9) : OFF });
    }
  });
  receivers.push(
    { p: 'news', net: 'vk', st: 'err', name: L('Новости района', 'Neighborhood News', 'Аудан жаңалықтары'), meta: L('Нужна повторная авторизация', 'Sign in again to keep posting', 'Қайта авторизация қажет'), fix: L('Переподключить', 'Reconnect', 'Қайта қосу') },
    { p: 'news', net: 'tg', st: 'on', name: L('Канал района', 'District channel', 'Аудан арнасы'), meta: ago(9) },
    { p: 'news', net: 'x', st: 'err', name: L('@news_rayon', '@news_rayon', '@news_rayon'), meta: L('Превышен дневной лимит соцсети', 'Daily network limit reached', 'Желінің күндік лимиті асты'), fix: L('Настроить лимит', 'Set a limit', 'Лимитті баптау') },
    { p: 'cook', net: 'vk', st: 'off', name: L('Кулинарный канал', 'Cooking Channel', 'Аспаздық арна'), meta: L('Проект отключён', 'Project is disabled', 'Жоба өшірулі') },
    { p: 'cook', net: 'ok', st: 'off', name: L('Рецепты на каждый день', 'Everyday recipes', 'Күнделікті рецепттер'), meta: L('Проект отключён', 'Project is disabled', 'Жоба өшірулі') },
  );
  REAL_SRC.forEach((x, i) => sources.push({ id: 'sr' + (i + 1), ...realRow(x) }));
  REAL_DST.forEach((x) => receivers.push(realRow(x)));
  receivers.forEach((r, i) => { r.id = 'r' + (i + 1); });
  // Соцсети проекта без списка — по его приёмникам
  projects.forEach((p) => { if (!p.nets.length) p.nets = [...new Set(receivers.filter((r) => r.p === p.id).map((r) => r.net))]; });

  /* ---------- Очередь ---------- */
  // st: plan — запланирован, paused — на паузе, err — ошибка, done — опубликован. src: соцсеть-источник или man — вручную.
  const P = (id, p, d, h, m, src, dests, more, title, text, st = 'plan', thumb = id) =>
    ({ id: 'q' + id, p, at: at(d, h, m), src, dests, more, title, text, st, thumb: thumb % 6, tags: [], link: '' });
  const posts = [
    P(1, 'shop', 0, 15, 30, 'rss', ['vk', 'tg', 'ok'], 3, L('Новинки недели в каталоге', 'This week’s new arrivals', 'Каталогтағы апта жаңалықтары'), L('Собрали 12 новых товаров: от уютных пледов до техники для кухни', '12 new products, from cosy blankets to kitchen gadgets', 'Жылы пледтерден ас үй техникасына дейін 12 жаңа тауар')),
    P(2, 'shop', 0, 18, 0, 'rss', ['vk', 'mm', 'pi'], 0, L('Как выбрать подарок и не ошибиться', 'How to pick a gift that lands', 'Сыйлықты қателеспей қалай таңдау керек'), L('7 идей для близких и коллег — с ценами и ссылками', '7 ideas for family and colleagues, with prices and links', 'Жақындар мен әріптестерге 7 идея — бағасы мен сілтемесімен')),
    P(3, 'shop', 0, 20, 15, 'vk', ['tg', 'x'], 0, L('Отзыв покупателя недели', 'Customer review of the week', 'Аптаның сатып алушы пікірі'), L('«Заказала в пятницу, в субботу уже пользовалась»', '“Ordered on Friday, using it by Saturday”', '«Жұмада тапсырыс бердім, сенбіде қолдандым»')),
    P(4, 'shop', 1, 10, 0, 'man', ['vk', 'tg', 'ok', 'in'], 0, L('Акция выходного дня', 'Weekend sale', 'Демалыс күнгі акция'), L('Скидка 15% на всё до воскресенья', '15% off everything until Sunday', 'Жексенбіге дейін бәріне 15% жеңілдік')),
    P(5, 'shop', 1, 12, 30, 'rss', ['vk', 'tg'], 0, L('Свежий кейс в блоге', 'New case study on the blog', 'Блогтағы жаңа кейс'), L('Как кофейня увеличила продажи через соцсети', 'How a coffee shop grew sales through social media', 'Кофехана әлеуметтік желі арқылы сатылымды қалай арттырды')),
    P(6, 'shop', 1, 19, 0, 'yt', ['tg', 'vk', 'ok'], 0, L('Обзор новой модели', 'New model review', 'Жаңа модельге шолу'), L('Видео: показываем все режимы за 4 минуты', 'Video: every mode in 4 minutes', 'Бейне: барлық режим 4 минутта')),
    P(7, 'news', 0, 16, 45, 'rss', ['tg', 'vk'], 0, L('На Садовой откроют новый сквер', 'A new square opens on Sadovaya Street', 'Садовая көшесінде жаңа сквер ашылады'), L('Работы закончат к концу месяца, внутри — детская площадка и скамейки', 'Works end by the end of the month: a playground and benches inside', 'Жұмыс ай соңына дейін аяқталады: ішінде балалар алаңы мен орындықтар')),
    P(8, 'news', 1, 9, 0, 'rss', ['tg', 'vk', 'x'], 0, L('Расписание автобусов на выходные', 'Weekend bus timetable', 'Демалыс күнгі автобус кестесі'), L('Маршруты 12 и 34 будут ходить реже — публикуем новое расписание', 'Routes 12 and 34 will run less often — here is the new timetable', '12 және 34 бағыттары сирек жүреді — жаңа кестені жариялаймыз')),
    P(9, 'shop', 2, 11, 0, 'rss', ['vk', 'tg', 'ok', 'pi'], 2, L('Пледы: как выбрать по составу', 'Blankets: choosing by fabric', 'Пледтер: құрамы бойынша қалай таңдау керек'), L('Шерсть, хлопок или флис — разбираем плюсы каждого', 'Wool, cotton or fleece — the upside of each', 'Жүн, мақта әлде флис — әрқайсысының артықшылығы')),
    P(10, 'shop', 2, 14, 0, 'man', ['vk', 'ok'], 0, L('Розыгрыш среди подписчиков', 'Giveaway for followers', 'Жазылушылар арасында ұтыс'), L('Разыгрываем три сертификата на 3 000 ₽ — условия внутри', 'Three 3,000 ₽ gift cards up for grabs — details inside', '3 000 ₽-лік үш сертификат ойнатамыз — шарттары ішінде')),
    P(11, 'shop', 2, 17, 30, 'rss', ['tg', 'mm'], 0, L('Как ухаживать за техникой для кухни', 'Caring for kitchen gadgets', 'Ас үй техникасын қалай күту керек'), L('Пять простых правил, чтобы блендер прослужил дольше', 'Five simple rules to keep your blender going', 'Блендер ұзақ қызмет етуі үшін бес қарапайым ереже')),
    P(12, 'news', 2, 8, 30, 'rss', ['tg', 'vk'], 0, L('Погода на неделю', 'Weather for the week', 'Апталық ауа райы'), L('Ждём потепления до +12 и короткие дожди в среду', 'Warming up to +12 with short showers on Wednesday', '+12-ге дейін жылыну және сәрсенбіде қысқа жаңбыр')),
    P(13, 'signal', 1, 13, 0, 'man', ['vk', 'tg', 'in'], 0, L('Кейс агентства: запуск за неделю', 'Agency case: launch in a week', 'Агенттік кейсі: бір аптада іске қосу'), L('Как мы подключили 40 аккаунтов клиента за пять дней', 'How we connected 40 client accounts in five days', 'Клиенттің 40 аккаунтын бес күнде қалай қостық')),
    P(14, 'shop', 1, 16, 0, 'rss', ['vk', 'tg'], 0, L('Подборка к выходным', 'Weekend picks', 'Демалысқа арналған таңдау'), L('Что взять с собой на дачу: 9 товаров до 1 000 ₽', 'What to take to the country house: 9 items under 1,000 ₽', 'Саяжайға не алу керек: 1 000 ₽-ге дейінгі 9 тауар'), 'paused'),
    P(15, 'shop', 2, 10, 0, 'rss', ['vk', 'ok'], 0, L('Старая коллекция со скидкой', 'Last season on sale', 'Ескі коллекция жеңілдікпен'), L('Распродажа остатков: скидки до 40%', 'Clearance: up to 40% off', 'Қалдықтарды сату: 40%-ға дейін жеңілдік'), 'paused'),
    P(16, 'shop', 2, 21, 0, 'yt', ['tg'], 0, L('Как мы упаковываем заказы', 'How we pack your orders', 'Тапсырыстарды қалай орайтынымыз'), L('Короткое видео со склада', 'A short video from our warehouse', 'Қоймадан қысқа бейне'), 'paused'),
    P(17, 'shop', -1, 9, 0, 'rss', ['vk', 'tg', 'ok'], 3, L('Новинки недели в каталоге', 'This week’s new arrivals', 'Каталогтағы апта жаңалықтары'), L('Восемь новых товаров для дома', 'Eight new products for your home', 'Үйге арналған сегіз жаңа тауар'), 'done'),
    P(18, 'shop', -1, 12, 40, 'rss', ['vk', 'mm', 'pi'], 0, L('Как выбрать плед', 'How to pick a blanket', 'Пледті қалай таңдау керек'), L('Короткий гид по размерам и материалам', 'A short guide to sizes and fabrics', 'Өлшемдер мен материалдар бойынша қысқа нұсқаулық'), 'done'),
    P(19, 'shop', -1, 16, 10, 'vk', ['tg', 'x'], 0, L('Отзыв покупателя', 'Customer review', 'Сатып алушы пікірі'), L('«Доставили за день, всё целое»', '“Delivered in a day, all intact”', '«Бір күнде жеткізді, бәрі бүтін»'), 'done'),
    P(20, 'news', -1, 19, 30, 'rss', ['tg', 'vk'], 0, L('Ярмарка в субботу', 'Saturday fair', 'Сенбідегі жәрмеңке'), L('Фермерские продукты на площади с 10:00', 'Farm produce on the square from 10:00', 'Алаңда 10:00-ден фермерлік өнімдер'), 'done'),
  ];
  // Дописываем очередь до чисел на карточках проектов: [в очереди, на паузе, с ошибкой]. Тексты — по кругу из пула проекта.
  const POOL = {
    cook: [
      [L('Суп-пюре из тыквы за 30 минут', 'Pumpkin soup in 30 minutes', '30 минутта асқабақ сорпасы'), L('Пошаговый рецепт с фото', 'Step-by-step recipe with photos', 'Суреттері бар қадамдық рецепт')],
      [L('Что приготовить на ужин', 'What to cook for dinner', 'Кешкі асқа не дайындау керек'), L('Пять быстрых блюд из того, что есть дома', 'Five quick dishes from what you have at home', 'Үйдегі азық-түліктен бес жылдам тағам')],
      [L('Секреты пышных блинов', 'Secrets of fluffy pancakes', 'Үлпілдек құймақтың құпиялары'), L('Тесто, сковорода и температура', 'Batter, pan and heat', 'Қамыр, таба және температура')],
    ],
    srt: [
      [L('Что ещё появилось за год: ИИ-соавтор, шаблоны, очередь', 'This year in SEOlit: AI co-author, templates, queue', 'Бір жылда не қосылды: ЖИ-серіктес, үлгілер, кезек'), L('Новости сервиса SEOlit', 'SEOlit service news', 'SEOlit сервисінің жаңалықтары')],
      [L('Истории ВКонтакте: читаем и публикуем', 'VK Stories: we read and publish them', 'ВКонтакте стористері: оқимыз және жариялаймыз'), L('Новости сервиса SEOlit', 'SEOlit service news', 'SEOlit сервисінің жаңалықтары')],
      [L('MAX.RU: новая площадка — каналы, чаты и собственный бот', 'MAX.RU: a new platform — channels, chats and your own bot', 'MAX.RU: жаңа алаң — арналар, чаттар және жеке бот'), L('Новости сервиса SEOlit', 'SEOlit service news', 'SEOlit сервисінің жаңалықтары')],
      [L('Год без новостей: что мы сделали в SEOlit', 'A year without news: what we built in SEOlit', 'Жаңалықсыз бір жыл: SEOlit-те не істедік'), L('Новости сервиса SEOlit', 'SEOlit service news', 'SEOlit сервисінің жаңалықтары')],
    ],
    signal: [
      [L('Как вести соцсети клиента без хаоса', 'Running client social media without chaos', 'Клиенттің әлеуметтік желілерін ретімен жүргізу'), L('Наш чек-лист для запуска', 'Our launch checklist', 'Іске қосуға арналған чек-парағымыз')],
      [L('Дайджест агентства за неделю', 'Agency weekly digest', 'Агенттіктің апталық дайджесті'), L('Главное из блога и кейсов', 'Highlights from the blog and case studies', 'Блог пен кейстердің ең маңыздысы')],
      [L('Вакансия: SMM-менеджер', 'Job opening: SMM manager', 'Бос орын: SMM-менеджер'), L('Ищем в команду человека с опытом от года', 'Looking for someone with a year of experience', 'Бір жылдан астам тәжірибесі бар маман іздейміз')],
    ],
  };
  const NEED = { shop: [28, 3, 0], srt: [28, 0, 0], news: [14, 0, 2], cook: [0, 12, 0], signal: [36, 76, 6] };
  const DESTS = { srt: [['vk', 'ok'], ['vk'], ['fb', 'vk']], shop: [['vk', 'tg', 'ok'], ['vk', 'tg'], ['tg', 'pi', 'mm']], news: [['tg', 'vk'], ['tg', 'vk', 'x']], cook: [['vk', 'ok']], signal: [['vk', 'tg', 'in'], ['vk', 'tg']] };
  const ERR = {
    news: L('ВКонтакте: нужна повторная авторизация', 'VK: sign in again to keep posting', 'ВКонтакте: қайта авторизация қажет'),
    signal: L('Telegram: бота удалили из канала', 'Telegram: the bot was removed from the channel', 'Telegram: бот арнадан шығарылды'),
  };
  let nid = posts.length + 1;
  Object.entries(NEED).forEach(([p, need]) => {
    const pool = POOL[p] || posts.filter((x) => x.p === p).map((x) => [x.title, x.text]);
    ['plan', 'paused', 'err'].forEach((st, j) => {
      for (let have = posts.filter((x) => x.p === p && x.st === st).length, k = 0; have < need[j]; have++, k++) {
        const [title, text] = pool[k % pool.length];
        const d = st === 'plan' ? 3 + (k % 4) : st === 'err' ? 0 : 1 + (k % 6);
        const post = P(nid++, p, d, st === 'err' ? 8 + k : 9 + ((k * 3) % 12), [0, 15, 30, 45][k % 4], k % 3 ? 'rss' : 'man', DESTS[p][k % DESTS[p].length], 0, title, text, st);
        if (st === 'err') post.err = ERR[p];
        posts.push(post);
      }
    });
  });

  /* ---------- Новости сервиса ---------- */
  const news = [
    { at: at(-2), title: L('Что ещё появилось за год: ИИ-соавтор, шаблоны, очередь', 'This year in SEOlit: AI co-author, templates, queue', 'Бір жылда не қосылды: ЖИ-серіктес, үлгілер, кезек') },
    { at: at(-2), title: L('Истории ВКонтакте: читаем и публикуем', 'VK Stories: we read and publish them', 'ВКонтакте стористері: оқимыз және жариялаймыз') },
    { at: at(-6), title: L('MAX.RU: новая площадка — каналы, чаты и собственный бот', 'MAX.RU: a new platform — channels, chats and your own bot', 'MAX.RU: жаңа алаң — арналар, чаттар және жеке бот') },
    { at: at(-6), title: L('Год без новостей: что мы сделали в SEOlit', 'A year without news: what we built in SEOlit', 'Жаңалықсыз бір жыл: SEOlit-те не істедік') },
  ];

  /* ---------- Состояние: сид + изменения из sessionStorage ---------- */
  const seed = () => ({ v: 4, projects, sources, receivers, posts, nextId: 1000 });
  const clone = (o) => JSON.parse(JSON.stringify(o));
  let db;
  try { db = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { db = null; }
  if (!db || db.v !== 4) db = clone(seed());

  const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* хранилище недоступно */ } };
  const reset = () => { try { sessionStorage.removeItem(KEY); } catch (e) { /* ничего */ } db = clone(seed()); };
  const uid = (pfx) => pfx + (db.nextId++);

  // Демо-вход: email в localStorage, чтобы index.html знал, куда вести
  const USER_KEY = 'seolit-demo-user';
  const login = (email) => { try { localStorage.setItem(USER_KEY, email || user.email); } catch (e) { /* ничего */ } };
  const logout = () => { try { localStorage.removeItem(USER_KEY); } catch (e) { /* ничего */ } };
  const loggedIn = () => { try { return localStorage.getItem(USER_KEY); } catch (e) { return null; } };

  window.DEMO = {
    L, at, D0, user, news,
    get db() { return db; },
    save, reset, uid, login, logout, loggedIn,
    project: (id) => db.projects.find((p) => p.id === id),
    // Ошибки подключений проекта: приёмники и источники с ошибкой
    conn(id) {
      const r = db.receivers.filter((x) => x.p === id && x.st === 'err').length, s2 = db.sources.filter((x) => x.p === id && x.st === 'err').length;
      return { r, s: s2, all: r + s2 };
    },
    // Счётчики постов проекта (или всех, если id не задан): plan, paused, err, done (вместе с вышедшими раньше)
    stats(id) {
      const c = { plan: 0, paused: 0, err: 0, done: 0 };
      db.posts.forEach((x) => { if (!id || x.p === id) c[x.st]++; });
      db.projects.forEach((p) => { if (!id || p.id === id) { c.done += p.published || 0; c.paused += p.pausedExtra || 0; } });
      return c;
    },
  };
})();
