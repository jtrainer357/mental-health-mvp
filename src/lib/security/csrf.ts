/**
 * CSRF (Cross-Site Request Forgery) Protection.
 */

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

const CSRF_TOKEN_LENGTH = 32;
const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_COOKIE_NAME = "csrf-token";

/**
 * Generate a cryptographically secure CSRF token.
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
}

/**
 * Hash a CSRF token for comparison.
 */
export function hashCSRFToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Validate CSRF token from request.
 */
export function validateCSRFToken(request: NextRequest): boolean {
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;

  if (!headerToken || !cookieToken) {
    return false;
  }

  // Use timing-safe comparison
  const headerHash = hashCSRFToken(headerToken);
  const cookieHash = hashCSRFToken(cookieToken);

  try {
    return crypto.timingSafeEqual(
      Buffer.from(headerHash),
      Buffer.from(cookieHash)
    );
  } catch {
    return false;
  }
}

/**
 * Check if the request method requires CSRF protection.
 */
export function requiresCSRFProtection(method: string): boolean {
  return ["POST", "PUT", "DELETE", "PATCH"].includes(method.toUpperCase());
}

/**
 * Check if the path is exempt from CSRF protection.
 */
export function isCSRFExempt(path: string): boolean {
  const exemptPaths = [
    "/api/auth/callback",
    "/api/auth/signin",
    "/api/auth/signout",
    "/api/webhooks/",
  ];

  return exemptPaths.some((exempt) => path.startsWith(exempt));
}

/**
 * CSRF middleware for API routes.
 */
export function csrfMiddleware(request: NextRequest): NextResponse | null {
  const method = request.method;
  const path = new URL(request.url).pathname;

  // Skip CSRF check for safe methods or exempt paths
  if (!requiresCSRFProtection(method) || isCSRFExempt(path)) {
    return null;
  }

  // Skip for non-API routes
  if (!path.startsWith("/api/")) {
    return null;
  }

  // Validate CSRF token
  if (!validateCSRFToken(request)) {
    console.warn("[CSRF] Invalid token for:", { method, path });
    return new NextResponse(
      JSON.stringify({
        error: "Forbidden",
        message: "Invalid or missing CSRF token",
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  return null;
}

/**
 * Set CSRF cookie on response.
 */
export function setCSRFCookie(response: NextResponse): NextResponse {
  const token = generateCSRFToken();

  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Client needs to read this for the header
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return response;
}

/**
 * Get CSRF token utilities for client-side use.
 */
export const csrfClient = {
  getToken(): string | null {
    if (typeof document === "undefined") return null;

    const match = document.cookie.match(new RegExp(`${CSRF_COOKIE_NAME}=([^;]+)`));
    return match ? match[1] : null;
  },

  getHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { [CSRF_HEADER_NAME]: token } : {};
  },
};
