/**
 * Claude Provider Implementation
 * @module ai/providers/claude
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  AIProvider,
  AIMessage,
  AICompletionOptions,
  AICompletionResult,
  AIProviderError,
  AIErrorCode,
} from "./base";

export interface ClaudeProviderConfig {
  apiKey: string;
  model?: string;
}

export class ClaudeProvider extends AIProvider {
  readonly type = "claude" as const;
  readonly model: string;
  private readonly client: Anthropic;

  constructor(config: ClaudeProviderConfig) {
    super();
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.model = config.model || "claude-sonnet-4-20250514";
  }

  async complete(
    messages: AIMessage[],
    options: AICompletionOptions = {}
  ): Promise<AICompletionResult> {
    const { maxTokens = 2048, temperature = 0.7, systemPrompt, stopSequences } = options;

    const systemMessages = messages.filter((m) => m.role === "system");
    const nonSystemMessages = messages.filter((m) => m.role !== "system");
    const system = systemPrompt || systemMessages.map((m) => m.content).join("\n") || undefined;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: maxTokens,
        temperature,
        system,
        messages: nonSystemMessages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        stop_sequences: stopSequences,
      });

      const textBlock = response.content.find((block) => block.type === "text");
      const content = textBlock && "text" in textBlock ? textBlock.text : "";

      return {
        content,
        provider: this.type,
        model: this.model,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
        finishReason: response.stop_reason || undefined,
      };
    } catch (error) {
      throw this.mapError(error);
    }
  }

  private mapError(error: unknown): AIProviderError {
    if (error instanceof Anthropic.APIError) {
      const statusCode = error.status;
      let code: AIErrorCode = "PROVIDER_ERROR";
      let retryable = false;

      if (statusCode === 429) {
        code = "RATE_LIMIT";
        retryable = true;
      } else if (statusCode === 401) {
        code = "INVALID_API_KEY";
      } else if (statusCode === 400 && error.message.includes("context")) {
        code = "CONTEXT_LENGTH_EXCEEDED";
      } else if (statusCode === 400 && error.message.includes("content")) {
        code = "CONTENT_FILTERED";
      } else if (statusCode && statusCode >= 500) {
        code = "PROVIDER_ERROR";
        retryable = true;
      }

      return new AIProviderError(error.message, this.type, code, statusCode, retryable, error);
    }

    if (error instanceof Error && error.message.includes("timeout")) {
      return new AIProviderError(error.message, this.type, "TIMEOUT", undefined, true, error);
    }

    return new AIProviderError(
      error instanceof Error ? error.message : "Unknown error",
      this.type,
      "UNKNOWN_ERROR",
      undefined,
      false,
      error
    );
  }
}

export function createClaudeProvider(apiKey?: string, model?: string): ClaudeProvider {
  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error("ANTHROPIC_API_KEY is required");
  }
  return new ClaudeProvider({ apiKey: key, model });
}
