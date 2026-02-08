"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PriorityActionList } from "@/src/components/substrate";
import {
  usePriorityActions,
  useCompleteAction,
  useDismissAction,
  useSnoozeAction,
} from "@/src/lib/queries/use-priority-actions";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";
import type { SuggestedAction, SnoozeDuration } from "@/src/lib/triggers";

export default function HomePage() {
  const router = useRouter();

  // Fetch priority actions
  const { data: actions, isLoading, error, refetch } = usePriorityActions(DEMO_PRACTICE_ID);

  // Mutations
  const completeAction = useCompleteAction(DEMO_PRACTICE_ID);
  const dismissAction = useDismissAction(DEMO_PRACTICE_ID);
  const snoozeAction = useSnoozeAction(DEMO_PRACTICE_ID);

  const handleComplete = async (actionId: string) => {
    await completeAction.mutateAsync(actionId);
  };

  const handleDismiss = async (actionId: string, reason?: string) => {
    await dismissAction.mutateAsync({ actionId, reason });
  };

  const handleSnooze = async (actionId: string, duration: SnoozeDuration) => {
    await snoozeAction.mutateAsync({ actionId, duration });
  };

  const handleActionClick = (action: SuggestedAction) => {
    // Handle different action types
    switch (action.type) {
      case "appointment_create":
      case "appointment_reschedule":
        router.push("/schedule");
        break;
      case "message_send":
        router.push("/communications");
        break;
      default:
        // Log for other action types (placeholder for now)
        console.log("Action clicked:", action);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-foreground-strong text-2xl font-bold sm:text-3xl">
          Good morning, Dr. Smith
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Here's what needs your attention today
        </p>
      </div>

      {/* Priority Actions */}
      <PriorityActionList
        actions={actions || []}
        isLoading={isLoading}
        error={error?.message}
        onComplete={handleComplete}
        onDismiss={handleDismiss}
        onSnooze={handleSnooze}
        onActionClick={handleActionClick}
        onRetry={() => refetch()}
        showFilters={true}
        title="Priority Actions"
      />

      {/* Quick Stats (optional, for future enhancement) */}
      {actions && actions.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border p-4">
            <p className="text-muted-foreground text-xs tracking-wide uppercase">Urgent</p>
            <p className="text-foreground-strong text-2xl font-bold">
              {actions.filter((a) => a.urgency === "urgent").length}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-muted-foreground text-xs tracking-wide uppercase">High</p>
            <p className="text-foreground-strong text-2xl font-bold">
              {actions.filter((a) => a.urgency === "high").length}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-muted-foreground text-xs tracking-wide uppercase">Medium</p>
            <p className="text-foreground-strong text-2xl font-bold">
              {actions.filter((a) => a.urgency === "medium").length}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-muted-foreground text-xs tracking-wide uppercase">Low</p>
            <p className="text-foreground-strong text-2xl font-bold">
              {actions.filter((a) => a.urgency === "low").length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
