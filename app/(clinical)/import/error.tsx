"use client";

import { useEffect } from "react";
import { ErrorFallback } from "@/src/components/error";
import { logger } from "@/src/lib/logger";

export default function ImportError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Import page error", error, {
      module: "ImportErrorPage",
      action: "render",
      digest: error.digest,
    });
  }, [error]);

  return (
    <ErrorFallback
      error={error}
      resetError={reset}
      section="Import Wizard"
      digest={error.digest}
      className="min-h-screen bg-gray-50"
    />
  );
}
