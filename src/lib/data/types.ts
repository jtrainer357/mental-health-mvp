/**
 * Unified Data Types — Single source of truth for all demo data
 * These types are the canonical seed data format.
 * The adapter layer converts them to Supabase DB types.
 */

// ============================================================================
// PATIENT
// ============================================================================

export interface SeedPatient {
  id: string;
  client_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string; // YYYY-MM-DD
  gender: "M" | "F" | "Non-binary";
  email: string;
  phone_mobile: string;
  phone_home?: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  // Payment — cash or Stripe only (no insurance)
  payment_type: "cash" | "stripe";
  stripe_customer_id?: string;
  // Clinical
  primary_diagnosis_code: string;
  primary_diagnosis_name: string;
  secondary_diagnosis_code?: string;
  secondary_diagnosis_name?: string;
  risk_level: "low" | "medium" | "high";
  treatment_start_date: string;
  medications: string[];
  // Meta
  provider: string;
  status: "Active" | "Inactive";
  avatar_url: string; // "/avatars/f-01.jpg" or "" for initials
  date_created: string;
  // Schedule context
  preferred_day: number; // 0=Sun..6=Sat — used to generate weekly appointment cadence
  preferred_time: string; // HH:MM 24h — usual appointment slot
  session_duration: number; // minutes (45 or 60)
  cpt_code: string; // "90834" | "90837" | "90791"
}

// ============================================================================
// APPOINTMENT
// ============================================================================

export interface SeedAppointment {
  id: string;
  patient_id: string;
  patient_name: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM 24h
  end_time: string; // HH:MM 24h
  duration_minutes: number;
  status: "Completed" | "Scheduled" | "No-Show" | "Cancelled";
  service_type: string;
  cpt_code: string;
  location: string;
  notes?: string;
}

// ============================================================================
// SESSION NOTE (SOAP)
// ============================================================================

export interface SeedSessionNote {
  id: string;
  patient_id: string;
  appointment_id: string;
  date_of_service: string;
  note_type: "progress_note" | "initial_evaluation";
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  cpt_code: string;
  duration_minutes: number;
  signed_at: string;
  signed_by: string;
  status: "signed" | "draft";
}

// ============================================================================
// INVOICE / BILLING
// ============================================================================

export interface SeedInvoice {
  id: string;
  patient_id: string;
  patient_name: string;
  appointment_id: string;
  date_of_service: string;
  cpt_code: string;
  charge_amount: number;
  insurance_paid: number; // always 0 — kept for DB compat
  patient_responsibility: number;
  patient_paid: number;
  balance: number;
  status: "Paid" | "Pending" | "Partial" | "Cancelled";
  payment_method: "cash" | "stripe";
}

// ============================================================================
// OUTCOME MEASURE
// ============================================================================

export interface SeedOutcomeMeasure {
  id: string;
  patient_id: string;
  measure_type: "PHQ-9" | "GAD-7" | "PCL-5";
  score: number;
  max_score: number;
  measurement_date: string;
  administered_by: string;
}

// ============================================================================
// MESSAGE
// ============================================================================

export interface SeedMessage {
  id: string;
  patient_id: string;
  direction: "inbound" | "outbound";
  channel: "sms" | "email" | "portal";
  content: string;
  timestamp: string;
  read: boolean;
}

// ============================================================================
// PRIORITY ACTION (Substrate-surfaced)
// ============================================================================

export interface SeedPriorityAction {
  id: string;
  patient_id: string;
  practice_id: string;
  title: string;
  description: string;
  urgency: "urgent" | "high" | "medium" | "low";
  timeframe: string;
  confidence_score: number;
  clinical_context: string;
  suggested_actions: string[];
  status: "pending" | "completed" | "dismissed";
  created_at: string;
}

// ============================================================================
// CPT PRICING
// ============================================================================

export const CPT_PRICES: Record<string, number> = {
  "90837": 180, // 60 min individual
  "90834": 150, // 45 min individual
  "90791": 200, // Initial evaluation
  "90839": 200, // Crisis session
};
