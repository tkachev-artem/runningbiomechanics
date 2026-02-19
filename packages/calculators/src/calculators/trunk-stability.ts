import { TrunkData, HeadData, TrunkStabilityResult } from '@biomech/types';
import { gaussianNormalize, calculateConsistencyScore, calculateCV } from '../utils/math';
import { BIOMECHANICS_NORMS } from '../data/norms';

/**
 * Расчет стабильности туловища и головы
 * 
 * Оценивает:
 * - Угол наклона туловища (trunk_angle)
 * - Стабильность туловища (низкая вариативность = хорошо)
 * - Угол головы (head_angle)
 * 
 * @param trunk - данные туловища
 * @param head - данные головы
 * @returns результат расчета стабильности туловища
 */
export function calculateTrunkStability(
  trunk: TrunkData,
  head: HeadData
): TrunkStabilityResult {
  const { trunk: trunkNorms, head: headNorms } = BIOMECHANICS_NORMS;

  // 1. Оценка угла туловища
  const trunkAngleScore = gaussianNormalize(
    trunk.trunk_angle.mean,
    trunkNorms.trunk_angle.optimal,
    trunkNorms.trunk_angle.sigma
  );

  // 2. Оценка стабильности туловища (чем меньше std, тем лучше)
  const trunkCV = calculateCV(trunk.trunk_angle.std, trunk.trunk_angle.mean);
  const trunkConsistencyScore = calculateConsistencyScore(trunkCV, 1); // очень низкий оптимальный CV для туловища

  // 3. Оценка угла головы
  const headAngleScore = gaussianNormalize(
    head.head_angle.mean,
    headNorms.head_angle.optimal,
    headNorms.head_angle.sigma
  );

  // 4. Общая оценка стабильности
  // Веса: угол туловища 40%, стабильность 40%, угол головы 20%
  const trunkStabilityScore =
    trunkAngleScore * 0.4 + trunkConsistencyScore * 0.4 + headAngleScore * 0.2;

  return {
    trunk_stability_score: trunkStabilityScore,
    trunk_angle_score: trunkAngleScore,
    trunk_consistency_score: trunkConsistencyScore,
  };
}
