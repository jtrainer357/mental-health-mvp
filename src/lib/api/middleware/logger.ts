/**
 * Request logging middleware for API routes.
 * Provides structured logging with request timing.
 */

import { NextRequest, NextResponse } from "next/server";

export interface RequestTimer {
  startTime: number;
  requestId: string;
}

export interface LogEntry {
  timestamp: string;
  requestId: string;
  method: string;
  path: string;
  query?: Record<string, string>;
  duration?: number;
  status?: number;
  userAgent?: string;
  ip?: string;
  error?: string;
}

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Get client IP from request headers
 */
function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
}

/**
 * Log the incoming request
 */
export function logRequest(request: NextRequest, requestId: string): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    requestId,
    method: request.method,
    path: request.nextUrl.pathname,
    userAgent: request.headers.get("user-agent") || undefined,
    ip: getClientIp(request),
  };

  // Add query params if present
  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  if (Object.keys(searchParams).length > 0) {
    // Redact sensitive query parameters
    const redactedParams = { ...searchParams };
    const sensitiveKeys = ["password", "token", "key", "secret", "auth"];
    for (const key of Object.keys(redactedParams)) {
      if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
        redactedParams[key] = "[REDACTED]";
      }
    }
    entry.query = redactedParams;
  }

  // In production, use a proper logging service
  console.log(JSON.stringify({ type: "request", ...entry }));
}

/**
 * Log the response
 */
export function logResponse(
  request: NextRequest,
  response: NextResponse,
  requestId: string,
  duration: number
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    requestId,
    method: request.method,
    path: request.nextUrl.pathname,
    status: response.status,
    duration,
  };

  // Log at different levels based on status
  const logLevel =
    response.status >= 500
      ? "error"
      : response.status >= 400
        ? "warn"
        : "info";

  console.log(JSON.stringify({ type: "response", level: logLevel, ...entry }));
}

/**
 * Log an error that occurred during request processing
 */
export function logError(
  request: NextRequest,
  error: Error,
  requestId: string,
  duration: number
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    requestId,
    method: request.method,
    path: request.nextUrl.pathname,
    duration,
    error: error.message,
  };

  console.error(
    JSON.stringify({
      type: "error",
      level: "error",
      ...entry,
      stack: error.stack,
    })
  );
}

/**
 * Create a timer for tracking request duration
 */
export function createTimer(): RequestTimer {
  return {
    startTime: performance.now(),
    requestId: generateRequestId(),
  };
}

/**
 * Stop the timer and return duration in milliseconds
 */
export function stopTimer(timer: RequestTimer): number {
  return Math.round(performance.now() - timer.startTime);
}

/**
 * Create a wrapped handler with automatic logging
 */
export function withLogging<T extends NextResponse>(
  handler: (request: NextRequest, context: { requestId: string }) => Promise<T>
): (request: NextRequest) => Promise<T | NextResponse> {
  return async (request: NextRequest) => {
    const timer = createTimer();
    logRequest(request, timer.requestId);

    try {
      const response = await handler(request, { requestId: timer.requestId });
      const duration = stopTimer(timer);
      logResponse(request, response, timer.requestId, duration);

      // Add request ID to response headers
      response.headers.set("X-Request-ID", timer.requestId);

      return response;
    } catch (error) {
      const duration = stopTimer(timer);
      logError(request, error as Error, timer.requestId, duration);
      throw error;
    }
  };
}
