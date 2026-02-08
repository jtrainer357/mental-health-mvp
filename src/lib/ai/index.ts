/**
 * AI Module Public API
 * @module ai
 */

// Provider Types and Interfaces
export type {
  AIProviderType,
  AIMessageRole,
  AIMessage,
  AICompletionOptions,
  AITokenUsage,
  AICompletionResult,
  AIErrorCode,
  AIProviderConfig,
  AIProviderHealth,
} from "./providers/base";

export { AIProvider, AIProviderError } from "./providers/base";

// Provider Implementations
export { ClaudeProvider, createClaudeProvider } from "./providers/claude";
export type { ClaudeProviderConfig } from "./providers/claude";

export { GeminiProvider, createGeminiProvider } from "./providers/gemini";
export type { GeminiProviderConfig } from "./providers/gemini";

// Provider Factory
export {
  getAIProvider,
  getDefaultProvider,
  isProviderAvailable,
  getAvailableProviders,
  clearProviderCache,
  Providers,
} from "./providers/factory";

export type { AIProviderFactoryConfig } from "./providers/factory";

// Fallback Chain
export {
  FallbackChain,
  createDefaultFallbackChain,
  createClinicalFallbackChain,
  createMarketingFallbackChain,
} from "./pipeline/fallback-chain";

export type { FallbackChainConfig, FallbackChainResult } from "./pipeline/fallback-chain";

// Prompt Templates
export {
  promptRegistry,
  compilePrompt,
  getPromptTemplate,
  hasPromptTemplate,
  listPromptTemplates,
} from "./prompts/registry";

export type { PromptTemplate, CompiledPrompt } from "./prompts/registry";

// Input Sanitization
export {
  sanitizeUserInput,
  sanitize,
  containsInjection,
  escapeForPrompt,
  sanitizeObject,
  validateInput,
} from "./prompts/sanitizer";

export type { SanitizeOptions, SanitizeResult } from "./prompts/sanitizer";

// Configuration
export {
  getAIConfig,
  reloadConfig,
  isAIAvailable,
  getAvailableProviderTypes,
  validateConfig,
  ENV_VARS,
} from "./config";

export type { AIConfig } from "./config";

// Backward compatibility exports
export { analyzePatientWithClaude, analyzeMultiplePatients } from "./claude-substrate";
export type { PatientAnalysisInput, PrioritizedAction } from "./claude-substrate";

export { generateColumnMapping, TARGET_SCHEMA } from "./gemini-import";
export type { ColumnMapping } from "./gemini-import";
