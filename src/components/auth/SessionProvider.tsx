"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { SessionTimeoutModal } from "./SessionTimeoutModal";

interface SessionProviderProps {
  children: React.ReactNode;
}

/**
 * SessionProvider wraps the NextAuth SessionProvider and includes
 * the HIPAA-compliant session timeout modal.
 *
 * This component should wrap the entire application to:
 * 1. Provide session context to all components
 * 2. Enable automatic session timeout after 15 minutes of inactivity
 * 3. Show a 2-minute warning before automatic logout
 */
export function SessionProvider({ children }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider>
      {children}
      <SessionTimeoutModal />
    </NextAuthSessionProvider>
  );
}
