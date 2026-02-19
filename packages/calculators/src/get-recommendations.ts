import { RunningError, RecommendationResult, Recommendation, RunnerLevel, Exercise } from '@biomech/types';
import { getExercisesForErrors } from './data/exercises';

/**
 * MCP Tool #3: Получение персонализированных рекомендаций
 * 
 * На основе выявленных ошибок формирует:
 * - Приоритизированные рекомендации по улучшению техники
 * - Подборку упражнений для коррекции
 * - Фокусные области для работы
 * - Оценку времени для улучшения
 * 
 * @param errors - список выявленных ошибок
 * @param runnerLevel - текущий уровень бегуна (опционально)
 * @returns результат с рекомендациями
 */
export async function getRecommendations(
  errors: RunningError[],
  runnerLevel?: RunnerLevel
): Promise<RecommendationResult> {
  // Если ошибок нет - возвращаем позитивный результат
  if (errors.length === 0) {
    return {
      recommendations: [
        {
          priority: 1,
          focus_area: 'Поддержание формы',
          recommendation: 'Продолжайте текущий режим тренировок',
          reason: 'Ваша техника бега находится на отличном уровне',
          expected_improvement: 'Поддержание текущего уровня',
        },
      ],
      exercises: [],
      focus_areas: ['Поддержание техники'],
      estimated_improvement_time: 'Не требуется',
      summary: 'Техника бега отличная! Продолжайте в том же духе.',
    };
  }

  // Сортируем ошибки по серьезности и уверенности
  const sortedErrors = [...errors].sort((a, b) => {
    const severityOrder = { 'Критическая': 4, 'Высокая': 3, 'Средняя': 2, 'Низкая': 1 };
    const severityDiff = (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
    if (severityDiff !== 0) return severityDiff;
    return b.confidence - a.confidence;
  });

  // Генерируем рекомендации
  const recommendations = generateRecommendations(sortedErrors, runnerLevel);

  // Получаем упражнения для коррекции
  const errorTypes = sortedErrors.map(e => e.error_type);
  const exercises = getExercisesForErrors(errorTypes).slice(0, 5); // Топ-5 упражнений

  // Формируем фокусные области
  const focusAreas = getFocusAreas(sortedErrors);

  // Оцениваем время для улучшения
  const estimatedTime = estimateImprovementTime(sortedErrors, runnerLevel);

  // Формируем резюме
  const summary = generateRecommendationSummary(recommendations, exercises);

  return {
    recommendations,
    exercises,
    focus_areas: focusAreas,
    estimated_improvement_time: estimatedTime,
    summary,
  };
}

/**
 * Генерация рекомендаций на основе ошибок
 */
function generateRecommendations(
  errors: RunningError[],
  _runnerLevel?: RunnerLevel
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Берем топ-5 самых критичных ошибок
  const topErrors = errors.slice(0, 5);

  topErrors.forEach((error, index) => {
    let recommendation: string;
    let expectedImprovement: string;

    switch (error.error_type) {
      case 'ARM_ASYMMETRY':
        recommendation = 'Работайте над симметричной работой рук. Выполняйте односторонние упражнения, акцентируя внимание на слабой стороне.';
        expectedImprovement = 'Улучшение симметрии на 5-10% за 2-3 недели';
        break;

      case 'LEG_ASYMMETRY':
        recommendation = 'Укрепляйте слабую ногу через односторонние упражнения. Обратите внимание на баланс и стабильность.';
        expectedImprovement = 'Улучшение симметрии на 5-8% за 3-4 недели';
        break;

      case 'KNEE_INSTABILITY':
        recommendation = 'Работайте над стабильностью коленного сустава. Упражнения на баланс и укрепление мышц вокруг колена.';
        expectedImprovement = 'Снижение вариативности на 20-30% за 4-6 недель';
        break;

      case 'EXCESSIVE_VERTICAL_OSCILLATION':
        recommendation = 'Фокусируйтесь на горизонтальном движении вперед, а не на вертикальных прыжках. Короткие быстрые шаги.';
        expectedImprovement = 'Снижение вертикальных колебаний на 15-25% за 2-4 недели';
        break;

      case 'POOR_TRUNK_POSTURE':
        recommendation = 'Работайте над осанкой и стабильностью корпуса. Укрепляйте мышцы кора, следите за наклоном туловища.';
        expectedImprovement = 'Улучшение осанки на 10-15% за 3-5 недель';
        break;

      case 'OVERSTRIDING':
        recommendation = 'Увеличьте частоту шагов (каденс), уменьшите длину шага. Приземляйтесь под центр тяжести.';
        expectedImprovement = 'Улучшение техники на 15-20% за 3-4 недели';
        break;

      case 'EXCESSIVE_PRONATION':
        recommendation = 'Укрепляйте стопы и голеностопы. Рассмотрите подбор правильной обуви с поддержкой.';
        expectedImprovement = 'Улучшение на 10-15% за 4-6 недель';
        break;

      case 'INSUFFICIENT_ARM_DRIVE':
        recommendation = 'Увеличьте амплитуду маха рук. Локти согнуты ~90°, руки двигаются от бедра до уровня груди.';
        expectedImprovement = 'Улучшение работы рук на 15-20% за 2-3 недели';
        break;

      default:
        recommendation = 'Работайте над общей техникой бега под руководством тренера.';
        expectedImprovement = 'Постепенное улучшение за 4-8 недель';
    }

    recommendations.push({
      priority: index + 1,
      focus_area: error.error_name,
      recommendation,
      reason: error.description,
      expected_improvement: expectedImprovement,
    });
  });

  // Добавляем общую рекомендацию, если ошибок много
  if (errors.length > 5) {
    recommendations.push({
      priority: 6,
      focus_area: 'Общая техника',
      recommendation: 'Рекомендуется работа с квалифицированным тренером по бегу для комплексного улучшения техники.',
      reason: `Выявлено ${errors.length} ошибок техники`,
      expected_improvement: 'Значительное улучшение за 2-3 месяца',
    });
  }

  return recommendations;
}

/**
 * Определение фокусных областей
 */
function getFocusAreas(errors: RunningError[]): string[] {
  const areas = new Set<string>();

  errors.forEach(error => {
    if (error.error_type.includes('ARM')) {
      areas.add('Работа рук');
    }
    if (error.error_type.includes('LEG') || error.error_type.includes('KNEE')) {
      areas.add('Работа ног');
    }
    if (error.error_type.includes('TRUNK')) {
      areas.add('Стабильность корпуса');
    }
    if (error.error_type === 'EXCESSIVE_VERTICAL_OSCILLATION') {
      areas.add('Горизонтальность движения');
    }
  });

  return Array.from(areas);
}

/**
 * Оценка времени для улучшения
 */
function estimateImprovementTime(errors: RunningError[], runnerLevel?: RunnerLevel): string {
  const criticalCount = errors.filter(e => e.severity === 'Критическая').length;
  const highCount = errors.filter(e => e.severity === 'Высокая').length;

  let baseWeeks = 0;

  if (criticalCount > 0) {
    baseWeeks += criticalCount * 6;
  }
  if (highCount > 0) {
    baseWeeks += highCount * 4;
  }
  baseWeeks += errors.length * 2;

  // Корректируем на уровень бегуна
  if (runnerLevel === 'ELITE' || runnerLevel === 'ADVANCED') {
    baseWeeks *= 0.7; // опытные бегуны быстрее адаптируются
  } else if (runnerLevel === 'BEGINNER' || runnerLevel === 'NEEDS_HELP') {
    baseWeeks *= 1.3; // новичкам нужно больше времени
  }

  const weeks = Math.ceil(baseWeeks);

  if (weeks <= 4) {
    return '2-4 недели при регулярных тренировках';
  } else if (weeks <= 8) {
    return '1-2 месяца при регулярных тренировках';
  } else if (weeks <= 12) {
    return '2-3 месяца при регулярных тренировках';
  } else {
    return '3-6 месяцев при регулярных тренировках и работе с тренером';
  }
}

/**
 * Генерация резюме рекомендаций
 */
function generateRecommendationSummary(
  recommendations: Recommendation[],
  exercises: Exercise[]
): string {
  let summary = `Персонализированный план улучшения техники бега:\n\n`;

  summary += `Приоритетные области:\n`;
  recommendations.slice(0, 3).forEach(rec => {
    summary += `${rec.priority}. ${rec.focus_area}\n`;
  });

  summary += `\nРекомендуется выполнять ${exercises.length} упражнений:\n`;
  exercises.slice(0, 3).forEach(ex => {
    summary += `- ${ex.name} (${ex.frequency})\n`;
  });

  summary += `\nПри регулярных тренировках вы увидите первые результаты через 2-3 недели.`;

  return summary;
}
