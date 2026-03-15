/**
 * Supabase Browser Client
 * For client-side Supabase operations
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

type BrowserClient = ReturnType<typeof createBrowserClient<Database>>;

let client: BrowserClient | null = null;
let isConfigured = false;

/**
 * Check if Supabase is configured (env vars present)
 */
export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function createClient(): BrowserClient {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client that fails gracefully for demo mode
    // This allows the app to run without Supabase for demos
    isConfigured = false;
    return createMockClient() as unknown as BrowserClient;
  }

  isConfigured = true;
  client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  return client;
}

/**
 * Create a mock Supabase client that returns empty results
 * Used when Supabase is not configured (demo mode)
 */
function createMockClient() {
  const mockResult = {
    data: null,
    error: { message: "Supabase not configured", code: "NOT_CONFIGURED" },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockQuery = (): any => {
    const query = {
      select: () => mockQuery(),
      insert: () => mockQuery(),
      update: () => mockQuery(),
      delete: () => mockQuery(),
      eq: () => mockQuery(),
      neq: () => mockQuery(),
      gt: () => mockQuery(),
      gte: () => mockQuery(),
      lt: () => mockQuery(),
      lte: () => mockQuery(),
      like: () => mockQuery(),
      ilike: () => mockQuery(),
      is: () => mockQuery(),
      in: () => mockQuery(),
      or: () => mockQuery(),
      order: () => mockQuery(),
      limit: () => mockQuery(),
      single: () => Promise.resolve(mockResult),
      // Make the query thenable so await works
      then: (
        onFulfilled?: (value: typeof mockResult) => unknown,
        onRejected?: (reason: unknown) => unknown
      ) => Promise.resolve(mockResult).then(onFulfilled, onRejected),
      catch: (onRejected?: (reason: unknown) => unknown) =>
        Promise.resolve(mockResult).catch(onRejected),
    };
    return query;
  };

  return {
    from: () => mockQuery(),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
  };
}

// Re-export for convenience
export type { Database };
