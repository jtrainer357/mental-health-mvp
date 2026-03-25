/**
 * Practice Queries
 * Fetches practice data and dashboard stats from Supabase
 */

import { createClient } from "@/src/lib/supabase/client";
import { createLogger } from "@/src/lib/logger";
import type { Practice } from "@/src/lib/supabase/types";
import { getDemoToday, DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";
import { getDemoTodayAppointments, getDemoPatients } from "@/src/lib/data/adapter";

const log = createLogger("queries/practice");

/**
 * Get the demo practice (first practice in the database)
 */
export async function getDemoPractice(): Promise<Practice | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("practices")
    .select("*")
    .eq("id", DEMO_PRACTICE_ID)
    .single();

  if (error) {
    log.error("Failed to fetch demo practice", error, { action: "getDemoPractice" });
    return null;
  }

  return data;
}

/**
 * Get practice ID for queries
 */
export async function getPracticeId(): Promise<string> {
  return DEMO_PRACTICE_ID;
}

/**
 * Get dashboard statistics for a practice
 * Includes demo data for hackathon demonstration
 */
export async function getDashboardStats(practiceId: string = DEMO_PRACTICE_ID): Promise<{
  patientCount: number;
  activePatientCount: number;
  highRiskCount: number;
  todayAppointmentCount: number;
  unreadMessageCount: number;
  pendingActionCount: number;
  outstandingBalance: number;
}> {
  const supabase = createClient();
  const today = getDemoToday();

  // Get demo data (always available)
  const demoPatients = getDemoPatients();
  const demoTodayAppointments = getDemoTodayAppointments();

  // Run all queries in parallel
  const [patientsResult, todayApptsResult, messagesResult, actionsResult, invoicesResult] =
    await Promise.all([
      // Patient counts
      supabase.from("patients").select("status, risk_level").eq("practice_id", practiceId),

      // Today's appointments
      supabase.from("appointments").select("id").eq("practice_id", practiceId).eq("date", today),

      // Unread messages (try communications table which is what demo uses)
      supabase
        .from("communications")
        .select("id")
        .eq("practice_id", practiceId)
        .eq("direction", "inbound")
        .eq("is_read", false),

      // Pending actions (use prioritized_actions table)
      supabase
        .from("prioritized_actions")
        .select("id")
        .eq("practice_id", practiceId)
        .or("status.eq.pending,status.is.null"),

      // Outstanding balance
      supabase.from("invoices").select("balance").eq("practice_id", practiceId).gt("balance", 0),
    ]);

  type PatientStatus = { status: string | null; risk_level: string | null };
  type InvoiceBalance = { balance: number | null };

  const dbPatients = (patientsResult.data || []) as PatientStatus[];
  const dbTodayAppts = todayApptsResult.data || [];
  const messages = messagesResult.data || [];
  const actions = actionsResult.data || [];
  const invoices = (invoicesResult.data || []) as InvoiceBalance[];

  // Combine DB + demo counts (avoid double-counting by using demo as base)
  const totalPatients = Math.max(dbPatients.length, demoPatients.length);
  const activePatients = Math.max(
    dbPatients.filter((p: PatientStatus) => p.status === "Active").length,
    demoPatients.filter((p) => p.status === "Active").length
  );
  const highRiskPatients = Math.max(
    dbPatients.filter((p: PatientStatus) => p.risk_level === "high").length,
    demoPatients.filter((p) => p.risk_level === "high").length
  );
  const todayApptCount = Math.max(dbTodayAppts.length, demoTodayAppointments.length);

  return {
    patientCount: totalPatients,
    activePatientCount: activePatients,
    highRiskCount: highRiskPatients,
    todayAppointmentCount: todayApptCount,
    unreadMessageCount: messages.length,
    pendingActionCount: actions.length,
    outstandingBalance: invoices.reduce(
      (sum: number, inv: InvoiceBalance) => sum + (inv.balance || 0),
      0
    ),
  };
}

/**
 * Check if the database has been populated (import has run) or demo data is available
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function isDatabasePopulated(practiceId: string = DEMO_PRACTICE_ID): Promise<boolean> {
  // For demo practice, always return true since synthetic demo data is available
  if (practiceId === DEMO_PRACTICE_ID) {
    return true;
  }

  const supabase = createClient();

  const { count, error } = await supabase
    .from("patients")
    .select("*", { count: "exact", head: true })
    .eq("practice_id", practiceId);

  if (error) {
    log.error("Failed to check database population", error, {
      action: "isDatabasePopulated",
      practiceId,
    });
    return false;
  }

  return (count || 0) > 0;
}

/**
 * Get recent AI analysis runs
 */
export async function getRecentAnalysisRuns(
  practiceId: string,
  limit = 5
): Promise<
  Array<{
    id: string;
    batch_id: string;
    patients_analyzed: number;
    actions_generated: number;
    duration_seconds: number;
    completed_at: string;
  }>
> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("ai_analysis_runs")
    .select("id, batch_id, patients_analyzed, actions_generated, duration_seconds, completed_at")
    .eq("practice_id", practiceId)
    .order("completed_at", { ascending: false })
    .limit(limit);

  if (error) {
    log.error("Failed to fetch analysis runs", error, {
      action: "getRecentAnalysisRuns",
      practiceId,
    });
    return [];
  }

  return data || [];
}
