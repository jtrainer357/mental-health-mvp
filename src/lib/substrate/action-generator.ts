/**
 * AI Action Generator
 * Generates priority action cards from trigger contexts using AI.
 *
 * @module substrate/action-generator
 */

import { createClinicalFallbackChain } from "@/src/lib/ai";
import { createLogger } from "@/src/lib/logger";
import {
  TriggerContext,
  TriggerEvent,
  UrgencyLevel,
  TimeFrame,
  SuggestedAction,
  SubstrateAction,
  UnsignedNoteData,
  AppointmentMissedData,
  MedicationRefillData,
  InsuranceAuthData,
  PatientNotSeenData,
  OutcomeScoreData,
  NewPatientIntakeData,
} from "@/src/lib/triggers";

const log = createLogger("substrate/action-generator");

/**
 * Generated action from AI or fallback template
 */
export interface GeneratedAction {
  title: string;
  urgency: UrgencyLevel;
  confidence: number;
  time_frame: TimeFrame;
  context: string;
  suggested_actions: SuggestedAction[];
}

/**
 * Action cache to prevent re-generation
 */
const actionCache = new Map<string, { action: GeneratedAction; expires: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Generate a cache key for a trigger
 */
function getCacheKey(trigger: TriggerContext): string {
  return `${trigger.event}-${trigger.patient_id}-${trigger.triggered_at.substring(0, 10)}`;
}

/**
 * Generate an action card from a trigger context using AI
 */
export async function generateAction(trigger: TriggerContext): Promise<GeneratedAction> {
  const cacheKey = getCacheKey(trigger);

  // Check cache first
  const cached = actionCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    log.debug("Returning cached action", { cacheKey });
    return cached.action;
  }

  try {
    // Try AI generation first
    const action = await generateActionWithAI(trigger);
    actionCache.set(cacheKey, { action, expires: Date.now() + CACHE_TTL_MS });
    return action;
  } catch (error) {
    log.warn("AI generation failed, using template fallback", { error });
    // Fall back to template-based generation
    const action = generateActionFromTemplate(trigger);
    actionCache.set(cacheKey, { action, expires: Date.now() + CACHE_TTL_MS });
    return action;
  }
}

/**
 * Generate actions for multiple triggers in batch
 */
export async function generateActionsInBatch(
  triggers: TriggerContext[]
): Promise<Map<TriggerContext, GeneratedAction>> {
  const results = new Map<TriggerContext, GeneratedAction>();

  // Process in parallel batches of 5 to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < triggers.length; i += batchSize) {
    const batch = triggers.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(async (trigger) => {
        const action = await generateAction(trigger);
        return { trigger, action };
      })
    );

    batchResults.forEach((result) => {
      if (result.status === "fulfilled") {
        results.set(result.value.trigger, result.value.action);
      } else {
        log.error("Failed to generate action", result.reason);
      }
    });

    // Small delay between batches
    if (i + batchSize < triggers.length) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  return results;
}

/**
 * Generate action using AI fallback chain
 */
async function generateActionWithAI(trigger: TriggerContext): Promise<GeneratedAction> {
  const chain = createClinicalFallbackChain();

  const prompt = buildPromptForTrigger(trigger);

  const result = await chain.completeJSON<AIActionResponse>([
    { role: "user", content: prompt },
  ]);

  return {
    title: result.data.title,
    urgency: trigger.urgency,
    confidence: result.data.confidence || calculateBaseConfidence(trigger),
    time_frame: result.data.time_frame as TimeFrame,
    context: result.data.context,
    suggested_actions: result.data.suggested_actions.map((sa) => ({
      label: sa.label,
      type: sa.type as SuggestedAction["type"],
      payload: sa.payload,
    })),
  };
}

interface AIActionResponse {
  title: string;
  confidence: number;
  time_frame: string;
  context: string;
  suggested_actions: Array<{
    label: string;
    type: string;
    payload?: Record<string, unknown>;
  }>;
}

/**
 * Build AI prompt based on trigger type
 */
function buildPromptForTrigger(trigger: TriggerContext): string {
  const basePrompt = `You are a clinical decision support AI for a mental health practice. Generate a priority action card for a clinical trigger.

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "title": "Brief action title (max 60 chars)",
  "confidence": 85,
  "time_frame": "Immediate" | "Within 24 hours" | "Within 3 days" | "This week" | "Next visit",
  "context": "Clinical context paragraph (2-3 sentences explaining why this matters and what to consider)",
  "suggested_actions": [
    { "label": "Action label", "type": "action_type" }
  ]
}

Valid action types: medication_action, appointment_create, appointment_reschedule, message_send, note_sign, note_create, assessment_complete, insurance_verify, treatment_plan_update

`;

  switch (trigger.event) {
    case TriggerEvent.UNSIGNED_NOTE_AGING: {
      const data = trigger.data as UnsignedNoteData;
      return `${basePrompt}
TRIGGER: Unsigned Session Note
Patient: ${data.patient_name}
Session Date: ${data.session_date}
Hours Since Session: ${data.hours_since_session}
Session Type: ${data.session_type || "Therapy Session"}
Urgency: ${trigger.urgency}

Generate an action card for this aging unsigned note. Include clinical and compliance implications.`;
    }

    case TriggerEvent.APPOINTMENT_MISSED: {
      const data = trigger.data as AppointmentMissedData;
      return `${basePrompt}
TRIGGER: Missed Appointment (No-Show)
Patient: ${data.patient_name}
Missed Date: ${data.appointment_date}
Service Type: ${data.service_type || "Therapy"}
No-Shows in Last 30 Days: ${data.no_show_count_30_days}
Urgency: ${trigger.urgency}

Generate an action card for this missed appointment. Consider engagement concerns and outreach strategies.`;
    }

    case TriggerEvent.MEDICATION_REFILL_APPROACHING: {
      const data = trigger.data as MedicationRefillData;
      return `${basePrompt}
TRIGGER: Medication Refill Due
Patient: ${data.patient_name}
Medication: ${data.medication_name} ${data.dosage}
Refill Date: ${data.refill_date}
Days Until Refill: ${data.days_until_refill}
Urgency: ${trigger.urgency}

Generate an action card for this upcoming medication refill. Consider adherence and follow-up needs.`;
    }

    case TriggerEvent.INSURANCE_AUTH_EXPIRING: {
      const data = trigger.data as InsuranceAuthData;
      return `${basePrompt}
TRIGGER: Insurance Authorization Expiring
Patient: ${data.patient_name}
Insurance: ${data.insurance_provider}
Sessions Remaining: ${data.sessions_remaining}
Expiry Date: ${data.expiry_date}
Days Until Expiry: ${data.days_until_expiry}
Urgency: ${trigger.urgency}

Generate an action card for this expiring authorization. Include reauthorization steps.`;
    }

    case TriggerEvent.PATIENT_NOT_SEEN: {
      const data = trigger.data as PatientNotSeenData;
      return `${basePrompt}
TRIGGER: Patient Not Seen Recently
Patient: ${data.patient_name}
Last Visit: ${data.last_appointment_date}
Days Since Visit: ${data.days_since_last_visit}
Risk Level: ${data.risk_level || "Unknown"}
Primary Diagnosis: ${data.primary_diagnosis || "Not specified"}
Urgency: ${trigger.urgency}

Generate an action card for this patient who hasn't been seen. Consider continuity of care and engagement.`;
    }

    case TriggerEvent.OUTCOME_SCORE_ELEVATED: {
      const data = trigger.data as OutcomeScoreData;
      return `${basePrompt}
TRIGGER: Elevated Outcome Score
Patient: ${data.patient_name}
Measure: ${data.measure_type}
Score: ${data.score}/${data.max_score}
Severity: ${data.severity}
Previous Score: ${data.previous_score || "N/A"}
Trend: ${data.trend || "Unknown"}
Measurement Date: ${data.measurement_date}
Urgency: ${trigger.urgency}

Generate an action card for this elevated clinical score. Include clinical implications and next steps.`;
    }

    case TriggerEvent.NEW_PATIENT_INTAKE_DUE: {
      const data = trigger.data as NewPatientIntakeData;
      return `${basePrompt}
TRIGGER: New Patient Intake Due
Patient: ${data.patient_name}
Added: ${data.created_at}
Days Since Added: ${data.days_since_added}
Has Scheduled Appointment: ${data.has_scheduled_appointment}
First Appointment: ${data.first_appointment_date || "Not scheduled"}
Urgency: ${trigger.urgency}

Generate an action card for this new patient needing intake. Consider onboarding and first appointment prep.`;
    }

    default:
      return `${basePrompt}
TRIGGER: ${trigger.event}
Patient ID: ${trigger.patient_id}
Data: ${JSON.stringify(trigger.data)}
Urgency: ${trigger.urgency}

Generate an appropriate action card for this clinical trigger.`;
  }
}

/**
 * Generate action from template (fallback when AI fails)
 */
function generateActionFromTemplate(trigger: TriggerContext): GeneratedAction {
  switch (trigger.event) {
    case TriggerEvent.UNSIGNED_NOTE_AGING: {
      const data = trigger.data as UnsignedNoteData;
      const urgencyText = data.hours_since_session >= 72 ? "critical" : data.hours_since_session >= 48 ? "important" : "needed";
      return {
        title: `Unsigned Session Note — ${data.patient_name}`,
        urgency: trigger.urgency,
        confidence: calculateBaseConfidence(trigger),
        time_frame: data.hours_since_session >= 72 ? "Immediate" : "Within 24 hours",
        context: `Session note from ${data.session_date} has been unsigned for ${data.hours_since_session} hours. Timely documentation is ${urgencyText} for clinical continuity and compliance. The ${data.session_type || "therapy"} session requires completion.`,
        suggested_actions: [
          { label: "Sign Note", type: "note_sign" },
          { label: "Open Session", type: "note_create" },
        ],
      };
    }

    case TriggerEvent.APPOINTMENT_MISSED: {
      const data = trigger.data as AppointmentMissedData;
      const pattern = data.no_show_count_30_days > 1 ? "This is part of a pattern with multiple missed appointments." : "";
      return {
        title: `Missed Appointment — ${data.patient_name}`,
        urgency: trigger.urgency,
        confidence: calculateBaseConfidence(trigger),
        time_frame: "Within 24 hours",
        context: `${data.patient_name} missed their ${data.service_type || "therapy"} appointment on ${data.appointment_date}. ${pattern} Follow up to understand barriers and reschedule care.`,
        suggested_actions: [
          { label: "Send Message", type: "message_send" },
          { label: "Reschedule", type: "appointment_reschedule" },
          { label: "Schedule Follow-up", type: "appointment_create" },
        ],
      };
    }

    case TriggerEvent.MEDICATION_REFILL_APPROACHING: {
      const data = trigger.data as MedicationRefillData;
      return {
        title: `Medication Refill Due — ${data.patient_name}`,
        urgency: trigger.urgency,
        confidence: calculateBaseConfidence(trigger),
        time_frame: data.days_until_refill <= 3 ? "Within 24 hours" : "Within 3 days",
        context: `${data.patient_name}'s ${data.medication_name} ${data.dosage} prescription needs refill in ${data.days_until_refill} days (due ${data.refill_date}). Ensure continuity of medication.`,
        suggested_actions: [
          { label: "Authorize Refill", type: "medication_action" },
          { label: "Schedule Follow-up", type: "appointment_create" },
          { label: "Send Patient Message", type: "message_send" },
        ],
      };
    }

    case TriggerEvent.INSURANCE_AUTH_EXPIRING: {
      const data = trigger.data as InsuranceAuthData;
      return {
        title: `Insurance Auth Expiring — ${data.patient_name}`,
        urgency: trigger.urgency,
        confidence: calculateBaseConfidence(trigger),
        time_frame: data.days_until_expiry <= 7 ? "Within 24 hours" : "Within 3 days",
        context: `${data.insurance_provider} authorization for ${data.patient_name} expires on ${data.expiry_date} (${data.days_until_expiry} days). ${data.sessions_remaining} sessions remaining. Initiate reauthorization.`,
        suggested_actions: [
          { label: "Start Reauthorization", type: "insurance_verify" },
          { label: "Update Treatment Plan", type: "treatment_plan_update" },
          { label: "Contact Insurance", type: "message_send" },
        ],
      };
    }

    case TriggerEvent.PATIENT_NOT_SEEN: {
      const data = trigger.data as PatientNotSeenData;
      const riskNote = data.risk_level === "high" ? "This patient is high risk." : "";
      return {
        title: `Patient Not Seen — ${data.patient_name}`,
        urgency: trigger.urgency,
        confidence: calculateBaseConfidence(trigger),
        time_frame: data.days_since_last_visit >= 30 ? "Within 24 hours" : "This week",
        context: `${data.patient_name} hasn't been seen in ${data.days_since_last_visit} days (last visit: ${data.last_appointment_date}). ${riskNote} Reach out to maintain treatment continuity.`,
        suggested_actions: [
          { label: "Send Outreach", type: "message_send" },
          { label: "Schedule Appointment", type: "appointment_create" },
        ],
      };
    }

    case TriggerEvent.OUTCOME_SCORE_ELEVATED: {
      const data = trigger.data as OutcomeScoreData;
      const trendText = data.trend === "worsening" ? "Symptoms are worsening." : data.trend === "improving" ? "Despite improvement, score remains elevated." : "";
      return {
        title: `Elevated ${data.measure_type} — ${data.patient_name}`,
        urgency: trigger.urgency,
        confidence: calculateBaseConfidence(trigger),
        time_frame: trigger.urgency === UrgencyLevel.URGENT ? "Immediate" : "Within 24 hours",
        context: `${data.patient_name}'s ${data.measure_type} score of ${data.score}/${data.max_score} indicates ${data.severity} symptoms (measured ${data.measurement_date}). ${trendText} Clinical review recommended.`,
        suggested_actions: [
          { label: "Review & Document", type: "note_create" },
          { label: "Safety Assessment", type: "assessment_complete" },
          { label: "Schedule Follow-up", type: "appointment_create" },
        ],
      };
    }

    case TriggerEvent.NEW_PATIENT_INTAKE_DUE: {
      const data = trigger.data as NewPatientIntakeData;
      const scheduledText = data.has_scheduled_appointment
        ? `First appointment scheduled for ${data.first_appointment_date}.`
        : "No appointment scheduled yet.";
      return {
        title: `Intake Due — ${data.patient_name}`,
        urgency: trigger.urgency,
        confidence: calculateBaseConfidence(trigger),
        time_frame: "This week",
        context: `New patient ${data.patient_name} was added ${data.days_since_added} days ago and needs intake completion. ${scheduledText}`,
        suggested_actions: [
          { label: "Complete Intake", type: "assessment_complete" },
          { label: "Schedule Session", type: "appointment_create" },
          { label: "Send Welcome Message", type: "message_send" },
        ],
      };
    }

    default:
      return {
        title: `Action Required — ${trigger.event}`,
        urgency: trigger.urgency,
        confidence: 70,
        time_frame: "This week",
        context: `A clinical trigger was detected that requires attention. Review the details and take appropriate action.`,
        suggested_actions: [
          { label: "Review Details", type: "note_create" },
        ],
      };
  }
}

/**
 * Calculate base confidence score for a trigger
 */
function calculateBaseConfidence(trigger: TriggerContext): number {
  // Higher confidence for more urgent and data-rich triggers
  let confidence = 75;

  switch (trigger.urgency) {
    case UrgencyLevel.URGENT:
      confidence += 15;
      break;
    case UrgencyLevel.HIGH:
      confidence += 10;
      break;
    case UrgencyLevel.MEDIUM:
      confidence += 5;
      break;
  }

  // Boost confidence for triggers with specific data
  switch (trigger.event) {
    case TriggerEvent.OUTCOME_SCORE_ELEVATED:
      confidence += 5; // Clinical measures are reliable
      break;
    case TriggerEvent.APPOINTMENT_MISSED:
      confidence += 5; // Concrete event
      break;
    case TriggerEvent.UNSIGNED_NOTE_AGING:
      confidence += 5; // Clear timestamp
      break;
  }

  return Math.min(confidence, 99);
}

/**
 * Convert trigger + generated action to full SubstrateAction
 */
export function toSubstrateAction(
  trigger: TriggerContext,
  action: GeneratedAction,
  practiceId: string
): Omit<SubstrateAction, "id" | "created_at" | "updated_at"> {
  return {
    practice_id: practiceId,
    patient_id: trigger.patient_id,
    trigger_event: trigger.event,
    urgency: action.urgency,
    confidence: action.confidence,
    title: action.title,
    context: action.context,
    time_frame: action.time_frame,
    suggested_actions: action.suggested_actions,
    status: "active",
    source_data: trigger.data,
    generated_at: new Date().toISOString(),
  };
}

/**
 * Clear the action cache (useful for testing or forced refresh)
 */
export function clearActionCache(): void {
  actionCache.clear();
}

/**
 * Get cache stats
 */
export function getActionCacheStats(): { size: number; oldestEntry: number | null } {
  let oldest: number | null = null;
  actionCache.forEach((entry) => {
    if (oldest === null || entry.expires < oldest) {
      oldest = entry.expires;
    }
  });
  return { size: actionCache.size, oldestEntry: oldest };
}
