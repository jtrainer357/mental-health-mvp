/**
 * Patient 360 Priority Actions
 * Displays patient-specific priority action cards in the Patient 360 view.
 *
 * @module components/substrate/Patient360PriorityActions
 */

"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PriorityActionCard } from "./PriorityActionCard";
import { usePatientPriorityActions } from "@/lib/queries/use-priority-actions";
import type { SuggestedAction } from "@/lib/triggers/trigger-types";

export interface Patient360PriorityActionsProps {
  patientId: string;
  patientName: string;
  practiceId: string;
  className?: string;
  maxActions?: number;
  onActionClick?: (action: SuggestedAction) => void;
}

/**
 * Patient-specific priority actions for the Patient 360 view.
 * Shows a compact list of AI-generated action recommendations for this patient.
 */
export const Patient360PriorityActions = memo(function Patient360PriorityActions({
  patientId,
  patientName,
  practiceId,
  className,
  maxActions = 5,
  onActionClick,
}: Patient360PriorityActionsProps) {
  const {
    data: actions,
    isLoading,
    error,
    refetch,
  } = usePatientPriorityActions(practiceId, patientId);

  // Display limited actions
  const displayActions = actions?.slice(0, maxActions) ?? [];

  if (isLoading) {
    return (
      <div
        className={cn(
          "bg-growth-teal/5 border border-growth-teal/20 rounded-lg p-4",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-growth-teal/10">
            <Loader2 className="h-5 w-5 text-growth-teal animate-spin" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">
              Analyzing Patient Data
            </h3>
            <p className="text-xs text-muted-foreground">
              Generating priority actions...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "bg-destructive/5 border border-destructive/20 rounded-lg p-4",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-foreground">
              Unable to Load Priority Actions
            </h3>
            <p className="text-xs text-muted-foreground">
              {error.message || "An error occurred while analyzing patient data."}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="text-xs text-growth-teal hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (displayActions.length === 0) {
    return (
      <div
        className={cn(
          "bg-growth-teal/5 border border-growth-teal/20 rounded-lg p-4",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-growth-teal/10">
            <Sparkles className="h-5 w-5 text-growth-teal" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">
              No Priority Actions
            </h3>
            <p className="text-xs text-muted-foreground">
              No priority actions for {patientName} at this time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-growth-teal/10">
            <Brain className="h-4 w-4 text-growth-teal" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Priority Actions
            </h3>
            <p className="text-xs text-muted-foreground">
              AI-generated recommendations for {patientName}
            </p>
          </div>
        </div>
        {actions && actions.length > maxActions && (
          <span className="text-xs text-muted-foreground">
            +{actions.length - maxActions} more
          </span>
        )}
      </div>

      {/* Action Cards */}
      <AnimatePresence mode="popLayout">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {displayActions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <PriorityActionCard
                id={action.id}
                title={action.title}
                urgency={action.urgency}
                confidence={action.confidence}
                timeFrame={action.timeFrame}
                context={action.context}
                suggestedActions={action.suggestedActions}
                onActionClick={onActionClick}
                defaultExpanded={index === 0}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
});
