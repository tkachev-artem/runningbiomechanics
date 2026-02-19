/**
 * Финальный JSON результат анализа
 * Соответствует формату examples/data.json
 */

// --- Блок technique ---
export interface JsonMetricItem {
  name: string;  // "Руки", "Ноги", "Корпус", "Стабильность"
  value: number;
}

export interface JsonTechniqueData {
  score: number;
  level: string;
  metrics: JsonMetricItem[];
}

export interface JsonTechniqueBlock {
  id: 'technique';
  message: string;
  data: JsonTechniqueData;
}

// --- Блок focus ---
export interface JsonFocusBlock {
  id: 'focus';
  message: string;
  recommendation: string;
  estimated_improvement: string;
}

// --- Блок errors ---
export interface JsonErrorItem {
  priority: 'low' | 'medium' | 'high';
  description: string;
}

export interface JsonErrorsBlock {
  id: 'errors';
  message: string;
  data: JsonErrorItem[];
}

// --- Блок exercises ---
export interface JsonExerciseItem {
  id: string;
  name: string;
  description: string;
}

export interface JsonExercisesBlock {
  id: 'exercises';
  message: string;
  data: JsonExerciseItem[];
}

// --- Корневой результат ---
export type JsonBlock = JsonTechniqueBlock | JsonFocusBlock | JsonErrorsBlock | JsonExercisesBlock;

export interface JsonAnalysisResult {
  'first-message': string;
  blocks: JsonBlock[];
}
