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
  const projects = [
    { id: 'shop', name: L('Магазин «Пример»', 'Example Store', '«Мысал» дүкені'), site: 'example.ru', st: 'ok',
      nets: ['vk', 'tg', 'ok', 'mm', 'pi', 'in', 'x', 'tu', 'lj', 'tt', 'bl', 're', 'max', 'ig'], published: 1201,
      until: at(20), period: 30, own: true },
    { id: 'news', name: L('Новости района', 'Neighborhood News', 'Аудан жаңалықтары'), site: 'news-rayon.ru', st: 'err',
      nets: ['vk', 'tg', 'x'], published: 640, until: at(86), period: 93, own: true },
    { id: 'travel', name: L('Блог о путешествиях', 'Travel Blog', 'Саяхат блогы'), site: 'travel-blog.ru', st: 'demo',
      nets: ['tg', 'pi'], published: 0, until: at(1), period: 3, own: true },
    { id: 'cook', name: L('Кулинарный канал', 'Cooking Channel', 'Аспаздық арна'), site: 'cook.ru', st: 'off',
      nets: ['vk', 'ok'], published: 312, until: at(-14), period: 30, own: true },
    { id: 'signal', name: L('Агентство «Сигнал»', 'Signal Agency', '«Сигнал» агенттігі'), site: 'signal-agency.ru', st: 'err',
      nets: ['vk', 'tg', 'ok', 'in'], published: 2210, until: at(41), period: 30, own: false,
      role: 'editor', owner: 'ivan@example.ru' },
  ];

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
    { id: 's17', p: 'signal', net: 'rss', name: L('signal-agency.ru/blog', 'signal-agency.ru/blog', 'signal-agency.ru/blog'), st: 'on', meta: ago(21) },
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
    { p: 'travel', net: 'tg', st: 'on', name: L('Канал «В дорогу»', 'On the Road channel', '«Жолға» арнасы'), meta: ago(55) },
    { p: 'travel', net: 'pi', st: 'on', name: L('Доска «Маршруты»', 'Routes board', '«Бағыттар» тақтасы'), meta: L('Вчера', 'Yesterday', 'Кеше') },
    { p: 'cook', net: 'vk', st: 'off', name: L('Кулинарный канал', 'Cooking Channel', 'Аспаздық арна'), meta: L('Проект отключён', 'Project is disabled', 'Жоба өшірулі') },
    { p: 'cook', net: 'ok', st: 'off', name: L('Рецепты на каждый день', 'Everyday recipes', 'Күнделікті рецепттер'), meta: L('Проект отключён', 'Project is disabled', 'Жоба өшірулі') },
    { p: 'signal', net: 'vk', st: 'on', name: L('Сигнал · ВКонтакте', 'Signal · VK', 'Сигнал · ВКонтакте'), meta: ago(4) },
    { p: 'signal', net: 'tg', st: 'on', name: L('Сигнал · канал', 'Signal · channel', 'Сигнал · арна'), meta: ago(11) },
    { p: 'signal', net: 'ok', st: 'off', name: L('Сигнал · ОК', 'Signal · OK', 'Сигнал · ОК'), meta: OFF },
    { p: 'signal', net: 'in', st: 'on', name: L('Signal Agency', 'Signal Agency', 'Signal Agency'), meta: ago(26) },
  );
  receivers.forEach((r, i) => { r.id = 'r' + (i + 1); });

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
    signal: [
      [L('Как вести соцсети клиента без хаоса', 'Running client social media without chaos', 'Клиенттің әлеуметтік желілерін ретімен жүргізу'), L('Наш чек-лист для запуска', 'Our launch checklist', 'Іске қосуға арналған чек-парағымыз')],
      [L('Дайджест агентства за неделю', 'Agency weekly digest', 'Агенттіктің апталық дайджесті'), L('Главное из блога и кейсов', 'Highlights from the blog and case studies', 'Блог пен кейстердің ең маңыздысы')],
      [L('Вакансия: SMM-менеджер', 'Job opening: SMM manager', 'Бос орын: SMM-менеджер'), L('Ищем в команду человека с опытом от года', 'Looking for someone with a year of experience', 'Бір жылдан астам тәжірибесі бар маман іздейміз')],
    ],
  };
  const NEED = { shop: [28, 3, 0], news: [14, 0, 2], cook: [0, 12, 0], signal: [36, 76, 6] };
  const DESTS = { shop: [['vk', 'tg', 'ok'], ['vk', 'tg'], ['tg', 'pi', 'mm']], news: [['tg', 'vk'], ['tg', 'vk', 'x']], cook: [['vk', 'ok']], signal: [['vk', 'tg', 'in'], ['vk', 'tg']] };
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
    { at: at(-6), title: L('MAX.RU: каналы, чаты и собственный бот', 'MAX.RU: channels, chats and your own bot', 'MAX.RU: арналар, чаттар және жеке бот') },
  ];

  /* ---------- Состояние: сид + изменения из sessionStorage ---------- */
  const seed = () => ({ v: 2, projects, sources, receivers, posts, nextId: 1000 });
  const clone = (o) => JSON.parse(JSON.stringify(o));
  let db;
  try { db = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { db = null; }
  if (!db || db.v !== 2) db = clone(seed());

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
    // Счётчики постов проекта (или всех, если id не задан): plan, paused, err, done (вместе с вышедшими раньше)
    stats(id) {
      const c = { plan: 0, paused: 0, err: 0, done: 0 };
      db.posts.forEach((x) => { if (!id || x.p === id) c[x.st]++; });
      db.projects.forEach((p) => { if (!id || p.id === id) c.done += p.published || 0; });
      return c;
    },
  };
})();
