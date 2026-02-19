import { config } from 'dotenv';
import { GigaChatMCPFull } from '../src/gigachat/gigachat-orchestrator.js';
import { REAL_USER_DATA } from '../tests/fixtures/real-data.js';
config();
async function main() {
    if (!process.env.GIGACHAT_API_KEY) {
        console.error('❌ GIGACHAT_API_KEY не найден');
        process.exit(1);
    }
    const orchestrator = new GigaChatMCPFull(process.env.GIGACHAT_API_KEY);
    // Формируем сообщение из реальных данных (ВСЕ поля!)
    const data = REAL_USER_DATA;
    let message1 = `Используй функцию analyze_running_technique для анализа моей техники бега.

ВАЖНО: В ответе покажи:
- Итоговую оценку и уровень
- Оценки по всем категориям
- Сильные стороны
- Области для улучшения
- ИМТ если доступен


Данные (все углы в градусах):
- Физические параметры: Вес ${data.weight_kg} кг, Рост ${data.height_cm} см

- Левая рука: 
  * Мах руки: ${data.left_arm.arm_swing.mean.toFixed(0)}°
  * Локоть: ${data.left_arm.elbow_angle.mean.toFixed(0)}°
  
- Правая рука:
  * Мах руки: ${data.right_arm.arm_swing.mean.toFixed(0)}°
  * Локоть: ${data.right_arm.elbow_angle.mean.toFixed(0)}°

- Левая нога:
  * Колено: ${data.left_leg.knee_angle.mean.toFixed(0)}°
  * Голеностоп: ${data.left_leg.ankle_angle.mean.toFixed(0)}°
  * Бедро: ${data.left_leg.hip_angle.mean.toFixed(0)}°
  * Голень: ${data.left_leg.shank_angle.mean.toFixed(0)}°

- Правая нога:
  * Колено: ${data.right_leg.knee_angle.mean.toFixed(0)}°
  * Голеностоп: ${data.right_leg.ankle_angle.mean.toFixed(0)}°
  * Бедро: ${data.right_leg.hip_angle.mean.toFixed(0)}°
  * Голень: ${data.right_leg.shank_angle.mean.toFixed(0)}°

- Туловище: ${data.trunk.trunk_angle.mean.toFixed(0)}°
- Голова: ${data.head.head_angle.mean.toFixed(0)}°`;
    try {
        // Шаг 1: Анализ техники
        const response1 = await orchestrator.processUserMessage(message1);
        const clean1 = response1.replace(/#{1,6}\s/g, '');
        console.log('Анализ:\n', clean1);
        // Шаг 2: Выявление ошибок
        const message2 = `Используй функцию detect_errors чтобы выявить ошибки в технике.

ВАЖНО: В ответе ОБЯЗАТЕЛЬНО перечисли ВСЕ найденные ошибки с деталями:
- Название ошибки
- Уровень серьезности
- Описание проблемы
- Затронутые метрики
- Конкретные значения

Если ошибок НЕТ - явно укажи что техника отличная.`;
        const response2 = await orchestrator.processUserMessage(message2);
        const clean2 = response2.replace(/#{1,6}\s/g, '');
        console.log('\nОшибки:\n', clean2);
        // Шаг 3: Рекомендации
        const message3 = `Используй функцию get_exercise_recommendations для моего уровня (из первого анализа).

ВАЖНО: В ответе ОБЯЗАТЕЛЬНО перечисли ВСЕ упражнения из результата функции с их деталями:
- Название упражнения
- Описание техники выполнения
- Подходы и повторения
- Частота выполнения
- Уровень сложности

Используй ТОЛЬКО упражнения из результата функции, не придумывай свои.`;
        const response3 = await orchestrator.processUserMessage(message3);
        const clean3 = response3.replace(/#{1,6}\s/g, '');
        console.log('\nРекомендации:\n', clean3);
    }
    catch (error) {
        console.error('Ошибка:', error.message);
    }
}
main();
//# sourceMappingURL=sequential-analysis.js.map