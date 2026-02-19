import { RunBiomechanicsInput, RunAnalysisResult, RunnerLevel, RunnerLevelRu, CategoryScores } from '@biomech/types';
import { RunBiomechanicsInputSchema } from '@biomech/types';
import { calculateArmQuality } from './calculators/arm-quality';
import { calculateLegQuality } from './calculators/leg-quality';
import { calculateTrunkStability } from './calculators/trunk-stability';
import { calculateSymmetry } from './calculators/symmetry';
import { calculateEfficiency } from './calculators/efficiency';
import { calculateConsistency } from './calculators/consistency';
import { BIOMECHANICS_NORMS } from './data/norms';
import { roundTo } from './utils/math';
import { calculateBMI, getBMICategory } from './utils/bmi';

/**
 * MCP Tool #1: Анализ биомеханики пробежки
 * 
 * Выполняет полный анализ биомеханических данных:
 * - Рассчитывает оценки по 6 категориям
 * - Вычисляет итоговый score
 * - Классифицирует уровень бегуна
 * - Формирует текстовое резюме
 * 
 * @param data - биомеханические данные пробежки
 * @returns результат анализа
 */
export async function analyzeRunBiomechanics(
  data: RunBiomechanicsInput
): Promise<RunAnalysisResult> {
  // Валидация входных данных
  const validatedData = RunBiomechanicsInputSchema.parse(data);

  // 1. Расчет качества рук
  const armQualityResult = calculateArmQuality(
    validatedData.left_arm,
    validatedData.right_arm
  );

  // 2. Расчет качества ног
  const legQualityResult = calculateLegQuality(
    validatedData.left_leg,
    validatedData.right_leg
  );

  // 3. Расчет стабильности туловища
  const trunkStabilityResult = calculateTrunkStability(
    validatedData.trunk,
    validatedData.head
  );

  // 4. Расчет общей симметрии
  const symmetryResult = calculateSymmetry(validatedData);

  // 5. Расчет эффективности
  const efficiencyResult = calculateEfficiency(validatedData);

  // 6. Расчет консистентности
  const consistencyResult = calculateConsistency(validatedData);

  // 7. Формирование категорий оценки
  const categoryScores: CategoryScores = {
    arm_quality: roundTo(armQualityResult.arm_quality_index, 1),
    leg_quality: roundTo(legQualityResult.leg_quality_index, 1),
    trunk_stability: roundTo(trunkStabilityResult.trunk_stability_score, 1),
    symmetry: roundTo(symmetryResult.symmetry_score, 1),
    efficiency: roundTo(efficiencyResult.efficiency_score, 1),
    consistency: roundTo(consistencyResult.consistency_score, 1),
  };

  // 8. Расчет итогового score с весами
  const { category_weights } = BIOMECHANICS_NORMS;
  
  const finalScore = roundTo(
    categoryScores.arm_quality * category_weights.arm_quality +
    categoryScores.leg_quality * category_weights.leg_quality +
    categoryScores.trunk_stability * category_weights.trunk_stability +
    categoryScores.symmetry * category_weights.symmetry +
    categoryScores.efficiency * category_weights.efficiency +
    categoryScores.consistency * category_weights.consistency,
    1
  );

  // 9. Классификация уровня бегуна
  const classification = classifyRunnerLevel(finalScore);
  const classificationRu = translateClassification(classification);

  // 10. Расчет ИМТ и категории веса (если доступны данные)
  let bmi: number | undefined;
  let weightCategory: string | undefined;
  
  if (validatedData.weight_kg && validatedData.height_cm) {
    bmi = roundTo(calculateBMI(validatedData.weight_kg, validatedData.height_cm), 1);
    weightCategory = getBMICategory(bmi);
  }

  // 11. Формирование текстового резюме
  const summary = generateSummary(classificationRu, finalScore, categoryScores, bmi, weightCategory);

  // 12. Возврат результата
  return {
    общий_индекс_качества: finalScore,
    оценки_категорий: categoryScores,
    итоговая_оценка: finalScore,
    классификация: classificationRu,
    резюме: summary,
    временная_метка: new Date().toISOString(),
    bmi,
    weight_category: weightCategory,
  };
}

/**
 * Классификация уровня бегуна на основе итогового score
 */
function classifyRunnerLevel(score: number): RunnerLevel {
  const { classification_thresholds } = BIOMECHANICS_NORMS;

  if (score >= classification_thresholds.elite) return 'ELITE';
  if (score >= classification_thresholds.advanced) return 'ADVANCED';
  if (score >= classification_thresholds.intermediate) return 'INTERMEDIATE';
  if (score >= classification_thresholds.beginner) return 'BEGINNER';
  return 'NEEDS_HELP';
}

/**
 * Перевод классификации на русский
 */
function translateClassification(level: RunnerLevel): RunnerLevelRu {
  const translations: Record<RunnerLevel, RunnerLevelRu> = {
    'ELITE': 'Элитный',
    'ADVANCED': 'Продвинутый',
    'INTERMEDIATE': 'Средний',
    'BEGINNER': 'Начальный',
    'NEEDS_HELP': 'Требуется помощь',
  };
  return translations[level];
}

/**
 * Генерация текстового резюме анализа
 */
function generateSummary(
  classification: RunnerLevelRu,
  finalScore: number,
  categoryScores: CategoryScores,
  bmi?: number,
  weightCategory?: string
): string {

  // Находим сильные и слабые стороны
  const scores = Object.entries(categoryScores);
  const sortedScores = scores.sort((a, b) => b[1] - a[1]);
  
  const strongest = sortedScores[0];
  const weakest = sortedScores[sortedScores.length - 1];

  const categoryNames: Record<keyof CategoryScores, string> = {
    arm_quality: 'Работа рук',
    leg_quality: 'Работа ног',
    trunk_stability: 'Стабильность туловища',
    symmetry: 'Симметрия',
    efficiency: 'Эффективность',
    consistency: 'Консистентность',
  };

  let summary = `${classification} уровень. Итоговая оценка: ${finalScore}/100.\n\n`;

  // Добавляем информацию об ИМТ если доступна
  if (bmi && weightCategory) {
    summary += `Физические параметры:\n`;
    summary += `- ИМТ: ${bmi} (${weightCategory})\n\n`;
  }

  summary += `Сильные стороны:\n`;
  summary += `- ${categoryNames[strongest[0] as keyof CategoryScores]}: ${strongest[1].toFixed(1)}/100\n`;

  summary += `\nОбласти для улучшения:\n`;
  summary += `- ${categoryNames[weakest[0] as keyof CategoryScores]}: ${weakest[1].toFixed(1)}/100\n`;

  // Добавляем общую оценку
  if (classification === 'Элитный') {
    summary += `\nОтличная техника бега! Продолжайте поддерживать высокий уровень.`;
  } else if (classification === 'Продвинутый') {
    summary += `\nХорошая техника бега с небольшим потенциалом для улучшения.`;
  } else if (classification === 'Средний') {
    summary += `\nУмеренная техника бега. Рекомендуется работа над выявленными слабостями.`;
  } else if (classification === 'Начальный') {
    summary += `\nБазовая техника бега. Есть значительный потенциал для улучшения.`;
  } else {
    summary += `\nТехника бега требует серьезной коррекции. Рекомендуется работа с тренером.`;
  }

  return summary;
}
