/**
 * Утилиты для расчета ИМТ и категорий по весу
 */

/**
 * Расчет ИМТ (Индекс массы тела)
 * @param weight_kg - вес в килограммах
 * @param height_cm - рост в сантиметрах
 * @returns ИМТ
 */
export function calculateBMI(weight_kg: number, height_cm: number): number {
  const height_m = height_cm / 100;
  return weight_kg / (height_m * height_m);
}

/**
 * Определение категории по ИМТ
 * @param bmi - индекс массы тела
 * @returns категория
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Недостаточный вес';
  if (bmi < 25) return 'Нормальный вес';
  if (bmi < 30) return 'Избыточный вес';
  return 'Ожирение';
}

/**
 * Коррекция оценки эффективности на основе ИМТ
 * Бегуны с оптимальным ИМТ (19-24) получают бонус к эффективности
 * 
 * @param baseScore - базовая оценка эффективности
 * @param bmi - индекс массы тела
 * @returns скорректированная оценка
 */
export function adjustEfficiencyForBMI(baseScore: number, bmi?: number): number {
  if (!bmi) return baseScore;

  let adjustment = 0;

  if (bmi >= 19 && bmi <= 24) {
    // Оптимальный вес для бегунов - бонус
    adjustment = 5;
  } else if (bmi >= 17 && bmi < 19) {
    // Немного недовес - небольшой штраф
    adjustment = -2;
  } else if (bmi > 24 && bmi <= 27) {
    // Немного перевес - небольшой штраф
    adjustment = -3;
  } else if (bmi > 27 && bmi <= 30) {
    // Избыточный вес - средний штраф
    adjustment = -8;
  } else if (bmi > 30) {
    // Ожирение - значительный штраф
    adjustment = -15;
  } else if (bmi < 17) {
    // Значительный недовес - средний штраф
    adjustment = -5;
  }

  return Math.max(0, Math.min(100, baseScore + adjustment));
}

/**
 * Коррекция оценки вертикальных колебаний на основе роста
 * Высокие бегуны естественно имеют больше вертикальных колебаний
 * 
 * @param baseScore - базовая оценка
 * @param height_cm - рост в см
 * @returns скорректированная оценка
 */
export function adjustVerticalOscillationForHeight(
  baseScore: number,
  height_cm?: number
): number {
  if (!height_cm) return baseScore;

  let adjustment = 0;

  if (height_cm >= 185) {
    // Высокие бегуны - допустимо больше колебаний
    adjustment = 3;
  } else if (height_cm >= 175 && height_cm < 185) {
    // Средне-высокие
    adjustment = 1;
  } else if (height_cm < 160) {
    // Низкие бегуны - должны иметь меньше колебаний
    adjustment = -2;
  }

  return Math.max(0, Math.min(100, baseScore + adjustment));
}

/**
 * Рекомендуемая частота шагов (каденс) на основе роста
 * @param height_cm - рост в см
 * @returns рекомендуемый каденс (шагов в минуту)
 */
export function getRecommendedCadence(height_cm: number): number {
  // Базовый каденс 180 шагов/мин
  // Коррекция: +2 шага на каждые 5 см ниже 170 см
  // Коррекция: -2 шага на каждые 5 см выше 180 см
  
  if (height_cm < 170) {
    const diff = 170 - height_cm;
    return 180 + Math.floor(diff / 5) * 2;
  } else if (height_cm > 180) {
    const diff = height_cm - 180;
    return 180 - Math.floor(diff / 5) * 2;
  }
  
  return 180;
}
