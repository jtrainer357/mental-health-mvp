"use client";

import React, { Component, type ReactNode, type ErrorInfo } from "react";
import { ErrorFallback, type ErrorFallbackProps } from "./ErrorFallback";
import { logger } from "@/src/lib/logger";

export interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;
  /** Custom fallback component or props for default ErrorFallback */
  fallback?: ReactNode | ((props: { error: Error; resetError: () => void }) => ReactNode);
  /** Section name for logging and display */
  section?: string;
  /** Callback when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Props to pass to the default ErrorFallback */
  fallbackProps?: Partial<ErrorFallbackProps>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * React Error Boundary component
 * Catches JavaScript errors in child component tree and displays a fallback UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { section, onError } = this.props;

    // Store error info for potential display
    this.setState({ errorInfo });

    // Log the error with structured logging
    logger.error(`Error caught by ErrorBoundary${section ? ` in ${section}` : ""}`, error, {
      module: "ErrorBoundary",
      action: "componentDidCatch",
      section,
      componentStack: errorInfo.componentStack || undefined,
    });

    // Call optional error callback
    if (onError) {
      onError(error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, section, fallbackProps } = this.props;

    if (hasError && error) {
      // Custom render function fallback
      if (typeof fallback === "function") {
        return fallback({ error, resetError: this.resetError });
      }

      // Custom ReactNode fallback
      if (fallback) {
        return fallback;
      }

      // Default ErrorFallback component
      return (
        <ErrorFallback
          error={error}
          resetError={this.resetError}
          section={section}
          showHomeLink={true}
          showReportLink={false}
          {...fallbackProps}
        />
      );
    }

    return children;
  }
}

/**
 * HOC to wrap a component with ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || "Component";

  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return ComponentWithErrorBoundary;
}
