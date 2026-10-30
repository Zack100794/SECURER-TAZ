import { z } from 'zod';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse<T = any> {
  content: string;
  parsed?: T;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMAdapter {
  generate(messages: LLMMessage[], options?: GenerateOptions): Promise<LLMResponse>;
}

export interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
  schema?: z.ZodSchema<any>;
}
