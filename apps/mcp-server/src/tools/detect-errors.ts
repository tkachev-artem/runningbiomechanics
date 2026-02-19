import { RunBiomechanicsInput } from '@biomech/types';
import { detectErrors } from '@biomech/calculators';

/**
 * MCP Tool #2: Выявление ошибок техники бега
 */

export const detectErrorsTool = {
  definition: {
    name: 'detect_errors',
    description: 'Выявляет ошибки и проблемы в технике бега на основе биомеханических данных',
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
      },
      required: ['left_arm', 'right_arm', 'left_leg', 'right_leg', 'trunk', 'head', 'vertical_oscillation', 'ground_contact_time', 'cadence'],
    },
  },
  handler: async (args: unknown): Promise<{ content: Array<{ type: string; text: string }> }> => {
    const result = await detectErrors(args as RunBiomechanicsInput);
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
