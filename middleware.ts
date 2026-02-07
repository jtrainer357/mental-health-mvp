/**
 * NextAuth Middleware
 * Protects routes with session-based authentication
 *
 * Set DEMO_MODE=true in environment to disable authentication (for hackathon demo)
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Check if running in demo mode (bypasses auth)
 */
const DEMO_MODE = process.env.DEMO_MODE === "true";

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/api/auth",
];

/**
 * Check if the path is a public route
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Check if the path is a static asset or API route that should bypass auth
 */
function shouldBypassAuth(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".") || // Static files
    pathname === "/favicon.ico" ||
    pathname === "/health"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Demo mode: allow all routes without authentication
  if (DEMO_MODE) {
    return NextResponse.next();
  }

  // Skip auth for static files, NextAuth routes, and health checks
  if (shouldBypassAuth(pathname)) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check for NextAuth session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token exists - verify it has required claims
  if (!token.practiceId) {
    // Token exists but missing practice context - force re-login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "session_expired");
    return NextResponse.redirect(loginUrl);
  }

  // Add practice context to response headers for downstream use
  const response = NextResponse.next();

  // Set custom headers for practice context (readable by API routes)
  response.headers.set("x-practice-id", token.practiceId as string);
  response.headers.set("x-user-id", token.id as string);
  response.headers.set("x-user-role", token.role as string);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
