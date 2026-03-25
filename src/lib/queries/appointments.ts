/**
 * Appointments Queries
 * Fetches appointment data from Supabase with demo data fallback
 */

import { createClient } from "@/src/lib/supabase/client";
import { createLogger } from "@/src/lib/logger";
import type { Appointment, Patient } from "@/src/lib/supabase/types";
import {
  getDemoToday,
  getDemoDaysFromNow,
  getDemoDaysAgo,
  DEMO_PRACTICE_ID,
} from "@/src/lib/utils/demo-date";
import { getDemoTodayAppointments, getDemoUpcomingAppointments } from "@/src/lib/data/adapter";

const log = createLogger("queries/appointments");

export type AppointmentWithPatient = Appointment & {
  patient: Pick<
    Patient,
    "id" | "first_name" | "last_name" | "avatar_url" | "risk_level" | "date_of_birth"
  >;
};

/**
 * Get today's appointments with patient details
 * Uses demo date (Feb 9, 2026) for consistent demo experience
 * Includes demo appointments for hackathon demonstration
 */
export async function getTodayAppointments(
  practiceId: string = DEMO_PRACTICE_ID
): Promise<AppointmentWithPatient[]> {
  const supabase = createClient();
  const today = getDemoToday();

  // Get demo appointments (always available)
  const demoAppointments = getDemoTodayAppointments();

  try {
    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        *,
        patient:patients(
          id,
          first_name,
          last_name,
          avatar_url,
          risk_level,
          date_of_birth
        )
      `
      )
      .eq("practice_id", practiceId)
      .eq("date", today)
      .order("start_time", { ascending: true });

    if (error) {
      log.warn("Failed to fetch appointments from DB, using demo data only", {
        action: "getTodayAppointments",
      });
      // Return demo appointments on error
      return demoAppointments;
    }

    // Merge database appointments with demo appointments
    const dbAppointments = (data || []) as AppointmentWithPatient[];
    const dbExternalIds = new Set(dbAppointments.map((a) => a.external_id));

    // Add demo appointments that aren't already in the database
    const uniqueDemoAppointments = demoAppointments.filter(
      (da) => !dbExternalIds.has(da.external_id)
    );

    // Combine and sort by start_time
    const allAppointments = [...uniqueDemoAppointments, ...dbAppointments];
    return allAppointments.sort((a, b) => a.start_time.localeCompare(b.start_time));
  } catch {
    // Fallback to demo appointments on any error
    return demoAppointments;
  }
}

/**
 * Get upcoming appointments (next N days from demo date)
 * @param practiceId - The practice ID to filter by
 * @param days - Number of days to look ahead
 * @param statusFilter - Optional status filter. If not provided, returns only "Scheduled" appointments.
 *                       Pass "all" to get appointments of any status.
 */
export async function getUpcomingAppointments(
  practiceId: string = DEMO_PRACTICE_ID,
  days = 7,
  statusFilter: "Scheduled" | "all" = "Scheduled"
): Promise<AppointmentWithPatient[]> {
  const supabase = createClient();
  const today = getDemoToday();
  const endDate = getDemoDaysFromNow(days);

  // Get demo appointments (always available)
  const demoAppointments = getDemoUpcomingAppointments(days);

  try {
    let query = supabase
      .from("appointments")
      .select(
        `
        *,
        patient:patients(
          id,
          first_name,
          last_name,
          avatar_url,
          risk_level,
          date_of_birth
        )
      `
      )
      .eq("practice_id", practiceId)
      .gte("date", today)
      .lte("date", endDate);

    // Only filter by status if not "all"
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      log.warn("Failed to fetch appointments from DB, using demo data only", {
        action: "getUpcomingAppointments",
      });
      // Filter demo appointments by status if needed
      const filteredDemo =
        statusFilter === "all"
          ? demoAppointments
          : demoAppointments.filter((a) => a.status === statusFilter);
      return filteredDemo;
    }

    // Merge database appointments with demo appointments
    const dbAppointments = (data || []) as AppointmentWithPatient[];
    const dbExternalIds = new Set(dbAppointments.map((a) => a.external_id));

    // Add demo appointments that aren't already in the database
    let uniqueDemoAppointments = demoAppointments.filter(
      (da) => !dbExternalIds.has(da.external_id)
    );

    // Filter by status if needed
    if (statusFilter !== "all") {
      uniqueDemoAppointments = uniqueDemoAppointments.filter((a) => a.status === statusFilter);
    }

    // Combine and sort
    const allAppointments = [...uniqueDemoAppointments, ...dbAppointments];
    return allAppointments.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.start_time.localeCompare(b.start_time);
    });
  } catch {
    // Fallback to demo appointments on any error
    const filteredDemo =
      statusFilter === "all"
        ? demoAppointments
        : demoAppointments.filter((a) => a.status === statusFilter);
    return filteredDemo;
  }
}

/**
 * Get recent appointments (past N days from demo date)
 */
export async function getRecentAppointments(
  practiceId: string = DEMO_PRACTICE_ID,
  days = 30
): Promise<AppointmentWithPatient[]> {
  const supabase = createClient();
  const today = getDemoToday();
  const startDate = getDemoDaysAgo(days);

  const { data, error } = await supabase
    .from("appointments")
    .select(
      `
      *,
      patient:patients(
        id,
        first_name,
        last_name,
        avatar_url,
        risk_level,
        date_of_birth
      )
    `
    )
    .eq("practice_id", practiceId)
    .lt("date", today)
    .gte("date", startDate)
    .order("date", { ascending: false })
    .order("start_time", { ascending: false });

  if (error) {
    log.error("Failed to fetch recent appointments", error, {
      action: "getRecentAppointments",
      practiceId,
      days,
    });
    throw error;
  }

  return (data || []) as AppointmentWithPatient[];
}

/**
 * Get appointment statistics
 */
export async function getAppointmentStats(practiceId: string = DEMO_PRACTICE_ID): Promise<{
  todayCount: number;
  completedToday: number;
  scheduledToday: number;
  noShowsThisWeek: number;
  cancelledThisWeek: number;
}> {
  const supabase = createClient();
  const today = getDemoToday();
  const weekStart = getDemoDaysAgo(7);

  // Get today's appointments
  const { data: todayData } = await supabase
    .from("appointments")
    .select("status")
    .eq("practice_id", practiceId)
    .eq("date", today);

  // Get week's no-shows and cancellations
  const { data: weekData } = await supabase
    .from("appointments")
    .select("status")
    .eq("practice_id", practiceId)
    .gte("date", weekStart)
    .lte("date", today)
    .in("status", ["No-Show", "Cancelled"]);

  const todayAppts: { status: string }[] = todayData || [];
  const weekAppts: { status: string }[] = weekData || [];

  return {
    todayCount: todayAppts.length,
    completedToday: todayAppts.filter((a) => a.status === "Completed").length,
    scheduledToday: todayAppts.filter((a) => a.status === "Scheduled").length,
    noShowsThisWeek: weekAppts.filter((a) => a.status === "No-Show").length,
    cancelledThisWeek: weekAppts.filter((a) => a.status === "Cancelled").length,
  };
}

/**
 * Update appointment status
 * @param appointmentId - The appointment's UUID
 * @param status - The new status
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  status: "Scheduled" | "Completed" | "No-Show" | "Cancelled",
  practiceId: string = DEMO_PRACTICE_ID
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", appointmentId)
    .eq("practice_id", practiceId);

  if (error) {
    log.error("Failed to update appointment status", error, {
      action: "updateAppointmentStatus",
      appointmentId,
      status,
    });
    throw error;
  }
}
