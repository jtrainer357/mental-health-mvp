"use client";

import { useCallback } from "react";
import { useToast } from "./useToast";
import { logger } from "@/src/lib/logger";

/**
 * Error severity levels
 */
export type ErrorSeverity = "low" | "medium" | "high" | "critical";

/**
 * Options for error handling
 */
export interface ErrorHandlerOptions {
  /** Context about where the error occurred */
  context?: string;
  /** Whether to show a toast notification */
  showToast?: boolean;
  /** Whether to log the error */
  logError?: boolean;
  /** Error severity for categorization */
  severity?: ErrorSeverity;
  /** Additional metadata for logging */
  metadata?: Record<string, unknown>;
  /** Custom user-facing message (overrides default) */
  userMessage?: string;
  /** Whether to rethrow the error after handling */
  rethrow?: boolean;
}

/**
 * Default user-friendly messages for common error types
 */
const DEFAULT_ERROR_MESSAGES: Record<string, string> = {
  NetworkError: "Unable to connect. Please check your internet connection.",
  TimeoutError: "The request took too long. Please try again.",
  AuthenticationError: "Your session has expired. Please log in again.",
  PermissionError: "You don't have permission to perform this action.",
  ValidationError: "Please check your input and try again.",
  NotFoundError: "The requested resource was not found.",
  ServerError: "Something went wrong on our end. Please try again later.",
  default: "An unexpected error occurred. Please try again.",
};

/**
 * Get a user-friendly message for an error
 */
function getUserFriendlyMessage(error: Error): string {
  // Check for specific error types
  const specificMessage = DEFAULT_ERROR_MESSAGES[error.name];
  if (specificMessage) {
    return specificMessage;
  }

  const defaultMessage = "An unexpected error occurred. Please try again.";

  // Check for common error patterns
  if (error.message.includes("network") || error.message.includes("fetch")) {
    return DEFAULT_ERROR_MESSAGES.NetworkError ?? defaultMessage;
  }

  if (error.message.includes("timeout")) {
    return DEFAULT_ERROR_MESSAGES.TimeoutError ?? defaultMessage;
  }

  if (error.message.includes("401") || error.message.includes("unauthorized")) {
    return DEFAULT_ERROR_MESSAGES.AuthenticationError ?? defaultMessage;
  }

  if (error.message.includes("403") || error.message.includes("forbidden")) {
    return DEFAULT_ERROR_MESSAGES.PermissionError ?? defaultMessage;
  }

  if (error.message.includes("404") || error.message.includes("not found")) {
    return DEFAULT_ERROR_MESSAGES.NotFoundError ?? defaultMessage;
  }

  if (error.message.includes("500") || error.message.includes("server error")) {
    return DEFAULT_ERROR_MESSAGES.ServerError ?? defaultMessage;
  }

  return DEFAULT_ERROR_MESSAGES.default ?? defaultMessage;
}

/**
 * Centralized error handler hook
 * Provides consistent error handling across the application
 *
 * @example
 * const { handleError, handleAsyncError } = useErrorHandler();
 *
 * // Synchronous error handling
 * try {
 *   riskyOperation();
 * } catch (err) {
 *   handleError(err, { context: 'patient-search' });
 * }
 *
 * // Async wrapper
 * const result = await handleAsyncError(
 *   () => fetchPatient(id),
 *   { context: 'fetch-patient', showToast: true }
 * );
 */
export function useErrorHandler() {
  const { error: showError, warning: showWarning } = useToast();

  /**
   * Handle an error with logging and optional toast notification
   */
  const handleError = useCallback(
    (error: Error | unknown, options: ErrorHandlerOptions = {}): void => {
      const {
        context = "unknown",
        showToast = true,
        logError = true,
        severity = "medium",
        metadata = {},
        userMessage,
        rethrow = false,
      } = options;

      // Normalize error
      const normalizedError = error instanceof Error ? error : new Error(String(error));

      // Log the error
      if (logError) {
        const errorContext = {
          module: "ErrorHandler",
          action: context,
          severity,
          ...metadata,
        };

        if (severity === "critical" || severity === "high") {
          logger.error(`Error in ${context}: ${normalizedError.message}`, normalizedError, errorContext);
        } else {
          logger.warn(`Error in ${context}: ${normalizedError.message}`, errorContext);
        }
      }

      // Show toast notification
      if (showToast) {
        const message = userMessage || getUserFriendlyMessage(normalizedError);
        const errorDetails =
          process.env.NODE_ENV === "development" ? normalizedError.message : undefined;

        if (severity === "critical" || severity === "high") {
          showError(message, errorDetails);
        } else {
          showWarning(message);
        }
      }

      // Optionally rethrow
      if (rethrow) {
        throw normalizedError;
      }
    },
    [showError, showWarning]
  );

  /**
   * Wrapper for async operations with automatic error handling
   */
  const handleAsyncError = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options: ErrorHandlerOptions = {}
    ): Promise<T | null> => {
      try {
        return await operation();
      } catch (error) {
        handleError(error, options);
        return null;
      }
    },
    [handleError]
  );

  /**
   * Create an error handler bound to a specific context
   */
  const createContextHandler = useCallback(
    (context: string, defaultOptions: Omit<ErrorHandlerOptions, "context"> = {}) => {
      return (error: Error | unknown, options: Omit<ErrorHandlerOptions, "context"> = {}) => {
        handleError(error, { context, ...defaultOptions, ...options });
      };
    },
    [handleError]
  );

  return {
    handleError,
    handleAsyncError,
    createContextHandler,
    /** Default error messages for reference */
    errorMessages: DEFAULT_ERROR_MESSAGES,
  };
}
