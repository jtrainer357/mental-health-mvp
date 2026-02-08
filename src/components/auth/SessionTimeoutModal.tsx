"use client";

import * as React from "react";
import { signOut } from "next-auth/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/design-system/components/ui/alert-dialog";

/**
 * HIPAA-Compliant Session Timeout Configuration
 *
 * Per HIPAA Security Rule (45 CFR 164.312(a)(2)(iii)), automatic logoff must be implemented
 * for workstations that access electronic PHI to protect against unauthorized access.
 *
 * Industry standard for healthcare applications:
 * - Session timeout: 15 minutes of inactivity
 * - Warning before timeout: 2 minutes
 */
export const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
export const SESSION_WARNING = 2 * 60 * 1000; // 2 minutes warning before timeout

interface SessionTimeoutModalProps {
  /** Whether the user has an active session */
  isAuthenticated: boolean;
  /** Callback when session is extended */
  onExtend?: () => void;
}

/**
 * HIPAA-compliant session timeout modal with countdown.
 *
 * Tracks user activity (mouse, keyboard, touch, scroll, click) and shows
 * a warning modal 2 minutes before the 15-minute session timeout.
 *
 * User can extend their session or log out from the modal.
 */
export function SessionTimeoutModal({ isAuthenticated, onExtend }: SessionTimeoutModalProps) {
  const [showWarning, setShowWarning] = React.useState(false);
  const [countdown, setCountdown] = React.useState(SESSION_WARNING / 1000);

  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = React.useRef<number>(Date.now());

  // Reset activity timer
  const resetActivityTimer = React.useCallback(() => {
    lastActivityRef.current = Date.now();

    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    // Hide warning if shown
    setShowWarning(false);
    setCountdown(SESSION_WARNING / 1000);

    if (!isAuthenticated) return;

    // Set warning timeout (fires 2 minutes before session expires)
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(SESSION_WARNING / 1000);

      // Start countdown
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Time's up - log out
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, SESSION_TIMEOUT - SESSION_WARNING);

    // Set absolute timeout (session expires)
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, SESSION_TIMEOUT);
  }, [isAuthenticated]);

  // Handle logout
  const handleLogout = React.useCallback(() => {
    // Clear all timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    setShowWarning(false);
    signOut({ callbackUrl: "/login?reason=timeout" });
  }, []);

  // Handle session extension
  const handleExtend = React.useCallback(() => {
    resetActivityTimer();
    onExtend?.();
  }, [resetActivityTimer, onExtend]);

  // Set up activity listeners
  React.useEffect(() => {
    if (!isAuthenticated) return;

    const activityEvents = ["mousedown", "mousemove", "keydown", "touchstart", "scroll", "click"];

    const handleActivity = () => {
      // Debounce activity tracking to prevent excessive resets
      const now = Date.now();
      if (now - lastActivityRef.current > 1000) {
        resetActivityTimer();
      }
    };

    // Add event listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initialize timer
    resetActivityTimer();

    // Cleanup
    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isAuthenticated, resetActivityTimer]);

  // Format countdown for display
  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isAuthenticated) return null;

  return (
    <AlertDialog open={showWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Session Expiring Soon</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                For your security, your session will expire in{" "}
                <span className="font-mono font-bold text-destructive">
                  {formatCountdown(countdown)}
                </span>{" "}
                due to inactivity.
              </p>
              <p className="text-sm text-muted-foreground">
                This helps protect patient information in compliance with HIPAA security
                requirements.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleLogout}>Log Out Now</AlertDialogCancel>
          <AlertDialogAction onClick={handleExtend}>Stay Signed In</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
