/**
 * NextAuth Proxy for Tebra Mental Health MVP
 * Handles route protection and session refresh
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Demo password protection (set via DEMO_PASSWORD env var, defaults to "tebra2026")
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "tebra2026";
const DEMO_COOKIE_NAME = "demo_access";

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/mfa-verify",
  "/mfa-setup",
  "/terms",
  "/privacy",
  "/baa",
  "/demo-auth", // Password entry page
];

// Check if a path is a public route
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

// Add security headers to response
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  // XSS protection (legacy but still useful)
  response.headers.set("X-XSS-Protection", "1; mode=block");
  // HSTS - force HTTPS
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  // Referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // CSP for healthcare compliance
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'none';"
  );
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip proxy for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/mc") ||
    pathname.includes(".") ||
    pathname.startsWith("/fonts") ||
    pathname.startsWith("/assets")
  ) {
    return NextResponse.next();
  }

  // DEMO MODE: Simple password protection (no user auth required)
  const demoCookie = request.cookies.get(DEMO_COOKIE_NAME);
  const hasValidDemoAccess = demoCookie?.value === DEMO_PASSWORD;

  // If not authenticated for demo and not on demo-auth page, redirect to password page
  if (!hasValidDemoAccess && pathname !== "/demo-auth") {
    const url = request.nextUrl.clone();
    url.pathname = "/demo-auth";
    url.searchParams.set("callbackUrl", pathname);
    const response = NextResponse.redirect(url);
    return addSecurityHeaders(response);
  }

  // If already authenticated and trying to access demo-auth, redirect to home
  if (hasValidDemoAccess && pathname === "/demo-auth") {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    const response = NextResponse.redirect(url);
    return addSecurityHeaders(response);
  }

  /* ORIGINAL AUTH (disabled for demo):
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;
  const isPublic = isPublicRoute(pathname);

  if (!isAuthenticated && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    const response = NextResponse.redirect(url);
    return addSecurityHeaders(response);
  }

  if (isAuthenticated && isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    const response = NextResponse.redirect(url);
    return addSecurityHeaders(response);
  }
  */

  // Allow the request to proceed
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|favicon.ico|fonts|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
