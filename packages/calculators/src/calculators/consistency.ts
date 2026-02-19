import { RunBiomechanicsInput, ConsistencyResult } from '@biomech/types';
import { calculateCV } from '../utils/math';

/**
 * Расчет консистентности (стабильности) движений
 * 
 * Оценивает насколько стабильно повторяются движения от шага к шагу
 * Низкая вариативность (CV) = высокая консистентность = хорошо
 * 
 * @param data - полные биомеханические данные
 * @returns результат расчета консистентности
 */
export function calculateConsistency(data: RunBiomechanicsInput): ConsistencyResult {
  // Собираем все CV для разных параметров
  const cvValues: number[] = [];

  // 1. CV для рук
  cvValues.push(
    calculateCV(data.left_arm.arm_swing.std, data.left_arm.arm_swing.mean),
    calculateCV(data.left_arm.elbow_angle.std, data.left_arm.elbow_angle.mean),
    calculateCV(data.right_arm.arm_swing.std, data.right_arm.arm_swing.mean),
    calculateCV(data.right_arm.elbow_angle.std, data.right_arm.elbow_angle.mean)
  );

  // 2. CV для ног
  cvValues.push(
    calculateCV(data.left_leg.knee_angle.std, data.left_leg.knee_angle.mean),
    calculateCV(data.left_leg.ankle_angle.std, data.left_leg.ankle_angle.mean),
    calculateCV(data.left_leg.hip_angle.std, data.left_leg.hip_angle.mean),
    calculateCV(data.left_leg.shank_angle.std, data.left_leg.shank_angle.mean),
    calculateCV(data.right_leg.knee_angle.std, data.right_leg.knee_angle.mean),
    calculateCV(data.right_leg.ankle_angle.std, data.right_leg.ankle_angle.mean),
    calculateCV(data.right_leg.hip_angle.std, data.right_leg.hip_angle.mean),
    calculateCV(data.right_leg.shank_angle.std, data.right_leg.shank_angle.mean)
  );

  // 3. CV для туловища и головы
  cvValues.push(
    calculateCV(data.trunk.trunk_angle.std, data.trunk.trunk_angle.mean),
    calculateCV(data.head.head_angle.std, data.head.head_angle.mean)
  );

  // 4. Средний CV по всем параметрам
  const overallCV = cvValues.reduce((sum, cv) => sum + cv, 0) / cvValues.length;

  // 5. Расчет score консистентности
  // Оптимальный общий CV ~ 10-12%
  // Меньше = слишком жестко, больше = нестабильно
  let consistencyScore: number;

  if (overallCV < 5) {
    // Слишком низкая вариативность - может быть жесткость
    consistencyScore = 70 + overallCV * 4;
  } else if (overallCV <= 12) {
    // Оптимальный диапазон
    consistencyScore = 100 - (overallCV - 5) * 2;
  } else {
    // Высокая вариативность - плохая консистентность
    consistencyScore = Math.max(0, 86 - (overallCV - 12) * 4);
  }

  // 6. Штраф за вариативность
  const variabilityPenalty = Math.max(0, (overallCV - 12) * 2);

  return {
    consistency_score: consistencyScore,
    overall_cv: overallCV,
    variability_penalty: variabilityPenalty,
  };
}
