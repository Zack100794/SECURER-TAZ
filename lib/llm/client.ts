import { llmConfig } from './config';
import { OllamaAdapter } from './adapters/ollama';
import { OpenAIAdapter } from './adapters/openai';
import { LLMAdapter, LLMMessage, LLMResponse, GenerateOptions } from './types';
import { z } from 'zod';

class LLMClient {
  private adapter: LLMAdapter;

  constructor() {
    if (llmConfig.provider === 'openai') {
      if (!llmConfig.apiKey) {
        throw new Error('OpenAI API key is required');
      }
      this.adapter = new OpenAIAdapter(llmConfig.apiKey, llmConfig.model);
    } else {
      if (!llmConfig.baseUrl) {
        throw new Error('Ollama base URL is required');
      }
      this.adapter = new OllamaAdapter(llmConfig.baseUrl, llmConfig.model);
    }
  }

  /**
   * Generate a response from the LLM
   */
  async generate(messages: LLMMessage[], options?: GenerateOptions): Promise<LLMResponse> {
    return this.adapter.generate(messages, options);
  }

  /**
   * Generate a response with structured output using a Zod schema
   */
  async generateStructured<T>(
    messages: LLMMessage[],
    schema: z.ZodSchema<T>,
    options?: Omit<GenerateOptions, 'schema'>
  ): Promise<LLMResponse<T>> {
    return this.adapter.generate(messages, { ...options, schema });
  }

  /**
   * Simple completion helper
   */
  async complete(prompt: string, options?: GenerateOptions): Promise<string> {
    const response = await this.generate(
      [{ role: 'user', content: prompt }],
      options
    );
    return response.content;
  }

  /**
   * Chat with system prompt helper
   */
  async chat(
    systemPrompt: string,
    userMessage: string,
    options?: GenerateOptions
  ): Promise<string> {
    const response = await this.generate(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      options
    );
    return response.content;
  }
}

// Export singleton instance
export const llm = new LLMClient();

// Re-export types
export * from './types';
export { llmConfig };
