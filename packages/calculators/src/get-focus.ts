import { RunningError, RunAnalysisResult, Exercise } from '@biomech/types';

export interface FocusAreasInput {
  errors: RunningError[];
  analysis: RunAnalysisResult;
  exercises?: Exercise[];
}

export interface FocusPriority {
  area: string;
  priority: number;
  score?: number;
  reason: string;
  action: string;
}

export interface FocusAreasResult {
  priorities: FocusPriority[];
  recommendations: string[];
  estimated_improvement: string;
}

function getActionLabel(category: string): string {
  const map: Record<string, string> = {
    arm_quality: 'работы рук',
    leg_quality: 'техники ног',
    trunk_stability: 'ровной спины',
    symmetry: 'баланса левой и правой стороны',
    efficiency: 'экономичности бега',
    consistency: 'стабильности движений',
  };

  return map[category] || 'этого показателя';
}

export async function getFocusAreas(input: FocusAreasInput): Promise<FocusAreasResult> {
  const { errors, analysis } = input;
  
  const priorities: FocusPriority[] = [];
  const recommendations: string[] = [];
  
  // 1. Анализ слабых категорий из техники
  const categoryScores = analysis.оценки_категорий;
  const weakCategories = Object.entries(categoryScores)
    .filter(([_, score]) => score < 85)
    .sort(([_, a], [__, b]) => a - b);
  
  let priorityCounter = 1;
  
  // Добавляем слабые категории
  for (const [category, score] of weakCategories) {
    const categoryNames: Record<string, string> = {
      arm_quality: 'Работа рук',
      leg_quality: 'Техника ног',
      trunk_stability: 'Ровная спина',
      symmetry: 'Баланс левой/правой',
      efficiency: 'Экономичность бега',
      consistency: 'Стабильность движений'
    };
    
    priorities.push({
      area: categoryNames[category] || category,
      priority: priorityCounter++,
      score,
      reason: `Оценка ${score.toFixed(1)}/100 - требует улучшения`,
      action: `Работать над улучшением ${getActionLabel(category)}`
    });
  }
  
  // 2. Критические ошибки
  const criticalErrors = errors.filter(e => e.severity === 'Критическая' || e.severity === 'Высокая');
  for (const error of criticalErrors) {
    priorities.push({
      area: error.error_name,
      priority: priorityCounter++,
      reason: `${error.severity} ошибка - ${error.description}`,
      action: 'Требует немедленной коррекции'
    });
  }
  
  // 3. Формируем рекомендации (простым языком)
  if (errors.length > 0) {
    recommendations.push('Делайте упражнения для коррекции 3-4 раза в неделю - результат увидите через месяц');
  }
  
  if (weakCategories.length > 0) {
    const weakestCategory = weakCategories[0][0];
    if (weakestCategory === 'consistency') {
      recommendations.push('Работайте над тем, чтобы каждый шаг был одинаковым - это ключ к скорости');
    } else if (weakestCategory === 'efficiency') {
      recommendations.push('Учитесь бежать легче - меньше усилий, больше скорости');
    } else if (weakestCategory === 'symmetry') {
      recommendations.push('Нужно выровнять работу левой и правой ноги - так бежать легче');
    } else if (weakestCategory === 'trunk_stability') {
      recommendations.push('Укрепляйте пресс и спину - это основа правильной техники');
    }
  }
  
  if (analysis.итоговая_оценка >= 90) {
    recommendations.push('Ваша техника на отличном уровне - продолжайте в том же духе!');
  } else {
    recommendations.push('Каждую тренировку думайте о технике - не только о скорости');
  }
  
  // 4. Оценка времени улучшения
  const avgScore = analysis.итоговая_оценка;
  
  let timeEstimate = '2-3 месяца';
  if (avgScore >= 90) {
    timeEstimate = '1-2 месяца';
  } else if (avgScore >= 75) {
    timeEstimate = '2-3 месяца';
  } else {
    timeEstimate = '3-6 месяцев';
  }
  
  return {
    priorities: priorities.slice(0, 5), // Топ-5 приоритетов
    recommendations,
    estimated_improvement: timeEstimate
  };
}
