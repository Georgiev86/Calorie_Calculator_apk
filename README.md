# Calorie Coach BG

Мобилно приложение с `React Native + Expo` за Android calorie calculator, login, cloud sync и AI хранителен помощник.

## Какво вече има

- истинска navigation система с `stack + tabs`
- отделни screen routes за `Auth`, `Onboarding`, `Plan`, `Coach`, `Progress`, `Profile`
- login и регистрация през backend
- cloud sync на профил и прогрес
- onboarding с пол, възраст, тегло, височина, активност, цел и брой хранения
- progress dashboard със summary карти и графика на теглото
- `AI Coach` екран с чат и бързи действия
- production-oriented UI с gradient hero, card layout и по-завършен app shell
- разделена структура в `src/components`, `src/navigation`, `src/screens`, `src/services`, `src/utils`

## Какво изчислява

- `BMR`
- калории за поддържане
- дневна калорийна цел
- ориентировъчни макроси
- калории на хранене

## Стартиране

1. Инсталирай зависимостите:

```bash
npm install
```

2. Стартирай Expo:

```bash
npm run start
```

3. За Android:

```bash
npm run android
```

Или отвори проекта с `Expo Go`.

## Backend за login, cloud sync и AI coach

1. Инсталирай backend зависимостите:

```bash
npm install --prefix backend
```

2. Стартирай backend-а:

```bash
OPENAI_API_KEY=your_key_here npm run backend
```

3. Стартирай mobile app-а с URL към backend:

```bash
EXPO_PUBLIC_AI_BACKEND_URL=http://YOUR_LOCAL_IP:8787 npm run start
```

Ако `EXPO_PUBLIC_AI_BACKEND_URL` липсва:

- login и cloud sync няма да работят
- AI coach ще падне обратно към локален fallback

## Screen flow

1. `Auth` screen за вход и регистрация
2. `Onboarding` screen за начален профил
3. `Home` tabs:
   `Plan`, `Coach`, `Progress`, `Profile`
4. `ProfileModal` за акаунт и синхронизация

## Backend endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/cloud`
- `PUT /api/cloud`
- `POST /api/coach`

## AI интеграция

В момента AI екранът работи с локална логика, за да може app-ът да е usable веднага.

За production версия:

- не слагай OpenAI API key директно в мобилното приложение
- направи защитен backend или serverless endpoint
- приложението да изпраща профила, целта, прогреса и въпроса на потребителя
- backend-ът да говори с OpenAI и да връща готов отговор

Виж [OPENAI_BACKEND_NOTES.md](/home/dimitar_georgiev/calorie_calculator_app/OPENAI_BACKEND_NOTES.md).
