/**
 * POST /api/appointments - Create a new appointment
 * GET /api/appointments - List appointments with filters
 * Agent: GAMMA | Feature: Scheduling Production
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { createLogger } from "@/src/lib/logger";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";
import { v4 as uuidv4 } from "uuid";
import { addWeeks, addMonths, parse, format } from "date-fns";
import type { AppointmentReminderInsert } from "@/src/lib/supabase/scheduling-types";

const log = createLogger("api/appointments");

interface CreateAppointmentBody {
  patientId: string;
  date: string;
  startTime: string;
  duration: number;
  appointmentType: string;
  cptCode?: string;
  format: "in_person" | "telehealth";
  room?: string;
  notes?: string;
  recurring?: {
    pattern: "weekly" | "biweekly" | "monthly";
    endDate?: string;
    occurrences?: number;
  };
  skipConflictCheck?: boolean;
}

interface ConflictingAppointment {
  id: string;
  patientName: string;
  date: string;
  startTime: string;
  endTime: string;
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const totalMinutes = (hours ?? 0) * 60 + (minutes ?? 0) + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMins = totalMinutes % 60;
  return `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}:00`;
}

async function checkConflicts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  practiceId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeAppointmentId?: string
): Promise<ConflictingAppointment[]> {
  let query = supabase
    .from("appointments")
    .select(`id, date, start_time, end_time, patient:patients(first_name, last_name)`)
    .eq("practice_id", practiceId)
    .eq("date", date)
    .not("status", "in", '("Cancelled","No-Show")')
    .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`);

  if (excludeAppointmentId) {
    query = query.neq("id", excludeAppointmentId);
  }

  const { data, error } = await query;

  if (error) {
    log.error("Failed to check conflicts", error, { practiceId, date });
    throw error;
  }

  return (data || []).map((appt) => ({
    id: appt.id,
    patientName: appt.patient
      ? `${(appt.patient as { first_name: string }).first_name} ${(appt.patient as { last_name: string }).last_name}`
      : "Unknown",
    date: appt.date,
    startTime: appt.start_time,
    endTime: appt.end_time,
  }));
}

async function createReminders(
  supabase: Awaited<ReturnType<typeof createClient>>,
  practiceId: string,
  appointmentId: string,
  appointmentDate: string,
  appointmentTime: string
): Promise<void> {
  const appointmentDateTime = parse(
    `${appointmentDate} ${appointmentTime}`,
    "yyyy-MM-dd HH:mm:ss",
    new Date()
  );

  const reminder24h = new Date(appointmentDateTime);
  reminder24h.setHours(reminder24h.getHours() - 24);

  const reminder2h = new Date(appointmentDateTime);
  reminder2h.setHours(reminder2h.getHours() - 2);

  const reminders: AppointmentReminderInsert[] = [
    {
      practice_id: practiceId,
      appointment_id: appointmentId,
      reminder_type: "24h",
      scheduled_at: reminder24h.toISOString(),
      channel: "email",
      status: "pending",
    },
    {
      practice_id: practiceId,
      appointment_id: appointmentId,
      reminder_type: "2h",
      scheduled_at: reminder2h.toISOString(),
      channel: "email",
      status: "pending",
    },
  ];

  const { error } = await supabase.from("appointment_reminders").insert(reminders);
  if (error) {
    log.warn("Failed to create reminders", { appointmentId, error: error.message });
  }
}

function generateRecurringDates(
  startDate: string,
  pattern: "weekly" | "biweekly" | "monthly",
  endDate?: string,
  occurrences?: number
): string[] {
  const dates: string[] = [];
  const maxOccurrences = Math.min(occurrences || 52, 52);
  const endDateObj = endDate ? new Date(endDate) : null;
  let currentDate = new Date(startDate);

  for (let i = 0; i < maxOccurrences; i++) {
    if (i > 0) {
      switch (pattern) {
        case "weekly":
          currentDate = addWeeks(currentDate, 1);
          break;
        case "biweekly":
          currentDate = addWeeks(currentDate, 2);
          break;
        case "monthly":
          currentDate = addMonths(currentDate, 1);
          break;
      }
    }
    if (endDateObj && currentDate > endDateObj) break;
    if (i > 0) dates.push(format(currentDate, "yyyy-MM-dd"));
  }
  return dates;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: CreateAppointmentBody = await request.json();
    const practiceId = DEMO_PRACTICE_ID;

    const {
      patientId, date, startTime, duration, appointmentType, cptCode,
      format: appointmentFormat, room, notes, recurring, skipConflictCheck,
    } = body;

    if (!patientId || !date || !startTime || !duration || !appointmentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const startTimeFormatted = startTime.includes(":")
      ? startTime.length === 5 ? `${startTime}:00` : startTime
      : `${startTime}:00:00`;
    const endTime = calculateEndTime(startTimeFormatted, duration);

    if (!skipConflictCheck) {
      const conflicts = await checkConflicts(supabase, practiceId, date, startTimeFormatted, endTime);
      if (conflicts.length > 0) {
        return NextResponse.json({ error: "Conflict detected", conflicts }, { status: 409 });
      }
    }

    const recurringGroupId = recurring ? uuidv4() : null;

    const appointmentData = {
      practice_id: practiceId,
      patient_id: patientId,
      date,
      start_time: startTimeFormatted,
      end_time: endTime,
      duration_minutes: duration,
      status: "Scheduled" as const,
      service_type: appointmentType,
      cpt_code: cptCode || null,
      appointment_type: appointmentType,
      format: appointmentFormat,
      room: room || null,
      notes: notes || null,
      recurring_group_id: recurringGroupId,
      recurring_pattern: recurring?.pattern || null,
    };

    const { data: mainAppointment, error: mainError } = await supabase
      .from("appointments")
      .insert(appointmentData)
      .select()
      .single();

    if (mainError) {
      log.error("Failed to create appointment", mainError, { patientId, date });
      return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
    }

    await createReminders(supabase, practiceId, mainAppointment.id, date, startTimeFormatted);

    const allAppointments = [mainAppointment];
    if (recurring) {
      const futureDates = generateRecurringDates(date, recurring.pattern, recurring.endDate, recurring.occurrences);

      for (const futureDate of futureDates) {
        const futureConflicts = await checkConflicts(supabase, practiceId, futureDate, startTimeFormatted, endTime);
        if (futureConflicts.length > 0) {
          log.warn("Skipping conflicting recurring date", { date: futureDate });
          continue;
        }

        const recurringAppt = { ...appointmentData, date: futureDate };
        const { data: recurringData, error: recurringError } = await supabase
          .from("appointments")
          .insert(recurringAppt)
          .select()
          .single();

        if (recurringError) {
          log.warn("Failed to create recurring appointment", { date: futureDate, error: recurringError.message });
          continue;
        }

        allAppointments.push(recurringData);
        await createReminders(supabase, practiceId, recurringData.id, futureDate, startTimeFormatted);
      }
    }

    log.info("Appointments created", { count: allAppointments.length, mainId: mainAppointment.id, recurring: !!recurring });
    return NextResponse.json({ appointment: mainAppointment, allAppointments, count: allAppointments.length });
  } catch (error) {
    log.error("Failed to create appointment", error as Error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const practiceId = DEMO_PRACTICE_ID;
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const patientId = searchParams.get("patientId");
    const status = searchParams.get("status");

    let query = supabase
      .from("appointments")
      .select(`*, patient:patients(id, first_name, last_name, avatar_url, phone_mobile, risk_level, date_of_birth)`)
      .eq("practice_id", practiceId)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (startDate) query = query.gte("date", startDate);
    if (endDate) query = query.lte("date", endDate);
    if (patientId) query = query.eq("patient_id", patientId);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;

    if (error) {
      log.error("Failed to fetch appointments", error, { practiceId });
      return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
    }

    return NextResponse.json({ appointments: data || [] });
  } catch (error) {
    log.error("Failed to fetch appointments", error as Error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
