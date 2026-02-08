"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Filter, Loader2 } from "lucide-react";
import { Button } from "@/design-system/components/ui/button";
import { cn } from "@/design-system/lib/utils";
import { PriorityActionCard, type ActionPatient } from "./PriorityActionCard";
import type { UrgencyLevel, SuggestedAction, SnoozeDuration } from "@/src/lib/triggers";

/**
 * Priority action data structure
 */
export interface PriorityActionData {
  id: string;
  title: string;
  urgency: UrgencyLevel;
  confidence: number;
  timeFrame: string;
  context: string;
  suggestedActions: SuggestedAction[];
  patient?: ActionPatient;
}

/**
 * Filter options for the action list
 */
export type ActionFilter = "all" | "urgent" | "patient_care" | "administrative";

/**
 * Props for the PriorityActionList component
 */
export interface PriorityActionListProps {
  actions: PriorityActionData[];
  isLoading?: boolean;
  error?: string;
  onComplete?: (id: string) => void;
  onDismiss?: (id: string, reason?: string) => void;
  onSnooze?: (id: string, duration: SnoozeDuration) => void;
  onActionClick?: (action: SuggestedAction) => void;
  onRetry?: () => void;
  className?: string;
  showFilters?: boolean;
  title?: string;
}

// Categorize actions for filtering
function categorizeAction(action: PriorityActionData): ActionFilter[] {
  const categories: ActionFilter[] = ["all"];
  const lowerTitle = action.title.toLowerCase();

  if (action.urgency === "urgent") {
    categories.push("urgent");
  }

  // Patient care actions
  if (
    lowerTitle.includes("phq") ||
    lowerTitle.includes("gad") ||
    lowerTitle.includes("medication") ||
    lowerTitle.includes("appointment") ||
    lowerTitle.includes("not seen") ||
    lowerTitle.includes("intake") ||
    lowerTitle.includes("elevated")
  ) {
    categories.push("patient_care");
  }

  // Administrative actions
  if (
    lowerTitle.includes("insurance") ||
    lowerTitle.includes("auth") ||
    lowerTitle.includes("note") ||
    lowerTitle.includes("unsigned")
  ) {
    categories.push("administrative");
  }

  return categories;
}

// Sort actions by urgency and confidence
function sortActions(actions: PriorityActionData[]): PriorityActionData[] {
  const urgencyOrder: Record<UrgencyLevel, number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return [...actions].sort((a, b) => {
    const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    if (urgencyDiff !== 0) return urgencyDiff;
    return b.confidence - a.confidence; // Higher confidence first
  });
}

export function PriorityActionList({
  actions,
  isLoading = false,
  error,
  onComplete,
  onDismiss,
  onSnooze,
  onActionClick,
  onRetry,
  className,
  showFilters = true,
  title = "Priority Actions",
}: PriorityActionListProps) {
  const [activeFilter, setActiveFilter] = React.useState<ActionFilter>("all");
  const [completedIds, setCompletedIds] = React.useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = React.useState<Set<string>>(new Set());
  const [snoozedIds, setSnoozedIds] = React.useState<Set<string>>(new Set());

  // Filter and sort actions
  const visibleActions = React.useMemo(() => {
    const filtered = actions.filter((action) => {
      // Hide completed, dismissed, or snoozed actions
      if (completedIds.has(action.id) || dismissedIds.has(action.id) || snoozedIds.has(action.id)) {
        return false;
      }

      // Apply category filter
      if (activeFilter !== "all") {
        const categories = categorizeAction(action);
        return categories.includes(activeFilter);
      }

      return true;
    });

    return sortActions(filtered);
  }, [actions, activeFilter, completedIds, dismissedIds, snoozedIds]);

  // Count by category
  const counts = React.useMemo(() => {
    const activeActions = actions.filter(
      (a) => !completedIds.has(a.id) && !dismissedIds.has(a.id) && !snoozedIds.has(a.id)
    );
    return {
      all: activeActions.length,
      urgent: activeActions.filter((a) => a.urgency === "urgent").length,
      patient_care: activeActions.filter((a) => categorizeAction(a).includes("patient_care"))
        .length,
      administrative: activeActions.filter((a) => categorizeAction(a).includes("administrative"))
        .length,
    };
  }, [actions, completedIds, dismissedIds, snoozedIds]);

  const handleComplete = (id: string) => {
    setCompletedIds((prev) => new Set([...prev, id]));
    onComplete?.(id);
  };

  const handleDismiss = (id: string, reason?: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
    onDismiss?.(id, reason);
  };

  const handleSnooze = (id: string, duration: SnoozeDuration) => {
    setSnoozedIds((prev) => new Set([...prev, id]));
    onSnooze?.(id, duration);
  };

  const filters: { key: ActionFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "urgent", label: "Urgent" },
    { key: "patient_care", label: "Patient Care" },
    { key: "administrative", label: "Administrative" },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12", className)}>
        <Loader2 className="text-teal h-8 w-8 animate-spin" />
        <p className="text-muted-foreground mt-3 text-sm">Loading priority actions...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={cn("border-destructive/20 bg-destructive/5 rounded-lg border p-6", className)}
      >
        <p className="text-destructive mb-3 text-sm">{error}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    );
  }

  // Empty state
  if (visibleActions.length === 0 && counts.all === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12", className)}>
        <div className="bg-teal/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <CheckCircle className="text-teal h-8 w-8" />
        </div>
        <h3 className="text-foreground-strong text-lg font-semibold">All caught up!</h3>
        <p className="text-muted-foreground mt-1 text-sm">No priority actions right now.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-foreground-strong text-lg font-semibold sm:text-xl">{title}</h2>
          <span className="bg-teal/10 text-teal rounded-full px-2.5 py-0.5 text-sm font-medium">
            {counts.all}
          </span>
        </div>
      </div>

      {/* Filters */}
      {showFilters && counts.all > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="text-muted-foreground h-4 w-4 shrink-0" />
          {filters.map(({ key, label }) => (
            <Button
              key={key}
              variant={activeFilter === key ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-8 shrink-0 px-3 text-xs",
                activeFilter === key && "bg-teal hover:bg-teal/90"
              )}
              onClick={() => setActiveFilter(key)}
            >
              {label}
              {counts[key] > 0 && (
                <span
                  className={cn(
                    "ml-1.5 rounded-full px-1.5 text-[10px]",
                    activeFilter === key ? "bg-white/20" : "bg-muted"
                  )}
                >
                  {counts[key]}
                </span>
              )}
            </Button>
          ))}
        </div>
      )}

      {/* Action Cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {visibleActions.map((action) => (
            <PriorityActionCard
              key={action.id}
              id={action.id}
              title={action.title}
              urgency={action.urgency}
              confidence={action.confidence}
              timeFrame={action.timeFrame}
              context={action.context}
              suggestedActions={action.suggestedActions}
              patient={action.patient}
              onComplete={handleComplete}
              onDismiss={handleDismiss}
              onSnooze={handleSnooze}
              onActionClick={onActionClick}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Filtered empty state */}
      {visibleActions.length === 0 && counts.all > 0 && (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground text-sm">
            No actions match the "{filters.find((f) => f.key === activeFilter)?.label}" filter.
          </p>
          <Button variant="link" size="sm" onClick={() => setActiveFilter("all")} className="mt-1">
            Show all actions
          </Button>
        </div>
      )}
    </div>
  );
}
