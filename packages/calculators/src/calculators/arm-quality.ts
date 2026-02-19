import { ArmData, ArmQualityResult } from '@biomech/types';
import { gaussianNormalize, calculateAsymmetry, calculateAsymmetryPenalty } from '../utils/math';
import { BIOMECHANICS_NORMS } from '../data/norms';

/**
 * Расчет качества работы рук
 * 
 * Оценивает:
 * - Амплитуду маха рук (arm_swing)
 * - Угол сгибания локтя (elbow_angle)
 * - Симметрию между левой и правой рукой
 * 
 * @param leftArm - данные левой руки
 * @param rightArm - данные правой руки
 * @returns результат расчета качества рук
 */
export function calculateArmQuality(
  leftArm: ArmData,
  rightArm: ArmData
): ArmQualityResult {
  const { arm } = BIOMECHANICS_NORMS;

  // 1. Оценка левой руки
  const leftSwingScore = gaussianNormalize(
    leftArm.arm_swing.mean,
    arm.arm_swing.optimal,
    arm.arm_swing.sigma
  );

  const leftElbowScore = gaussianNormalize(
    leftArm.elbow_angle.mean,
    arm.elbow_angle.optimal,
    arm.elbow_angle.sigma
  );

  const leftArmScore = (leftSwingScore + leftElbowScore) / 2;

  // 2. Оценка правой руки
  const rightSwingScore = gaussianNormalize(
    rightArm.arm_swing.mean,
    arm.arm_swing.optimal,
    arm.arm_swing.sigma
  );

  const rightElbowScore = gaussianNormalize(
    rightArm.elbow_angle.mean,
    arm.elbow_angle.optimal,
    arm.elbow_angle.sigma
  );

  const rightArmScore = (rightSwingScore + rightElbowScore) / 2;

  // 3. Расчет симметрии рук
  const armSymmetry = 100 - calculateAsymmetry(leftArmScore, rightArmScore);

  // 4. Расчет штрафа за асимметрию
  const asymmetryIndex = 100 - armSymmetry;
  const asymmetryPenalty = calculateAsymmetryPenalty(asymmetryIndex, 15);

  // 5. Итоговый индекс качества рук
  const armQualityIndex = Math.max(
    0,
    (leftArmScore + rightArmScore) / 2 - asymmetryPenalty
  );

  return {
    arm_quality_index: armQualityIndex,
    arm_symmetry: armSymmetry,
    left_arm_score: leftArmScore,
    right_arm_score: rightArmScore,
    asymmetry_penalty: asymmetryPenalty,
    details: {
      left_swing_score: leftSwingScore,
      left_elbow_score: leftElbowScore,
      right_swing_score: rightSwingScore,
      right_elbow_score: rightElbowScore,
    },
  };
}
