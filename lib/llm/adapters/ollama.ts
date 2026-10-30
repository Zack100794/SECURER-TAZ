import { LLMAdapter, LLMMessage, LLMResponse, GenerateOptions } from '../types';

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

      // Try to parse if schema is provided
      let parsed = undefined;
      if (options?.schema && content) {
        try {
          // Try to extract JSON from the response
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const jsonData = JSON.parse(jsonMatch[0]);
            parsed = options.schema.parse(jsonData);
          }
        } catch (error) {
          console.warn('Failed to parse LLM response with schema:', error);
        }
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
