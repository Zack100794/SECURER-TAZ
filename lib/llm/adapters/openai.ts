import { LLMAdapter, LLMMessage, LLMResponse, GenerateOptions } from '../types';

export class OpenAIAdapter implements LLMAdapter {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generate(messages: LLMMessage[], options?: GenerateOptions): Promise<LLMResponse> {
    try {
      const requestBody: any = {
        model: this.model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
      };

      // If schema is provided, use JSON mode
      if (options?.schema) {
        requestBody.response_format = { type: 'json_object' };
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';

      // Try to parse if schema is provided
      let parsed = undefined;
      if (options?.schema && content) {
        try {
          const jsonData = JSON.parse(content);
          parsed = options.schema.parse(jsonData);
        } catch (error) {
          console.warn('Failed to parse OpenAI response with schema:', error);
        }
      }

      return {
        content,
        parsed,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      console.error('OpenAI adapter error:', error);
      throw new Error(`Failed to generate response from OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
