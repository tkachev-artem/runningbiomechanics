import { config } from 'dotenv';
import { analyzeRunBiomechanics } from '../src/tools/analyze-run';
import { GigaChatService } from '../src/gigachat/gigachat.service';
import { REAL_RUN_DATA } from '../tests/fixtures/real-data';
import { REAL_USER_DATA } from '../tests/fixtures/real-data';

config();

async function main() {

  // Шаг 1: Прямой вызов MCP функции
  
  const analysisResult = await analyzeRunBiomechanics(REAL_RUN_DATA);
  
  
  // Шаг 2: Интерпретация с GigaChat
  if (!process.env.GIGACHAT_API_KEY) {
    console.log('\n⚠️  GIGACHAT_API_KEY не найден, пропускаем интерпретацию');
    console.log('✅ ТЕСТ ЗАВЕРШЕН (только MCP)');
    return;
  }


  const gigachat = new GigaChatService({
    apiKey: process.env.GIGACHAT_API_KEY,
    model: 'GigaChat'
  });

  const prompt = `Ты - эксперт по бегу. Вот результаты анализа техники бега спортсмена:

Итоговая оценка: ${analysisResult.итоговая_оценка}/100
Классификация: ${analysisResult.классификация}
ИМТ: ${analysisResult.bmi} (${analysisResult.weight_category})

Оценки по категориям:
- Качество рук: ${analysisResult.оценки_категорий.arm_quality.toFixed(1)}/100
- Качество ног: ${analysisResult.оценки_категорий.leg_quality.toFixed(1)}/100
- Стабильность туловища: ${analysisResult.оценки_категорий.trunk_stability.toFixed(1)}/100
- Симметрия: ${analysisResult.оценки_категорий.symmetry.toFixed(1)}/100
- Эффективность: ${analysisResult.оценки_категорий.efficiency.toFixed(1)}/100
- Консистентность: ${analysisResult.оценки_категорий.consistency.toFixed(1)}/100

Объясни эти результаты простым языком. Выдели сильные стороны и что нужно улучшить.`;

  try {
    const response = await gigachat.chat([
      { role: 'user', content: prompt }
    ]);

    console.log('🤖 ИНТЕРПРЕТАЦИЯ GIGACHAT');
    console.log(response.content);
    console.log('✅ ТЕСТ УСПЕШНО ЗАВЕРШЕН!');
    
  } catch (error: any) {
    console.error('\n❌ Ошибка GigaChat:', error.message);
    console.log('⚠️  ТЕСТ ЗАВЕРШЕН (без интерпретации GigaChat)');
  }
}

main();
