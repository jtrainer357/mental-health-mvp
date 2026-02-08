/**
 * In-memory rate limiter using token bucket algorithm.
 * For production, use Redis or similar distributed store.
 */

import { NextRequest } from "next/server";

export interface RateLimitConfig {
  /** Maximum number of requests in the window */
  maxRequests: number;
  /** Window size in seconds */
  windowSeconds: number;
  /** Identifier for this rate limit (for logging) */
  identifier: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

// In-memory store for rate limiting
// In production, use Redis or similar
const buckets = new Map<string, TokenBucket>();

// Cleanup old buckets every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const BUCKET_TTL_MS = 10 * 60 * 1000; // 10 minutes

let lastCleanup = Date.now();

function cleanupBuckets(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) {
    return;
  }

  lastCleanup = now;
  const cutoff = now - BUCKET_TTL_MS;

  const entries = Array.from(buckets.entries());
  for (const [key, bucket] of entries) {
    if (bucket.lastRefill < cutoff) {
      buckets.delete(key);
    }
  }
}

/**
 * Check rate limit for a given key
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): RateLimitResult {
  cleanupBuckets();

  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  let bucket = buckets.get(key);

  if (!bucket) {
    bucket = {
      tokens: config.maxRequests,
      lastRefill: now,
    };
    buckets.set(key, bucket);
  }

  // Refill tokens based on time elapsed
  const elapsed = now - bucket.lastRefill;
  const tokensToAdd = Math.floor(
    (elapsed / windowMs) * config.maxRequests
  );

  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(config.maxRequests, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  // Calculate reset time
  const resetAt = new Date(bucket.lastRefill + windowMs);

  // Try to consume a token
  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return {
      success: true,
      limit: config.maxRequests,
      remaining: bucket.tokens,
      resetAt,
    };
  }

  // Rate limited
  const retryAfter = Math.ceil((bucket.lastRefill + windowMs - now) / 1000);

  return {
    success: false,
    limit: config.maxRequests,
    remaining: 0,
    resetAt,
    retryAfter,
  };
}

/**
 * Get a unique client identifier from the request
 */
export function getClientIdentifier(request: NextRequest): string {
  // Try to get a user identifier from headers (set by auth middleware)
  const userId = request.headers.get("x-user-id");
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP-based identification
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";

  return `ip:${ip}`;
}

/**
 * Create rate limit headers for the response
 */
export function createRateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers();
  headers.set("X-RateLimit-Limit", result.limit.toString());
  headers.set("X-RateLimit-Remaining", result.remaining.toString());
  headers.set("X-RateLimit-Reset", Math.floor(result.resetAt.getTime() / 1000).toString());

  if (result.retryAfter) {
    headers.set("Retry-After", result.retryAfter.toString());
  }

  return headers;
}

// Default configuration: 100 requests per minute
export const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 100,
  windowSeconds: 60,
  identifier: "default",
};

// Stricter limits for certain endpoints
export const STRICT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 10,
  windowSeconds: 60,
  identifier: "strict",
};

// More lenient for read operations
export const STANDARD_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 100,
  windowSeconds: 60,
  identifier: "API",
};

// Very strict for sensitive operations
export const SENSITIVE_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowSeconds: 300, // 5 minutes
  identifier: "sensitive",
};
