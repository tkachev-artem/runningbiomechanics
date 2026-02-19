/**
 * Типы для GigaChat API
 */

export interface ChatCompletionMessage {
  role: 'user' | 'assistant' | 'function' | 'system';
  content: string;
  name?: string;
  function_call?: FunctionCall;
}

export interface FunctionCall {
  name: string;
  arguments: string;
}

export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatCompletionMessage[];
  temperature?: number;
  max_tokens?: number;
  functions?: FunctionDefinition[];
  function_call?: 'auto' | 'none' | { name: string };
}

export interface ChatCompletionResponse {
  choices: Array<{
    message: ChatCompletionMessage;
    finish_reason: string;
    index: number;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GigaChatConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  timeout?: number;
}

export interface TokenResponse {
  access_token: string;
  expires_at: number;
}
