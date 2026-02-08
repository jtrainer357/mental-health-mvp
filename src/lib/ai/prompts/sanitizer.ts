/**
 * Input Sanitizer
 * @module ai/prompts/sanitizer
 */

export interface SanitizeOptions {
  maxLength?: number;
  allowNewlines?: boolean;
  allowHtml?: boolean;
  blockedPatterns?: RegExp[];
  replacementText?: string;
}

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(previous|all|above|prior)\s+(instructions|prompts|rules)/i,
  /forget\s+(everything|all|your\s+instructions)/i,
  /disregard\s+(all|previous|above)\s+(instructions|rules)/i,
  /override\s+(your|system)\s+(instructions|rules)/i,
  /you\s+are\s+now\s+(a|an|the)/i,
  /pretend\s+(to\s+be|you\s+are)/i,
  /what\s+(are|is)\s+your\s+(system\s+)?prompt/i,
  /reveal\s+your\s+(instructions|prompt|system)/i,
  /\bDAN\b/,
  /jailbreak/i,
  /bypass\s+(safety|filter|restriction)/i,
];

const DANGEROUS_HTML = /<\s*(script|iframe|object|embed|form|input|link|meta|style|base|svg)[^>]*>/gi;
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

export interface SanitizeResult {
  text: string;
  wasModified: boolean;
  warnings: string[];
  detectedPatterns: string[];
}

export function sanitizeUserInput(input: string, options: SanitizeOptions = {}): SanitizeResult {
  const {
    maxLength = 10000,
    allowNewlines = true,
    allowHtml = false,
    blockedPatterns = [],
    replacementText = "[REMOVED]",
  } = options;

  if (!input) return { text: "", wasModified: false, warnings: [], detectedPatterns: [] };

  let text = typeof input === "string" ? input : String(input);
  let wasModified = false;
  const warnings: string[] = [];
  const detectedPatterns: string[] = [];

  const originalLen = text.length;
  text = text.replace(CONTROL_CHARS, "");
  if (text.length !== originalLen) {
    wasModified = true;
    warnings.push("Control characters removed");
  }

  if (!allowNewlines) {
    const before = text;
    text = text.replace(/[\r\n]+/g, " ");
    if (text !== before) wasModified = true;
  }

  if (!allowHtml) {
    const before = text;
    text = text.replace(DANGEROUS_HTML, replacementText);
    if (text !== before) {
      wasModified = true;
      warnings.push("Dangerous HTML removed");
    }
  }

  for (const pattern of [...INJECTION_PATTERNS, ...blockedPatterns]) {
    if (pattern.test(text)) {
      detectedPatterns.push(pattern.source.slice(0, 50));
      text = text.replace(pattern, replacementText);
      wasModified = true;
    }
  }

  if (detectedPatterns.length > 0) {
    warnings.push("Potential prompt injection detected");
  }

  if (text.length > maxLength) {
    text = text.slice(0, maxLength);
    wasModified = true;
    warnings.push(`Truncated to ${maxLength} characters`);
  }

  text = text.trim();

  return { text, wasModified, warnings, detectedPatterns };
}

export function sanitize(input: string, options?: SanitizeOptions): string {
  return sanitizeUserInput(input, options).text;
}

export function containsInjection(input: string, additionalPatterns?: RegExp[]): boolean {
  const allPatterns = [...INJECTION_PATTERNS, ...(additionalPatterns || [])];
  return allPatterns.some((pattern) => pattern.test(input));
}

export function escapeForPrompt(input: string): string {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options?: SanitizeOptions
): { data: T; warnings: string[] } {
  const warnings: string[] = [];

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === "string") {
      const result = sanitizeUserInput(value, options);
      warnings.push(...result.warnings);
      return result.text;
    }
    if (Array.isArray(value)) return value.map(sanitizeValue);
    if (value && typeof value === "object") {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  }

  return { data: sanitizeValue(obj) as T, warnings };
}

export function validateInput(
  input: string,
  options?: SanitizeOptions
): { valid: boolean; issues: string[] } {
  const result = sanitizeUserInput(input, options);
  return {
    valid: !result.wasModified && result.warnings.length === 0,
    issues: [...result.warnings, ...result.detectedPatterns.map((p) => `Pattern: ${p}`)],
  };
}
