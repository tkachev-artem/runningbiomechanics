import { z } from 'zod';

/**
 * Zod схема для базовой метрики биомеханики
 */
export const BiomechanicsMetricSchema = z.object({
  min: z.number(),
  max: z.number(),
  mean: z.number(),
  std: z.number().min(0),
  count: z.number().int().positive(),
});

/**
 * Zod схема для данных руки
 */
export const ArmDataSchema = z.object({
  arm_swing: BiomechanicsMetricSchema,
  elbow_angle: BiomechanicsMetricSchema,
});

/**
 * Zod схема для данных ноги
 */
export const LegDataSchema = z.object({
  knee_angle: BiomechanicsMetricSchema,
  ankle_angle: BiomechanicsMetricSchema,
  hip_angle: BiomechanicsMetricSchema,
  shank_angle: BiomechanicsMetricSchema,
});

/**
 * Zod схема для данных туловища
 */
export const TrunkDataSchema = z.object({
  trunk_angle: BiomechanicsMetricSchema,
});

/**
 * Zod схема для данных головы
 */
export const HeadDataSchema = z.object({
  head_angle: BiomechanicsMetricSchema,
});

/**
 * Zod схема для полных биомеханических данных пробежки
 */
export const RunBiomechanicsInputSchema = z.object({
  left_arm: ArmDataSchema,
  right_arm: ArmDataSchema,
  left_leg: LegDataSchema,
  right_leg: LegDataSchema,
  trunk: TrunkDataSchema,
  head: HeadDataSchema,
  weight_kg: z.number().positive().optional(),
  height_cm: z.number().positive().optional(),
});

/**
 * Zod схема для уровня бегуна
 */
export const RunnerLevelSchema = z.enum([
  'ELITE',
  'ADVANCED',
  'INTERMEDIATE',
  'BEGINNER',
  'NEEDS_HELP',
]);

/**
 * Zod схема для типа ошибки
 */
export const ErrorTypeSchema = z.enum([
  'ARM_ASYMMETRY',
  'LEG_ASYMMETRY',
  'KNEE_INSTABILITY',
  'EXCESSIVE_VERTICAL_OSCILLATION',
  'POOR_TRUNK_POSTURE',
  'OVERSTRIDING',
  'EXCESSIVE_PRONATION',
  'INSUFFICIENT_ARM_DRIVE',
]);

/**
 * Zod схема для серьезности ошибки
 */
export const ErrorSeveritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

/**
 * Zod схема для ошибки техники бега
 */
export const RunningErrorSchema = z.object({
  error_type: ErrorTypeSchema,
  error_name: z.string(),
  severity: ErrorSeveritySchema,
  confidence: z.number().min(0).max(100),
  affected_metrics: z.array(z.string()),
  values: z.record(z.number()),
  description: z.string(),
});

/**
 * Zod схема для категорий оценки
 */
export const CategoryScoresSchema = z.object({
  arm_quality: z.number().min(0).max(100),
  leg_quality: z.number().min(0).max(100),
  trunk_stability: z.number().min(0).max(100),
  symmetry: z.number().min(0).max(100),
  efficiency: z.number().min(0).max(100),
  consistency: z.number().min(0).max(100),
});

/**
 * Zod схема для результата анализа пробежки
 */
export const RunAnalysisResultSchema = z.object({
  общий_индекс_качества: z.number().min(0).max(100),
  оценки_категорий: CategoryScoresSchema,
  итоговая_оценка: z.number().min(0).max(100),
  классификация: z.enum(['Элитный', 'Продвинутый', 'Средний', 'Начальный', 'Требуется помощь']),
  резюме: z.string(),
  временная_метка: z.string(),
  bmi: z.number().optional(),
  weight_category: z.string().optional(),
});

/**
 * Zod схема для рекомендации
 */
export const RecommendationSchema = z.object({
  priority: z.number().int().min(1).max(5),
  focus_area: z.string(),
  recommendation: z.string(),
  reason: z.string(),
  expected_improvement: z.string(),
});

/**
 * Zod схема для упражнения
 */
export const ExerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  sets: z.number().int().positive(),
  reps: z.string(),
  frequency: z.string(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  target_errors: z.array(ErrorTypeSchema),
  video_url: z.string().url().optional(),
});

// Экспорт типов, выведенных из схем Zod
export type RunBiomechanicsInputType = z.infer<typeof RunBiomechanicsInputSchema>;
export type RunnerLevelType = z.infer<typeof RunnerLevelSchema>;
export type ErrorTypeType = z.infer<typeof ErrorTypeSchema>;
export type RunningErrorType = z.infer<typeof RunningErrorSchema>;
export type CategoryScoresType = z.infer<typeof CategoryScoresSchema>;
export type RunAnalysisResultType = z.infer<typeof RunAnalysisResultSchema>;
export type RecommendationType = z.infer<typeof RecommendationSchema>;
export type ExerciseType = z.infer<typeof ExerciseSchema>;
