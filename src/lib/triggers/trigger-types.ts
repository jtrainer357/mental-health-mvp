/**
 * Trigger Event Types
 * Defines all clinical trigger events for the substrate intelligence layer.
 *
 * @module triggers/trigger-types
 */

/**
 * All possible clinical trigger events that the substrate can detect.
 */
export enum TriggerEvent {
  /** A session note has been signed and finalized */
  SESSION_SIGNED = "SESSION_SIGNED",

  /** An outcome measure has been scored (PHQ-9, GAD-7, PCL-5, etc.) */
  OUTCOME_MEASURE_SCORED = "OUTCOME_MEASURE_SCORED",

  /** A patient missed a scheduled appointment */
  APPOINTMENT_MISSED = "APPOINTMENT_MISSED",

  /** A medication refill is due soon */
  MEDICATION_REFILL_APPROACHING = "MEDICATION_REFILL_APPROACHING",

  /** A session note remains unsigned for too long */
  UNSIGNED_NOTE_AGING = "UNSIGNED_NOTE_AGING",

  /** Insurance authorization is expiring soon */
  INSURANCE_AUTH_EXPIRING = "INSURANCE_AUTH_EXPIRING",

  /** An active patient hasn't been seen recently */
  PATIENT_NOT_SEEN = "PATIENT_NOT_SEEN",

  /** An outcome measure score exceeds clinical threshold */
  OUTCOME_SCORE_ELEVATED = "OUTCOME_SCORE_ELEVATED",

  /** A new patient needs intake completion */
  NEW_PATIENT_INTAKE_DUE = "NEW_PATIENT_INTAKE_DUE",

  /** A treatment plan is nearing expiration */
  TREATMENT_PLAN_EXPIRING = "TREATMENT_PLAN_EXPIRING",
}

/**
 * Urgency levels for prioritizing actions.
 * Maps to visual indicators (colors) in the UI.
 */
export enum UrgencyLevel {
  /** Requires immediate attention - red indicator */
  URGENT = "urgent",

  /** High priority, needs attention soon - orange indicator */
  HIGH = "high",

  /** Standard priority - teal (Growth Teal) indicator */
  MEDIUM = "medium",

  /** Lower priority, can be addressed when convenient - gray indicator */
  LOW = "low",
}

/**
 * Time frames for when an action should be completed.
 */
export type TimeFrame =
  | "Immediate"
  | "Within 24 hours"
  | "Within 3 days"
  | "This week"
  | "Next visit";

/**
 * Action types that can be suggested for a priority action.
 */
export type SuggestedActionType =
  | "medication_action"
  | "appointment_create"
  | "appointment_reschedule"
  | "message_send"
  | "note_sign"
  | "note_create"
  | "assessment_complete"
  | "insurance_verify"
  | "treatment_plan_update"
  | "complete_task"
  | "dismiss"
  | "snooze";

/**
 * A suggested action that can be taken on a priority action card.
 */
export interface SuggestedAction {
  /** Display label for the action button */
  label: string;

  /** Type of action to execute */
  type: SuggestedActionType;

  /** Additional data needed to execute the action */
  payload?: Record<string, unknown>;
}

/**
 * Context for a detected trigger event.
 * Contains all information needed to generate a priority action.
 */
export interface TriggerContext {
  /** The type of trigger event detected */
  event: TriggerEvent;

  /** Patient associated with this trigger (if applicable) */
  patient_id: string | null;

  /** Practice this trigger belongs to */
  practice_id: string;

  /** Event-specific payload data */
  data: TriggerEventData;

  /** ISO timestamp when the trigger was detected */
  triggered_at: string;

  /** Calculated urgency level based on trigger rules */
  urgency: UrgencyLevel;
}

/**
 * Union type for all possible trigger event data payloads.
 */
export type TriggerEventData =
  | UnsignedNoteData
  | AppointmentMissedData
  | MedicationRefillData
  | InsuranceAuthData
  | PatientNotSeenData
  | OutcomeScoreData
  | NewPatientIntakeData
  | SessionSignedData
  | OutcomeMeasureScoredData
  | TreatmentPlanExpiringData;

/**
 * Data for UNSIGNED_NOTE_AGING trigger
 */
export interface UnsignedNoteData {
  session_id: string;
  patient_name: string;
  patient_id: string;
  hours_since_session: number;
  session_date: string;
  session_type?: string;
}

/**
 * Data for APPOINTMENT_MISSED trigger
 */
export interface AppointmentMissedData {
  appointment_id: string;
  patient_name: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  no_show_count_30_days: number;
  service_type?: string;
}

/**
 * Data for MEDICATION_REFILL_APPROACHING trigger
 */
export interface MedicationRefillData {
  medication_id?: string;
  medication_name: string;
  dosage: string;
  patient_name: string;
  patient_id: string;
  refill_date: string;
  days_until_refill: number;
  adherence_notes?: string;
}

/**
 * Data for INSURANCE_AUTH_EXPIRING trigger
 */
export interface InsuranceAuthData {
  patient_name: string;
  patient_id: string;
  sessions_remaining: number;
  expiry_date: string;
  days_until_expiry: number;
  insurance_provider: string;
  authorization_number?: string;
}

/**
 * Data for PATIENT_NOT_SEEN trigger
 */
export interface PatientNotSeenData {
  patient_name: string;
  patient_id: string;
  days_since_last_visit: number;
  last_appointment_date: string;
  risk_level?: "low" | "medium" | "high";
  primary_diagnosis?: string;
}

/**
 * Data for OUTCOME_SCORE_ELEVATED trigger
 */
export interface OutcomeScoreData {
  patient_name: string;
  patient_id: string;
  measure_type: "PHQ-9" | "GAD-7" | "PCL-5" | "Other";
  score: number;
  max_score: number;
  severity: "minimal" | "mild" | "moderate" | "moderately-severe" | "severe";
  previous_score?: number;
  trend?: "improving" | "stable" | "worsening";
  measurement_date: string;
}

/**
 * Data for NEW_PATIENT_INTAKE_DUE trigger
 */
export interface NewPatientIntakeData {
  patient_name: string;
  patient_id: string;
  created_at: string;
  days_since_added: number;
  has_scheduled_appointment: boolean;
  first_appointment_date?: string;
}

/**
 * Data for SESSION_SIGNED trigger
 */
export interface SessionSignedData {
  session_id: string;
  patient_name: string;
  patient_id: string;
  session_date: string;
  signed_at: string;
}

/**
 * Data for OUTCOME_MEASURE_SCORED trigger
 */
export interface OutcomeMeasureScoredData {
  measure_id: string;
  patient_name: string;
  patient_id: string;
  measure_type: "PHQ-9" | "GAD-7" | "PCL-5" | "Other";
  score: number;
  max_score: number;
  scored_at: string;
}

/**
 * Data for TREATMENT_PLAN_EXPIRING trigger
 */
export interface TreatmentPlanExpiringData {
  patient_name: string;
  patient_id: string;
  plan_expiry_date: string;
  days_until_expiry: number;
  treatment_goals?: string[];
}

/**
 * Clinical thresholds for outcome measures
 */
export const CLINICAL_THRESHOLDS = {
  "PHQ-9": {
    minimal: 4, // 0-4
    mild: 9, // 5-9
    moderate: 14, // 10-14
    moderatelySevere: 19, // 15-19
    severe: 27, // 20-27
    clinicalConcern: 15, // Trigger threshold
    urgentConcern: 20, // Urgent trigger
    maxScore: 27,
  },
  "GAD-7": {
    minimal: 4, // 0-4
    mild: 9, // 5-9
    moderate: 14, // 10-14
    severe: 21, // 15-21
    clinicalConcern: 15, // Trigger threshold (severe)
    maxScore: 21,
  },
  "PCL-5": {
    threshold: 32, // PTSD threshold
    urgentConcern: 50,
    maxScore: 80,
  },
} as const;

/**
 * Confidence score range (0-100)
 * Higher scores indicate more reliable trigger detection
 */
export interface ConfidenceScore {
  /** Score from 0-100 */
  value: number;

  /** Factors that contributed to the score */
  factors?: string[];
}

/**
 * Priority action status
 */
export type PriorityActionStatus = "active" | "completed" | "dismissed" | "snoozed";

/**
 * Full substrate action (stored in database)
 */
export interface SubstrateAction {
  id: string;
  practice_id: string;
  patient_id: string | null;
  trigger_event: TriggerEvent;
  urgency: UrgencyLevel;
  confidence: number;
  title: string;
  context: string | null;
  time_frame: TimeFrame;
  suggested_actions: SuggestedAction[];
  status: PriorityActionStatus;
  completed_at?: string;
  completed_by?: string;
  dismissed_at?: string;
  dismissed_reason?: string;
  snoozed_until?: string;
  source_data: TriggerEventData;
  generated_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Snooze duration options
 */
export type SnoozeDuration = "24h" | "3d" | "1w";

/**
 * Get the snooze date based on duration
 */
export function getSnoozedUntil(duration: SnoozeDuration): string {
  const now = new Date();
  switch (duration) {
    case "24h":
      now.setHours(now.getHours() + 24);
      break;
    case "3d":
      now.setDate(now.getDate() + 3);
      break;
    case "1w":
      now.setDate(now.getDate() + 7);
      break;
  }
  return now.toISOString();
}

/**
 * Get severity label from outcome score
 */
export function getOutcomeSeverity(
  measureType: "PHQ-9" | "GAD-7" | "PCL-5" | "Other",
  score: number
): OutcomeScoreData["severity"] {
  if (measureType === "PHQ-9") {
    const thresholds = CLINICAL_THRESHOLDS["PHQ-9"];
    if (score <= thresholds.minimal) return "minimal";
    if (score <= thresholds.mild) return "mild";
    if (score <= thresholds.moderate) return "moderate";
    if (score <= thresholds.moderatelySevere) return "moderately-severe";
    return "severe";
  }

  if (measureType === "GAD-7") {
    const thresholds = CLINICAL_THRESHOLDS["GAD-7"];
    if (score <= thresholds.minimal) return "minimal";
    if (score <= thresholds.mild) return "mild";
    if (score <= thresholds.moderate) return "moderate";
    return "severe";
  }

  if (measureType === "PCL-5") {
    const thresholds = CLINICAL_THRESHOLDS["PCL-5"];
    if (score < thresholds.threshold) return "minimal";
    if (score < thresholds.urgentConcern) return "moderate";
    return "severe";
  }

  // Default for 'Other' types
  return "moderate";
}

/**
 * Determine urgency from outcome score
 */
export function getUrgencyFromOutcomeScore(
  measureType: "PHQ-9" | "GAD-7" | "PCL-5" | "Other",
  score: number
): UrgencyLevel {
  if (measureType === "PHQ-9") {
    if (score >= CLINICAL_THRESHOLDS["PHQ-9"].urgentConcern) return UrgencyLevel.URGENT;
    if (score >= CLINICAL_THRESHOLDS["PHQ-9"].clinicalConcern) return UrgencyLevel.HIGH;
  }

  if (measureType === "GAD-7") {
    if (score >= CLINICAL_THRESHOLDS["GAD-7"].clinicalConcern) return UrgencyLevel.HIGH;
  }

  if (measureType === "PCL-5") {
    if (score >= CLINICAL_THRESHOLDS["PCL-5"].urgentConcern) return UrgencyLevel.URGENT;
    if (score >= CLINICAL_THRESHOLDS["PCL-5"].threshold) return UrgencyLevel.HIGH;
  }

  return UrgencyLevel.MEDIUM;
}
