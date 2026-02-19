import { RunBiomechanicsInput, EfficiencyResult } from '@biomech/types';
import { calculateCV } from '../utils/math';
import { adjustEfficiencyForBMI, calculateBMI, adjustVerticalOscillationForHeight } from '../utils/bmi';

/**
 * Расчет эффективности движений
 * 
 * Оценивает экономичность бега через:
 * - Минимизацию вертикальных колебаний (hip_angle вариативность)
 * - Оптимальность амплитуды движений
 * - Отсутствие избыточных движений
 * 
 * @param data - полные биомеханические данные
 * @returns результат расчета эффективности
 */
export function calculateEfficiency(data: RunBiomechanicsInput): EfficiencyResult {
  // 1. Экономичность вертикальных движений
  // Меньше вертикальных колебаний = лучше
  const leftHipCV = calculateCV(data.left_leg.hip_angle.std, data.left_leg.hip_angle.mean);
  const rightHipCV = calculateCV(
    data.right_leg.hip_angle.std,
    data.right_leg.hip_angle.mean
  );
  const avgHipCV = (leftHipCV + rightHipCV) / 2;

  // Оптимальный CV для hip_angle ~ 20-25%
  // Слишком низкий CV = жесткость, слишком высокий = нестабильность
  const verticalEfficiency = 100 - Math.abs(avgHipCV - 22) * 2;

  // 2. Экономичность движения рук
  // Меньше вариативность arm_swing = более эффективно
  const leftArmSwingCV = calculateCV(
    data.left_arm.arm_swing.std,
    data.left_arm.arm_swing.mean
  );
  const rightArmSwingCV = calculateCV(
    data.right_arm.arm_swing.std,
    data.right_arm.arm_swing.mean
  );
  const avgArmSwingCV = (leftArmSwingCV + rightArmSwingCV) / 2;

  // Оптимальный CV для arm_swing ~ 5-8%
  const armEfficiency = 100 - Math.max(0, avgArmSwingCV - 8) * 5;

  // 3. Экономичность работы коленей
  // Избыточная вариативность = потеря энергии
  const leftKneeCV = calculateCV(data.left_leg.knee_angle.std, data.left_leg.knee_angle.mean);
  const rightKneeCV = calculateCV(
    data.right_leg.knee_angle.std,
    data.right_leg.knee_angle.mean
  );
  const avgKneeCV = (leftKneeCV + rightKneeCV) / 2;

  // Оптимальный CV для knee_angle ~ 15-18%
  const kneeEfficiency = 100 - Math.abs(avgKneeCV - 16) * 3;

  // 4. Общая экономичность движений
  const movementEconomy =
    verticalEfficiency * 0.4 + armEfficiency * 0.3 + kneeEfficiency * 0.3;

  // 5. Штраф за потерю энергии
  // Рассчитывается по избыточной вариативности всех параметров
  const totalExcessVariability =
    Math.max(0, avgHipCV - 25) +
    Math.max(0, avgArmSwingCV - 10) +
    Math.max(0, avgKneeCV - 20);

  const energyWastePenalty = Math.min(30, totalExcessVariability * 1.5);

  // 6. Коррекция на ИМТ и рост (если доступны)
  let adjustedMovementEconomy = movementEconomy;
  
  if (data.weight_kg && data.height_cm) {
    const bmi = calculateBMI(data.weight_kg, data.height_cm);
    adjustedMovementEconomy = adjustEfficiencyForBMI(movementEconomy, bmi);
  }
  
  // Коррекция вертикальных колебаний на рост
  if (data.height_cm) {
    const vertEfficiencyAdjusted = adjustVerticalOscillationForHeight(verticalEfficiency, data.height_cm);
    const improvement = vertEfficiencyAdjusted - verticalEfficiency;
    adjustedMovementEconomy += improvement * 0.4; // 40% веса вертикальной эффективности
  }

  // 7. Итоговый score эффективности
  const efficiencyScore = Math.max(0, adjustedMovementEconomy - energyWastePenalty);

  return {
    efficiency_score: efficiencyScore,
    movement_economy: adjustedMovementEconomy,
    energy_waste_penalty: energyWastePenalty,
  };
}
