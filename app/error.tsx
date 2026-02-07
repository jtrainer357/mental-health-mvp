"use client";

import { useEffect } from "react";
import { ErrorFallback } from "@/src/components/error";
import { logger } from "@/src/lib/logger";

/**
 * Next.js root error page
 * Catches errors at the application root level
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error with structured logging
    logger.error("Application error caught by error.tsx", error, {
      module: "RootErrorPage",
      action: "render",
      digest: error.digest,
    });
  }, [error]);

  return (
    <ErrorFallback
      error={error}
      resetError={reset}
      digest={error.digest}
      showHomeLink={true}
      showReportLink={true}
      className="min-h-screen"
    />
  );
}
