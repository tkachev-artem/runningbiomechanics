/**
 * Утилиты для перевода на русский
 */

import { ErrorSeverity, ErrorSeverityRu } from '@biomech/types';

/**
 * Перевод уровня серьезности на русский
 */
export function translateSeverity(severity: ErrorSeverity): ErrorSeverityRu {
  const translations: Record<ErrorSeverity, ErrorSeverityRu> = {
    'LOW': 'Низкая',
    'MEDIUM': 'Средняя',
    'HIGH': 'Высокая',
    'CRITICAL': 'Критическая',
  };
  return translations[severity];
}

/**
 * Перевод сложности на русский
 */
export function translateDifficulty(difficulty: 'EASY' | 'MEDIUM' | 'HARD'): 'Легко' | 'Средне' | 'Сложно' {
  const translations = {
    'EASY': 'Легко' as const,
    'MEDIUM': 'Средне' as const,
    'HARD': 'Сложно' as const,
  };
  return translations[difficulty];
}
