# Демо-кабинет и API SEOlit

Сверка с описанием API: https://seolit.ru/dev/ — OpenAPI 3.0 «Seolit API» 1.10.0, сервер `https://api.seolit.ru`, методы вида `/v1/<объект>.<действие>` (GET и POST). Проверено 29.10.2026.

Обозначения: **API** — поле или метод есть; **браузер** — считаем на странице из данных API; **нет** — в API этого нет (данные Joomla или убрать).

## 1. Страница проектов (`projects.html`)
| Элемент | Откуда |
|---|---|
| Список, «Мои» / «Доступны мне» | API: `projects.list` → `projects[]`, `is_owner` |
| Название, описание под названием | API: `name`, `description` (поля «сайт» в API нет — показываем описание) |
| Статус: Работает / N ошибок / Демо / Отключён | браузер: `state` (0 — отключён), `is_demo`, `count_feeds_with_fatal_errors + count_receivers_with_fatal_errors` |
| Значки соцсетей и «+N» | API: `receivers_counts[]` (`type_id`, `count`) + `receiver_types[]` (`name`, `icon`, `symbol`); «+N» — браузер |
| В очереди / на паузе / ошибок | API: `tasks_queued`, `tasks_paused`; ошибки — сумма двух `count_*_with_fatal_errors` |
| «Оплачен до …», «N дней», полоска | API: `paid_till`; дни и полоска — браузер (длины периода в API нет: берём 30 дней, у демо — 3) |
| «Оплатить 800 ₽» / «Продлить» | API: `projects.prolong`; цена нового проекта — `new_project_price`, право на демо — `demo_allowed` |
| «Новый проект» | API: `projects.create` (`name`, `description`) |
| «Требует внимания» | браузер: проекты с ненулевыми `count_*_fatal_errors` и демо с `paid_till` ≤ завтра. Текст ошибки — `fatal_error_text` из `receivers.list` / `feeds.list` (по запросу на проект, можно лениво) |
| Роль в подключённом проекте | браузер из `permissions[]`: есть `project.update` — полные права; `task.create` — редактор; иначе просмотр. **Email владельца в API нет** — убран |
| «Отказаться от проекта» | API: `projects.refuse` |
| Поиск по проектам | браузер (по `name`, `description`) |
| Баланс, «Хватит примерно на N месяцев» | **нет** в API — данные Joomla (биллинг); прогноз — браузер (баланс / 800 ₽ × оплаченные проекты) |
| Новости | **нет** в API — контент Joomla |

## 2. Страница проекта (`project.html?id=…`)
| Элемент | Откуда |
|---|---|
| Шапка: название, статус, описание, «оплачен до» | API: `projects.get` |
| Счётчики вкладок | браузер: длины `feeds[]`, `receivers[]`; «Очередь» — `tasks_queued` |
| «Опубликовано за 7 дней» и график | API: `tasks.get_statistics` (`type=project`, `date_start`, `date_end`) → `publish_ok` по дням |
| «+18 к прошлой неделе» | браузер: второй запрос `tasks.get_statistics` за прошлую неделю, разница |
| «В очереди», «Ближайший — сегодня в 15:30» | API: `tasks_queued`; ближайший — минимум `publication_time_expected` из `receivers.list` (браузер) |
| «На паузе» | API: `tasks_paused`. Причина паузы не приходит — подпись «Премодерация и черновики» (так поле описано в API) |
| «Ошибки N», «4 приёмника · 2 источника», «Разобрать» | API: `count_receivers_with_fatal_errors`, `count_feeds_with_fatal_errors`; фильтр «Ошибки» — браузер |
| Источники: имя, подпись, переключатель | API: `feeds.list` (`name`, `pic`, `page_url`, `state`, `last_usage`, `read_time_next`, `read_interval`, `tasks_queued`, `err_state`, `fatal_error_text`); вкл/выкл — `feeds.set_state` |
| Приёмники: имя, «Сегодня 12:40 · 4 в очереди», ошибка | API: `receivers.list` (`name`, `pic`, `page_url`, `state`, `last_usage`, `publication_time_expected`, `tasks_queued`, `tasks_paused`, `err_state`, `last_error_text`, `fatal_error_text`, `paid_till`); подпись строки собирается в браузере |
| Группы по соцсетям, «9 · 2 работают», чипы-фильтры, поиск по аккаунтам | браузер (группировка по `type_id`, счётчики по `state` / `err_state`) |
| Переключатель приёмника | API: `receivers.set_state` |
| Кнопка исправления («Переподключить») | API: `receivers/<соцсеть>/oauth.get_authorization_url` → окно соцсети → `oauth.get_access_token` → `receivers.update` (`access_token`). **Конкретного действия в API нет** — приходит только текст ошибки. «Проверить права», «Добавить бота», «Выбрать доску» — сопоставление текста ошибки в браузере (хрупко) или одна общая «Исправить» |
| Меню «⋯»: настройки, очередь аккаунта, удалить | API: `receivers.get` / `receivers.update`; `tasks.list?receiver_id=`; `receivers.delete` (у источников — `feeds.*`) |
| Окно «Подключить»: плитки, «Входит в тариф / +100 ₽» | API: `receiver_types[]` (`enabled`, `is_free`, `name`, `icon`); «Уже подключён: N» — браузер. Цену 100 ₽ в API не нашёл — берём из прайса. Категории «Соцсети / Мессенджеры / Блоги / Видео» — справочник в браузере |
| Шаги окна: вход → страница → подключить | API: `…/oauth.get_authorization_url` → `…/oauth.get_access_token` → `…list_targets` (у источников `list_sources`) → `receivers.create`. Логин и пароль — `instagram.check_credentials`, `live_journal.check_credentials`; Telegram — `telegram.get_group_info`; Max — `max_ru.connect_bot`; ВК-ключ сообщества — `vkontakte.community_token.check` |
| Пустое состояние без источников | браузер |
| Статистика: график, ряды, период | API: `tasks.get_statistics` → `publish_ok`, `publish_fail`, `likes`, `comments`, `reposts`, `views` по дням |
| Статистика «по соцсетям» | браузер: `tasks.get_statistics?type=receiver` по каждому приёмнику и сумма по `type_id` (N запросов) |
| CSV | браузер |
| ~~Вкладка «Доступ»~~ | **нет** методов управления участниками (есть только право `users.manage` в `permissions`) — **вкладка убрана** |

## 3. Настройки проекта (`project.html?tab=settings`)
Сделаны строго по `projects.update`:
`name`, `description`, `publication_interval` (интервал между публикациями, мин), `posts_number_at_a_time` (сообщений за раз), `schedule_id` (расписание проекта), `templates_selected[]` (шаблон по типу источника: `feed_type_id`, `id`, `priority`), `report_errors` (1 — не присылать, 2 — критические, 3 — все), `report_sending` (1 — почта, 2 — Telegram, 3 — оба), `telegram_accounts`. Вкл/выкл — `projects.set_state`; продление — `projects.prolong`; удаление — `projects.delete`; у подключённого проекта — `projects.refuse` и только просмотр (нет `project.update` в `permissions`).

**Убрано из макета, потому что этого нет в API:** часовой пояс проекта (в API есть только параметр `api_timezone` у запросов — это настройка пользователя), переключатель «Автоматическая / Ручная» (в старом кабинете это вкладки списка, а не настройка), автопродление проекта (`auto_prolong` есть только у платных приёмников и источников).

## 4. Настройки приёмника и источника (окно из «⋯ → Настройки»)
По `receivers.update`:
- **Основные:** `name`, состояние (`set_state`), `premoderate`, `posts_per_day_max`, `schedule_selected[id]`, `default_pic`, `auto_prolong` (только у платных, второй и следующие аккаунты соцсети).
- **Дополнительно:** `post_video_thumbnails` (0–3), `utm_marks[add_to_url, source, medium, campaign, term, content]`.
  - Telegram: `channel`, `is_private_channel`, `use_own_bot` + `own_bot_token`, `disable_notification`, `instant_view` + `instant_view_rhash`, `post_autoimages`, `post_link_mode` (none / button / point) + `post_link_button_text`, `post_url_mode` (arrow_topright / hostname / text), `post_images_count` (all / first / none), `post_images_mode` (album+text / separate / together), `post_images_auto_format`, `post_images_with_video`, `post_videos_mode`, `post_ignoring_video_errors`.
  - ВКонтакте: `post_from_group`, `post_signed`, `link_url`, `target_feed`, `post_attachments_mode`, `add_geo_location`, `post_autoimages`.
- **Шаблоны:** `templates_selected[]` по типу источника.

Источник (`feeds.update`): `name`, состояние, `read_interval`, `date_start`, `premoderate`, `merge_line_breaks`, `default_pic`.

**Убрано из окна:** водяной знак у приёмника. В API водяной знак и автокартинка привязываются к **шаблону** (`watermarks_selected` в `templates.update`), а не к приёмнику.

У остальных соцсетей свои поля (`facebook[…]`, `instagram[…]`, `linkedin[…]`, `odnoklassniki[…]`, `pinterest[…]`, `reddit[…]`, `tumblr[…]`, `twitter[…]`, `max_ru[…]`, `live_journal[…]`). В демо показаны Telegram и ВКонтакте, остальные — по тому же образцу.

## 5. Остальные разделы — коротко
| Раздел | API | Расхождения с демо |
|---|---|---|
| Очередь | `tasks.list` (`count_queued`, `count_paused`, `count_failed`, `tasks[]` с `publication.state_name`, `date_plan`, `error`, `result_url`), `tasks.set_state`, `tasks.update` (перенос), `tasks.delete`, `tasks.delete_all_in_state`, `tasks.clone` | **Одно задание = один приёмник.** Строка «источник → ВК, TG, OK +3» — группировка заданий в браузере (по `url` + `title` + `date_plan`) |
| Новый пост | `tasks.create` (`receivers[]`, `title`, `text`, `tags`, `author_name`, `url`, `latitude/longitude`, `advertisement_id/label`, `mark_as_advertisement`, `attachments[]`, `auto_delete`, `auto_repeat`, `publication[date_plan]`, `paused` — черновик), `tasks.upload_image` | Счётчики символов, предпросмотр — браузер. ИИ-соавтор — `ai/texts.generate`, `ai/texts.get_tokens_count`, `ai/preprompts.list`, `ai/models.list` |
| Шаблоны | `templates.*`: `feed_type_id`, `template_text`, `template_footer`, `template_url`, `text_length_max` + `text_too_long_action` (skip / truncate), картинки и видео, `posts_auto_delete`, `tasks_obsolescence`, `geo_location_default`, `advertisement_marking`, `watermarks_selected` | В демо шаблон выбирается «для соцсетей», в API — **для типа источника**. Синтаксис переменных (#TITLE# и т. п.) в описании API не найден — уточнить в репозитории |
| Расписания | `schedules.*`: дни с интервалами `time_start`–`time_end`, `schedules.list_days` | Сетка 7 × 24 переводится в интервалы в браузере. Лимит и интервал из редактора расписаний убраны (они у приёмника и проекта) |
| Водяные знаки | `watermarks.*`, `get_preview` (превью рисует сервер), `upload_image`, `list_fonts` | Превью в демо рисуется в браузере; в бою — `get_preview` или своё превью на canvas |
| Автокартинки | `autoimages.*`, `get_preview`, `upload_image`, `list_fonts` | Так же |
| RSS-тест | `feeds/rss.check` (`feeds/atom.check`) | Совпадает |
| Баланс, пополнение, история, промокод | **нет** | Joomla / биллинг |
| Рефералы | **нет** | Joomla |
| API-ключи | **нет** | Joomla (страница ключей) |
| Новости, колокольчик уведомлений | **нет** | Joomla; уведомления можно собирать в браузере из ошибок проектов |
| Профиль: язык, тема | браузер (`localStorage`) | — |
| Профиль: часовой пояс | браузер + параметр `api_timezone` во всех запросах | — |
| Профиль: уведомления | частично: `report_errors` / `report_sending` есть **у проекта**, а не у пользователя | В демо — у пользователя; в бою — перенести в проект или в Joomla |
| Поиск Ctrl+K | браузер по загруженным спискам | — |

## 6. Что сделано в демо по итогам сверки
- Настройки проекта и окно настроек приёмника/источника переделаны строго под поля API (раздел 3–4).
- Вкладка «Доступ» убрана; у подключённого проекта вместо email владельца — «Подключённый проект» и роль из `permissions`, добавлено «Отказаться от проекта».
- Ряды статистики названы по полям API: «Опубликовано» (`publish_ok`), «Ошибки публикации» (`publish_fail`), лайки, репосты, комментарии, просмотры.
- Подпись «На паузе» — «Премодерация и черновики».
- Из редактора расписаний убраны лимит и интервал.
- В демо-данных у проектов поля из `projects.get`: `description`, `publication_interval`, `posts_number_at_a_time`, `schedule_id`, `templates_selected`, `report_errors`, `report_sending`, `telegram_accounts`, `permissions`.

## 7. Промпт для репозитория seolit (Joomla 4 + PHP)
Отчёт нужен, чтобы сверить демо с тем, что реально выводит текущий интерфейс. Скопируйте блок целиком:

```
Это репозиторий интерфейса сервиса SEOlit (Joomla 4 + PHP), который работает поверх API https://api.seolit.ru
(описание: https://seolit.ru/dev/). Ничего не меняй в коде — нужен только отчёт.

Сделай файл REPORT-UI.md в корне репозитория (не коммить его, просто сохрани) со следующими разделами.
Где можно — указывай пути к файлам и номера строк. Пиши кратко, таблицами.

1. Карта экранов кабинета: список страниц (маршрут/URL, компонент или шаблон Joomla, PHP-файл),
   особенно: список проектов, страница проекта, настройки проекта, настройки приёмника/источника, очередь заданий,
   создание задания (новый пост), шаблоны, расписания, водяные знаки, автокартинки, баланс, рефералы, API-ключи, новости.
2. Для страницы проектов, страницы проекта и настроек проекта: какие методы API вызываются (с параметрами `fields`,
   `api_timezone`), какие поля ответа реально выводятся и как вычисляются производные значения
   (статус проекта, «серьёзные ошибки», звёзды/рейтинг на карточке, срок оплаты, цвета карточек).
3. Откуда берутся данные, которых нет в API: баланс пользователя, история платежей, способы оплаты и комиссии,
   промокоды, рефералы (условия, процент), API-ключи, новости, уведомления (колокольчик), команда проекта / приглашения
   (право users.manage), профиль пользователя (часовой пояс, язык, email). Таблица: данные → источник (таблица БД Joomla,
   внешний сервис, конфиг) → файл.
4. Шаблоны постов: полный синтаксис шаблона (template_text, template_footer, template_url) — список переменных
   и функций с примерами, где он описан/разбирается.
5. Ошибки приёмников и источников: список типовых текстов fatal_error_text / last_error_text (или их кодов) и какие действия
   интерфейс предлагает пользователю для каждой (переподключить, проверить права, добавить бота, выбрать доску и т. п.).
6. Цены и тарифы: где в коде задаются цена проекта (800 ₽), дополнительного приёмника/источника (100 ₽?), длина демо-периода,
   справочник tariff; есть ли это в API.
7. Подключение соцсетей: как устроен поток OAuth в интерфейсе (окно, редирект, callback), где список типов приёмников
   группируется (соцсети/мессенджеры/блоги/видео) и есть ли такая группировка в данных.
8. Локализация: какие языки есть в интерфейсе, где лежат строки (ini-файлы Joomla), есть ли казахский.
9. Всё, что интерфейс делает без API (вычисления в PHP или JS, кеши, cron) и что может пригодиться новому дизайну.
```
