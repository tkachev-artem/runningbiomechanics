import { RunBiomechanicsInput } from '@biomech/types';

/**
 * Реальные биомеханические данные пользователя для тестирования
 */
export const REAL_USER_DATA: RunBiomechanicsInput = {
  left_arm: {
    arm_swing: {
      min: 142.5,
      max: 160.6,
      mean: 151.6,
      std: 5.2,
      count: 78,
    },
    elbow_angle: {
      min: 91.3,
      max: 139.3,
      mean: 115.3,
      std: 10.8,
      count: 82,
    },
  },
  right_arm: {
    arm_swing: {
      min: 126.1,
      max: 162.4,
      mean: 144.2,
      std: 8.1,
      count: 75,
    },
    elbow_angle: {
      min: 91.8,
      max: 128.1,
      mean: 109.9,
      std: 9.5,
      count: 80,
    },
  },
  left_leg: {
    knee_angle: {
      min: 62.9,
      max: 168.0,
      mean: 115.4,
      std: 22.3,
      count: 85,
    },
    ankle_angle: {
      min: 81.8,
      max: 119.4,
      mean: 100.6,
      std: 8.5,
      count: 88,
    },
    hip_angle: {
      min: 11.0,
      max: 39.8,
      mean: 25.4,
      std: 6.2,
      count: 80,
    },
    shank_angle: {
      min: 3.6,
      max: 108.3,
      mean: 55.9,
      std: 18.4,
      count: 83,
    },
  },
  right_leg: {
    knee_angle: {
      min: 63.3,
      max: 158.6,
      mean: 111.0,
      std: 20.1,
      count: 84,
    },
    ankle_angle: {
      min: 85.0,
      max: 123.1,
      mean: 104.1,
      std: 9.2,
      count: 87,
    },
    hip_angle: {
      min: 9.1,
      max: 49.0,
      mean: 29.1,
      std: 8.5,
      count: 79,
    },
    shank_angle: {
      min: 3.4,
      max: 104.2,
      mean: 53.8,
      std: 17.2,
      count: 81,
    },
  },
  trunk: {
    trunk_angle: {
      min: 172.1,
      max: 176.9,
      mean: 174.5,
      std: 1.2,
      count: 86,
    },
  },
  head: {
    head_angle: {
      min: 131.3,
      max: 141.9,
      mean: 136.6,
      std: 2.8,
      count: 84,
    },
  },
};

// Экспорт с другим именем для совместимости
export const REAL_RUN_DATA = REAL_USER_DATA;
export const testData = REAL_USER_DATA;
