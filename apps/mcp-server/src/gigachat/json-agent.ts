import { RunBiomechanicsInput, JsonAnalysisResult, JsonTechniqueBlock, JsonFocusBlock, JsonErrorsBlock, JsonExercisesBlock, JsonErrorItem, JsonExerciseItem, JsonMetricItem } from '@biomech/types';
import { analyzeRunBiomechanics, detectErrors, getRecommendations, getFocusAreas } from '@biomech/calculators';
import GigaChat from 'gigachat';
import { Agent } from 'node:https';

export class JsonAnalysisAgent {
  private gigachat: GigaChat;

  constructor(apiKey: string, model: string = 'GigaChat') {
    const httpsAgent = new Agent({ rejectUnauthorized: false });
    this.gigachat = new GigaChat({
      timeout: 600,
      model,
      credentials: apiKey,
      httpsAgent,
    });
  }

  async analyzeAndGetJson(data: RunBiomechanicsInput): Promise<JsonAnalysisResult> {
    // --- Шаг 1: Вызываем все инструменты ---
    console.log('✅ analyze_running_technique');
    const analysisResult = await analyzeRunBiomechanics(data);

    console.log('✅ detect_errors');
    const errorsResult = await detectErrors(data);

    console.log('✅ get_exercise_recommendations');
    const recommendationsResult = await getRecommendations(
      errorsResult.errors,
      undefined
    );

    console.log('✅ get_focus_areas');
    const focusResult = await getFocusAreas({
      errors: errorsResult.errors,
      analysis: analysisResult,
      exercises: recommendationsResult.exercises,
    });

    // --- Шаг 2: Подготавливаем данные для блоков ---

    // Метрики для блока technique
    const categories = analysisResult.оценки_категорий;
    const metrics: JsonMetricItem[] = [
      { name: 'Руки', value: Math.round(categories.arm_quality) },
      { name: 'Ноги', value: Math.round(categories.leg_quality) },
      { name: 'Корпус', value: Math.round(categories.trunk_stability) },
      { name: 'Стабильность', value: Math.round(categories.consistency) },
    ];

    const score = Math.round(analysisResult.итоговая_оценка * 10) / 10;
    const level = this.mapLevel(analysisResult.классификация);

    // Ошибки для блока errors
    const severityMap: Record<string, JsonErrorItem['priority']> = {
      'Критическая': 'high',
      'Высокая': 'high',
      'Средняя': 'medium',
      'Низкая': 'low',
    };
    const errorsData: JsonErrorItem[] = errorsResult.errors.map(e => ({
      priority: severityMap[e.severity] ?? 'low',
      description: e.description,
    }));

    // Упражнения для блока exercises
    const exercisesData: JsonExerciseItem[] = recommendationsResult.exercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      description: ex.description,
    }));

    // Estimated improvement из focus
    const estimatedImprovement = focusResult.estimated_improvement;

    // --- Шаг 3: GigaChat генерирует все тексты за один запрос ---
    const weakMetrics = metrics
      .filter(m => m.value < 85)
      .map(m => `${m.name}: ${m.value}/100`)
      .join(', ');

    const strongMetrics = metrics
      .filter(m => m.value >= 85)
      .map(m => `${m.name}: ${m.value}/100`)
      .join(', ');

    const topFocusPriority = focusResult.priorities[0];
    const focusAreaText = topFocusPriority
      ? topFocusPriority.area
      : 'общая техника';

    const topErrorForFocus = errorsResult.errors.find(
      e => e.severity === 'Высокая' || e.severity === 'Критическая'
    ) ?? errorsResult.errors[0];

    const errorsCount = errorsResult.errors.length;
    const exercisesCount = exercisesData.length;

    const prompt = `Ты персональный тренер по бегу. Напиши содержательные, живые тексты для бегуна на основе реальных данных анализа.

ДАННЫЕ АНАЛИЗА:
- Общая оценка: ${score}/100 (уровень: ${level})
- Метрики: Руки ${metrics[0].value}/100, Ноги ${metrics[1].value}/100, Корпус ${metrics[2].value}/100, Стабильность ${metrics[3].value}/100
- Сильные стороны: ${strongMetrics || 'нет'}
- Слабые стороны: ${weakMetrics || 'нет'}
- Количество ошибок: ${errorsCount}
- Главная зона для фокуса: ${focusAreaText}
- Описание главной проблемы: ${topErrorForFocus?.description ?? 'не выявлено'}
- Ожидаемое время улучшения: ${estimatedImprovement}
- Упражнений рекомендовано: ${exercisesCount}

ТРЕБОВАНИЯ:
- Простые слова, без технических терминов, без markdown, без списков, без заголовков
- Обращение на "ты"
- Тон дружелюбный, как живой тренер разговаривает с учеником
- Каждый текст — 2-4 полных, содержательных предложения с конкретикой из данных
- БЕЗ ЦИФР, БАЛЛОВ И ПРОЦЕНТОВ — называй сильные и слабые стороны только словами
- НЕ пиши общих фраз вроде "продолжай работать" без конкретики
- НЕ добавляй никакого текста вне JSON

ВЫВЕДИ СТРОГО В ТАКОМ JSON ФОРМАТЕ (только JSON, никакого текста вокруг):
{
  "first_message": "Общий вывод по технике без цифр — только словами назови сильные стороны и что улучшить. Главный совет и мотивирующий финал про упражнения. БЕЗ ЦИФР.",
  "technique_message": "Общая оценка техники без цифр и чисел — только словами. Что именно хорошо — назови что сильно. Что мешает и как это влияет на бег. БЕЗ ЦИФР И ПРОЦЕНТОВ.",
  "focus_message": "Конкретная зона фокуса — назови её словами без цифр. Описание проблемы своими словами — что происходит в теле при беге. Почему это важно исправить.",
  "focus_recommendation": "Конкретный совет как тренироваться — что делать на каждой тренировке. Как часто делать упражнения и что это даст.",
  "errors_message": "Вступление — сколько ошибок нашли. Коротко о характере ошибок — серьёзные или нет.",
  "exercises_message": "Зачем эти упражнения именно этому бегуну. Что они исправят и как часто их делать для результата."
}`;

    console.log('✅ GigaChat generates texts');
    const response = await this.gigachat.chat({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const rawContent = response.choices[0]?.message.content ?? '{}';
    const texts = this.parseTextsFromGigaChat(rawContent, score, level, metrics, focusAreaText, topErrorForFocus?.description, errorsCount, exercisesCount);

    // --- Шаг 4: Собираем финальный JSON ---
    const techniqueBlock: JsonTechniqueBlock = {
      id: 'technique',
      message: texts.technique_message,
      data: {
        score,
        level,
        metrics,
      },
    };

    const focusBlock: JsonFocusBlock = {
      id: 'focus',
      message: texts.focus_message,
      recommendation: texts.focus_recommendation,
      estimated_improvement: estimatedImprovement,
    };

    const errorsBlock: JsonErrorsBlock = {
      id: 'errors',
      message: texts.errors_message,
      data: errorsData,
    };

    const exercisesBlock: JsonExercisesBlock = {
      id: 'exercises',
      message: texts.exercises_message,
      data: exercisesData,
    };

    return {
      'first-message': texts.first_message,
      blocks: [techniqueBlock, focusBlock, errorsBlock, exercisesBlock],
    };
  }

  /**
   * Парсит JSON из ответа GigaChat.
   * Если GigaChat вернул что-то нечитаемое — используем fallback-тексты.
   */
  private parseTextsFromGigaChat(
    raw: string,
    score: number,
    level: string,
    metrics: JsonMetricItem[],
    focusArea: string,
    mainErrorDesc: string | undefined,
    errorsCount: number,
    exercisesCount: number,
  ): {
    first_message: string;
    technique_message: string;
    focus_message: string;
    focus_recommendation: string;
    errors_message: string;
    exercises_message: string;
  } {
    try {
      // Убираем markdown-блоки ```json ... ``` если GigaChat их добавил
      let cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim();
      // Извлекаем JSON из ответа (GigaChat может добавлять текст до/после)
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      const parsed = JSON.parse(jsonMatch[0]);

      // Проверяем что все поля на месте
      const required = ['first_message', 'technique_message', 'focus_message', 'focus_recommendation', 'errors_message', 'exercises_message'];
      for (const key of required) {
        if (typeof parsed[key] !== 'string' || !parsed[key].trim()) {
          throw new Error(`Missing or empty field: ${key}`);
        }
      }

      return parsed;
    } catch {
      console.warn('⚠️ GigaChat returned invalid JSON, using fallback texts');
      return this.buildFallbackTexts(score, level, metrics, focusArea, mainErrorDesc, errorsCount, exercisesCount);
    }
  }

  private buildFallbackTexts(
    score: number,
    level: string,
    metrics: JsonMetricItem[],
    focusArea: string,
    mainErrorDesc: string | undefined,
    errorsCount: number,
    exercisesCount: number,
  ) {
    const weak = metrics.filter(m => m.value < 85).map(m => m.name.toLowerCase());
    const strong = metrics.filter(m => m.value >= 85).map(m => m.name.toLowerCase());
    const weakMetric = metrics.filter(m => m.value < 85).sort((a, b) => a.value - b.value)[0];

    const first_message = strong.length > 0
      ? `Техника у тебя уже сильная, особенно ${strong.join(' и ')}. Самое важное сейчас — сделать ${weak.length > 0 ? weak.join(' и ') + ' лучше' : 'технику ещё стабильнее'}, тогда бег станет легче и быстрее. Для тебя подобраны упражнения, которые помогут быстрее прийти к результату!`
      : `Общая оценка твоей техники — ${score}/100, уровень: ${level}. Есть несколько зон, над которыми стоит поработать, и специально подобранные упражнения помогут тебе прогрессировать.`;

    const technique_message = `Твоя техника в целом ${score >= 85 ? 'очень сильная' : score >= 70 ? 'хорошая' : 'требует внимания'}.` +
      (strong.length > 0 ? ` Особенно хорошо работают ${strong.join(' и ')} — это твоя сильная база.` : '') +
      (weak.length > 0
        ? ` Но ${weakMetric ? weakMetric.name.toLowerCase() : weak.join(' и ')} ${weak.length === 1 ? 'пока уступает' : 'пока уступают'} остальным показателям — из-за этого ты теряешь часть энергии при каждом шаге.`
        : ' Все показатели на высоком уровне — продолжай в том же темпе!');

    const focus_message = mainErrorDesc
      ? `Фокус на ${focusArea}. ${mainErrorDesc} Именно это сейчас сильнее всего влияет на экономичность твоего бега.`
      : `Главный фокус сейчас — ${focusArea}. Улучшение этого показателя напрямую скажется на скорости и лёгкости бега.`;

    const focus_recommendation = `Работай над тем, чтобы каждый шаг был одинаковым по длине и высоте — это ключ к стабильности. Делай рекомендуемые упражнения 3–4 раза в неделю, и уже через несколько недель почувствуешь разницу.`;

    const errors_message = errorsCount > 0
      ? `Разберём твои ошибки подробнее — их ${errorsCount}. ${errorsCount === 1 ? 'Она' : 'Они'} влияют на эффективность бега, но ${errorsCount <= 2 ? 'это вполне решаемо с правильными упражнениями' : 'при регулярных тренировках всё можно скорректировать'}.`
      : 'Серьёзных ошибок техники не выявлено — это отличный результат. Продолжай следить за качеством движений на каждой тренировке.';

    const exercises_message = exercisesCount > 0
      ? `Вот упражнения, которые подобраны специально под твои ошибки и слабые места. Выполняй их регулярно — они помогут закрепить правильные паттерны движения и сделать бег более эффективным.`
      : 'Специальные корректирующие упражнения сейчас не нужны — техника на отличном уровне. Сосредоточься на поддержании формы и постепенном увеличении нагрузки.';

    return { first_message, technique_message, focus_message, focus_recommendation, errors_message, exercises_message };
  }

  private mapLevel(levelRu: string): string {
    const mapping: Record<string, string> = {
      'Элитный': 'Профессионал',
      'Продвинутый': 'Продвинутый',
      'Средний': 'Любитель',
      'Начальный': 'Начинающий',
      'Требуется помощь': 'Новичок',
    };
    return mapping[levelRu] ?? levelRu;
  }
}
