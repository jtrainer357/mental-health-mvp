"use client";

import * as React from "react";
import { SessionProvider as NextAuthSessionProvider, useSession } from "next-auth/react";
import { SessionTimeoutModal } from "./SessionTimeoutModal";

interface AuthSessionProviderProps {
  children: React.ReactNode;
}

/**
 * Inner component that uses the session hook and renders the timeout modal.
 */
function SessionTimeoutWrapper({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <>
      {children}
      <SessionTimeoutModal isAuthenticated={isAuthenticated} />
    </>
  );
}

/**
 * Session Provider that wraps NextAuth SessionProvider with HIPAA-compliant
 * session timeout monitoring.
 *
 * Usage:
 * ```tsx
 * // In your root layout
 * <SessionProvider>
 *   {children}
 * </SessionProvider>
 * ```
 */
export function SessionProvider({ children }: AuthSessionProviderProps) {
  return (
    <NextAuthSessionProvider>
      <SessionTimeoutWrapper>{children}</SessionTimeoutWrapper>
    </NextAuthSessionProvider>
  );
}
