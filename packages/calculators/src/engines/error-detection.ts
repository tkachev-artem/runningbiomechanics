import { RunBiomechanicsInput, RunningError, ErrorSeverity } from '@biomech/types';
import { calculateCV, determineSeverity } from '../utils/math';
import { ERROR_DETECTION_THRESHOLDS } from '../data/norms';
import { translateSeverity } from '../utils/translations';

/**
 * Выявление ошибок техники бега на основе биомеханических данных
 * 
 * @param data - полные биомеханические данные пробежки
 * @returns массив выявленных ошибок
 */
export function detectRunningErrors(data: RunBiomechanicsInput): RunningError[] {
  const errors: RunningError[] = [];

  // 1. Проверка асимметрии рук (ARM_ASYMMETRY)
  const armSwingDiff = Math.abs(
    data.left_arm.arm_swing.mean - data.right_arm.arm_swing.mean
  );

  if (armSwingDiff > ERROR_DETECTION_THRESHOLDS.arm_asymmetry.low) {
    const severity = determineSeverity(armSwingDiff, [
      ERROR_DETECTION_THRESHOLDS.arm_asymmetry.medium,
      ERROR_DETECTION_THRESHOLDS.arm_asymmetry.high,
      ERROR_DETECTION_THRESHOLDS.arm_asymmetry.critical,
    ]);

    errors.push({
      error_type: 'ARM_ASYMMETRY',
      error_name: 'Асимметрия работы рук',
      severity: translateSeverity(severity),
      confidence: Math.min(95, 50 + armSwingDiff * 2),
      affected_metrics: ['left_arm.arm_swing', 'right_arm.arm_swing'],
      values: {
        left_arm_swing: data.left_arm.arm_swing.mean,
        right_arm_swing: data.right_arm.arm_swing.mean,
        difference: armSwingDiff,
      },
      description: `Одна рука работает активнее другой (разница ${armSwingDiff.toFixed(1)}°). Это создает дисбаланс - вы тратите больше энергии и можете быстрее уставать.`,
    });
  }

  // 2. Проверка асимметрии ног (LEG_ASYMMETRY)
  const kneeAngleDiff = Math.abs(
    data.left_leg.knee_angle.mean - data.right_leg.knee_angle.mean
  );

  if (kneeAngleDiff > ERROR_DETECTION_THRESHOLDS.leg_asymmetry.low) {
    const severity = determineSeverity(kneeAngleDiff, [
      ERROR_DETECTION_THRESHOLDS.leg_asymmetry.medium,
      ERROR_DETECTION_THRESHOLDS.leg_asymmetry.high,
      ERROR_DETECTION_THRESHOLDS.leg_asymmetry.critical,
    ]);

    errors.push({
      error_type: 'LEG_ASYMMETRY',
      error_name: 'Асимметрия работы ног',
      severity: translateSeverity(severity),
      confidence: Math.min(90, 45 + kneeAngleDiff * 2.5),
      affected_metrics: ['left_leg.knee_angle', 'right_leg.knee_angle'],
      values: {
        left_knee_angle: data.left_leg.knee_angle.mean,
        right_knee_angle: data.right_leg.knee_angle.mean,
        difference: kneeAngleDiff,
      },
      description: `Одно колено сгибается сильнее другого (разница ${kneeAngleDiff.toFixed(1)}°). Это перегружает одну ногу и может привести к травме.`,
    });
  }

  // 3. Проверка нестабильности колена (KNEE_INSTABILITY)
  const leftKneeCV = calculateCV(data.left_leg.knee_angle.std, data.left_leg.knee_angle.mean);
  const rightKneeCV = calculateCV(data.right_leg.knee_angle.std, data.right_leg.knee_angle.mean);
  const maxKneeCV = Math.max(leftKneeCV, rightKneeCV);

  if (maxKneeCV > ERROR_DETECTION_THRESHOLDS.knee_instability.low) {
    const severity = determineSeverity(maxKneeCV, [
      ERROR_DETECTION_THRESHOLDS.knee_instability.medium,
      ERROR_DETECTION_THRESHOLDS.knee_instability.high,
      ERROR_DETECTION_THRESHOLDS.knee_instability.critical,
    ]);

    const affectedLeg = leftKneeCV > rightKneeCV ? 'left_leg' : 'right_leg';

    errors.push({
      error_type: 'KNEE_INSTABILITY',
      error_name: 'Нестабильность коленного сустава',
      severity: translateSeverity(severity),
      confidence: Math.min(88, 40 + maxKneeCV * 1.5),
      affected_metrics: [`${affectedLeg}.knee_angle`],
      values: {
        cv: maxKneeCV,
        std: affectedLeg === 'left_leg' ? data.left_leg.knee_angle.std : data.right_leg.knee_angle.std,
        mean: affectedLeg === 'left_leg' ? data.left_leg.knee_angle.mean : data.right_leg.knee_angle.mean,
      },
      description: `Колено работает нестабильно, каждый шаг разный. Это снижает контроль и повышает риск травмы.`,
    });
  }

  // 4. Проверка избыточных вертикальных колебаний (EXCESSIVE_VERTICAL_OSCILLATION)
  const leftHipCV = calculateCV(data.left_leg.hip_angle.std, data.left_leg.hip_angle.mean);
  const rightHipCV = calculateCV(data.right_leg.hip_angle.std, data.right_leg.hip_angle.mean);
  const avgHipCV = (leftHipCV + rightHipCV) / 2;

  if (avgHipCV > ERROR_DETECTION_THRESHOLDS.excessive_vertical_oscillation.low) {
    const severity = determineSeverity(avgHipCV, [
      ERROR_DETECTION_THRESHOLDS.excessive_vertical_oscillation.medium,
      ERROR_DETECTION_THRESHOLDS.excessive_vertical_oscillation.high,
      ERROR_DETECTION_THRESHOLDS.excessive_vertical_oscillation.critical,
    ]);

    errors.push({
      error_type: 'EXCESSIVE_VERTICAL_OSCILLATION',
      error_name: 'Избыточные вертикальные колебания',
      severity: translateSeverity(severity),
      confidence: Math.min(85, 35 + avgHipCV * 2),
      affected_metrics: ['left_leg.hip_angle', 'right_leg.hip_angle'],
      values: {
        avg_hip_cv: avgHipCV,
        left_hip_cv: leftHipCV,
        right_hip_cv: rightHipCV,
      },
      description: `Вы слишком сильно прыгаете вверх при каждом шаге вместо движения вперед. Теряете энергию - вот почему устаете быстрее!`,
    });
  }

  // 5. Проверка плохой осанки туловища (POOR_TRUNK_POSTURE)
  const trunkAngle = data.trunk.trunk_angle.mean;
  
  if (
    trunkAngle < ERROR_DETECTION_THRESHOLDS.poor_trunk_posture.forward_lean_low ||
    trunkAngle > ERROR_DETECTION_THRESHOLDS.poor_trunk_posture.backward_lean_low
  ) {
    let postureType: string;
    let severityValue: number;

    if (trunkAngle < ERROR_DETECTION_THRESHOLDS.poor_trunk_posture.forward_lean_low) {
      postureType = 'наклон вперед';
      severityValue = ERROR_DETECTION_THRESHOLDS.poor_trunk_posture.forward_lean_low - trunkAngle;
    } else {
      postureType = 'наклон назад';
      severityValue = trunkAngle - ERROR_DETECTION_THRESHOLDS.poor_trunk_posture.backward_lean_low;
    }

    const severity: ErrorSeverity = severityValue > 5 ? 'HIGH' : severityValue > 3 ? 'MEDIUM' : 'LOW';

    errors.push({
      error_type: 'POOR_TRUNK_POSTURE',
      error_name: 'Неправильная осанка туловища',
      severity: translateSeverity(severity),
      confidence: Math.min(92, 60 + severityValue * 5),
      affected_metrics: ['trunk.trunk_angle'],
      values: {
        trunk_angle: trunkAngle,
        deviation: severityValue,
      },
      description: `Корпус наклонен ${postureType}. Ровная спина помогает бежать легче и снижает нагрузку на поясницу.`,
    });
  }

  // 6. Проверка недостаточной работы рук (INSUFFICIENT_ARM_DRIVE)
  const avgArmSwing = (data.left_arm.arm_swing.mean + data.right_arm.arm_swing.mean) / 2;
  
  if (avgArmSwing < 135) {
    const deviation = 135 - avgArmSwing;
    const severity: ErrorSeverity = deviation > 15 ? 'HIGH' : deviation > 10 ? 'MEDIUM' : 'LOW';

    errors.push({
      error_type: 'INSUFFICIENT_ARM_DRIVE',
      error_name: 'Недостаточная работа рук',
      severity: translateSeverity(severity),
      confidence: Math.min(88, 50 + deviation * 2),
      affected_metrics: ['left_arm.arm_swing', 'right_arm.arm_swing'],
      values: {
        avg_arm_swing: avgArmSwing,
        optimal: 150,
        deficit: deviation,
      },
      description: `Руки работают слишком слабо. Активный мах руками помогает бежать быстрее и держать баланс.`,
    });
  }

  // 7. Проверка нестабильности туловища
  if (data.trunk.trunk_angle.std > ERROR_DETECTION_THRESHOLDS.trunk_instability.low) {
    const severity = determineSeverity(data.trunk.trunk_angle.std, [
      ERROR_DETECTION_THRESHOLDS.trunk_instability.medium,
      ERROR_DETECTION_THRESHOLDS.trunk_instability.high,
      ERROR_DETECTION_THRESHOLDS.trunk_instability.critical,
    ]);

    errors.push({
      error_type: 'POOR_TRUNK_POSTURE',
      error_name: 'Нестабильность туловища',
      severity: translateSeverity(severity),
      confidence: Math.min(90, 55 + data.trunk.trunk_angle.std * 8),
      affected_metrics: ['trunk.trunk_angle'],
      values: {
        trunk_std: data.trunk.trunk_angle.std,
        trunk_cv: calculateCV(data.trunk.trunk_angle.std, data.trunk.trunk_angle.mean),
      },
      description: `Корпус сильно качается из стороны в сторону. Это тратит силы и снижает скорость.`,
    });
  }

  return errors;
}

/**
 * Получить наивысший уровень серьезности из списка ошибок
 */
export function getHighestSeverity(errors: RunningError[]) {
  if (errors.length === 0) return 'Низкая';
  
  const severityOrder = ['Низкая', 'Средняя', 'Высокая', 'Критическая'] as const;
  const severities = errors.map(e => e.severity);
  
  return severities.reduce((highest, current) => {
    return severityOrder.indexOf(current) > severityOrder.indexOf(highest) ? current : highest;
  });
}
