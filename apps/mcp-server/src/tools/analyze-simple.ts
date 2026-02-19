import { analyzeRunSimple, SimpleBiomechanicsInput } from '@biomech/calculators';

/**
 * MCP Tool: Упрощенный анализ биомеханики
 * Принимает агрегированные данные (средние значения) вместо полных статистик
 */

export const analyzeSimpleTool = {
  definition: {
    name: 'analyze_simple',
    description: 'Упрощенный анализ биомеханики бега с агрегированными данными',
    inputSchema: {
      type: 'object',
      properties: {
        left_arm_swing_mean: { type: 'number', description: 'Средний угол маха левой руки' },
        right_arm_swing_mean: { type: 'number', description: 'Средний угол маха правой руки' },
        left_elbow_angle_mean: { type: 'number', description: 'Средний угол левого локтя' },
        right_elbow_angle_mean: { type: 'number', description: 'Средний угол правого локтя' },
        left_knee_angle_mean: { type: 'number', description: 'Средний угол левого колена' },
        right_knee_angle_mean: { type: 'number', description: 'Средний угол правого колена' },
        left_ankle_angle_mean: { type: 'number', description: 'Средний угол левой лодыжки' },
        right_ankle_angle_mean: { type: 'number', description: 'Средний угол правой лодыжки' },
        trunk_angle_mean: { type: 'number', description: 'Средний наклон туловища' },
        trunk_rotation_mean: { type: 'number', description: 'Средняя ротация туловища' },
        head_stability_mean: { type: 'number', description: 'Средняя стабильность головы' },
        vertical_oscillation_mean: { type: 'number', description: 'Средние вертикальные колебания' },
        ground_contact_time_mean: { type: 'number', description: 'Среднее время контакта с землей' },
        cadence_mean: { type: 'number', description: 'Средний каденс' },
        weight_kg: { type: 'number', description: 'Вес в кг (опционально)' },
        height_cm: { type: 'number', description: 'Рост в см (опционально)' },
      },
      required: [
        'left_arm_swing_mean', 'right_arm_swing_mean', 'left_elbow_angle_mean', 'right_elbow_angle_mean',
        'left_knee_angle_mean', 'right_knee_angle_mean', 'left_ankle_angle_mean', 'right_ankle_angle_mean',
        'trunk_angle_mean', 'trunk_rotation_mean', 'head_stability_mean',
        'vertical_oscillation_mean', 'ground_contact_time_mean', 'cadence_mean'
      ],
    },
  },
  handler: async (args: unknown): Promise<{ content: Array<{ type: string; text: string }> }> => {
    const result = await analyzeRunSimple(args as SimpleBiomechanicsInput);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
};
