/**
 * AI Provider Factory
 * @module ai/providers/factory
 */

import { AIProvider, AIProviderType } from "./base";
import { ClaudeProvider } from "./claude";
import { GeminiProvider } from "./gemini";
import { getAIConfig } from "../config";

export interface AIProviderFactoryConfig {
  provider?: AIProviderType;
  apiKey?: string;
  model?: string;
}

const providerCache = new Map<string, AIProvider>();

function getCacheKey(config: AIProviderFactoryConfig): string {
  return `${config.provider || "default"}-${config.model || "default"}`;
}

export function getAIProvider(
  factoryConfig: AIProviderFactoryConfig = {},
  useCache: boolean = true
): AIProvider {
  const config = getAIConfig();
  const providerType = factoryConfig.provider || config.defaultProvider;

  const cacheKey = getCacheKey({ ...factoryConfig, provider: providerType });

  if (useCache && providerCache.has(cacheKey)) {
    return providerCache.get(cacheKey)!;
  }

  let provider: AIProvider;

  switch (providerType) {
    case "claude": {
      const apiKey = factoryConfig.apiKey || config.claude.apiKey;
      if (!apiKey) throw new Error("ANTHROPIC_API_KEY is required");
      provider = new ClaudeProvider({
        apiKey,
        model: factoryConfig.model || config.claude.model,
      });
      break;
    }
    case "gemini": {
      const apiKey = factoryConfig.apiKey || config.gemini.apiKey;
      if (!apiKey) throw new Error("GEMINI_API_KEY is required");
      provider = new GeminiProvider({
        apiKey,
        model: factoryConfig.model || config.gemini.model,
        enableSearchGrounding: config.gemini.searchGroundingEnabled,
      });
      break;
    }
    case "openai":
      throw new Error("OpenAI provider not yet implemented");
    default:
      throw new Error(`Unknown provider type: ${providerType}`);
  }

  if (useCache) {
    providerCache.set(cacheKey, provider);
  }

  return provider;
}

export function getDefaultProvider(): AIProvider {
  return getAIProvider();
}

export function isProviderAvailable(type: AIProviderType): boolean {
  const config = getAIConfig();
  switch (type) {
    case "claude":
      return config.claude.available;
    case "gemini":
      return config.gemini.available;
    case "openai":
      return config.openai.available;
    default:
      return false;
  }
}

export function getAvailableProviders(): AIProviderType[] {
  const config = getAIConfig();
  const available: AIProviderType[] = [];
  if (config.claude.available) available.push("claude");
  if (config.gemini.available) available.push("gemini");
  if (config.openai.available) available.push("openai");
  return available;
}

export function clearProviderCache(): void {
  providerCache.clear();
}

/** Pre-configured provider presets */
export const Providers = {
  /** Claude for clinical analysis - higher accuracy */
  clinicalAnalysis: () => getAIProvider({ provider: "claude" }),

  /** Gemini with search grounding for web research */
  webSearchGrounded: () => getAIProvider({ provider: "gemini" }),

  /** Fast provider for simple tasks */
  fast: () => getAIProvider({ provider: "gemini" }),
};
