/**
 * CSRF (Cross-Site Request Forgery) Protection.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const CSRF_COOKIE_NAME = "__Host-csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_TOKEN_LENGTH = 32;
const PROTECTED_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const CSRF_EXEMPT_ROUTES = ["/api/auth/callback/", "/api/webhooks/"];

function generateToken(): string {
  const array = new Uint8Array(CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function generateCSRFToken(): Promise<string> {
  const token = generateToken();
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return token;
}

export async function getCSRFToken(): Promise<string> {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  return existingToken || generateCSRFToken();
}

export async function validateCSRFToken(request: NextRequest): Promise<boolean> {
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  if (!headerToken || !cookieToken) return false;
  const [headerHash, cookieHash] = await Promise.all([hashToken(headerToken), hashToken(cookieToken)]);
  return headerHash === cookieHash;
}

function isExemptRoute(pathname: string): boolean {
  return CSRF_EXEMPT_ROUTES.some((route) => pathname.startsWith(route));
}

export async function csrfMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const { method, url } = request;
  const pathname = new URL(url).pathname;
  if (!PROTECTED_METHODS.has(method) || isExemptRoute(pathname) || !pathname.startsWith("/api/")) return null;
  const isValid = await validateCSRFToken(request);
  if (!isValid) {
    console.warn("[CSRF] Invalid token:", { method, pathname });
    return new NextResponse(
      JSON.stringify({ error: "CSRF token validation failed", message: "Please refresh the page and try again" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  return null;
}

export async function getCSRFTokenForClient(): Promise<{ token: string }> {
  const token = await getCSRFToken();
  return { token };
}

export async function handleCSRFTokenRequest(): Promise<NextResponse> {
  const token = await getCSRFToken();
  return NextResponse.json({ token }, { headers: { "Cache-Control": "no-store" } });
}

export function withCSRFToken(token: string, init?: RequestInit): RequestInit {
  return { ...init, headers: { ...init?.headers, [CSRF_HEADER_NAME]: token } };
}
