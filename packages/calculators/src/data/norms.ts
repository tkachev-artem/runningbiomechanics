/**
 * Нормативные значения для биомеханических параметров бега
 * Основаны на исследованиях элитных бегунов и спортивной биомеханике
 */

export const BIOMECHANICS_NORMS = {
  // Параметры рук
  arm: {
    arm_swing: {
      optimal: 150, // градусы
      sigma: 10,
      range: { min: 130, max: 170 },
    },
    elbow_angle: {
      optimal: 110, // градусы
      sigma: 15,
      range: { min: 90, max: 130 },
    },
  },

  // Параметры ног
  leg: {
    knee_angle: {
      optimal: 115, // градусы
      sigma: 20,
      range: { min: 60, max: 170 },
    },
    ankle_angle: {
      optimal: 100, // градусы
      sigma: 10,
      range: { min: 80, max: 120 },
    },
    hip_angle: {
      optimal: 28, // градусы
      sigma: 8,
      range: { min: 10, max: 50 },
    },
    shank_angle: {
      optimal: 55, // градусы
      sigma: 18,
      range: { min: 0, max: 110 },
    },
  },

  // Параметры туловища
  trunk: {
    trunk_angle: {
      optimal: 175, // градусы (почти вертикально)
      sigma: 3,
      range: { min: 165, max: 180 },
    },
  },

  // Параметры головы
  head: {
    head_angle: {
      optimal: 137, // градусы
      sigma: 5,
      range: { min: 125, max: 145 },
    },
  },

  // Пороги для коэффициента вариации (CV)
  cv_thresholds: {
    excellent: 5, // CV < 5% - отлично
    good: 10, // CV < 10% - хорошо
    acceptable: 15, // CV < 15% - приемлемо
    poor: 20, // CV < 20% - плохо
    // CV >= 20% - очень плохо
  },

  // Пороги асимметрии (разница между левой и правой стороной)
  asymmetry_thresholds: {
    excellent: 5, // < 5% - отлично
    good: 10, // < 10% - хорошо
    acceptable: 15, // < 15% - приемлемо
    poor: 20, // < 20% - плохо
    // >= 20% - критическая асимметрия
  },

  // Веса для категорий при расчете финального score
  category_weights: {
    arm_quality: 0.15,
    leg_quality: 0.25,
    trunk_stability: 0.15,
    symmetry: 0.20,
    efficiency: 0.15,
    consistency: 0.10,
  },

  // Пороги классификации уровня бегуна
  classification_thresholds: {
    elite: 85, // >= 85 - ELITE
    advanced: 70, // >= 70 - ADVANCED
    intermediate: 55, // >= 55 - INTERMEDIATE
    beginner: 40, // >= 40 - BEGINNER
    // < 40 - NEEDS_HELP
  },
} as const;

/**
 * Пороги для выявления ошибок техники
 */
export const ERROR_DETECTION_THRESHOLDS = {
  arm_asymmetry: {
    low: 10, // разница > 10° - LOW
    medium: 15, // разница > 15° - MEDIUM
    high: 20, // разница > 20° - HIGH
    critical: 30, // разница > 30° - CRITICAL
  },

  leg_asymmetry: {
    low: 8,
    medium: 12,
    high: 18,
    critical: 25,
  },

  knee_instability: {
    low: 15, // CV > 15% - LOW
    medium: 20, // CV > 20% - MEDIUM
    high: 25, // CV > 25% - HIGH
    critical: 30, // CV > 30% - CRITICAL
  },

  trunk_instability: {
    low: 2, // std > 2° - LOW
    medium: 3, // std > 3° - MEDIUM
    high: 4, // std > 4° - HIGH
    critical: 5, // std > 5° - CRITICAL
  },

  poor_trunk_posture: {
    forward_lean_low: 170, // trunk_angle < 170° - наклон вперед
    forward_lean_high: 165,
    backward_lean_low: 178, // trunk_angle > 178° - наклон назад
    backward_lean_high: 180,
  },

  excessive_vertical_oscillation: {
    // Определяется по вариативности hip_angle
    low: 10,
    medium: 15,
    high: 20,
    critical: 25,
  },
} as const;
