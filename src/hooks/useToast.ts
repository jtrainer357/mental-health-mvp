"use client";

import { useCallback } from "react";
import {
  toast as baseToast,
  useToast as useBaseToast,
} from "@/design-system/components/ui/use-toast";
import type { ToastActionElement } from "@/design-system/components/ui/toast";

/**
 * Toast duration constants (in milliseconds)
 */
const TOAST_DURATION = {
  default: 5000,
  error: 8000,
  success: 4000,
  warning: 6000,
  info: 5000,
} as const;

/**
 * Toast type for styling variants
 */
export type ToastType = "default" | "success" | "error" | "warning" | "info";

/**
 * Options for toast messages
 */
export interface ToastOptions {
  /** Toast title */
  title?: string;
  /** Optional action element */
  action?: ToastActionElement;
  /** Custom duration in ms (overrides defaults) */
  duration?: number;
}

/**
 * Options for promise toast
 */
export interface PromiseToastOptions<T> {
  /** Message to show while loading */
  loading: string;
  /** Message or function to generate message on success */
  success: string | ((data: T) => string);
  /** Message or function to generate message on error */
  error: string | ((error: Error) => string);
}

/**
 * Show a success toast
 */
function success(message: string, options?: ToastOptions) {
  return baseToast({
    title: options?.title || "Success",
    description: message,
    variant: "default",
    action: options?.action,
    className: "border-l-4 border-l-success bg-success/5",
    duration: options?.duration ?? TOAST_DURATION.success,
  });
}

/**
 * Show an error toast
 */
function error(message: string, details?: string, options?: Omit<ToastOptions, "title">) {
  return baseToast({
    title: "Error",
    description: details ? `${message}\n${details}` : message,
    variant: "destructive",
    action: options?.action,
    duration: options?.duration ?? TOAST_DURATION.error,
  });
}

/**
 * Show a warning toast
 */
function warning(message: string, options?: ToastOptions) {
  return baseToast({
    title: options?.title || "Warning",
    description: message,
    variant: "default",
    action: options?.action,
    className: "border-l-4 border-l-warning bg-warning/5",
    duration: options?.duration ?? TOAST_DURATION.warning,
  });
}

/**
 * Show an info toast
 */
function info(message: string, options?: ToastOptions) {
  return baseToast({
    title: options?.title || "Info",
    description: message,
    variant: "default",
    action: options?.action,
    className: "border-l-4 border-l-teal bg-teal/5",
    duration: options?.duration ?? TOAST_DURATION.info,
  });
}

/**
 * Show a toast for a promise - displays loading, then success/error
 */
async function promise<T>(
  promiseOrFn: Promise<T> | (() => Promise<T>),
  options: PromiseToastOptions<T>
): Promise<T> {
  const actualPromise = typeof promiseOrFn === "function" ? promiseOrFn() : promiseOrFn;

  // Show loading toast
  const toastRef = baseToast({
    title: "Loading...",
    description: options.loading,
    variant: "default",
    className: "border-l-4 border-l-muted",
  });

  try {
    const result = await actualPromise;

    // Update to success
    const successMessage =
      typeof options.success === "function" ? options.success(result) : options.success;

    toastRef.update({
      id: toastRef.id,
      title: "Success",
      description: successMessage,
      variant: "default",
      className: "border-l-4 border-l-success bg-success/5",
    });

    // Auto-dismiss after success duration
    setTimeout(() => toastRef.dismiss(), TOAST_DURATION.success);

    return result;
  } catch (err) {
    // Update to error
    const errorMessage =
      typeof options.error === "function"
        ? options.error(err instanceof Error ? err : new Error(String(err)))
        : options.error;

    toastRef.update({
      id: toastRef.id,
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });

    // Auto-dismiss after error duration
    setTimeout(() => toastRef.dismiss(), TOAST_DURATION.error);

    throw err;
  }
}

/**
 * Enhanced toast object with typed methods
 */
export const toast = {
  success,
  error,
  warning,
  info,
  promise,
  /** Base toast for custom usage */
  custom: baseToast,
};

/**
 * Enhanced useToast hook with convenience methods
 * Provides success, error, warning, info, and promise toast functions
 */
export function useToast() {
  const baseHook = useBaseToast();

  const showSuccess = useCallback(
    (message: string, options?: ToastOptions) => success(message, options),
    []
  );

  const showError = useCallback(
    (message: string, details?: string, options?: Omit<ToastOptions, "title">) =>
      error(message, details, options),
    []
  );

  const showWarning = useCallback(
    (message: string, options?: ToastOptions) => warning(message, options),
    []
  );

  const showInfo = useCallback(
    (message: string, options?: ToastOptions) => info(message, options),
    []
  );

  const showPromise = useCallback(
    <T>(promiseOrFn: Promise<T> | (() => Promise<T>), options: PromiseToastOptions<T>) =>
      promise(promiseOrFn, options),
    []
  );

  return {
    ...baseHook,
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
    promise: showPromise,
  };
}
