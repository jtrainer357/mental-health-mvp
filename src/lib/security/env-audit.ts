/**
 * Environment Variable Audit.
 */

const REQUIRED_ENV_VARS: Array<{ name: string; critical: boolean; description: string }> = [
  { name: "NEXTAUTH_SECRET", critical: true, description: "Session encryption" },
  { name: "NEXTAUTH_URL", critical: true, description: "Auth callback URL" },
  { name: "NEXT_PUBLIC_SUPABASE_URL", critical: true, description: "Supabase URL" },
  { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", critical: true, description: "Supabase public key" },
  { name: "SUPABASE_SERVICE_ROLE_KEY", critical: true, description: "Supabase service key" },
  { name: "ANTHROPIC_API_KEY", critical: false, description: "Claude AI" },
  { name: "GOOGLE_AI_API_KEY", critical: false, description: "Gemini AI" },
  { name: "OPENAI_API_KEY", critical: false, description: "OpenAI fallback" },
  { name: "DEEPGRAM_API_KEY", critical: false, description: "Voice transcription" },
];

const SENSITIVE_PATTERNS = [/SECRET/i, /KEY/i, /PASSWORD/i, /TOKEN/i, /PRIVATE/i, /SERVICE_ROLE/i];

export interface EnvAuditResult {
  valid: boolean;
  missing: string[];
  missingCritical: string[];
  warnings: string[];
  exposedSecrets: string[];
}

function isSensitiveVariable(name: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(name));
}

export function auditEnvironment(): EnvAuditResult {
  const result: EnvAuditResult = { valid: true, missing: [], missingCritical: [], warnings: [], exposedSecrets: [] };

  for (const { name, critical, description } of REQUIRED_ENV_VARS) {
    if (!process.env[name]) {
      result.missing.push(name);
      if (critical) { result.missingCritical.push(name); result.valid = false; }
      else result.warnings.push(`Optional: ${name} - ${description}`);
    }
  }

  for (const name of Object.keys(process.env)) {
    if (name.startsWith("NEXT_PUBLIC_") && isSensitiveVariable(name)) {
      const safePublicVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];
      if (!safePublicVars.includes(name)) { result.exposedSecrets.push(name); result.valid = false; }
    }
  }
  return result;
}

export function logAuditResults(result: EnvAuditResult): void {
  const ts = new Date().toISOString();
  if (result.valid) console.info(`[${ts}] [Env Audit] All critical environment variables present`);
  else console.error(`[${ts}] [Env Audit] CRITICAL: Environment audit failed!`);
  if (result.missingCritical.length > 0) console.error(`[${ts}] [Env Audit] Missing critical:`, result.missingCritical.join(", "));
  if (result.exposedSecrets.length > 0) console.error(`[${ts}] [Env Audit] SECURITY: Exposed:`, result.exposedSecrets.join(", "));
}

export function validateEnvironment(): void {
  const result = auditEnvironment();
  logAuditResults(result);
  if (!result.valid && process.env.NODE_ENV === "production")
    throw new Error(`Environment validation failed. Missing: ${result.missingCritical.join(", ")}`);
}

export function getEnvironmentSummary(): Record<string, "present" | "missing"> {
  const summary: Record<string, "present" | "missing"> = {};
  for (const { name } of REQUIRED_ENV_VARS) summary[name] = process.env[name] ? "present" : "missing";
  return summary;
}

export function isDevelopment(): boolean { return process.env.NODE_ENV !== "production"; }
export function isProduction(): boolean { return process.env.NODE_ENV === "production"; }
export function getBaseUrl(): string {
  return process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
}
