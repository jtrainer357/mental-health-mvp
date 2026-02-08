/**
 * Input Sanitization Utilities
 * Prevents XSS, SQL injection, and other common attacks.
 */

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;",
};

/**
 * Escape HTML special characters to prevent XSS.
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Remove potentially dangerous SQL patterns.
 */
export function stripSqlPatterns(str: string): string {
  const patterns = [
    /;\s*--/gi,
    /;\s*\/\*/gi,
    /'\s*OR\s*'1'\s*=\s*'1/gi,
    /"\s*OR\s*"1"\s*=\s*"1/gi,
    /UNION\s+SELECT/gi,
    /INSERT\s+INTO/gi,
    /UPDATE\s+.*\s+SET/gi,
    /DELETE\s+FROM/gi,
    /DROP\s+(TABLE|DATABASE)/gi,
    /TRUNCATE\s+TABLE/gi,
    /EXEC(\s|\()/gi,
    /xp_/gi,
  ];

  let result = str;
  for (const pattern of patterns) {
    result = result.replace(pattern, "");
  }
  return result;
}

/**
 * Remove script tags and event handlers.
 */
export function stripScripts(str: string): string {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/data:/gi, "safe:");
}

/**
 * Sanitize plain text input.
 */
export function sanitizeText(input: string, maxLength: number = 10000): string {
  if (!input || typeof input !== "string") return "";

  let result = input.trim();
  result = result.slice(0, maxLength);
  result = escapeHtml(result);
  result = stripSqlPatterns(result);

  return result;
}

/**
 * Sanitize rich text (allows some HTML but removes dangerous elements).
 */
export function sanitizeRichText(input: string, maxLength: number = 50000): string {
  if (!input || typeof input !== "string") return "";

  let result = input.trim();
  result = result.slice(0, maxLength);
  result = stripScripts(result);
  result = stripSqlPatterns(result);

  // Remove potentially dangerous attributes
  result = result.replace(/\s+(style|class|id)\s*=\s*["'][^"']*["']/gi, "");

  return result;
}

/**
 * Sanitize a search query.
 */
export function sanitizeSearchQuery(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== "string") return "";

  let result = input.trim();
  result = result.slice(0, maxLength);
  result = escapeHtml(result);
  result = stripSqlPatterns(result);
  // Remove special search characters that could cause issues
  result = result.replace(/[*?[\]{}()\\^$|]/g, "");

  return result;
}

/**
 * Sanitize email address.
 */
export function sanitizeEmail(input: string): string {
  if (!input || typeof input !== "string") return "";

  const result = input.trim().toLowerCase().slice(0, 254);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(result)) return "";
  return result;
}

/**
 * Sanitize phone number.
 */
export function sanitizePhone(input: string): string {
  if (!input || typeof input !== "string") return "";

  // Remove all non-numeric characters except + at the start
  let result = input.trim();
  const hasPlus = result.startsWith("+");
  result = result.replace(/\D/g, "");

  if (hasPlus) result = "+" + result;
  return result.slice(0, 20);
}

/**
 * Sanitize UUID.
 */
export function sanitizeUUID(input: string): string | null {
  if (!input || typeof input !== "string") return null;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const cleaned = input.trim().toLowerCase();

  return uuidRegex.test(cleaned) ? cleaned : null;
}

/**
 * Smart sanitize that applies appropriate sanitization based on field type.
 */
export function smartSanitize(
  input: unknown,
  fieldType: "text" | "richText" | "search" | "email" | "phone" | "uuid" = "text"
): string | null {
  if (input === null || input === undefined) return "";
  if (typeof input !== "string") return String(input);

  switch (fieldType) {
    case "richText":
      return sanitizeRichText(input);
    case "search":
      return sanitizeSearchQuery(input);
    case "email":
      return sanitizeEmail(input);
    case "phone":
      return sanitizePhone(input);
    case "uuid":
      return sanitizeUUID(input);
    default:
      return sanitizeText(input);
  }
}

/**
 * Sanitize an entire object's string values.
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  fieldTypes?: Partial<Record<keyof T, "text" | "richText" | "search" | "email" | "phone" | "uuid">>
): T {
  const result = { ...obj };

  for (const key in result) {
    if (typeof result[key] === "string") {
      const fieldType = fieldTypes?.[key] || "text";
      result[key] = smartSanitize(result[key], fieldType) as T[Extract<keyof T, string>];
    } else if (typeof result[key] === "object" && result[key] !== null) {
      result[key] = sanitizeObject(result[key] as Record<string, unknown>) as T[Extract<keyof T, string>];
    }
  }

  return result;
}

/**
 * Higher-order function to wrap API handlers with sanitization.
 */
export function withSanitization<T extends Record<string, unknown>>(
  handler: (sanitizedBody: T) => Promise<Response>,
  fieldTypes?: Partial<Record<keyof T, "text" | "richText" | "search" | "email" | "phone" | "uuid">>
) {
  return async (body: T): Promise<Response> => {
    const sanitizedBody = sanitizeObject(body, fieldTypes);
    return handler(sanitizedBody);
  };
}
