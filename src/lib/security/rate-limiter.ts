/**
 * API Rate Limiting with Sliding Window Algorithm.
 */

import { NextRequest, NextResponse } from "next/server";

export interface RateLimitConfig {
  requests: number;
  windowMs: number;
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  "/api/auth/mfa/*": { requests: 5, windowMs: 60_000 },
  "/api/auth/*": { requests: 10, windowMs: 60_000 },
  "/api/substrate/*": { requests: 20, windowMs: 60_000 },
  "/api/ai/*": { requests: 20, windowMs: 60_000 },
  "/api/*": { requests: 60, windowMs: 60_000 },
};

interface RequestRecord {
  timestamps: number[];
}

const requestStore = new Map<string, RequestRecord>();
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanupExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  const maxAge = Math.max(...Object.values(RATE_LIMITS).map((r) => r.windowMs));
  for (const [key, record] of requestStore.entries()) {
    record.timestamps = record.timestamps.filter((t) => now - t < maxAge);
    if (record.timestamps.length === 0) requestStore.delete(key);
  }
}

function findRateLimitConfig(path: string): RateLimitConfig | null {
  const patterns = Object.keys(RATE_LIMITS).sort((a, b) => b.split("/").length - a.split("/").length);
  for (const pattern of patterns) {
    if (matchPattern(pattern, path)) return RATE_LIMITS[pattern];
  }
  return null;
}

function matchPattern(pattern: string, path: string): boolean {
  const regexStr = pattern.replace(/\*/g, "[^/]+").replace(/\[^\/\]\+\[^\/\]\+/g, ".*");
  return new RegExp(`^${regexStr}$`).test(path);
}

function getRateLimitKey(ip: string | null, userId: string | null, pattern: string): string {
  return [ip || "unknown", userId || "anonymous", pattern].join(":");
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAfterSeconds: number;
  limit: number;
}

export function checkRateLimit(ip: string | null, userId: string | null, path: string): RateLimitResult {
  cleanupExpiredEntries();
  const config = findRateLimitConfig(path);
  if (!config) return { allowed: true, remaining: -1, resetAfterSeconds: 0, limit: -1 };

  const now = Date.now();
  const key = getRateLimitKey(ip, userId, path);
  let record = requestStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    requestStore.set(key, record);
  }

  const windowStart = now - config.windowMs;
  record.timestamps = record.timestamps.filter((t) => t > windowStart);
  const remaining = Math.max(0, config.requests - record.timestamps.length);
  const allowed = record.timestamps.length < config.requests;

  let resetAfterSeconds = 0;
  if (!allowed && record.timestamps.length > 0) {
    const oldestInWindow = Math.min(...record.timestamps);
    resetAfterSeconds = Math.ceil((oldestInWindow + config.windowMs - now) / 1000);
  }

  if (allowed) record.timestamps.push(now);

  return { allowed, remaining: allowed ? remaining - 1 : 0, resetAfterSeconds, limit: config.requests };
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {};
  if (result.limit > 0) {
    headers["X-RateLimit-Limit"] = result.limit.toString();
    headers["X-RateLimit-Remaining"] = result.remaining.toString();
  }
  if (!result.allowed) headers["Retry-After"] = result.resetAfterSeconds.toString();
  return headers;
}

export function createRateLimitResponse(result: RateLimitResult): NextResponse {
  return new NextResponse(
    JSON.stringify({
      error: "Too Many Requests",
      message: `Rate limit exceeded. Please try again in ${result.resetAfterSeconds} seconds.`,
      retryAfter: result.resetAfterSeconds,
    }),
    { status: 429, headers: { "Content-Type": "application/json", ...getRateLimitHeaders(result) } }
  );
}

export function getClientIP(request: NextRequest): string | null {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    null;
}

export function rateLimitMiddleware(request: NextRequest, userId?: string | null): NextResponse | null {
  const ip = getClientIP(request);
  const path = new URL(request.url).pathname;
  const result = checkRateLimit(ip, userId || null, path);
  if (!result.allowed) {
    console.warn("[Rate Limit] Blocked:", { ip, userId, path });
    return createRateLimitResponse(result);
  }
  return null;
}

export function getRateLimitStats(): { totalKeys: number; totalRequests: number } {
  let totalRequests = 0;
  for (const record of requestStore.values()) totalRequests += record.timestamps.length;
  return { totalKeys: requestStore.size, totalRequests };
}

export function clearRateLimits(): void {
  requestStore.clear();
}
