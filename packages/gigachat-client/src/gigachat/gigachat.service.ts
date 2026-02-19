import GigaChat from 'gigachat';
import { Agent } from 'https';
import {
  ChatCompletionMessage,
  FunctionDefinition,
  GigaChatConfig,
} from './types';

export class GigaChatService {
  private client: any;

  constructor(config: GigaChatConfig) {
    const httpsAgent = new Agent({
      rejectUnauthorized: false,
    });

    this.client = new GigaChat({
      credentials: config.apiKey,
      model: config.model || 'GigaChat',
      timeout: (config.timeout || 180) * 1000,
      httpsAgent: httpsAgent,
    });
  }

  async chat(
    messages: ChatCompletionMessage[],
    functions?: FunctionDefinition[]
  ): Promise<ChatCompletionMessage> {
    try {
      const response = await this.client.chat({
        messages,
        functions,
        function_call: functions && functions.length > 0 ? 'auto' : undefined,
      });

      return response.choices[0]?.message;
    } catch (error: any) {
      console.error('GigaChat SDK error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
      });
      throw new Error(`GigaChat error: ${error.message || JSON.stringify(error)}`);
    }
  }
}
