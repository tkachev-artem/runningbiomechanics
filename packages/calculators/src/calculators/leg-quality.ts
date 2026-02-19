import { LegData, LegQualityResult } from '@biomech/types';
import { gaussianNormalize, calculateAsymmetry, calculateAsymmetryPenalty } from '../utils/math';
import { BIOMECHANICS_NORMS } from '../data/norms';

/**
 * Расчет качества работы ног
 * 
 * Оценивает:
 * - Угол колена (knee_angle)
 * - Угол голеностопа (ankle_angle)
 * - Угол бедра (hip_angle)
 * - Угол голени (shank_angle)
 * - Симметрию между левой и правой ногой
 * 
 * @param leftLeg - данные левой ноги
 * @param rightLeg - данные правой ноги
 * @returns результат расчета качества ног
 */
export function calculateLegQuality(
  leftLeg: LegData,
  rightLeg: LegData
): LegQualityResult {
  const { leg } = BIOMECHANICS_NORMS;

  // 1. Оценка левой ноги
  const leftKneeScore = gaussianNormalize(
    leftLeg.knee_angle.mean,
    leg.knee_angle.optimal,
    leg.knee_angle.sigma
  );

  const leftAnkleScore = gaussianNormalize(
    leftLeg.ankle_angle.mean,
    leg.ankle_angle.optimal,
    leg.ankle_angle.sigma
  );

  const leftHipScore = gaussianNormalize(
    leftLeg.hip_angle.mean,
    leg.hip_angle.optimal,
    leg.hip_angle.sigma
  );

  const leftShankScore = gaussianNormalize(
    leftLeg.shank_angle.mean,
    leg.shank_angle.optimal,
    leg.shank_angle.sigma
  );

  // Веса для компонентов ноги
  const leftLegScore =
    leftKneeScore * 0.3 +
    leftAnkleScore * 0.25 +
    leftHipScore * 0.25 +
    leftShankScore * 0.2;

  // 2. Оценка правой ноги
  const rightKneeScore = gaussianNormalize(
    rightLeg.knee_angle.mean,
    leg.knee_angle.optimal,
    leg.knee_angle.sigma
  );

  const rightAnkleScore = gaussianNormalize(
    rightLeg.ankle_angle.mean,
    leg.ankle_angle.optimal,
    leg.ankle_angle.sigma
  );

  const rightHipScore = gaussianNormalize(
    rightLeg.hip_angle.mean,
    leg.hip_angle.optimal,
    leg.hip_angle.sigma
  );

  const rightShankScore = gaussianNormalize(
    rightLeg.shank_angle.mean,
    leg.shank_angle.optimal,
    leg.shank_angle.sigma
  );

  const rightLegScore =
    rightKneeScore * 0.3 +
    rightAnkleScore * 0.25 +
    rightHipScore * 0.25 +
    rightShankScore * 0.2;

  // 3. Расчет симметрии ног
  const legSymmetry = 100 - calculateAsymmetry(leftLegScore, rightLegScore);

  // 4. Расчет штрафа за асимметрию
  const asymmetryIndex = 100 - legSymmetry;
  const asymmetryPenalty = calculateAsymmetryPenalty(asymmetryIndex, 20);

  // 5. Итоговый индекс качества ног
  const legQualityIndex = Math.max(
    0,
    (leftLegScore + rightLegScore) / 2 - asymmetryPenalty
  );

  return {
    leg_quality_index: legQualityIndex,
    leg_symmetry: legSymmetry,
    left_leg_score: leftLegScore,
    right_leg_score: rightLegScore,
    asymmetry_penalty: asymmetryPenalty,
    details: {
      left_knee_score: leftKneeScore,
      left_ankle_score: leftAnkleScore,
      left_hip_score: leftHipScore,
      left_shank_score: leftShankScore,
      right_knee_score: rightKneeScore,
      right_ankle_score: rightAnkleScore,
      right_hip_score: rightHipScore,
      right_shank_score: rightShankScore,
    },
  };
}
