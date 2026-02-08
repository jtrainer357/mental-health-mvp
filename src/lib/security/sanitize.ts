/**
 * Input Sanitization Utilities.
 */

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;",
  "'": "&#x27;", "/": "&#x2F;", "`": "&#x60;", "=": "&#x3D;",
};

const ALLOWED_TAGS = new Set(["p", "br", "b", "i", "u", "strong", "em", "ul", "ol", "li", "a", "span"]);
const ALLOWED_ATTRS: Record<string, Set<string>> = { a: new Set(["href", "title"]), span: new Set(["class"]) };

const SQL_PATTERNS = [/--/g, /;/g, /'/g, /"/g, /\\/g, /\/\*/g, /\*\//g,
  /\bOR\b/gi, /\bAND\b/gi, /\bUNION\b/gi, /\bSELECT\b/gi, /\bINSERT\b/gi,
  /\bUPDATE\b/gi, /\bDELETE\b/gi, /\bDROP\b/gi, /\bEXEC\b/gi, /\bEXECUTE\b/gi];

export function escapeHtml(input: string): string {
  return input.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

export function sanitizeText(input: string): string {
  if (!input || typeof input !== "string") return "";
  let sanitized = input.replace(/<[^>]*>/g, "");
  sanitized = sanitized.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#x2F;/g, "/")
    .replace(/&#x60;/g, "`").replace(/&#x3D;/g, "=").replace(/&nbsp;/g, " ");
  return escapeHtml(sanitized.trim());
}

export function sanitizeRichText(input: string): string {
  if (!input || typeof input !== "string") return "";
  let sanitized = input;
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  sanitized = sanitized.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/\son\w+\s*=\s*[^\s>]*/gi, "");
  sanitized = sanitized.replace(/javascript:/gi, "").replace(/data:/gi, "").replace(/vbscript:/gi, "");
  sanitized = sanitized.replace(/<\/?([a-z][a-z0-9]*)\b([^>]*)>/gi, (match, tagName, attrs) => {
    const tag = tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (match.startsWith("</")) return `</${tag}>`;
    const allowedAttrs = ALLOWED_ATTRS[tag];
    if (!allowedAttrs || !attrs.trim()) return `<${tag}>`;
    const cleanAttrs: string[] = [];
    const attrPattern = /(\w+)\s*=\s*["']([^"']*)["']/g;
    let attrMatch;
    while ((attrMatch = attrPattern.exec(attrs)) !== null) {
      const [, attrName, attrValue] = attrMatch;
      if (allowedAttrs.has(attrName.toLowerCase())) {
        const cleanVal = attrName.toLowerCase() === "href"
          ? attrValue.replace(/javascript:/gi, "").replace(/data:/gi, "").replace(/vbscript:/gi, "")
          : attrValue;
        cleanAttrs.push(`${attrName}="${escapeHtml(cleanVal)}"`);
      }
    }
    return cleanAttrs.length > 0 ? `<${tag} ${cleanAttrs.join(" ")}>` : `<${tag}>`;
  });
  return sanitized.trim();
}

export function sanitizeSearchQuery(input: string): string {
  if (!input || typeof input !== "string") return "";
  let sanitized = input.trim();
  for (const pattern of SQL_PATTERNS) sanitized = sanitized.replace(pattern, " ");
  sanitized = sanitized.replace(/\s+/g, " ").trim();
  return sanitized.length > 200 ? sanitized.substring(0, 200) : sanitized;
}

export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T, sanitizer: (input: string) => string = sanitizeText
): T {
  if (!obj || typeof obj !== "object") return obj;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") result[key] = sanitizer(value);
    else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === "string" ? sanitizer(item) :
        typeof item === "object" && item !== null ? sanitizeObject(item as Record<string, unknown>, sanitizer) : item
      );
    } else if (typeof value === "object" && value !== null) {
      result[key] = sanitizeObject(value as Record<string, unknown>, sanitizer);
    } else result[key] = value;
  }
  return result as T;
}

const RICH_TEXT_FIELDS = new Set(["content", "body", "description", "notes", "clinical_notes", "visit_summary", "message_body"]);
const SEARCH_FIELDS = new Set(["search", "query", "q", "term", "keyword"]);

export function smartSanitize<T extends Record<string, unknown>>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = RICH_TEXT_FIELDS.has(key) ? sanitizeRichText(value) :
                    SEARCH_FIELDS.has(key) ? sanitizeSearchQuery(value) : sanitizeText(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === "object" && item !== null ? smartSanitize(item as Record<string, unknown>) :
        typeof item === "string" ? sanitizeText(item) : item
      );
    } else if (typeof value === "object" && value !== null) {
      result[key] = smartSanitize(value as Record<string, unknown>);
    } else result[key] = value;
  }
  return result as T;
}

export function withSanitization<T extends (...args: never[]) => Promise<Response>>(handler: T): T {
  return (async (...args: Parameters<T>) => {
    const request = args[0] as Request;
    if (request.method !== "GET" && request.method !== "DELETE" &&
        request.headers.get("content-type")?.includes("application/json")) {
      try {
        const body = await request.json();
        const sanitizedBody = smartSanitize(body);
        const newRequest = new Request(request.url, {
          method: request.method, headers: request.headers, body: JSON.stringify(sanitizedBody),
        });
        return handler(newRequest as never, ...args.slice(1));
      } catch { return handler(...args); }
    }
    return handler(...args);
  }) as T;
}

export function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== "string") return null;
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const sanitized = email.toLowerCase().trim();
  if (!emailPattern.test(sanitized) || sanitized.includes("<") || sanitized.includes(">") || sanitized.includes("'"))
    return null;
  return sanitized;
}

export function sanitizeUUID(uuid: string): string | null {
  if (!uuid || typeof uuid !== "string") return null;
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const sanitized = uuid.toLowerCase().trim();
  return uuidPattern.test(sanitized) ? sanitized : null;
}
