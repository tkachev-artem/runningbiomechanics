import { RunBiomechanicsInput, ErrorDetectionResult, RunningError } from '@biomech/types';
import { RunBiomechanicsInputSchema } from '@biomech/types';
import { detectRunningErrors, getHighestSeverity } from './engines/error-detection';

/**
 * MCP Tool #2: Выявление ошибок техники бега
 * 
 * Анализирует биомеханические данные и выявляет:
 * - Асимметрии (рук, ног)
 * - Нестабильности (колени, туловище)
 * - Проблемы с осанкой
 * - Избыточные движения
 * - Недостаточную активность
 * 
 * @param data - биомеханические данные пробежки
 * @returns результат выявления ошибок
 */
export async function detectErrors(
  data: RunBiomechanicsInput
): Promise<ErrorDetectionResult> {
  // Валидация входных данных
  const validatedData = RunBiomechanicsInputSchema.parse(data);

  // Выявление ошибок
  const errors = detectRunningErrors(validatedData);

  // Определение наивысшего уровня серьезности
  const highestSeverity = getHighestSeverity(errors);

  // Формирование резюме
  const summary = generateErrorSummary(errors);

  return {
    errors,
    error_count: errors.length,
    highest_severity: highestSeverity,
    summary,
  };
}

/**
 * Генерация текстового резюме по ошибкам
 */
function generateErrorSummary(errors: RunningError[]): string {
  if (errors.length === 0) {
    return 'Критических ошибок техники не обнаружено. Отличная работа!';
  }

  const severityCounts = {
    Критическая: errors.filter(e => e.severity === 'Критическая').length,
    Высокая: errors.filter(e => e.severity === 'Высокая').length,
    Средняя: errors.filter(e => e.severity === 'Средняя').length,
    Низкая: errors.filter(e => e.severity === 'Низкая').length,
  };

  let summary = `Обнаружено ${errors.length} ${errors.length === 1 ? 'ошибка' : 'ошибок'}:\n`;

  if (severityCounts.Критическая > 0) {
    summary += `- ${severityCounts.Критическая} критических\n`;
  }
  if (severityCounts.Высокая > 0) {
    summary += `- ${severityCounts.Высокая} высокой важности\n`;
  }
  if (severityCounts.Средняя > 0) {
    summary += `- ${severityCounts.Средняя} средней важности\n`;
  }
  if (severityCounts.Низкая > 0) {
    summary += `- ${severityCounts.Низкая} низкой важности\n`;
  }

  summary += `\nОсновные проблемы:\n`;
  
  // Показываем топ-3 самые серьезные ошибки
  const sortedErrors = [...errors].sort((a, b) => {
    const severityOrder = { 'Критическая': 4, 'Высокая': 3, 'Средняя': 2, 'Низкая': 1 };
    return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
  });

  sortedErrors.slice(0, 3).forEach((error, index) => {
    summary += `${index + 1}. ${error.error_name} (${error.severity})\n`;
  });

  return summary;
}
