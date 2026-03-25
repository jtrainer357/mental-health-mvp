/**
 * Priority Actions Queries
 * Fetches Claude-generated priority actions from Supabase
 */

import { createClient } from "@/src/lib/supabase/client";
import { createLogger } from "@/src/lib/logger";
import type { PriorityActionWithPatient, PriorityAction, Patient } from "@/src/lib/supabase/types";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";
import { PRIORITY_ACTIONS as SYNTHETIC_PRIORITY_ACTIONS } from "@/src/lib/data/priority-actions";
import { PATIENTS as SYNTHETIC_PATIENTS } from "@/src/lib/data/patients";
import { getExternalIdFromUUID } from "@/src/lib/data/adapter";

// Build patient lookup map for seed data
const syntheticPatientMap = new Map(
  SYNTHETIC_PATIENTS.map((p) => [
    p.id,
    {
      id: p.id,
      first_name: p.first_name,
      last_name: p.last_name,
      date_of_birth: p.date_of_birth,
      risk_level: p.risk_level,
      avatar_url: p.avatar_url,
    },
  ])
);

/**
 * Get synthetic priority actions with patient details (for demo mode)
 */
function getSyntheticPriorityActionsWithPatients(): PriorityActionWithPatient[] {
  const urgencyOrder = { urgent: 0, high: 1, medium: 2, low: 3 };

  return SYNTHETIC_PRIORITY_ACTIONS.filter((action) => action.status === "pending")
    .map((action) => {
      const patient = syntheticPatientMap.get(action.patient_id);
      if (!patient) return null;

      return {
        id: action.id,
        practice_id: action.practice_id,
        patient_id: action.patient_id,
        title: action.title,
        description: null,
        urgency: action.urgency,
        timeframe: action.timeframe,
        confidence_score: action.confidence_score,
        clinical_context: action.clinical_context,
        ai_reasoning: action.clinical_context,
        icon: null,
        suggested_actions: action.suggested_actions,
        status: "active" as const,
        completed_at: null,
        dismissed_at: null,
        created_at: action.created_at,
        updated_at: action.created_at,
        patient,
      } as unknown as PriorityActionWithPatient;
    })
    .filter((a): a is PriorityActionWithPatient => a !== null)
    .sort((a, b) => {
      const aOrder = urgencyOrder[a.urgency] ?? 4;
      const bOrder = urgencyOrder[b.urgency] ?? 4;
      return aOrder - bOrder;
    });
}

const log = createLogger("queries/priority-actions");

// Type for priority action with patient relation from DB (raw form before mapping)
type PriorityActionWithPatientRow = PriorityAction & {
  patient: Pick<
    Patient,
    "id" | "first_name" | "last_name" | "date_of_birth" | "risk_level" | "avatar_url"
  >;
};

// Map urgency from uppercase (DB) to lowercase (types)
function normalizeUrgency(urgency: string): "urgent" | "high" | "medium" | "low" {
  const lower = urgency.toLowerCase();
  if (lower === "urgent") return "urgent";
  if (lower === "high") return "high";
  if (lower === "medium") return "medium";
  return "low";
}

/**
 * Get all pending priority actions for a practice with patient details
 * Uses synthetic data for demo mode, falls back to Supabase if available
 */
export async function getPriorityActions(
  practiceId: string = DEMO_PRACTICE_ID
): Promise<PriorityActionWithPatient[]> {
  // For demo practice, use synthetic data directly (no Supabase required)
  if (practiceId === DEMO_PRACTICE_ID) {
    return getSyntheticPriorityActionsWithPatients();
  }

  const supabase = createClient();

  // First try substrate_actions (new substrate engine table)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("substrate_actions")
    .select(
      `
      *,
      patient:patients(
        id,
        first_name,
        last_name,
        date_of_birth,
        risk_level,
        avatar_url
      )
    `
    )
    .eq("practice_id", practiceId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    // Log but don't throw - gracefully degrade if table doesn't exist or RLS blocks
    log.warn("Could not fetch priority actions", {
      action: "getPriorityActions",
      practiceId,
      error: error.message,
    });
    return [];
  }

  // Map substrate_actions fields to expected types and sort by urgency
  const urgencyOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actions = (data || []) as any[];
  return actions
    .map((action) => ({
      ...action,
      urgency: normalizeUrgency(action.urgency || "medium"),
      confidence_score: action.ai_confidence || 85, // substrate_actions uses ai_confidence
      timeframe: action.time_frame || "This week", // substrate_actions uses time_frame
      clinical_context: action.context || action.ai_reasoning,
      status: action.status || "active",
    }))
    .sort((a, b) => {
      const aOrder = urgencyOrder[a.urgency as keyof typeof urgencyOrder] ?? 4;
      const bOrder = urgencyOrder[b.urgency as keyof typeof urgencyOrder] ?? 4;
      return aOrder - bOrder;
    }) as PriorityActionWithPatient[];
}

// PriorityAction type for patient-specific queries
export interface PatientPriorityAction {
  id: string;
  practice_id: string;
  patient_id: string;
  title: string;
  urgency: "urgent" | "high" | "medium" | "low";
  timeframe: string | null;
  confidence_score: number | null;
  clinical_context: string | null;
  suggested_actions: unknown;
  status: string;
  created_at: string;
}

/**
 * Get synthetic priority actions for a patient (fallback when DB unavailable)
 * Handles both UUID (from UI) and external_id (from synthetic data)
 */
function getSyntheticPatientActions(patientId: string): PatientPriorityAction[] {
  const urgencyOrder = { urgent: 0, high: 1, medium: 2, low: 3 };

  // Convert UUID to external_id if needed (demo patients use UUIDs in UI)
  const externalId = getExternalIdFromUUID(patientId) || patientId;

  return SYNTHETIC_PRIORITY_ACTIONS.filter(
    (action) => action.patient_id === externalId && action.status === "pending"
  )
    .map((action) => ({
      id: action.id,
      practice_id: action.practice_id,
      patient_id: patientId, // Return the original patientId for consistency
      title: action.title,
      urgency: action.urgency,
      timeframe: action.timeframe,
      confidence_score: action.confidence_score,
      clinical_context: action.clinical_context,
      suggested_actions: action.suggested_actions,
      status: "active",
      created_at: action.created_at,
    }))
    .sort((a, b) => {
      const aOrder = urgencyOrder[a.urgency] ?? 4;
      const bOrder = urgencyOrder[b.urgency] ?? 4;
      return aOrder - bOrder;
    });
}

/**
 * Get priority actions for a specific patient
 * Queries substrate_actions table (created by substrate intelligence engine)
 * Falls back to synthetic data when Supabase is unavailable
 * @param patientId - The patient's UUID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function getPatientPriorityActions(
  patientId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<PatientPriorityAction[]> {
  const supabase = createClient();

  try {
    // Query substrate_actions table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("substrate_actions")
      .select("*")
      .eq("patient_id", patientId)
      .eq("practice_id", practiceId)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      // Log and fall back to synthetic data
      log.warn("Could not fetch patient priority actions, using synthetic data", {
        action: "getPatientPriorityActions",
        patientId,
        error: error.message,
      });
      return getSyntheticPatientActions(patientId);
    }

    // If no data from DB, use synthetic
    if (!data || data.length === 0) {
      return getSyntheticPatientActions(patientId);
    }

    // Map substrate_actions fields to PatientPriorityAction format
    const urgencyOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actions = data as any[];
    return actions
      .map((action) => ({
        id: action.id,
        practice_id: action.practice_id,
        patient_id: action.patient_id,
        title: action.title,
        urgency: normalizeUrgency(action.urgency || "medium"),
        timeframe: action.time_frame || "This week", // substrate_actions uses time_frame
        confidence_score: action.ai_confidence || 85, // substrate_actions uses ai_confidence
        clinical_context: action.context || action.ai_reasoning, // substrate_actions uses context
        suggested_actions: action.suggested_actions,
        status: action.status || "active",
        created_at: action.created_at,
      }))
      .sort((a, b) => {
        const aOrder = urgencyOrder[a.urgency] ?? 4;
        const bOrder = urgencyOrder[b.urgency] ?? 4;
        return aOrder - bOrder;
      });
  } catch {
    // Fallback to synthetic data on any error
    log.warn("Priority actions query failed, using synthetic data", {
      action: "getPatientPriorityActions",
      patientId,
    });
    return getSyntheticPatientActions(patientId);
  }
}

/**
 * Mark a priority action as completed
 * Updates substrate_actions table
 * @param actionId - The action's UUID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function completeAction(
  actionId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<void> {
  const supabase = createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("substrate_actions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", actionId)
    .eq("practice_id", practiceId);

  if (error) {
    log.error("Failed to complete action", error, { action: "completeAction", actionId });
    throw error;
  }
}

/**
 * Mark a priority action as dismissed
 * Updates substrate_actions table
 * @param actionId - The action's UUID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function dismissAction(
  actionId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<void> {
  const supabase = createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("substrate_actions")
    .update({
      status: "dismissed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", actionId)
    .eq("practice_id", practiceId);

  if (error) {
    log.error("Failed to dismiss action", error, { action: "dismissAction", actionId });
    throw error;
  }
}

/**
 * Complete all pending actions for a patient
 * Updates substrate_actions table
 * @param patientId - The patient's UUID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function completeAllPatientActions(
  patientId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<void> {
  const supabase = createClient();

  // Update substrate actions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: actionsError } = await (supabase as any)
    .from("substrate_actions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("patient_id", patientId)
    .eq("practice_id", practiceId)
    .eq("status", "active");

  if (actionsError) {
    log.error("Failed to complete patient actions", actionsError, {
      action: "completeAllPatientActions",
      patientId,
    });
    throw actionsError;
  }

  // Also complete related clinical tasks
  const { error: tasksError } = await supabase
    .from("clinical_tasks")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("patient_id", patientId)
    .eq("practice_id", practiceId)
    .eq("status", "pending");

  if (tasksError) {
    log.error("Failed to complete patient tasks", tasksError, {
      action: "completeAllPatientActions",
      patientId,
    });
    throw tasksError;
  }
}

/**
 * Get action counts by urgency
 * Queries substrate_actions table
 */
export async function getActionCounts(practiceId: string = DEMO_PRACTICE_ID): Promise<{
  urgent: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}> {
  const supabase = createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("substrate_actions")
    .select("urgency")
    .eq("practice_id", practiceId)
    .eq("status", "active");

  if (error) {
    log.error("Failed to fetch action counts", error, { action: "getActionCounts", practiceId });
    return { urgent: 0, high: 0, medium: 0, low: 0, total: 0 };
  }

  const actions = (data || []) as Array<{ urgency: string }>;
  const counts = {
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0,
    total: actions.length,
  };

  actions.forEach((action) => {
    const normalized = normalizeUrgency(action.urgency || "medium");
    counts[normalized]++;
  });

  return counts;
}
