# OpenAI Backend Notes

Това приложение е подготвено за AI coach, но реалният OpenAI достъп трябва да минава през защитен backend.

## Защо

Не е безопасно API ключът да стои директно в Android app.

## Препоръчана схема

1. Mobile app изпраща `profile`, `progress`, `goal` и `message` към твой backend.
2. Backend валидира заявката.
3. Backend изпраща prompt към OpenAI.
4. Backend връща кратък структуриран отговор към приложението.

## Примерен request от app към backend

```json
{
  "profile": {
    "gender": "male",
    "age": 30,
    "weight": 80,
    "height": 180,
    "activity": "medium",
    "goal": "lose",
    "meals": 3
  },
  "progress": [
    {
      "date": "2026-04-06",
      "weight": 79.5,
      "note": "Чувствам се добре"
    }
  ],
  "message": "Направи ми примерно меню за деня"
}
```

## Примерен response към app

```json
{
  "reply": "Ето примерно меню за деня...",
  "suggestions": [
    "Смени ориза с картофи",
    "Добави 1 междинно хранене",
    "Премести повече въглехидрати около тренировка"
  ]
}
```

## Добър следващ етап

- `Node.js/Express` или `Next.js API route`
- endpoint например `POST /api/coach`
- rate limiting
- basic auth/user auth
- logging без чувствителни данни

## Как е вързано сега

Вече има готови части:

- mobile service в [src/services/coach.ts](/home/dimitar_georgiev/calorie_calculator_app/src/services/coach.ts)
- backend endpoint в [backend/server.js](/home/dimitar_georgiev/calorie_calculator_app/backend/server.js)

Mobile app използва:

- `EXPO_PUBLIC_AI_BACKEND_URL` за URL към backend-а
- `POST /api/coach` за AI заявките
- локален fallback, ако backend URL липсва или е недостъпен

## Важно

Според официалната OpenAI документация API ключът трябва да остане server-side и да се подава чрез Bearer authentication, а не да стои в client app:

- https://platform.openai.com/docs/api-reference/authentication
