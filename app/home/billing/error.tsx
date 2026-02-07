"use client";

import { useEffect } from "react";
import { ErrorFallback } from "@/src/components/error";
import { logger } from "@/src/lib/logger";

export default function BillingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Billing page error", error, {
      module: "BillingErrorPage",
      action: "render",
      digest: error.digest,
    });
  }, [error]);

  return (
    <ErrorFallback
      error={error}
      resetError={reset}
      section="Billing"
      digest={error.digest}
      className="min-h-screen lg:pl-36"
    />
  );
}
