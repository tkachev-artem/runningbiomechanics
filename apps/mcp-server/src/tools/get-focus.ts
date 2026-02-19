import { getFocusAreas, FocusAreasInput } from '@biomech/calculators';

/**
 * MCP Tool #4: Определение фокусных областей для улучшения
 */

export const getFocusTool = {
  definition: {
    name: 'get_focus',
    description: 'Определяет приоритетные области для улучшения техники бега',
    inputSchema: {
      type: 'object',
      properties: {
        errors: { type: 'array', description: 'Массив выявленных ошибок' },
        analysis: { type: 'object', description: 'Результат анализа биомеханики' },
        exercises: { type: 'array', description: 'Массив упражнений (опционально)' },
      },
      required: ['errors', 'analysis'],
    },
  },
  handler: async (args: unknown): Promise<{ content: Array<{ type: string; text: string }> }> => {
    const result = await getFocusAreas(args as FocusAreasInput);
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
