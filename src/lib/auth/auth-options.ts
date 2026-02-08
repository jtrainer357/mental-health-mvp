/**
 * NextAuth.js configuration for multi-tenant healthcare practice management.
 * Implements secure authentication with practice-level tenant isolation.
 */

import type { NextAuthOptions, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import type { AuthUser, UserRole, AuthSession } from "./types";

// Supabase client for auth operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Hash password using Web Crypto API (compatible with Edge runtime).
 * In production, consider using bcrypt or argon2 in a Node.js context.
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Verify password against stored hash.
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const inputHash = await hashPassword(password);
  return inputHash === hash;
}

/**
 * NextAuth configuration options.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@practice.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Create Supabase client with service role for auth
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false },
        });

        // Look up user by email
        const { data: user, error: userError } = await supabase
          .from("users")
          .select(
            `
            id,
            email,
            password_hash,
            name,
            avatar_url,
            mfa_enabled,
            timezone,
            last_login_at,
            is_active
          `
          )
          .eq("email", credentials.email.toLowerCase())
          .single();

        if (userError || !user) {
          throw new Error("Invalid email or password");
        }

        if (!user.is_active) {
          throw new Error("Account is deactivated");
        }

        // Verify password
        const isValidPassword = await verifyPassword(credentials.password, user.password_hash);
        if (!isValidPassword) {
          throw new Error("Invalid email or password");
        }

        // Get user's practice membership (for now, get the first active one)
        const { data: membership, error: membershipError } = await supabase
          .from("practice_users")
          .select(
            `
            role,
            is_active,
            practice:practices (
              id,
              name
            )
          `
          )
          .eq("user_id", user.id)
          .eq("is_active", true)
          .limit(1)
          .single();

        if (membershipError || !membership) {
          throw new Error("No active practice membership found");
        }

        // Type guard for practice data - Supabase returns relations as arrays
        const practiceData = membership.practice as
          | { id: string; name: string }[]
          | { id: string; name: string }
          | null;
        const practice = Array.isArray(practiceData) ? practiceData[0] : practiceData;
        if (!practice) {
          throw new Error("Practice not found");
        }

        // Update last login timestamp
        await supabase
          .from("users")
          .update({ last_login_at: new Date().toISOString() })
          .eq("id", user.id);

        // Return user object for JWT
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: membership.role as UserRole,
          practiceId: practice.id,
          practiceName: practice.name,
          avatarUrl: user.avatar_url,
          mfaEnabled: user.mfa_enabled || false,
          timezone: user.timezone,
        } as User & AuthUser;
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours for healthcare compliance
  },

  jwt: {
    maxAge: 8 * 60 * 60, // 8 hours
  },

  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },

  callbacks: {
    /**
     * JWT callback - add custom claims to the token.
     * Called when JWT is created or updated.
     */
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        // Initial sign in - add user data to token
        const authUser = user as User & AuthUser;
        token.sub = authUser.id;
        token.email = authUser.email;
        token.name = authUser.name;
        token.role = authUser.role;
        token.practiceId = authUser.practiceId;
        token.practiceName = authUser.practiceName;
        token.mfaEnabled = authUser.mfaEnabled;
        token.avatarUrl = authUser.avatarUrl;
        token.timezone = authUser.timezone;
      }
      return token;
    },

    /**
     * Session callback - expose custom claims to the client.
     * Called whenever a session is checked.
     */
    async session({ session, token }): Promise<AuthSession> {
      return {
        user: {
          id: token.sub as string,
          email: token.email as string,
          name: token.name as string,
          role: token.role as UserRole,
          practiceId: token.practiceId as string,
          practiceName: token.practiceName as string,
          mfaEnabled: token.mfaEnabled as boolean,
          avatarUrl: token.avatarUrl as string | undefined,
          timezone: token.timezone as string | undefined,
        },
        expires: session.expires,
      };
    },

    /**
     * Redirect callback - control post-auth redirects.
     */
    async redirect({ url, baseUrl }) {
      // Allow relative URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Allow same-origin URLs
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Default to home page
      return baseUrl;
    },
  },

  events: {
    /**
     * Log sign in events for security audit.
     */
    async signIn({ user }) {
      console.info("[Auth] User signed in:", {
        userId: user.id,
        email: user.email,
        timestamp: new Date().toISOString(),
      });
    },

    /**
     * Log sign out events for security audit.
     */
    async signOut({ token }) {
      console.info("[Auth] User signed out:", {
        userId: token?.sub,
        timestamp: new Date().toISOString(),
      });
    },
  },

  debug: process.env.NODE_ENV === "development",
};

// Type augmentation for NextAuth
declare module "next-auth" {
  interface User extends AuthUser {}
  interface Session extends AuthSession {}
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    practiceId: string;
    practiceName: string;
    mfaEnabled: boolean;
    avatarUrl?: string;
    timezone?: string;
  }
}
