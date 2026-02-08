/**
 * Environment Variable Audit and Validation.
 */

interface EnvVarConfig {
  name: string;
  required: boolean;
  description: string;
  sensitive?: boolean;
}

const ENV_VARS: EnvVarConfig[] = [
  // Auth
  { name: "NEXTAUTH_URL", required: true, description: "NextAuth.js base URL" },
  { name: "NEXTAUTH_SECRET", required: true, description: "NextAuth.js secret key", sensitive: true },
  { name: "GOOGLE_CLIENT_ID", required: false, description: "Google OAuth client ID" },
  { name: "GOOGLE_CLIENT_SECRET", required: false, description: "Google OAuth client secret", sensitive: true },

  // Supabase
  { name: "NEXT_PUBLIC_SUPABASE_URL", required: true, description: "Supabase project URL" },
  { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", required: true, description: "Supabase anonymous key" },
  { name: "SUPABASE_SERVICE_ROLE_KEY", required: true, description: "Supabase service role key", sensitive: true },

  // AI Providers
  { name: "ANTHROPIC_API_KEY", required: false, description: "Anthropic API key", sensitive: true },
  { name: "OPENAI_API_KEY", required: false, description: "OpenAI API key", sensitive: true },
  { name: "DEEPGRAM_API_KEY", required: false, description: "Deepgram API key", sensitive: true },

  // Database
  { name: "DATABASE_URL", required: false, description: "Direct database connection URL", sensitive: true },

  // Sentry
  { name: "SENTRY_DSN", required: false, description: "Sentry error tracking DSN" },
  { name: "NEXT_PUBLIC_SENTRY_DSN", required: false, description: "Sentry public DSN" },

  // Analytics
  { name: "NEXT_PUBLIC_POSTHOG_KEY", required: false, description: "PostHog analytics key" },
  { name: "NEXT_PUBLIC_POSTHOG_HOST", required: false, description: "PostHog host URL" },
];

export interface AuditResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
  present: string[];
}

/**
 * Audit environment variables at runtime.
 */
export function auditEnvironmentVariables(): AuditResult {
  const missing: string[] = [];
  const warnings: string[] = [];
  const present: string[] = [];

  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.name];

    if (!value || value.trim() === "") {
      if (envVar.required) {
        missing.push(envVar.name);
      } else {
        warnings.push(`Optional: ${envVar.name} - ${envVar.description}`);
      }
    } else {
      present.push(envVar.name);

      // Check for placeholder values
      if (
        value.includes("your-") ||
        value.includes("xxx") ||
        value.includes("REPLACE_ME")
      ) {
        warnings.push(`${envVar.name} appears to contain a placeholder value`);
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
    present,
  };
}

/**
 * Log audit results to console.
 */
export function logAuditResults(result: AuditResult): void {
  if (result.valid) {
    console.log("[Env Audit] ✅ All required environment variables are set");
  } else {
    console.error("[Env Audit] ❌ Missing required environment variables:");
    result.missing.forEach((v) => console.error(`  - ${v}`));
  }

  if (result.warnings.length > 0) {
    console.warn("[Env Audit] ⚠️ Warnings:");
    result.warnings.forEach((w) => console.warn(`  - ${w}`));
  }
}

/**
 * Validate environment on startup.
 * Call this in your app initialization.
 */
export function validateEnvironment(): void {
  if (process.env.NODE_ENV === "test") return;

  const result = auditEnvironmentVariables();
  logAuditResults(result);

  if (!result.valid && process.env.NODE_ENV === "production") {
    throw new Error(
      `Missing required environment variables: ${result.missing.join(", ")}`
    );
  }
}

/**
 * Get environment variable with type safety.
 */
export function getEnv(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value || defaultValue || "";
}

/**
 * Get required environment variable.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

/**
 * Check if running in production.
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Check if running in development.
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}
