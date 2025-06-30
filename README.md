# Telegram Chat Viewer

Цей репозиторій містить повноцінний застосунок для перегляду чатів Telegram з сучасним веб-інтерфейсом та бекендом на FastAPI.

---

## Структура проекту

- **backend/** — бекенд на FastAPI, робота з Telegram, база даних, авторизація.
- **frontend/** — фронтенд на Next.js (React), сучасний UI для роботи з чатами.

---

## Швидкий старт

### 1. Клонування репозиторію

```sh
git clone <repo-url>
cd telegram-chat-viewer
```

### 2. Запуск бекенду

```sh
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python init_db.py
uvicorn main:app --reload
```

- Налаштування зберігаються у `app/config.py` або `.env`.

### 3. Запуск фронтенду

```sh
cd ../frontend
npm install
npm run dev
```

- Фронтенд буде доступний на [http://localhost:3000](http://localhost:3000)

---

## Основні можливості

- Авторизація та реєстрація користувачів
- Додавання Telegram-акаунтів
- Перегляд чатів, повідомлень, медіа
- Захист API (JWT, secure headers)
- Сучасний UI з анімаціями

---

## Технології

- **Backend:** Python, FastAPI, SQLAlchemy, Telethon, JWT
- **Frontend:** Next.js, React, Material UI, Anime.js

---

## Ліцензія

MIT

---

**Розробник:** Vladyslav Lykov
