/**
 * Auto-Save Hook for Clinical Documentation
 * Provides automatic saving with debouncing and status tracking
 * @module session/use-auto-save
 */

import { useState, useCallback, useRef, useEffect } from "react";

export type AutoSaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

interface UseAutoSaveOptions<T> {
  /** Data to save */
  data: T;
  /** Function to perform the save */
  onSave: (data: T) => Promise<void>;
  /** Interval in milliseconds between saves (default: 30000) */
  interval?: number;
  /** Debounce delay in milliseconds (default: 2000) */
  debounceDelay?: number;
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  /** Current save status */
  status: AutoSaveStatus;
  /** Last successful save timestamp */
  lastSavedAt: Date | null;
  /** Error message if save failed */
  error: string | null;
  /** Manually trigger a save */
  saveNow: () => Promise<void>;
  /** Mark data as changed (triggers pending status) */
  markChanged: () => void;
  /** Reset the auto-save state */
  reset: () => void;
}

/**
 * Hook for auto-saving clinical documentation
 */
export function useAutoSave<T>({
  data,
  onSave,
  interval = 30000,
  debounceDelay = 2000,
  enabled = true,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dataRef = useRef<T>(data);
  const hasChangesRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  // Update data ref when data changes
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Perform the actual save
  const performSave = useCallback(async () => {
    if (isSavingRef.current || !hasChangesRef.current) return;

    isSavingRef.current = true;
    setStatus("saving");
    setError(null);

    try {
      await onSave(dataRef.current);
      hasChangesRef.current = false;
      setLastSavedAt(new Date());
      setStatus("saved");

      // Reset to idle after a brief delay
      setTimeout(() => {
        setStatus((current) => (current === "saved" ? "idle" : current));
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setStatus("error");
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave]);

  // Mark data as changed
  const markChanged = useCallback(() => {
    if (!enabled) return;

    hasChangesRef.current = true;
    setStatus("pending");

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      performSave();
    }, debounceDelay);
  }, [enabled, debounceDelay, performSave]);

  // Manual save
  const saveNow = useCallback(async () => {
    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    hasChangesRef.current = true;
    await performSave();
  }, [performSave]);

  // Reset state
  const reset = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (intervalTimerRef.current) {
      clearInterval(intervalTimerRef.current);
      intervalTimerRef.current = null;
    }
    hasChangesRef.current = false;
    isSavingRef.current = false;
    setStatus("idle");
    setError(null);
  }, []);

  // Set up interval timer
  useEffect(() => {
    if (!enabled) return;

    intervalTimerRef.current = setInterval(() => {
      if (hasChangesRef.current && !isSavingRef.current) {
        performSave();
      }
    }, interval);

    return () => {
      if (intervalTimerRef.current) {
        clearInterval(intervalTimerRef.current);
      }
    };
  }, [enabled, interval, performSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (intervalTimerRef.current) {
        clearInterval(intervalTimerRef.current);
      }
    };
  }, []);

  // Save on unmount if there are pending changes
  useEffect(() => {
    return () => {
      if (hasChangesRef.current && !isSavingRef.current) {
        // Sync save on unmount
        onSave(dataRef.current).catch(() => {
          // Silently fail on unmount
        });
      }
    };
  }, [onSave]);

  return {
    status,
    lastSavedAt,
    error,
    saveNow,
    markChanged,
    reset,
  };
}

/**
 * Get status indicator props for UI display
 */
export function getAutoSaveStatusIndicator(status: AutoSaveStatus): {
  text: string;
  color: string;
  icon: "cloud" | "cloud-upload" | "check" | "alert-circle" | "clock";
} {
  switch (status) {
    case "idle":
      return { text: "Saved", color: "text-muted-foreground", icon: "cloud" };
    case "pending":
      return { text: "Unsaved changes", color: "text-yellow-600", icon: "clock" };
    case "saving":
      return { text: "Saving...", color: "text-blue-600", icon: "cloud-upload" };
    case "saved":
      return { text: "Saved", color: "text-green-600", icon: "check" };
    case "error":
      return { text: "Save failed", color: "text-red-600", icon: "alert-circle" };
  }
}

export default useAutoSave;
