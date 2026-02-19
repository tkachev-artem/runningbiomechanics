/**
 * Гауссовская нормализация значения
 * Использует функцию Гаусса для расчета score от 0 до 100
 * 
 * @param value - текущее значение параметра
 * @param optimal - оптимальное значение параметра
 * @param sigma - стандартное отклонение (контролирует "ширину" колокола)
 * @returns нормализованный score (0-100)
 */
export function gaussianNormalize(
  value: number,
  optimal: number,
  sigma: number
): number {
  const z = (value - optimal) / sigma;
  const score = 100 * Math.exp(-0.5 * z * z);
  return Math.max(0, Math.min(100, score));
}

/**
 * Расчет коэффициента вариации (CV)
 * CV показывает относительную вариативность данных
 * 
 * @param std - стандартное отклонение
 * @param mean - среднее значение
 * @returns CV в процентах
 */
export function calculateCV(std: number, mean: number): number {
  if (mean === 0) return 0;
  return (std / Math.abs(mean)) * 100;
}

/**
 * Расчет процентиля для нормального распределения
 * 
 * @param value - значение
 * @param mean - среднее
 * @param std - стандартное отклонение
 * @returns процентиль (0-100)
 */
export function calculatePercentile(value: number, mean: number, std: number): number {
  const z = (value - mean) / std;
  // Приблизительная формула для CDF нормального распределения
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p =
    d *
    t *
    (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  
  return z >= 0 ? (1 - p) * 100 : p * 100;
}

/**
 * Линейная нормализация значения в диапазон 0-100
 * 
 * @param value - текущее значение
 * @param min - минимальное допустимое значение
 * @param max - максимальное допустимое значение
 * @param inverse - инвертировать ли шкалу (true = меньше лучше)
 * @returns нормализованный score (0-100)
 */
export function linearNormalize(
  value: number,
  min: number,
  max: number,
  inverse = false
): number {
  if (max === min) return 50;
  
  const normalized = ((value - min) / (max - min)) * 100;
  const clamped = Math.max(0, Math.min(100, normalized));
  
  return inverse ? 100 - clamped : clamped;
}

/**
 * Расчет взвешенной суммы оценок
 * 
 * @param scores - массив оценок
 * @param weights - массив весов (должен суммироваться в 1.0)
 * @returns взвешенная сумма
 */
export function weightedSum(scores: number[], weights: number[]): number {
  if (scores.length !== weights.length) {
    throw new Error('Scores and weights arrays must have the same length');
  }
  
  const sum = scores.reduce((acc, score, i) => acc + score * weights[i], 0);
  return Math.max(0, Math.min(100, sum));
}

/**
 * Расчет асимметрии между левой и правой стороной
 * 
 * @param leftValue - значение левой стороны
 * @param rightValue - значение правой стороны
 * @returns индекс асимметрии (0 = идеальная симметрия, 100 = максимальная асимметрия)
 */
export function calculateAsymmetry(leftValue: number, rightValue: number): number {
  const average = (leftValue + rightValue) / 2;
  if (average === 0) return 0;
  
  const asymmetry = (Math.abs(leftValue - rightValue) / average) * 100;
  return Math.min(100, asymmetry);
}

/**
 * Расчет штрафа за асимметрию
 * 
 * @param asymmetryIndex - индекс асимметрии (0-100)
 * @param maxPenalty - максимальный штраф
 * @returns штраф (0 до maxPenalty)
 */
export function calculateAsymmetryPenalty(
  asymmetryIndex: number,
  maxPenalty = 20
): number {
  // Прогрессивный штраф: небольшая асимметрия - маленький штраф,
  // большая асимметрия - экспоненциально растущий штраф
  const normalizedAsymmetry = asymmetryIndex / 100;
  return maxPenalty * Math.pow(normalizedAsymmetry, 1.5);
}

/**
 * Расчет консистентности на основе CV
 * Низкий CV = высокая консистентность
 * 
 * @param cv - коэффициент вариации в процентах
 * @param optimalCV - оптимальный CV (обычно 5-10%)
 * @returns оценка консистентности (0-100)
 */
export function calculateConsistencyScore(cv: number, optimalCV = 8): number {
  // Использует гауссовскую функцию, где optimalCV - центр
  return gaussianNormalize(cv, optimalCV, 5);
}

/**
 * Определение severity level на основе значения
 * 
 * @param value - значение метрики
 * @param thresholds - пороги [low, medium, high]
 * @returns уровень серьезности
 */
export function determineSeverity(
  value: number,
  thresholds: [number, number, number]
): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  const [low, medium, high] = thresholds;
  
  if (value < low) return 'LOW';
  if (value < medium) return 'MEDIUM';
  if (value < high) return 'HIGH';
  return 'CRITICAL';
}

/**
 * Clamp значение в заданный диапазон
 * 
 * @param value - значение
 * @param min - минимум
 * @param max - максимум
 * @returns ограниченное значение
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Округление до заданного количества знаков после запятой
 * 
 * @param value - значение
 * @param decimals - количество знаков после запятой
 * @returns округленное значение
 */
export function roundTo(value: number, decimals = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}
