/**
 * Patients Queries
 * Fetches patient data from Supabase with demo data fallback
 */

import { createClient } from "@/src/lib/supabase/client";
import { createLogger } from "@/src/lib/logger";
import type {
  Patient,
  Appointment,
  OutcomeMeasure,
  Invoice,
  Review,
  Message,
  VisitSummary,
} from "@/src/lib/supabase/types";

// Alias Message as Communication for backwards compatibility
export type Communication = Message;
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";
import {
  getDemoPatients,
  getDemoPatientByUUID,
  getDemoPatientAppointments,
  getDemoPatientOutcomeMeasures,
  getDemoPatientMessages,
  getDemoPatientInvoices,
  isDemoPatientUUID,
  getExternalIdFromUUID,
} from "@/src/lib/data/adapter";

const log = createLogger("queries/patients");

// Communication type is aliased above for backwards compatibility

/**
 * Get all patients for a practice
 * Includes demo patients for hackathon demonstration
 */
export async function getPatients(practiceId: string = DEMO_PRACTICE_ID): Promise<Patient[]> {
  const supabase = createClient();

  // Get demo patients (always available for demo)
  const demoPatients = getDemoPatients();

  try {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .eq("practice_id", practiceId)
      .eq("status", "Active")
      .order("last_name", { ascending: true })
      .order("first_name", { ascending: true });

    if (error) {
      log.warn("Failed to fetch patients from DB, using demo data only", { action: "getPatients" });
      // Return demo patients on error
      return demoPatients.sort((a, b) => {
        const lastNameCompare = a.last_name.localeCompare(b.last_name);
        if (lastNameCompare !== 0) return lastNameCompare;
        return a.first_name.localeCompare(b.first_name);
      });
    }

    // Merge database patients with demo patients (demo patients prioritized)
    const dbPatients = data || [];
    const dbExternalIds = new Set(dbPatients.map((p) => p.external_id));

    // Add demo patients that aren't already in the database
    const uniqueDemoPatients = demoPatients.filter((dp) => !dbExternalIds.has(dp.external_id));

    // Combine: all unique patients
    const allPatients = [...uniqueDemoPatients, ...dbPatients];

    return allPatients.sort((a, b) => {
      const lastNameCompare = a.last_name.localeCompare(b.last_name);
      if (lastNameCompare !== 0) return lastNameCompare;
      return a.first_name.localeCompare(b.first_name);
    });
  } catch {
    // Fallback to demo patients on any error
    return demoPatients.sort((a, b) => {
      const lastNameCompare = a.last_name.localeCompare(b.last_name);
      if (lastNameCompare !== 0) return lastNameCompare;
      return a.first_name.localeCompare(b.first_name);
    });
  }
}

/**
 * Get a single patient by ID
 * Checks demo patients first, then database
 * @param patientId - The patient's UUID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function getPatientById(
  patientId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<Patient | null> {
  // Check if it's a demo patient first
  const demoPatient = getDemoPatientByUUID(patientId);
  if (demoPatient) {
    return demoPatient;
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", patientId)
    .eq("practice_id", practiceId)
    .single();

  if (error) {
    log.warn("Failed to fetch patient from DB", { action: "getPatientById", patientId });
    return null;
  }

  return data;
}

/**
 * Get a patient by external_id (from synthetic data)
 * @param externalId - The external patient ID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function getPatientByExternalId(
  externalId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<Patient | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("external_id", externalId)
    .eq("practice_id", practiceId)
    .single();

  if (error) {
    log.error("Failed to fetch patient by external ID", error, {
      action: "getPatientByExternalId",
      externalId,
    });
    return null;
  }

  return data;
}

/**
 * Get patient appointments
 * @param patientId - The patient's UUID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function getPatientAppointments(
  patientId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<Appointment[]> {
  // Check if it's a demo patient - use synthetic data
  if (isDemoPatientUUID(patientId)) {
    const externalId = getExternalIdFromUUID(patientId);
    if (externalId) {
      return getDemoPatientAppointments(externalId);
    }
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("patient_id", patientId)
    .eq("practice_id", practiceId)
    .order("date", { ascending: false })
    .order("start_time", { ascending: false });

  if (error) {
    log.error("Failed to fetch patient appointments", error, {
      action: "getPatientAppointments",
      patientId,
    });
    return [];
  }

  return data || [];
}

/**
 * Get patient outcome measures
 * @param patientId - The patient's UUID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function getPatientOutcomeMeasures(
  patientId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<OutcomeMeasure[]> {
  // Check if it's a demo patient - use synthetic data
  if (isDemoPatientUUID(patientId)) {
    const externalId = getExternalIdFromUUID(patientId);
    if (externalId) {
      return getDemoPatientOutcomeMeasures(externalId);
    }
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("outcome_measures")
    .select("*")
    .eq("patient_id", patientId)
    .eq("practice_id", practiceId)
    .order("measurement_date", { ascending: false });

  if (error) {
    log.error("Failed to fetch patient outcome measures", error, {
      action: "getPatientOutcomeMeasures",
      patientId,
    });
    return [];
  }

  return data || [];
}

/**
 * Get patient communications/messages
 * @param patientId - The patient's UUID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function getPatientMessages(
  patientId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<Communication[]> {
  // Check if it's a demo patient - use synthetic data
  if (isDemoPatientUUID(patientId)) {
    const externalId = getExternalIdFromUUID(patientId);
    if (externalId) {
      return getDemoPatientMessages(externalId) as Communication[];
    }
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("patient_id", patientId)
    .eq("practice_id", practiceId)
    .order("timestamp", { ascending: false })
    .limit(50);

  if (error) {
    log.warn("Failed to fetch patient messages", {
      action: "getPatientMessages",
      patientId,
    });
    // Return empty array instead of throwing - graceful degradation
    return [];
  }

  return (data || []) as Communication[];
}

/**
 * Get patient invoices
 * @param patientId - The patient's UUID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function getPatientInvoices(
  patientId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<Invoice[]> {
  // Check if it's a demo patient - use synthetic data
  if (isDemoPatientUUID(patientId)) {
    const externalId = getExternalIdFromUUID(patientId);
    if (externalId) {
      return getDemoPatientInvoices(externalId);
    }
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("patient_id", patientId)
    .eq("practice_id", practiceId)
    .order("date_of_service", { ascending: false });

  if (error) {
    log.error("Failed to fetch patient invoices", error, {
      action: "getPatientInvoices",
      patientId,
    });
    return [];
  }

  return data || [];
}

/**
 * Get patient reviews
 * Returns empty array if table doesn't exist or query fails (graceful degradation)
 * @param patientId - The patient's UUID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function getPatientReviews(
  patientId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<Review[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("patient_id", patientId)
      .eq("practice_id", practiceId)
      .order("review_date", { ascending: false });

    if (error) {
      // Table might not exist yet - return empty array gracefully
      log.warn("Reviews query failed (table may not exist)", {
        action: "getPatientReviews",
        patientId,
        errorMessage: error.message,
      });
      return [];
    }

    return data || [];
  } catch {
    // Graceful fallback if table doesn't exist
    return [];
  }
}

/**
 * Get complete patient details with all related data
 */
export async function getPatientDetails(patientId: string): Promise<{
  patient: Patient;
  appointments: Appointment[];
  outcomeMeasures: OutcomeMeasure[];
  messages: Communication[];
  invoices: Invoice[];
  reviews: Review[];
} | null> {
  const patient = await getPatientById(patientId);
  if (!patient) return null;

  const [appointments, outcomeMeasures, messages, invoices, reviews] = await Promise.all([
    getPatientAppointments(patientId),
    getPatientOutcomeMeasures(patientId),
    getPatientMessages(patientId),
    getPatientInvoices(patientId),
    getPatientReviews(patientId),
  ]);

  return {
    patient,
    appointments,
    outcomeMeasures,
    messages,
    invoices,
    reviews,
  };
}

/**
 * Search patients by name
 */
export async function searchPatients(
  query: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<Patient[]> {
  const supabase = createClient();

  // Use ilike for case-insensitive search
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("practice_id", practiceId)
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
    .eq("status", "Active")
    .order("last_name", { ascending: true })
    .limit(20);

  if (error) {
    log.error("Failed to search patients", error, { action: "searchPatients", query });
    throw error;
  }

  return data || [];
}

/**
 * Get high-risk patients
 */
export async function getHighRiskPatients(
  practiceId: string = DEMO_PRACTICE_ID
): Promise<Patient[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("practice_id", practiceId)
    .eq("risk_level", "high")
    .eq("status", "Active")
    .order("last_name", { ascending: true });

  if (error) {
    log.error("Failed to fetch high-risk patients", error, { action: "getHighRiskPatients" });
    throw error;
  }

  return data || [];
}

// Re-export VisitSummary type for backwards compatibility
export type { VisitSummary };

/**
 * Get patient visit summaries for recent activity
 * NOTE: visit_summaries table doesn't exist yet - returns empty array
 * TODO(S2): Create visit_summaries table or derive from appointments/session_notes
 * @param patientId - The patient's UUID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function getPatientVisitSummaries(
  _patientId: string,
  _practiceId: string = DEMO_PRACTICE_ID
): Promise<VisitSummary[]> {
  // visit_summaries table doesn't exist yet - return empty array
  // Future: derive from appointments or create the table
  return [];
}
