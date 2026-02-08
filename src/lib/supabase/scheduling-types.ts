/**
 * Scheduling Types (Agent: GAMMA)
 * Separate file to prevent auto-regeneration overwrites
 */

export type AppointmentStatus =
  | "Scheduled"
  | "Confirmed"
  | "Checked-In"
  | "In Session"
  | "Completed"
  | "No-Show"
  | "Cancelled";

export type AppointmentTypeCode =
  | "initial_evaluation"
  | "individual_therapy_30"
  | "individual_therapy_45"
  | "individual_therapy_53"
  | "crisis_session"
  | "medication_management";

export interface AppointmentTypeConfig {
  code: AppointmentTypeCode;
  label: string;
  cptCode: string;
  defaultDuration: number;
}

export const APPOINTMENT_TYPES: AppointmentTypeConfig[] = [
  { code: "initial_evaluation", label: "Initial Evaluation", cptCode: "90791", defaultDuration: 60 },
  { code: "individual_therapy_30", label: "Individual Therapy 30min", cptCode: "90832", defaultDuration: 30 },
  { code: "individual_therapy_45", label: "Individual Therapy 45min", cptCode: "90834", defaultDuration: 45 },
  { code: "individual_therapy_53", label: "Individual Therapy 53min", cptCode: "90837", defaultDuration: 53 },
  { code: "crisis_session", label: "Crisis Session", cptCode: "90839", defaultDuration: 60 },
  { code: "medication_management", label: "Medication Management", cptCode: "99214", defaultDuration: 20 },
];

export const APPOINTMENT_STATUS_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  Scheduled: ["Confirmed", "Cancelled"],
  Confirmed: ["Checked-In", "Cancelled"],
  "Checked-In": ["In Session", "No-Show"],
  "In Session": ["Completed"],
  Completed: [],
  "No-Show": [],
  Cancelled: [],
};

export interface AppointmentReminderInsert {
  practice_id: string;
  appointment_id: string;
  reminder_type: "24h" | "2h" | "custom";
  scheduled_at: string;
  sent_at?: string | null;
  channel?: "email" | "sms" | "push";
  status?: "pending" | "sent" | "failed" | "cancelled";
}
