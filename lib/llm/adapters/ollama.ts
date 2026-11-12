import { LLMAdapter, LLMMessage, LLMResponse, GenerateOptions } from '../types';
import { z } from 'zod';

export class OllamaAdapter implements LLMAdapter {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl: string, model: string) {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async generate(messages: LLMMessage[], options?: GenerateOptions): Promise<LLMResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          format: options?.schema ? z.toJSONSchema(options.schema) : undefined,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          stream: false,
          options: {
            temperature: options?.temperature ?? 0.7,
            num_predict: options?.maxTokens ?? 2000,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const content = data.message?.content || '';

      let parsed = undefined;
      if (options?.schema) {
        if (!content) {
          throw new Error('Ollama returned an empty structured response');
        }
        parsed = options.schema.parse(JSON.parse(content));
      }

      return {
        content,
        parsed,
        usage: {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
      };
    } catch (error) {
      console.error('Ollama adapter error:', error);
      throw new Error(`Failed to generate response from Ollama: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
