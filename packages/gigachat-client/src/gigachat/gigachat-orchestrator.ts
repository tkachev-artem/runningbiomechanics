import { GigaChatService } from './gigachat.service';
import { ChatCompletionMessage, FunctionDefinition } from './types';
import { analyzeRunSimple, SimpleBiomechanicsInput, detectErrors, getRecommendations, getFocusAreas } from '@biomech/calculators';
import type { RunBiomechanicsInput } from '@biomech/types';

export class GigaChatMCPFull {
  private gigachat: GigaChatService;
  private conversationHistory: ChatCompletionMessage[] = [];
  private lastAnalysisData: RunBiomechanicsInput | null = null;

  constructor(apiKey: string, model: string = 'GigaChat') {
    this.gigachat = new GigaChatService({ apiKey, model });
  }

  private getMCPFunctions(): FunctionDefinition[] {
    return [
      {
        name: 'analyze_running_technique',
        description: 'Анализирует технику бега и выдает оценку 0-100, классификацию уровня бегуна',
        parameters: {
          type: 'object',
          properties: {
            left_arm_swing_mean: { type: 'number', description: 'Средний угол маха левой руки' },
            right_arm_swing_mean: { type: 'number', description: 'Средний угол маха правой руки' },
            left_elbow_angle_mean: { type: 'number', description: 'Средний угол левого локтя' },
            right_elbow_angle_mean: { type: 'number', description: 'Средний угол правого локтя' },
            left_knee_angle_mean: { type: 'number', description: 'Средний угол левого колена' },
            right_knee_angle_mean: { type: 'number', description: 'Средний угол правого колена' },
            left_ankle_angle_mean: { type: 'number', description: 'Средний угол левого голеностопа' },
            right_ankle_angle_mean: { type: 'number', description: 'Средний угол правого голеностопа' },
            trunk_angle_mean: { type: 'number', description: 'Средний угол туловища' },
            head_angle_mean: { type: 'number', description: 'Средний угол головы' },
            weight_kg: { type: 'number', description: 'Вес в кг' },
            height_cm: { type: 'number', description: 'Рост в см' }
          },
          required: ['left_arm_swing_mean', 'right_arm_swing_mean', 'weight_kg', 'height_cm']
        }
      },
      {
        name: 'detect_errors',
        description: 'Выявляет ошибки техники бега на основе уже проанализированных данных',
        parameters: {
          type: 'object',
          properties: {
            use_last_analysis: { 
              type: 'boolean', 
              description: 'Использовать данные последнего анализа (true) или нужны новые данные' 
            }
          }
        }
      },
      {
        name: 'get_exercise_recommendations',
        description: 'Дает персональные рекомендации и упражнения для улучшения техники',
        parameters: {
          type: 'object',
          properties: {
            runner_level: {
              type: 'string',
              enum: ['ELITE', 'ADVANCED', 'INTERMEDIATE', 'BEGINNER', 'NEEDS_HELP'],
              description: 'Уровень бегуна из предыдущего анализа'
            }
          }
        }
      }
    ];
  }

  private async executeMCPFunction(functionName: string, args: any): Promise<any> {
    
    switch (functionName) {
      case 'analyze_running_technique':
        // Конвертируем упрощенные данные в полный формат
        const fullData = this.convertToFullFormat(args as SimpleBiomechanicsInput);
        // Сохраняем ДО анализа для других функций
        this.lastAnalysisData = fullData;
        // Выполняем анализ
        const result = await analyzeRunSimple(args as SimpleBiomechanicsInput);
        return result;
        
      case 'detect_errors':
        if (!this.lastAnalysisData) {
          throw new Error('Сначала нужно вызвать analyze_running_technique');
        }
        return await detectErrors(this.lastAnalysisData);
        
      case 'get_exercise_recommendations':
        // Получаем ошибки из последнего анализа или вызываем detect_errors
        if (!this.lastAnalysisData) {
          throw new Error('Сначала нужно вызвать analyze_running_technique');
        }
        const errors = await detectErrors(this.lastAnalysisData);
        return await getRecommendations(errors.errors, args.runner_level);
      
      case 'get_focus_areas':
        if (!this.lastAnalysisData) {
          throw new Error('Сначала нужно вызвать analyze_running_technique');
        }
        return await getFocusAreas(args);
        
      default:
        throw new Error(`Unknown function: ${functionName}`);
    }
  }

  // Копия функции конвертации из analyze-simple.ts
  private convertToFullFormat(simple: SimpleBiomechanicsInput): RunBiomechanicsInput {
    const createMetric = (mean: number | undefined, variability: number = 0.05, defaultValue: number = 0) => {
      const value = mean !== undefined && !isNaN(mean) ? mean : defaultValue;
      return {
        min: value * (1 - variability),
        max: value * (1 + variability),
        mean: value,
        std: value * variability / 2,
        count: 80
      };
    };

    return {
      left_arm: {
        arm_swing: createMetric(simple.left_arm_swing_mean, 0.05, 150),
        elbow_angle: createMetric(simple.left_elbow_angle_mean, 0.05, 110)
      },
      right_arm: {
        arm_swing: createMetric(simple.right_arm_swing_mean, 0.05, 145),
        elbow_angle: createMetric(simple.right_elbow_angle_mean, 0.05, 110)
      },
      left_leg: {
        knee_angle: createMetric(simple.left_knee_angle_mean, simple.knee_variability || 0.1, 115),
        ankle_angle: createMetric(simple.left_ankle_angle_mean, 0.05, 100),
        hip_angle: createMetric(25, 0.05, 25),
        shank_angle: createMetric(55, 0.05, 55)
      },
      right_leg: {
        knee_angle: createMetric(simple.right_knee_angle_mean, simple.knee_variability || 0.1, 111),
        ankle_angle: createMetric(simple.right_ankle_angle_mean, 0.05, 104),
        hip_angle: createMetric(28, 0.05, 28),
        shank_angle: createMetric(54, 0.05, 54)
      },
      trunk: {
        trunk_angle: createMetric(simple.trunk_angle_mean, simple.trunk_stability || 0.01, 174)
      },
      head: {
        head_angle: createMetric(simple.head_angle_mean, 0.02, 136)
      },
      weight_kg: simple.weight_kg,
      height_cm: simple.height_cm
    };
  }

  async processUserMessage(userMessage: string): Promise<string> {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    const maxIterations = 10; // Увеличено для нескольких вызовов функций
    let iteration = 0;

    while (iteration < maxIterations) {
      iteration++;

      const response = await this.gigachat.chat(
        this.conversationHistory,
        this.getMCPFunctions()
      );

      if (response.function_call) {
        const { name, arguments: argsStr } = response.function_call;

        let args;
        if (typeof argsStr === 'object') {
          args = argsStr;
        } else {
          args = JSON.parse(argsStr);
        }

        const result = await this.executeMCPFunction(name, args);
        console.log(`✅ ${name}`);

        this.conversationHistory.push({
          role: 'assistant',
          content: response.content || '',
          function_call: response.function_call,
        });

        this.conversationHistory.push({
          role: 'function',
          name: name,
          content: JSON.stringify(result),
        });

        continue;
      }

      this.conversationHistory.push({
        role: 'assistant',
        content: response.content,
      });

      return response.content;
    }

    throw new Error('Превышено максимальное количество итераций');
  }

  clearHistory(): void {
    this.conversationHistory = [];
    this.lastAnalysisData = null;
  }
}
