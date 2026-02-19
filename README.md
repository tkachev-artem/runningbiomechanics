# Running Biomechanics MCP

Сервис анализа техники бега. Принимает биомеханические данные (углы, длины шагов, время контакта и т.д.), рассчитывает показатели техники и с помощью GigaChat генерирует персональные рекомендации в виде структурированного JSON.

## Структура

```
packages/
  types/            — общие TypeScript типы
  calculators/      — расчёт показателей техники бега
  gigachat-client/  — клиент GigaChat API
apps/
  mcp-server/       — HTTP сервер с endpoint /analyze
```

## Запуск

```bash
# 1. Установить зависимости
bun install

# 2. Создать .env файл
cp apps/mcp-server/.env.example apps/mcp-server/.env
# Вписать GIGACHAT_API_KEY

# 3. Собрать проект
bun run build

# 4. Запустить сервер
bun run dev
```

Сервер запустится на `http://localhost:3000`

## Тестирование

```bash
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d @apps/mcp-server/tests/fixtures/real-data.json
```
