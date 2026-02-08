/**
 * Priority Actions Query Hook
 * React Query hook for fetching substrate priority actions.
 *
 * @module queries/use-priority-actions
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/src/lib/supabase/client";
import { createLogger } from "@/src/lib/logger";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";
import type { UrgencyLevel, SuggestedAction, SnoozeDuration, TimeFrame } from "@/src/lib/triggers";
import { getSnoozedUntil } from "@/src/lib/triggers";
import type { PriorityActionData, ActionPatient } from "@/src/components/substrate";

const log = createLogger("queries/use-priority-actions");

/**
 * Query key factory for priority actions
 */
export const priorityActionsKeys = {
  all: ["priority-actions"] as const,
  practice: (practiceId: string) => [...priorityActionsKeys.all, practiceId] as const,
  patient: (practiceId: string, patientId: string) =>
    [...priorityActionsKeys.practice(practiceId), "patient", patientId] as const,
};

/**
 * Raw priority action data from API/database
 */
interface RawPriorityAction {
  id: string;
  practice_id: string;
  patient_id: string | null;
  title: string;
  urgency: string;
  ai_confidence?: number;
  confidence_score?: number;
  time_window?: string;
  timeframe?: string;
  clinical_context?: string;
  context?: string;
  suggested_actions?: string[] | SuggestedAction[];
  status: string;
  created_at: string;
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string | null;
  };
}

/**
 * Normalize urgency to lowercase enum value
 */
function normalizeUrgency(urgency: string): UrgencyLevel {
  const lower = urgency.toLowerCase();
  if (lower === "urgent") return "urgent";
  if (lower === "high") return "high";
  if (lower === "medium") return "medium";
  return "low";
}

/**
 * Transform raw action to UI-friendly format
 */
function transformAction(raw: RawPriorityAction): PriorityActionData {
  // Parse suggested actions - could be string array or SuggestedAction array
  let suggestedActions: SuggestedAction[] = [];
  if (raw.suggested_actions) {
    if (typeof raw.suggested_actions[0] === "string") {
      // String array format - convert to SuggestedAction
      suggestedActions = (raw.suggested_actions as string[]).map((label) => ({
        label,
        type: "complete_task" as const,
      }));
    } else {
      suggestedActions = raw.suggested_actions as SuggestedAction[];
    }
  }

  return {
    id: raw.id,
    title: raw.title,
    urgency: normalizeUrgency(raw.urgency),
    confidence: raw.ai_confidence || raw.confidence_score || 85,
    timeFrame: raw.time_window || raw.timeframe || "This week",
    context: raw.clinical_context || raw.context || "",
    suggestedActions,
    patient: raw.patient
      ? {
          id: raw.patient.id,
          first_name: raw.patient.first_name,
          last_name: raw.patient.last_name,
          avatar_url: raw.patient.avatar_url,
        }
      : undefined,
  };
}

/**
 * Fetch priority actions from API
 */
async function fetchPriorityActions(practiceId: string): Promise<PriorityActionData[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("prioritized_actions")
    .select(
      `
      *,
      patient:patients(
        id,
        first_name,
        last_name,
        avatar_url
      )
    `
    )
    .eq("practice_id", practiceId)
    .or("status.eq.pending,status.is.null")
    .order("created_at", { ascending: false });

  if (error) {
    log.error("Failed to fetch priority actions", error, { practiceId });
    throw error;
  }

  // Transform and sort by urgency
  const urgencyOrder: Record<UrgencyLevel, number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return (data || [])
    .map((raw) => transformAction(raw as unknown as RawPriorityAction))
    .sort((a, b) => {
      const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      if (urgencyDiff !== 0) return urgencyDiff;
      return b.confidence - a.confidence;
    });
}

/**
 * Fetch priority actions for a specific patient
 */
async function fetchPatientPriorityActions(
  practiceId: string,
  patientId: string
): Promise<PriorityActionData[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("prioritized_actions")
    .select("*")
    .eq("practice_id", practiceId)
    .eq("patient_id", patientId)
    .or("status.eq.pending,status.is.null")
    .order("created_at", { ascending: false });

  if (error) {
    log.error("Failed to fetch patient priority actions", error, { practiceId, patientId });
    throw error;
  }

  const urgencyOrder: Record<UrgencyLevel, number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return (data || [])
    .map((raw) =>
      transformAction({
        ...raw,
        patient: undefined,
      } as unknown as RawPriorityAction)
    )
    .sort((a, b) => {
      const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      if (urgencyDiff !== 0) return urgencyDiff;
      return b.confidence - a.confidence;
    });
}

/**
 * Hook to fetch all priority actions for a practice
 */
export function usePriorityActions(practiceId: string = DEMO_PRACTICE_ID) {
  return useQuery({
    queryKey: priorityActionsKeys.practice(practiceId),
    queryFn: () => fetchPriorityActions(practiceId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 min
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to fetch priority actions for a specific patient
 */
export function usePatientPriorityActions(
  patientId: string,
  practiceId: string = DEMO_PRACTICE_ID
) {
  return useQuery({
    queryKey: priorityActionsKeys.patient(practiceId, patientId),
    queryFn: () => fetchPatientPriorityActions(practiceId, patientId),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    enabled: !!patientId,
  });
}

/**
 * Mutation to complete an action
 */
export function useCompleteAction(practiceId: string = DEMO_PRACTICE_ID) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (actionId: string) => {
      const supabase = createClient();

      const { error } = await supabase
        .from("prioritized_actions")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", actionId)
        .eq("practice_id", practiceId);

      if (error) {
        log.error("Failed to complete action", error, { actionId });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: priorityActionsKeys.practice(practiceId) });
    },
  });
}

/**
 * Mutation to dismiss an action
 */
export function useDismissAction(practiceId: string = DEMO_PRACTICE_ID) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ actionId, reason }: { actionId: string; reason?: string }) => {
      const supabase = createClient();

      const { error } = await supabase
        .from("prioritized_actions")
        .update({
          status: "dismissed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", actionId)
        .eq("practice_id", practiceId);

      if (error) {
        log.error("Failed to dismiss action", error, { actionId });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: priorityActionsKeys.practice(practiceId) });
    },
  });
}

/**
 * Mutation to snooze an action
 */
export function useSnoozeAction(practiceId: string = DEMO_PRACTICE_ID) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ actionId, duration }: { actionId: string; duration: SnoozeDuration }) => {
      const supabase = createClient();
      const snoozedUntil = getSnoozedUntil(duration);

      const { error } = await supabase
        .from("prioritized_actions")
        .update({
          status: "snoozed",
          // Note: snoozed_until would need to be added to the table
          // For now, we just mark as snoozed
        })
        .eq("id", actionId)
        .eq("practice_id", practiceId);

      if (error) {
        log.error("Failed to snooze action", error, { actionId, duration });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: priorityActionsKeys.practice(practiceId) });
    },
  });
}

/**
 * Hook to get action counts by urgency
 */
export function usePriorityActionCounts(practiceId: string = DEMO_PRACTICE_ID) {
  const { data: actions } = usePriorityActions(practiceId);

  return {
    urgent: actions?.filter((a) => a.urgency === "urgent").length || 0,
    high: actions?.filter((a) => a.urgency === "high").length || 0,
    medium: actions?.filter((a) => a.urgency === "medium").length || 0,
    low: actions?.filter((a) => a.urgency === "low").length || 0,
    total: actions?.length || 0,
  };
}
