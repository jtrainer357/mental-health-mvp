/**
 * AI Provider Base Types and Abstract Class
 * @module ai/providers/base
 */

export type AIProviderType = "claude" | "gemini" | "openai";
export type AIMessageRole = "user" | "assistant" | "system";

export interface AIMessage {
  role: AIMessageRole;
  content: string;
}

export interface AICompletionOptions {
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
  systemPrompt?: string;
  stopSequences?: string[];
}

export interface AITokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface AICompletionResult {
  content: string;
  provider: AIProviderType;
  model: string;
  usage?: AITokenUsage;
  finishReason?: string;
  isFallback?: boolean;
  originalProvider?: AIProviderType;
}

export type AIErrorCode =
  | "RATE_LIMIT"
  | "INVALID_API_KEY"
  | "CONTEXT_LENGTH_EXCEEDED"
  | "CONTENT_FILTERED"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "PROVIDER_ERROR"
  | "UNKNOWN_ERROR";

export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: AIProviderType,
    public readonly code: AIErrorCode,
    public readonly statusCode?: number,
    public readonly retryable: boolean = false,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}

export interface AIProviderConfig {
  apiKey: string;
  model?: string;
  timeout?: number;
}

export interface AIProviderHealth {
  healthy: boolean;
  latencyMs?: number;
  error?: string;
}

export abstract class AIProvider {
  abstract readonly type: AIProviderType;
  abstract readonly model: string;

  abstract complete(
    messages: AIMessage[],
    options?: AICompletionOptions
  ): Promise<AICompletionResult>;

  async completeJSON<T = unknown>(
    messages: AIMessage[],
    options?: AICompletionOptions
  ): Promise<{ data: T; result: AICompletionResult }> {
    const result = await this.complete(messages, options);
    let content = result.content.trim();
    if (content.startsWith("```")) {
      content = content.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?\s*```\s*$/, "");
    }
    const data = JSON.parse(content) as T;
    return { data, result };
  }

  async healthCheck(): Promise<AIProviderHealth> {
    const start = Date.now();
    try {
      await this.complete([{ role: "user", content: "Say 'ok'" }], {
        maxTokens: 10,
        timeout: 5000,
      });
      return { healthy: true, latencyMs: Date.now() - start };
    } catch (error) {
      return {
        healthy: false,
        latencyMs: Date.now() - start,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
