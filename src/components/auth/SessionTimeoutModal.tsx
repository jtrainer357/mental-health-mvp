"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/design-system/components/ui/dialog";
import { Button } from "@/design-system/components/ui/button";
import { AlertTriangle, Clock } from "lucide-react";

// HIPAA Compliant Session Timeout Configuration
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes (HIPAA recommended maximum)
const SESSION_WARNING = 2 * 60 * 1000; // 2 minutes before timeout (show warning)

// Activity events to track for session extension
const ACTIVITY_EVENTS = [
  "mousedown",
  "mousemove",
  "keydown",
  "touchstart",
  "scroll",
  "click",
] as const;

export function SessionTimeoutModal() {
  const { status } = useSession();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(SESSION_WARNING / 1000);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const handleLogout = useCallback(async () => {
    clearAllTimers();
    setShowWarning(false);
    await signOut({ callbackUrl: "/login?error=SessionRequired" });
  }, [clearAllTimers]);

  const resetTimers = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);
    setCountdown(SESSION_WARNING / 1000);

    // Set warning timer
    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(SESSION_WARNING / 1000);

      // Start countdown
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, SESSION_TIMEOUT - SESSION_WARNING);

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, SESSION_TIMEOUT);
  }, [clearAllTimers, handleLogout]);

  const handleContinueSession = useCallback(() => {
    resetTimers();
  }, [resetTimers]);

  // Set up activity listeners
  useEffect(() => {
    if (status !== "authenticated") return;

    const handleActivity = () => {
      if (!showWarning) {
        resetTimers();
      }
    };

    // Throttle activity events to prevent excessive timer resets
    let throttleTimeout: NodeJS.Timeout | null = null;
    const throttledActivity = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          handleActivity();
          throttleTimeout = null;
        }, 1000);
      }
    };

    // Initialize timers
    resetTimers();

    // Add event listeners
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, throttledActivity, { passive: true });
    });

    return () => {
      clearAllTimers();
      if (throttleTimeout) clearTimeout(throttleTimeout);
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, throttledActivity);
      });
    };
  }, [status, showWarning, resetTimers, clearAllTimers]);

  // Don't render if not authenticated
  if (status !== "authenticated") return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={showWarning} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="bg-warning/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <AlertTriangle className="text-warning h-6 w-6" />
          </div>
          <DialogTitle className="text-center">Session Timeout Warning</DialogTitle>
          <DialogDescription className="text-center">
            Your session is about to expire due to inactivity. For security and HIPAA compliance,
            you will be automatically logged out.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="bg-muted flex items-center gap-2 rounded-lg px-4 py-3">
            <Clock className="text-muted-foreground h-5 w-5" />
            <span className="text-2xl font-bold tabular-nums">{formatTime(countdown)}</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Click &quot;Continue Session&quot; to stay logged in
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
            Log Out Now
          </Button>
          <Button onClick={handleContinueSession} className="w-full sm:w-auto">
            Continue Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
