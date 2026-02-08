/**
 * NextAuth.js API Route Handler
 *
 * This route handles all authentication endpoints:
 * - GET /api/auth/signin - Sign in page
 * - POST /api/auth/signin/credentials - Handle credentials sign in
 * - GET /api/auth/signout - Sign out page
 * - POST /api/auth/signout - Handle sign out
 * - GET /api/auth/session - Get current session
 * - GET /api/auth/csrf - Get CSRF token
 * - GET /api/auth/providers - Get available providers
 */

import NextAuth from "next-auth";
import { authOptions } from "@/src/lib/auth/auth-options";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
