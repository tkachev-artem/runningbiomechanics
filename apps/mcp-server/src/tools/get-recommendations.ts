import { getRecommendations } from '@biomech/calculators';
import { RunningError, RunnerLevel } from '@biomech/types';

/**
 * MCP Tool #3: Получение персонализированных рекомендаций
 */

export const getRecommendationsTool = {
  definition: {
    name: 'get_recommendations',
    description: 'Формирует персонализированные рекомендации по улучшению техники бега',
    inputSchema: {
      type: 'object',
      properties: {
        errors: { type: 'array', description: 'Массив выявленных ошибок' },
        runner_level: { type: 'string', description: 'Уровень бегуна (BEGINNER, INTERMEDIATE, ADVANCED, ELITE)' },
      },
      required: ['errors', 'runner_level'],
    },
  },
  handler: async (args: { errors: RunningError[]; runner_level: RunnerLevel }): Promise<{ content: Array<{ type: string; text: string }> }> => {
    const result = await getRecommendations(args.errors, args.runner_level);
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
