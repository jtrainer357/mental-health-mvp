/**
 * AI Configuration
 * @module ai/config
 */

import { AIProviderType, AICompletionOptions } from "./providers/base";

export interface AIConfig {
  defaultProvider: AIProviderType;
  claude: { apiKey: string | undefined; model: string; available: boolean };
  gemini: { apiKey: string | undefined; model: string; available: boolean; searchGroundingEnabled: boolean };
  openai: { apiKey: string | undefined; model: string; available: boolean };
  defaults: Omit<AICompletionOptions, "systemPrompt" | "stopSequences">;
  fallback: { providers: AIProviderType[]; maxRetries: number; retryDelayMs: number };
  features: { enableFallback: boolean; enableLogging: boolean };
}

function getEnv(key: string, defaultValue?: string): string | undefined {
  return process.env[key] ?? defaultValue;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === "true" || value === "1";
}

function loadConfig(): AIConfig {
  const claudeApiKey = getEnv("ANTHROPIC_API_KEY");
  const geminiApiKey = getEnv("GEMINI_API_KEY");
  const openaiApiKey = getEnv("OPENAI_API_KEY");

  let defaultProvider: AIProviderType = "claude";
  if (claudeApiKey) defaultProvider = "claude";
  else if (geminiApiKey) defaultProvider = "gemini";
  else if (openaiApiKey) defaultProvider = "openai";

  const envProvider = getEnv("AI_DEFAULT_PROVIDER");
  if (envProvider === "claude" || envProvider === "gemini" || envProvider === "openai") {
    defaultProvider = envProvider;
  }

  return {
    defaultProvider,
    claude: {
      apiKey: claudeApiKey,
      model: getEnv("ANTHROPIC_MODEL", "claude-sonnet-4-20250514")!,
      available: Boolean(claudeApiKey),
    },
    gemini: {
      apiKey: geminiApiKey,
      model: getEnv("GEMINI_MODEL", "gemini-2.0-flash")!,
      available: Boolean(geminiApiKey),
      searchGroundingEnabled: getEnvBoolean("GEMINI_SEARCH_GROUNDING", true),
    },
    openai: {
      apiKey: openaiApiKey,
      model: getEnv("OPENAI_MODEL", "gpt-4o")!,
      available: Boolean(openaiApiKey),
    },
    defaults: {
      maxTokens: getEnvNumber("AI_DEFAULT_MAX_TOKENS", 2048),
      temperature: parseFloat(getEnv("AI_DEFAULT_TEMPERATURE", "0.7")!),
      timeout: getEnvNumber("AI_DEFAULT_TIMEOUT", 30000),
    },
    fallback: {
      providers: (getEnv("AI_FALLBACK_PROVIDERS", "claude,gemini")!.split(",") as AIProviderType[]),
      maxRetries: getEnvNumber("AI_FALLBACK_MAX_RETRIES", 2),
      retryDelayMs: getEnvNumber("AI_FALLBACK_RETRY_DELAY_MS", 1000),
    },
    features: {
      enableFallback: getEnvBoolean("AI_ENABLE_FALLBACK", true),
      enableLogging: getEnvBoolean("AI_ENABLE_LOGGING", true),
    },
  };
}

let cachedConfig: AIConfig | null = null;

export function getAIConfig(): AIConfig {
  if (!cachedConfig) cachedConfig = loadConfig();
  return cachedConfig;
}

export function reloadConfig(): AIConfig {
  cachedConfig = loadConfig();
  return cachedConfig;
}

export function isAIAvailable(): boolean {
  const config = getAIConfig();
  return config.claude.available || config.gemini.available || config.openai.available;
}

export function getAvailableProviderTypes(): AIProviderType[] {
  const config = getAIConfig();
  const available: AIProviderType[] = [];
  if (config.claude.available) available.push("claude");
  if (config.gemini.available) available.push("gemini");
  if (config.openai.available) available.push("openai");
  return available;
}

export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!isAIAvailable()) {
    errors.push("No AI provider API keys configured.");
  }
  return { valid: errors.length === 0, errors };
}

export const ENV_VARS = {
  ANTHROPIC_API_KEY: "API key for Claude/Anthropic",
  GEMINI_API_KEY: "API key for Google Gemini",
  OPENAI_API_KEY: "API key for OpenAI",
  ANTHROPIC_MODEL: "Claude model (default: claude-sonnet-4-20250514)",
  GEMINI_MODEL: "Gemini model (default: gemini-2.0-flash)",
  OPENAI_MODEL: "OpenAI model (default: gpt-4o)",
  AI_DEFAULT_PROVIDER: "Default provider: claude, gemini, or openai",
  AI_FALLBACK_PROVIDERS: "Comma-separated fallback chain (default: claude,gemini)",
  AI_ENABLE_FALLBACK: "Enable fallback chain (default: true)",
  AI_ENABLE_LOGGING: "Enable AI operation logging (default: true)",
  GEMINI_SEARCH_GROUNDING: "Enable Gemini search grounding (default: true)",
} as const;
