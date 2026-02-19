import { RunBiomechanicsInput, RunAnalysisResult } from '@biomech/types';
import { analyzeRunBiomechanics } from '@biomech/calculators';

/**
 * MCP Tool #1: Анализ биомеханики пробежки
 * 
 * Выполняет полный анализ биомеханических данных:
 * - Рассчитывает оценки по 6 категориям
 * - Вычисляет итоговый score
 * - Классифицирует уровень бегуна
 * - Формирует текстовое резюме
 */

export const analyzeRunTool = {
  definition: {
    name: 'analyze_run',
    description: 'Анализирует биомеханические данные пробежки и выдает полный отчет с оценками по категориям',
    inputSchema: {
      type: 'object',
      properties: {
        left_arm: { type: 'object', description: 'Данные левой руки' },
        right_arm: { type: 'object', description: 'Данные правой руки' },
        left_leg: { type: 'object', description: 'Данные левой ноги' },
        right_leg: { type: 'object', description: 'Данные правой ноги' },
        trunk: { type: 'object', description: 'Данные туловища' },
        head: { type: 'object', description: 'Данные головы' },
        vertical_oscillation: { type: 'object', description: 'Вертикальные колебания' },
        ground_contact_time: { type: 'object', description: 'Время контакта с землей' },
        cadence: { type: 'object', description: 'Каденс' },
        weight_kg: { type: 'number', description: 'Вес в кг (опционально)' },
        height_cm: { type: 'number', description: 'Рост в см (опционально)' },
      },
      required: ['left_arm', 'right_arm', 'left_leg', 'right_leg', 'trunk', 'head', 'vertical_oscillation', 'ground_contact_time', 'cadence'],
    },
  },
  handler: async (args: unknown): Promise<{ content: Array<{ type: string; text: string }> }> => {
    const result = await analyzeRunBiomechanics(args as RunBiomechanicsInput);
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
