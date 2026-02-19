import { RunBiomechanicsInput, SymmetryResult } from '@biomech/types';
import { calculateAsymmetry } from '../utils/math';

/**
 * Расчет общей симметрии движений
 * 
 * Оценивает симметрию между левой и правой стороной тела:
 * - Симметрия рук
 * - Симметрия ног
 * - Общая симметрия
 * 
 * @param data - полные биомеханические данные
 * @returns результат расчета симметрии
 */
export function calculateSymmetry(data: RunBiomechanicsInput): SymmetryResult {
  // 1. Симметрия рук
  const armSwingAsymmetry = calculateAsymmetry(
    data.left_arm.arm_swing.mean,
    data.right_arm.arm_swing.mean
  );

  const elbowAsymmetry = calculateAsymmetry(
    data.left_arm.elbow_angle.mean,
    data.right_arm.elbow_angle.mean
  );

  const armSymmetry = 100 - (armSwingAsymmetry + elbowAsymmetry) / 2;

  // 2. Симметрия ног
  const kneeAsymmetry = calculateAsymmetry(
    data.left_leg.knee_angle.mean,
    data.right_leg.knee_angle.mean
  );

  const ankleAsymmetry = calculateAsymmetry(
    data.left_leg.ankle_angle.mean,
    data.right_leg.ankle_angle.mean
  );

  const hipAsymmetry = calculateAsymmetry(
    data.left_leg.hip_angle.mean,
    data.right_leg.hip_angle.mean
  );

  const shankAsymmetry = calculateAsymmetry(
    data.left_leg.shank_angle.mean,
    data.right_leg.shank_angle.mean
  );

  const legSymmetry =
    100 -
    (kneeAsymmetry * 0.3 +
      ankleAsymmetry * 0.25 +
      hipAsymmetry * 0.25 +
      shankAsymmetry * 0.2);

  // 3. Общая симметрия
  // Веса: ноги важнее (60%), руки 40%
  const overallSymmetry = armSymmetry * 0.4 + legSymmetry * 0.6;

  // 4. Score симметрии (штраф за асимметрию)
  // Идеальная симметрия = 100, полная асимметрия = 0
  const symmetryScore = overallSymmetry;

  return {
    overall_symmetry: overallSymmetry,
    arm_symmetry: armSymmetry,
    leg_symmetry: legSymmetry,
    symmetry_score: symmetryScore,
  };
}
