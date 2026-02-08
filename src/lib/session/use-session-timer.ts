/**
 * Session Timer Hook
 * Provides accurate timing for clinical sessions
 * @module session/use-session-timer
 */

import { useState, useCallback, useRef, useEffect } from "react";

interface UseSessionTimerReturn {
  /** Whether the timer is currently running */
  isRunning: boolean;
  /** Whether the timer is paused */
  isPaused: boolean;
  /** Total elapsed seconds */
  elapsedSeconds: number;
  /** Elapsed minutes (for CPT code calculation) */
  elapsedMinutes: number;
  /** Formatted time string (HH:MM:SS) */
  formattedTime: string;
  /** Start the timer */
  start: () => void;
  /** Stop the timer completely */
  stop: () => void;
  /** Pause the timer (can resume) */
  pause: () => void;
  /** Resume a paused timer */
  resume: () => void;
  /** Reset the timer to zero */
  reset: () => void;
  /** Set the elapsed time manually (for resuming drafts) */
  setElapsedTime: (seconds: number) => void;
}

/**
 * Format seconds into HH:MM:SS string
 */
function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Hook for managing session timing
 */
export function useSessionTimer(
  initialSeconds: number = 0
): UseSessionTimerReturn {
  const [elapsedSeconds, setElapsedSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const accumulatedRef = useRef<number>(initialSeconds);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const start = useCallback(() => {
    if (isRunning) return;

    startTimeRef.current = Date.now();
    accumulatedRef.current = elapsedSeconds;
    setIsRunning(true);
    setIsPaused(false);

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - (startTimeRef.current || now)) / 1000);
      setElapsedSeconds(accumulatedRef.current + elapsed);
    }, 1000);
  }, [isRunning, elapsedSeconds]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    if (!isRunning || isPaused) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Save accumulated time
    accumulatedRef.current = elapsedSeconds;
    setIsPaused(true);
  }, [isRunning, isPaused, elapsedSeconds]);

  const resume = useCallback(() => {
    if (!isPaused) return;

    startTimeRef.current = Date.now();
    setIsPaused(false);

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - (startTimeRef.current || now)) / 1000);
      setElapsedSeconds(accumulatedRef.current + elapsed);
    }, 1000);
  }, [isPaused]);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setElapsedSeconds(0);
    setIsRunning(false);
    setIsPaused(false);
    startTimeRef.current = null;
    accumulatedRef.current = 0;
  }, []);

  const setElapsedTime = useCallback((seconds: number) => {
    setElapsedSeconds(seconds);
    accumulatedRef.current = seconds;
  }, []);

  return {
    isRunning,
    isPaused,
    elapsedSeconds,
    elapsedMinutes: Math.floor(elapsedSeconds / 60),
    formattedTime: formatTime(elapsedSeconds),
    start,
    stop,
    pause,
    resume,
    reset,
    setElapsedTime,
  };
}

export default useSessionTimer;
