/**
 * Упрощенная функция анализа для GigaChat function calling
 * Принимает агрегированные данные вместо детальных статистик
 */

import { RunBiomechanicsInput } from '@biomech/types';
import { analyzeRunBiomechanics } from './analyze-run';

export interface SimpleBiomechanicsInput {
  // Руки (средние значения)
  left_arm_swing_mean: number;
  right_arm_swing_mean: number;
  left_elbow_angle_mean: number;
  right_elbow_angle_mean: number;
  
  // Ноги (средние значения)
  left_knee_angle_mean: number;
  right_knee_angle_mean: number;
  left_ankle_angle_mean: number;
  right_ankle_angle_mean: number;
  
  // Туловище и голова
  trunk_angle_mean: number;
  head_angle_mean: number;
  
  // Физические параметры
  weight_kg: number;
  height_cm: number;
  
  // Опционально - вариативность
  knee_variability?: number; // CV колена
  trunk_stability?: number;  // стабильность туловища
}

/**
 * Преобразует упрощенные данные в полный формат
 */
function convertToFullFormat(simple: SimpleBiomechanicsInput): RunBiomechanicsInput {
  // Создаем синтетические статистики на основе средних значений
  const createMetric = (mean: number | undefined, variability: number = 0.05, defaultValue: number = 0) => {
    const value = mean !== undefined && !isNaN(mean) ? mean : defaultValue;
    return {
      min: value * (1 - variability),
      max: value * (1 + variability),
      mean: value,
      std: value * variability / 2,
      count: 80
    };
  };

  return {
    left_arm: {
      arm_swing: createMetric(simple.left_arm_swing_mean, 0.05, 150),
      elbow_angle: createMetric(simple.left_elbow_angle_mean, 0.05, 110)
    },
    right_arm: {
      arm_swing: createMetric(simple.right_arm_swing_mean, 0.05, 145),
      elbow_angle: createMetric(simple.right_elbow_angle_mean, 0.05, 110)
    },
    left_leg: {
      knee_angle: createMetric(simple.left_knee_angle_mean, simple.knee_variability || 0.1, 115),
      ankle_angle: createMetric(simple.left_ankle_angle_mean, 0.05, 100),
      hip_angle: createMetric(25, 0.05, 25),
      shank_angle: createMetric(55, 0.05, 55)
    },
    right_leg: {
      knee_angle: createMetric(simple.right_knee_angle_mean, simple.knee_variability || 0.1, 111),
      ankle_angle: createMetric(simple.right_ankle_angle_mean, 0.05, 104),
      hip_angle: createMetric(28, 0.05, 28),
      shank_angle: createMetric(54, 0.05, 54)
    },
    trunk: {
      trunk_angle: createMetric(simple.trunk_angle_mean, simple.trunk_stability || 0.01, 174)
    },
    head: {
      head_angle: createMetric(simple.head_angle_mean, 0.02, 136)
    },
    weight_kg: simple.weight_kg,
    height_cm: simple.height_cm
  };
}

/**
 * Анализ с упрощенными входными данными
 */
export async function analyzeRunSimple(simpleData: SimpleBiomechanicsInput) {
  const fullData = convertToFullFormat(simpleData);
  return await analyzeRunBiomechanics(fullData);
}
