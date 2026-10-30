import { env } from '@/lib/config/env';

export type LLMProvider = 'ollama' | 'openai';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  baseUrl?: string;
  apiKey?: string;
}

/**
 * Gets LLM provider configuration based on LLM_PROVIDER flag in .env
 * Set LLM_PROVIDER=openai or LLM_PROVIDER=ollama
 */
export function detectLLMProvider(): LLMConfig {
  if (env.LLM_PROVIDER === 'openai') {
    return {
      provider: 'openai',
      model: 'gpt-4o',
      apiKey: env.OPENAI_API_KEY,
    };
  }

  // Default to ollama
  return {
    provider: 'ollama',
    model: env.OLLAMA_MODEL || 'llama3.1',
    baseUrl: env.OLLAMA_BASE_URL || 'http://localhost:11434',
  };
}

export const llmConfig = detectLLMProvider();

console.log(`🤖 Using LLM Provider: ${llmConfig.provider} (${llmConfig.model})`);
