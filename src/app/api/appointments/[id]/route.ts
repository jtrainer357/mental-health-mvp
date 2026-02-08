/**
 * GET /api/appointments/[id] - Get a single appointment
 * PATCH /api/appointments/[id] - Update an appointment (reschedule)
 * DELETE /api/appointments/[id] - Cancel an appointment
 * Agent: GAMMA | Feature: Scheduling Production
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { createLogger } from "@/src/lib/logger";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";

const log = createLogger("api/appointments/[id]");

interface UpdateAppointmentBody {
  date?: string;
  startTime?: string;
  duration?: number;
  room?: string;
  notes?: string;
  format?: "in_person" | "telehealth";
  skipConflictCheck?: boolean;
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const totalMinutes = (hours ?? 0) * 60 + (minutes ?? 0) + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMins = totalMinutes % 60;
  return `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}:00`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const practiceId = DEMO_PRACTICE_ID;

    const { data, error } = await supabase
      .from("appointments")
      .select(`*, patient:patients(id, first_name, last_name, avatar_url, phone_mobile, email, risk_level, date_of_birth, primary_diagnosis_name)`)
      .eq("id", id)
      .eq("practice_id", practiceId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
      }
      log.error("Failed to fetch appointment", error, { id });
      return NextResponse.json({ error: "Failed to fetch appointment" }, { status: 500 });
    }

    return NextResponse.json({ appointment: data });
  } catch (error) {
    log.error("Failed to fetch appointment", error as Error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body: UpdateAppointmentBody = await request.json();
    const practiceId = DEMO_PRACTICE_ID;

    const { date, startTime, duration, room, notes, format: appointmentFormat, skipConflictCheck } = body;

    const updateData: Record<string, unknown> = {};

    if (date) updateData.date = date;
    if (room !== undefined) updateData.room = room;
    if (notes !== undefined) updateData.notes = notes;
    if (appointmentFormat) updateData.format = appointmentFormat;

    if (startTime || duration) {
      const { data: currentAppt } = await supabase
        .from("appointments")
        .select("start_time, duration_minutes, date")
        .eq("id", id)
        .single();

      const newStartTime = startTime ? (startTime.length === 5 ? `${startTime}:00` : startTime) : currentAppt?.start_time;
      const newDuration = duration || currentAppt?.duration_minutes || 60;

      updateData.start_time = newStartTime;
      updateData.duration_minutes = newDuration;
      updateData.end_time = calculateEndTime(newStartTime as string, newDuration);

      if (!skipConflictCheck && (startTime || date)) {
        const targetDate = date || currentAppt?.date;

        const { data: conflicts } = await supabase
          .from("appointments")
          .select(`id, date, start_time, end_time, patient:patients(first_name, last_name)`)
          .eq("practice_id", practiceId)
          .eq("date", targetDate as string)
          .neq("id", id)
          .not("status", "in", '("Cancelled","No-Show")')
          .or(`and(start_time.lt.${updateData.end_time},end_time.gt.${updateData.start_time})`);

        if (conflicts && conflicts.length > 0) {
          return NextResponse.json({
            error: "Conflict detected",
            conflicts: conflicts.map((c) => ({
              id: c.id,
              patientName: c.patient ? `${(c.patient as { first_name: string }).first_name} ${(c.patient as { last_name: string }).last_name}` : "Unknown",
              date: c.date,
              startTime: c.start_time,
              endTime: c.end_time,
            })),
          }, { status: 409 });
        }
      }
    }

    const { data, error } = await supabase
      .from("appointments")
      .update(updateData)
      .eq("id", id)
      .eq("practice_id", practiceId)
      .select(`*, patient:patients(id, first_name, last_name, avatar_url, phone_mobile, risk_level, date_of_birth)`)
      .single();

    if (error) {
      log.error("Failed to update appointment", error, { id });
      return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
    }

    log.info("Appointment updated", { id, updates: Object.keys(updateData) });
    return NextResponse.json({ appointment: data });
  } catch (error) {
    log.error("Failed to update appointment", error as Error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const practiceId = DEMO_PRACTICE_ID;
    const { searchParams } = new URL(request.url);
    const reason = searchParams.get("reason") || "provider";

    const { data, error } = await supabase
      .from("appointments")
      .update({ status: "Cancelled", cancelled_reason: reason, cancelled_at: new Date().toISOString() })
      .eq("id", id)
      .eq("practice_id", practiceId)
      .select()
      .single();

    if (error) {
      log.error("Failed to cancel appointment", error, { id });
      return NextResponse.json({ error: "Failed to cancel appointment" }, { status: 500 });
    }

    await supabase
      .from("appointment_reminders")
      .update({ status: "cancelled" })
      .eq("appointment_id", id)
      .eq("status", "pending");

    log.info("Appointment cancelled", { id, reason });
    return NextResponse.json({ appointment: data });
  } catch (error) {
    log.error("Failed to cancel appointment", error as Error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
