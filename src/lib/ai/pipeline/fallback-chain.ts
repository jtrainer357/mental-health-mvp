/**
 * AI Fallback Chain
 * @module ai/pipeline/fallback-chain
 */

import {
  AIProvider,
  AIProviderType,
  AIMessage,
  AICompletionOptions,
  AICompletionResult,
  AIProviderError,
} from "../providers/base";
import { getAIProvider, isProviderAvailable } from "../providers/factory";
import { logger } from "../../logger";

export interface FallbackChainConfig {
  providers: AIProviderType[];
  maxRetries?: number;
  retryDelayMs?: number;
  enableLogging?: boolean;
  onFallback?: (from: AIProviderType, to: AIProviderType, error: AIProviderError) => void;
}

export interface FallbackChainResult extends AICompletionResult {
  providersAttempted: number;
  errors: Array<{ provider: AIProviderType; error: AIProviderError }>;
}

export class FallbackChain {
  private readonly providers: AIProvider[];
  private readonly providerTypes: AIProviderType[];
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;
  private readonly enableLogging: boolean;
  private readonly onFallback?: FallbackChainConfig["onFallback"];

  constructor(config: FallbackChainConfig) {
    this.providerTypes = config.providers;
    this.maxRetries = config.maxRetries ?? 1;
    this.retryDelayMs = config.retryDelayMs ?? 1000;
    this.enableLogging = config.enableLogging ?? true;
    this.onFallback = config.onFallback;

    this.providers = [];
    for (const type of config.providers) {
      if (isProviderAvailable(type)) {
        try {
          this.providers.push(getAIProvider({ provider: type }));
        } catch (error) {
          if (this.enableLogging) {
            logger.warn(`Failed to initialize provider ${type}`, { error });
          }
        }
      }
    }

    if (this.providers.length === 0) {
      throw new Error(`No providers available from: ${config.providers.join(", ")}`);
    }
  }

  async complete(
    messages: AIMessage[],
    options?: AICompletionOptions
  ): Promise<FallbackChainResult> {
    const errors: FallbackChainResult["errors"] = [];
    let providersAttempted = 0;

    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[i]!;
      const isFirstProvider = i === 0;

      for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
        providersAttempted++;

        try {
          const result = await provider.complete(messages, options);
          return {
            ...result,
            isFallback: !isFirstProvider,
            originalProvider: isFirstProvider ? undefined : this.providerTypes[0],
            providersAttempted,
            errors,
          };
        } catch (error) {
          const providerError =
            error instanceof AIProviderError
              ? error
              : new AIProviderError(
                  (error as Error).message,
                  provider.type,
                  "UNKNOWN_ERROR",
                  undefined,
                  false,
                  error
                );

          errors.push({ provider: provider.type, error: providerError });

          if (this.enableLogging) {
            logger.warn(`AI provider ${provider.type} failed (attempt ${attempt + 1})`, {
              error: providerError.message,
              code: providerError.code,
            });
          }

          if (providerError.retryable && attempt < this.maxRetries) {
            await new Promise((r) => setTimeout(r, this.retryDelayMs * (attempt + 1)));
            continue;
          }
          break;
        }
      }

      if (i < this.providers.length - 1) {
        const nextProvider = this.providers[i + 1]!;
        const lastError = errors[errors.length - 1]?.error;

        if (this.enableLogging) {
          logger.info(`Falling back from ${provider.type} to ${nextProvider.type}`);
        }

        if (this.onFallback && lastError) {
          this.onFallback(provider.type, nextProvider.type, lastError);
        }
      }
    }

    const lastError = errors[errors.length - 1]?.error;
    const lastProviderType = this.providerTypes[this.providerTypes.length - 1] || "claude";
    throw new AIProviderError(
      `All providers failed. Last error: ${lastError?.message || "Unknown"}`,
      lastProviderType,
      lastError?.code || "PROVIDER_ERROR",
      lastError?.statusCode,
      false,
      { errors }
    );
  }

  async completeJSON<T = unknown>(
    messages: AIMessage[],
    options?: AICompletionOptions
  ): Promise<{ data: T; result: FallbackChainResult }> {
    const result = await this.complete(messages, options);

    let content = result.content.trim();
    if (content.startsWith("```")) {
      content = content.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?\s*```\s*$/, "");
    }

    const data = JSON.parse(content) as T;
    return { data, result };
  }

  getProviders(): AIProviderType[] {
    return this.providers.map((p) => p.type);
  }

  async healthCheck(): Promise<Array<{ provider: AIProviderType; healthy: boolean; latencyMs?: number }>> {
    return Promise.all(
      this.providers.map(async (p) => {
        const health = await p.healthCheck();
        return { provider: p.type, healthy: health.healthy, latencyMs: health.latencyMs };
      })
    );
  }
}

export function createDefaultFallbackChain(config?: Partial<FallbackChainConfig>): FallbackChain {
  return new FallbackChain({ providers: ["claude", "gemini"], maxRetries: 2, retryDelayMs: 1000, ...config });
}

export function createClinicalFallbackChain(
  onFallback?: FallbackChainConfig["onFallback"]
): FallbackChain {
  return new FallbackChain({
    providers: ["claude", "gemini"],
    maxRetries: 2,
    retryDelayMs: 2000,
    enableLogging: true,
    onFallback,
  });
}

export function createMarketingFallbackChain(
  onFallback?: FallbackChainConfig["onFallback"]
): FallbackChain {
  return new FallbackChain({
    providers: ["gemini", "claude"],
    maxRetries: 1,
    retryDelayMs: 1000,
    enableLogging: true,
    onFallback,
  });
}
