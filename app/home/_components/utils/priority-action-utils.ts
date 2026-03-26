/**
 * Pure utility functions for priority actions
 */

import type { OrchestrationContext, SuggestedAction } from "@/src/lib/orchestration/types";
import type { AppointmentWithPatient } from "@/src/lib/queries/appointments";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface UnifiedAction {
  id: string;
  source: "substrate" | "priority";
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    risk_level: string | null;
    avatar_url: string | null;
  };
  title: string;
  urgency: "urgent" | "high" | "medium" | "low";
  confidence: number;
  timeframe: string | null;
  context: string | null;
  reasoning?: string | null;
  trigger_type?: string;
  suggested_actions: SuggestedActionItem[];
}

export interface SuggestedActionItem {
  label: string;
  type: string;
  completed?: boolean;
}

// ─── Constants ──────────────────────────────────────────────────────────────

export const urgencyOrder: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

// ─── Pure functions ─────────────────────────────────────────────────────────

/** Format 24h time (e.g. "09:00") to 12h (e.g. "9:00 AM") */
export function formatTime12h(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours! >= 12 ? "PM" : "AM";
  const displayHours = hours! % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

/** Map urgency to badge variant */
export function getBadgeVariant(urgency: string): "urgent" | "warning" | "success" | "default" {
  switch (urgency) {
    case "urgent":
      return "urgent";
    case "high":
      return "warning";
    case "medium":
      return "success";
    default:
      return "default";
  }
}

/** Map urgency to badge text */
export function getBadgeText(urgency: string, timeframe: string | null): string {
  if (urgency === "urgent") return "URGENT";
  if (timeframe === "Immediate" || timeframe === "Today") return "TODAY";
  if (timeframe === "Within 3 days") return "WITHIN 3 DAYS";
  return "ACTION NEEDED";
}

/** Map trigger type to orchestration trigger type */
export function mapTriggerType(
  triggerType?: string
): "lab_result" | "refill" | "screening" | "appointment" {
  switch (triggerType) {
    case "OUTCOME_SCORE_ELEVATED":
    case "OUTCOME_MEASURE_SCORED":
      return "screening";
    case "MEDICATION_REFILL_APPROACHING":
      return "refill";
    case "APPOINTMENT_MISSED":
    case "PATIENT_NOT_SEEN":
      return "appointment";
    default:
      return "screening";
  }
}

/** Map action type to orchestration action type */
export function mapActionType(
  actionType: string
): "message" | "order" | "medication" | "task" | "document" {
  switch (actionType) {
    case "message_send":
      return "message";
    case "medication_action":
      return "medication";
    case "note_sign":
    case "note_create":
      return "document";
    default:
      return "task";
  }
}

/** Convert unified action to OrchestrationContext for the detail view */
export function unifiedActionToContext(action: UnifiedAction): OrchestrationContext {
  const patient = action.patient;
  return {
    patient: {
      id: patient.id,
      name: `${patient.first_name} ${patient.last_name}`,
      mrn: patient.id.substring(0, 8),
      dob: patient.date_of_birth,
      age: Math.floor(
        (Date.now() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      ),
      primaryDiagnosis: action.context || "Mental Health",
      avatar: patient.avatar_url || `https://i.pravatar.cc/150?u=${patient.id}`,
    },
    trigger: {
      type: mapTriggerType(action.trigger_type),
      title: action.title,
      urgency:
        action.urgency === "urgent" ? "urgent" : action.urgency === "high" ? "high" : "medium",
    },
    clinicalData: {},
    suggestedActions: action.suggested_actions.map((suggestion, i) => ({
      id: String(i + 1),
      label: suggestion.label,
      type: mapActionType(suggestion.type),
      checked: suggestion.completed ?? false,
    })),
  };
}

/** Generate suggested actions for an appointment based on service type and patient context */
export function generateAppointmentActions(
  apt: AppointmentWithPatient,
  matchingActions: UnifiedAction[]
): SuggestedAction[] {
  // If we have matching priority actions for this patient, use those suggested actions
  if (matchingActions.length > 0) {
    const allSuggestions: SuggestedAction[] = [];
    let idCounter = 1;
    for (const action of matchingActions) {
      for (const suggestion of action.suggested_actions) {
        allSuggestions.push({
          id: String(idCounter++),
          label: suggestion.label,
          type: mapActionType(suggestion.type),
          checked: false,
        });
      }
    }
    // Deduplicate by label and return up to 5
    const seen = new Set<string>();
    return allSuggestions
      .filter((a) => {
        const key = a.label.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 5);
  }

  // Otherwise generate smart defaults based on the appointment/service type
  const serviceType = (apt.service_type || "").toLowerCase();

  if (serviceType.includes("intake") || serviceType.includes("new patient")) {
    return [
      { id: "1", label: "Review intake paperwork and history", type: "document", checked: false },
      { id: "2", label: "Prepare PHQ-9 and GAD-7 assessments", type: "task", checked: false },
      { id: "3", label: "Complete diagnostic assessment", type: "task", checked: false },
      { id: "4", label: "Discuss treatment goals and plan", type: "task", checked: false },
    ];
  }

  if (serviceType.includes("follow") || serviceType.includes("check")) {
    return [
      { id: "1", label: "Review progress since last session", type: "task", checked: false },
      { id: "2", label: "Administer outcome measures", type: "task", checked: false },
      { id: "3", label: "Update treatment plan if needed", type: "document", checked: false },
      { id: "4", label: "Schedule next appointment", type: "task", checked: false },
    ];
  }

  // Default actions for any session type
  return [
    { id: "1", label: "Review patient chart and recent notes", type: "document", checked: false },
    { id: "2", label: "Check outcome measure trends", type: "task", checked: false },
    { id: "3", label: "Review and update treatment plan", type: "document", checked: false },
    { id: "4", label: "Document session notes", type: "document", checked: false },
  ];
}

/** Convert appointment to OrchestrationContext for the detail view */
export function appointmentToContext(
  apt: AppointmentWithPatient,
  allActions: UnifiedAction[] = []
): OrchestrationContext {
  const patient = apt.patient;
  // Find any priority actions that belong to this patient
  const matchingActions = allActions.filter((a) => a.patient.id === patient.id);

  return {
    patient: {
      id: patient.id,
      name: `${patient.first_name} ${patient.last_name}`,
      mrn: patient.id.substring(0, 8),
      dob: patient.date_of_birth,
      age: Math.floor(
        (Date.now() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      ),
      primaryDiagnosis: apt.service_type || "General Visit",
      avatar: patient.avatar_url || `https://i.pravatar.cc/150?u=${patient.id}`,
    },
    trigger: {
      type: "appointment",
      title: `${apt.service_type} Appointment`,
      urgency: "medium",
    },
    clinicalData: {},
    suggestedActions: generateAppointmentActions(apt, matchingActions),
  };
}
