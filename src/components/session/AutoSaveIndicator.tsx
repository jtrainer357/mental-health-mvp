"use client";

/**
 * Auto-Save Status Indicator
 * Visual indicator for auto-save status
 * @component
 */

import { Cloud, CloudOff, Check, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AutoSaveStatus } from "@/lib/session";

interface AutoSaveIndicatorProps {
  /** Current auto-save status */
  status: AutoSaveStatus;
  /** Last saved timestamp */
  lastSavedAt?: Date | null;
  /** Error message if save failed */
  error?: string | null;
  /** Additional CSS classes */
  className?: string;
}

const statusConfig: Record<
  AutoSaveStatus,
  {
    icon: typeof Cloud;
    text: string;
    className: string;
  }
> = {
  idle: {
    icon: Cloud,
    text: "Saved",
    className: "text-muted-foreground",
  },
  pending: {
    icon: Cloud,
    text: "Unsaved changes",
    className: "text-yellow-600",
  },
  saving: {
    icon: Loader2,
    text: "Saving...",
    className: "text-blue-600",
  },
  saved: {
    icon: Check,
    text: "Saved",
    className: "text-green-600",
  },
  error: {
    icon: AlertCircle,
    text: "Save failed",
    className: "text-red-600",
  },
};

export function AutoSaveIndicator({
  status,
  lastSavedAt,
  error,
  className,
}: AutoSaveIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm",
        config.className,
        className
      )}
      title={error || undefined}
    >
      <Icon
        className={cn("h-4 w-4", status === "saving" && "animate-spin")}
      />
      <span>{config.text}</span>
      {lastSavedAt && status !== "saving" && status !== "error" && (
        <span className="text-muted-foreground">
          at {formatTime(lastSavedAt)}
        </span>
      )}
    </div>
  );
}

export default AutoSaveIndicator;
