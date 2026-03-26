"use client";

import { useEffect } from "react";
import { ErrorFallback } from "@/src/components/error";
import { logger } from "@/src/lib/logger";

export default function CommunicationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Communications page error", error, {
      module: "CommunicationsErrorPage",
      action: "render",
      digest: error.digest,
    });
  }, [error]);

  return (
    <ErrorFallback
      error={error}
      resetError={reset}
      section="Communications"
      digest={error.digest}
      className="min-h-screen md:pl-20"
    />
  );
}
