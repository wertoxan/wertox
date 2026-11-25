# SIGNAL

Офлайн-демо для портфолио. Представление логики бота для поиска фриланс-задач: классификация, разбор бюджета, фильтры и черновик отклика. В демо используются только вымышленные заявки. Отправки откликов, Telegram-бота и импорта из внешних источников нет.

## Запуск

Из папки проекта выполните `python3 -m http.server 8000 --bind 127.0.0.1` и откройте адрес локального сервера на порту 8000. Интернет, пакеты, аккаунты и настройки не нужны.

Обычные HTML, CSS и JavaScript. Внешние запросы запрещены политикой страницы, данные не сохраняются. Интерфейс демо отделён от локальной логики в `engine.mjs`.

The richer portfolio interface is in `web/`. Serve the folder locally with Python or Node, then open `/web/`. Use fictional text only: this interface keeps filters and manual inputs in local browser storage; it does not send them to a service.
