/**
 * Session Types and CPT Code Logic
 * @module session/types
 */

// Note types matching database enum
export type NoteType =
  | "progress_note"
  | "initial_evaluation"
  | "treatment_plan"
  | "crisis_note"
  | "discharge_summary"
  | "group_note"
  | "collateral_contact";

// Note status matching database enum
export type NoteStatus = "draft" | "pending_signature" | "signed" | "amended";

// Diagnosis status matching database enum
export type DiagnosisStatus = "active" | "resolved" | "in_remission";

// CPT code structure for billing
export interface CPTCode {
  code: string;
  description: string;
  minMinutes: number;
  maxMinutes: number;
  fee: number;
}

// Standard psychotherapy CPT codes
export const CPT_CODES: CPTCode[] = [
  {
    code: "90832",
    description: "Individual psychotherapy, 16-37 minutes",
    minMinutes: 16,
    maxMinutes: 37,
    fee: 85,
  },
  {
    code: "90834",
    description: "Individual psychotherapy, 38-52 minutes",
    minMinutes: 38,
    maxMinutes: 52,
    fee: 130,
  },
  {
    code: "90837",
    description: "Individual psychotherapy, 53+ minutes",
    minMinutes: 53,
    maxMinutes: 999,
    fee: 175,
  },
  {
    code: "90847",
    description: "Family psychotherapy with patient, 50 minutes",
    minMinutes: 26,
    maxMinutes: 999,
    fee: 150,
  },
  {
    code: "90853",
    description: "Group psychotherapy",
    minMinutes: 45,
    maxMinutes: 999,
    fee: 45,
  },
  {
    code: "90791",
    description: "Psychiatric diagnostic evaluation",
    minMinutes: 45,
    maxMinutes: 999,
    fee: 200,
  },
];

// Initial evaluation CPT codes
export const EVAL_CPT_CODES: CPTCode[] = [
  {
    code: "90791",
    description: "Psychiatric diagnostic evaluation",
    minMinutes: 45,
    maxMinutes: 999,
    fee: 200,
  },
  {
    code: "90792",
    description: "Psychiatric diagnostic evaluation with medical services",
    minMinutes: 45,
    maxMinutes: 999,
    fee: 250,
  },
];

// Crisis CPT codes
export const CRISIS_CPT_CODES: CPTCode[] = [
  {
    code: "90839",
    description: "Psychotherapy for crisis, first 60 minutes",
    minMinutes: 30,
    maxMinutes: 74,
    fee: 200,
  },
  {
    code: "90840",
    description: "Psychotherapy for crisis, each additional 30 minutes",
    minMinutes: 75,
    maxMinutes: 999,
    fee: 100,
  },
];

/**
 * Get suggested CPT code based on session duration and note type
 */
export function getSuggestedCPTCode(
  minutes: number,
  noteType: NoteType = "progress_note"
): CPTCode | null {
  // Select appropriate code set based on note type
  let codes: CPTCode[];

  switch (noteType) {
    case "initial_evaluation":
      codes = EVAL_CPT_CODES;
      break;
    case "crisis_note":
      codes = CRISIS_CPT_CODES;
      break;
    case "group_note":
      return CPT_CODES.find((c) => c.code === "90853") || null;
    default:
      codes = CPT_CODES.filter((c) =>
        ["90832", "90834", "90837"].includes(c.code)
      );
  }

  // Find the matching code for the duration
  return codes.find((c) => minutes >= c.minMinutes && minutes <= c.maxMinutes) || null;
}

/**
 * Get all applicable CPT codes for a note type
 */
export function getApplicableCPTCodes(noteType: NoteType): CPTCode[] {
  switch (noteType) {
    case "initial_evaluation":
      return EVAL_CPT_CODES;
    case "crisis_note":
      return CRISIS_CPT_CODES;
    case "group_note":
      return CPT_CODES.filter((c) => c.code === "90853");
    case "collateral_contact":
      return []; // No billable codes for collateral contacts
    default:
      return CPT_CODES.filter((c) =>
        ["90832", "90834", "90837", "90847"].includes(c.code)
      );
  }
}

/**
 * Check if entry is late (signed after session date)
 */
export function isLateEntry(sessionDate: string, signedAt?: string): boolean {
  if (!signedAt) return false;

  const session = new Date(sessionDate);
  const signed = new Date(signedAt);

  // Set to end of session day
  session.setHours(23, 59, 59, 999);

  // If signed more than 24 hours after session ended
  const hoursDiff = (signed.getTime() - session.getTime()) / (1000 * 60 * 60);
  return hoursDiff > 24;
}

/**
 * Get draft warning level based on days since session
 */
export function getDraftWarningLevel(
  daysSinceSession: number
): "none" | "warning" | "urgent" | "critical" {
  if (daysSinceSession <= 2) return "none";
  if (daysSinceSession <= 5) return "warning";
  if (daysSinceSession <= 7) return "urgent";
  return "critical";
}

/**
 * Calculate days since session
 */
export function getDaysSinceSession(sessionDate: string): number {
  const session = new Date(sessionDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - session.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Session note data structure
export interface SessionNote {
  id: string;
  patientId: string;
  providerId: string;
  sessionDate: string;
  sessionStartTime?: string;
  sessionEndTime?: string;
  durationMinutes?: number;
  noteType: NoteType;
  status: NoteStatus;
  cptCode?: string;
  cptDescription?: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  interventions?: string[];
  riskAssessment?: RiskAssessment;
  signedAt?: string;
  signedBy?: string;
  signatureHash?: string;
  isLateEntry?: boolean;
  lateEntryReason?: string;
  lastAutoSavedAt?: string;
  autoSaveVersion?: number;
  createdAt: string;
  updatedAt: string;
}

// Risk assessment structure
export interface RiskAssessment {
  suicidalIdeation: "none" | "passive" | "active_without_plan" | "active_with_plan";
  homicidalIdeation: "none" | "present";
  selfHarmBehaviors: "none" | "present";
  riskLevel: "low" | "moderate" | "high";
  safetyPlanReviewed: boolean;
  notes?: string;
}

// Addendum structure
export interface SessionAddendum {
  id: string;
  sessionNoteId: string;
  authorId: string;
  content: string;
  reason: string;
  signedAt: string;
  signatureHash?: string;
  createdAt: string;
}

// Patient diagnosis structure
export interface PatientDiagnosis {
  id: string;
  patientId: string;
  icd10Code: string;
  description: string;
  status: DiagnosisStatus;
  isPrimary: boolean;
  onsetDate?: string;
  resolvedDate?: string;
  diagnosedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Patient medication structure
export interface PatientMedication {
  id: string;
  patientId: string;
  medicationName: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  prescriber?: string;
  pharmacy?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  refillsRemaining?: number;
  nextRefillDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Outcome measure types
export type OutcomeMeasureType =
  | "PHQ-9"
  | "GAD-7"
  | "PCL-5"
  | "AUDIT"
  | "DAST-10"
  | "Columbia-CSS";

// Severity bands for outcome measures
export interface SeverityBand {
  min: number;
  max: number;
  label: string;
  color: string;
}

export const SEVERITY_BANDS: Record<OutcomeMeasureType, SeverityBand[]> = {
  "PHQ-9": [
    { min: 0, max: 4, label: "Minimal", color: "green" },
    { min: 5, max: 9, label: "Mild", color: "yellow" },
    { min: 10, max: 14, label: "Moderate", color: "orange" },
    { min: 15, max: 19, label: "Moderately Severe", color: "red" },
    { min: 20, max: 27, label: "Severe", color: "darkred" },
  ],
  "GAD-7": [
    { min: 0, max: 4, label: "Minimal", color: "green" },
    { min: 5, max: 9, label: "Mild", color: "yellow" },
    { min: 10, max: 14, label: "Moderate", color: "orange" },
    { min: 15, max: 21, label: "Severe", color: "red" },
  ],
  "PCL-5": [
    { min: 0, max: 30, label: "Below Threshold", color: "green" },
    { min: 31, max: 32, label: "Provisional", color: "yellow" },
    { min: 33, max: 80, label: "Probable PTSD", color: "red" },
  ],
  AUDIT: [
    { min: 0, max: 7, label: "Low Risk", color: "green" },
    { min: 8, max: 15, label: "Hazardous", color: "yellow" },
    { min: 16, max: 19, label: "Harmful", color: "orange" },
    { min: 20, max: 40, label: "Possible Dependence", color: "red" },
  ],
  "DAST-10": [
    { min: 0, max: 2, label: "Low", color: "green" },
    { min: 3, max: 5, label: "Moderate", color: "yellow" },
    { min: 6, max: 8, label: "Substantial", color: "orange" },
    { min: 9, max: 10, label: "Severe", color: "red" },
  ],
  "Columbia-CSS": [
    { min: 0, max: 0, label: "No Risk", color: "green" },
    { min: 1, max: 2, label: "Low", color: "yellow" },
    { min: 3, max: 4, label: "Moderate", color: "orange" },
    { min: 5, max: 6, label: "High", color: "red" },
  ],
};

/**
 * Get severity band for a score
 */
export function getSeverityBand(
  measureType: OutcomeMeasureType,
  score: number
): SeverityBand | null {
  const bands = SEVERITY_BANDS[measureType];
  return bands.find((b) => score >= b.min && score <= b.max) || null;
}

// Outcome measure score structure
export interface OutcomeMeasureScore {
  id: string;
  patientId: string;
  sessionNoteId?: string;
  measureType: OutcomeMeasureType;
  totalScore: number;
  itemResponses?: Record<string, number>;
  severityBand?: string;
  administeredBy?: string;
  administeredAt: string;
  notes?: string;
  createdAt: string;
}

/**
 * Calculate trend direction from scores
 */
export function calculateTrend(
  scores: number[]
): "improving" | "worsening" | "stable" | null {
  if (scores.length < 2) return null;

  const recent = scores.slice(-3);
  const first = recent[0];
  const last = recent[recent.length - 1];
  const diff = last - first;

  // Threshold for significant change (varies by measure, using 3 as general)
  const threshold = 3;

  if (diff <= -threshold) return "improving";
  if (diff >= threshold) return "worsening";
  return "stable";
}
