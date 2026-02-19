/**
 * Базовая метрика биомеханики с статистическими данными
 */
export interface BiomechanicsMetric {
  min: number;
  max: number;
  mean: number;
  std: number;
  count: number;
}

/**
 * Данные о руке (левой или правой)
 */
export interface ArmData {
  arm_swing: BiomechanicsMetric;
  elbow_angle: BiomechanicsMetric;
}

/**
 * Данные о ноге (левой или правой)
 */
export interface LegData {
  knee_angle: BiomechanicsMetric;
  ankle_angle: BiomechanicsMetric;
  hip_angle: BiomechanicsMetric;
  shank_angle: BiomechanicsMetric;
}

/**
 * Данные о туловище
 */
export interface TrunkData {
  trunk_angle: BiomechanicsMetric;
}

/**
 * Данные о голове
 */
export interface HeadData {
  head_angle: BiomechanicsMetric;
}

/**
 * Полные биомеханические данные пробежки
 */
export interface RunBiomechanicsInput {
  left_arm: ArmData;
  right_arm: ArmData;
  left_leg: LegData;
  right_leg: LegData;
  trunk: TrunkData;
  head: HeadData;
  // Дополнительные параметры бегуна
  weight_kg?: number; // Вес в килограммах
  height_cm?: number; // Рост в сантиметрах
}

/**
 * Результат расчета качества рук
 */
export interface ArmQualityResult {
  arm_quality_index: number;
  arm_symmetry: number;
  left_arm_score: number;
  right_arm_score: number;
  asymmetry_penalty: number;
  details: {
    left_swing_score: number;
    left_elbow_score: number;
    right_swing_score: number;
    right_elbow_score: number;
  };
}

/**
 * Результат расчета качества ног
 */
export interface LegQualityResult {
  leg_quality_index: number;
  leg_symmetry: number;
  left_leg_score: number;
  right_leg_score: number;
  asymmetry_penalty: number;
  details: {
    left_knee_score: number;
    left_ankle_score: number;
    left_hip_score: number;
    left_shank_score: number;
    right_knee_score: number;
    right_ankle_score: number;
    right_hip_score: number;
    right_shank_score: number;
  };
}

/**
 * Результат расчета стабильности туловища
 */
export interface TrunkStabilityResult {
  trunk_stability_score: number;
  trunk_angle_score: number;
  trunk_consistency_score: number;
}

/**
 * Результат расчета общей симметрии
 */
export interface SymmetryResult {
  overall_symmetry: number;
  arm_symmetry: number;
  leg_symmetry: number;
  symmetry_score: number;
}

/**
 * Результат расчета эффективности
 */
export interface EfficiencyResult {
  efficiency_score: number;
  movement_economy: number;
  energy_waste_penalty: number;
}

/**
 * Результат расчета консистентности
 */
export interface ConsistencyResult {
  consistency_score: number;
  overall_cv: number;
  variability_penalty: number;
}

/**
 * Категории оценки
 */
export interface CategoryScores {
  arm_quality: number;
  leg_quality: number;
  trunk_stability: number;
  symmetry: number;
  efficiency: number;
  consistency: number;
}

/**
 * Уровень классификации бегуна (английский)
 */
export type RunnerLevel = 'ELITE' | 'ADVANCED' | 'INTERMEDIATE' | 'BEGINNER' | 'NEEDS_HELP';

/**
 * Уровень классификации бегуна (русский)
 */
export type RunnerLevelRu = 'Элитный' | 'Продвинутый' | 'Средний' | 'Начальный' | 'Требуется помощь';

/**
 * Тип ошибки техники бега
 */
export type ErrorType =
  | 'ARM_ASYMMETRY'
  | 'LEG_ASYMMETRY'
  | 'KNEE_INSTABILITY'
  | 'EXCESSIVE_VERTICAL_OSCILLATION'
  | 'POOR_TRUNK_POSTURE'
  | 'OVERSTRIDING'
  | 'EXCESSIVE_PRONATION'
  | 'INSUFFICIENT_ARM_DRIVE';

/**
 * Уровень серьезности ошибки (английский)
 */
export type ErrorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * Уровень серьезности ошибки (русский)
 */
export type ErrorSeverityRu = 'Низкая' | 'Средняя' | 'Высокая' | 'Критическая';

/**
 * Ошибка техники бега
 */
export interface RunningError {
  error_type: ErrorType;
  error_name: string;
  severity: ErrorSeverityRu;
  confidence: number;
  affected_metrics: string[];
  values: Record<string, number>;
  description: string;
}

/**
 * Рекомендация для бегуна
 */
export interface Recommendation {
  priority: number;
  focus_area: string;
  recommendation: string;
  reason: string;
  expected_improvement: string;
}

/**
 * Уровень сложности (русский)
 */
export type DifficultyRu = 'Легко' | 'Средне' | 'Сложно';

/**
 * Упражнение для коррекции
 */
export interface Exercise {
  id: string;
  name: string;
  category: string;
  description: string;
  sets: number;
  reps: string;
  frequency: string;
  difficulty: DifficultyRu;
  target_errors: ErrorType[];
  video_url?: string;
}

/**
 * Полный результат анализа пробежки
 */
export interface RunAnalysisResult {
  общий_индекс_качества: number;
  оценки_категорий: CategoryScores;
  итоговая_оценка: number;
  классификация: RunnerLevelRu;
  резюме: string;
  временная_метка: string;
  // Дополнительные данные
  bmi?: number; // ИМТ (Индекс массы тела)
  weight_category?: string; // Категория по весу
}

/**
 * Результат выявления ошибок
 */
export interface ErrorDetectionResult {
  errors: RunningError[];
  error_count: number;
  highest_severity: ErrorSeverityRu;
  summary: string;
}

/**
 * Результат формирования рекомендаций
 */
export interface RecommendationResult {
  recommendations: Recommendation[];
  exercises: Exercise[];
  focus_areas: string[];
  estimated_improvement_time: string;
  summary: string;
}

/**
 * Результат сравнения двух пробежек
 */
export interface ComparisonResult {
  improvement_percentage: number;
  category_changes: Record<keyof CategoryScores, number>;
  classification_change: {
    from: RunnerLevel;
    to: RunnerLevel;
    improved: boolean;
  };
  key_improvements: string[];
  areas_to_focus: string[];
  summary: string;
}
