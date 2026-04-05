"use client";

import { useEffect } from "react";
import { ErrorFallback } from "@/src/components/error";
import { logger } from "@/src/lib/logger";

export default function ScheduleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Schedule page error", error, {
      module: "ScheduleErrorPage",
      action: "render",
      digest: error.digest,
    });
  }, [error]);

  return (
    <ErrorFallback
      error={error}
      resetError={reset}
      section="Schedule"
      digest={error.digest}
      className="min-h-screen md:pl-24"
    />
  );
}
