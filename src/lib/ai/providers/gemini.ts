/**
 * Gemini Provider Implementation
 * @module ai/providers/gemini
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import {
  AIProvider,
  AIMessage,
  AICompletionOptions,
  AICompletionResult,
  AIProviderError,
  AIErrorCode,
} from "./base";

export interface GeminiProviderConfig {
  apiKey: string;
  model?: string;
  enableSearchGrounding?: boolean;
}

export class GeminiProvider extends AIProvider {
  readonly type = "gemini" as const;
  readonly model: string;
  private readonly client: GoogleGenerativeAI;
  private readonly enableSearchGrounding: boolean;

  constructor(config: GeminiProviderConfig) {
    super();
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model || "gemini-2.0-flash";
    this.enableSearchGrounding = config.enableSearchGrounding ?? true;
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
      const model = this.client.getGenerativeModel({
        model: this.model,
        systemInstruction: system,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature,
          stopSequences,
        },
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
      });

      const contents = nonSystemMessages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const result = await model.generateContent({ contents });
      const response = result.response;
      const content = response.text();

      const usage = response.usageMetadata;

      return {
        content,
        provider: this.type,
        model: this.model,
        usage: usage
          ? {
              inputTokens: usage.promptTokenCount || 0,
              outputTokens: usage.candidatesTokenCount || 0,
              totalTokens: usage.totalTokenCount || 0,
            }
          : undefined,
        finishReason: response.candidates?.[0]?.finishReason,
      };
    } catch (error) {
      throw this.mapError(error);
    }
  }

  private mapError(error: unknown): AIProviderError {
    const message = error instanceof Error ? error.message : String(error);
    let code: AIErrorCode = "PROVIDER_ERROR";
    let retryable = false;

    if (message.includes("429") || message.toLowerCase().includes("rate limit")) {
      code = "RATE_LIMIT";
      retryable = true;
    } else if (message.includes("401") || message.toLowerCase().includes("api key")) {
      code = "INVALID_API_KEY";
    } else if (message.toLowerCase().includes("context") || message.toLowerCase().includes("token")) {
      code = "CONTEXT_LENGTH_EXCEEDED";
    } else if (message.toLowerCase().includes("safety") || message.toLowerCase().includes("blocked")) {
      code = "CONTENT_FILTERED";
    } else if (message.includes("500") || message.includes("503")) {
      code = "PROVIDER_ERROR";
      retryable = true;
    } else if (message.toLowerCase().includes("timeout")) {
      code = "TIMEOUT";
      retryable = true;
    }

    return new AIProviderError(message, this.type, code, undefined, retryable, error);
  }
}

export function createGeminiProvider(
  apiKey?: string,
  model?: string,
  enableSearchGrounding?: boolean
): GeminiProvider {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is required");
  }
  return new GeminiProvider({ apiKey: key, model, enableSearchGrounding });
}
