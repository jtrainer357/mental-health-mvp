/**
 * PATCH /api/appointments/recurring/[groupId] - Update all future appointments in a recurring series
 * DELETE /api/appointments/recurring/[groupId] - Cancel all future appointments in a recurring series
 * Agent: GAMMA | Feature: Scheduling Production
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { createLogger } from "@/src/lib/logger";
import { DEMO_PRACTICE_ID, getDemoToday } from "@/src/lib/utils/demo-date";

const log = createLogger("api/appointments/recurring/[groupId]");

interface UpdateRecurringBody {
  startTime?: string;
  duration?: number;
  room?: string;
  notes?: string;
  format?: "in_person" | "telehealth";
  fromDate?: string;
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const totalMinutes = (hours ?? 0) * 60 + (minutes ?? 0) + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMins = totalMinutes % 60;
  return `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}:00`;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const supabase = await createClient();
    const body: UpdateRecurringBody = await request.json();
    const practiceId = DEMO_PRACTICE_ID;

    const { startTime, duration, room, notes, format: appointmentFormat, fromDate } = body;
    const today = fromDate || getDemoToday();

    const { data: appointments, error: fetchError } = await supabase
      .from("appointments")
      .select("id, start_time, duration_minutes")
      .eq("practice_id", practiceId)
      .eq("recurring_group_id", groupId)
      .gte("date", today)
      .not("status", "in", '("Cancelled","Completed","No-Show")');

    if (fetchError) {
      log.error("Failed to fetch recurring appointments", fetchError, { groupId });
      return NextResponse.json({ error: "Failed to fetch recurring appointments" }, { status: 500 });
    }

    if (!appointments || appointments.length === 0) {
      return NextResponse.json({ error: "No future appointments found in this series" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (room !== undefined) updateData.room = room;
    if (notes !== undefined) updateData.notes = notes;
    if (appointmentFormat) updateData.format = appointmentFormat;

    if (startTime || duration) {
      const firstAppt = appointments[0];
      if (!firstAppt) {
        return NextResponse.json({ error: "No appointments to update" }, { status: 404 });
      }
      const newStartTime = startTime ? (startTime.length === 5 ? `${startTime}:00` : startTime) : firstAppt.start_time;
      const newDuration = duration || firstAppt.duration_minutes;

      updateData.start_time = newStartTime;
      updateData.duration_minutes = newDuration;
      updateData.end_time = calculateEndTime(newStartTime as string, newDuration);
    }

    const { error: updateError } = await supabase
      .from("appointments")
      .update(updateData)
      .eq("practice_id", practiceId)
      .eq("recurring_group_id", groupId)
      .gte("date", today)
      .not("status", "in", '("Cancelled","Completed","No-Show")');

    if (updateError) {
      log.error("Failed to update recurring appointments", updateError, { groupId });
      return NextResponse.json({ error: "Failed to update recurring appointments" }, { status: 500 });
    }

    log.info("Recurring appointments updated", { groupId, count: appointments.length, updates: Object.keys(updateData) });
    return NextResponse.json({ updated: appointments.length, groupId });
  } catch (error) {
    log.error("Failed to update recurring appointments", error as Error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const supabase = await createClient();
    const practiceId = DEMO_PRACTICE_ID;
    const { searchParams } = new URL(request.url);
    const reason = searchParams.get("reason") || "provider";
    const fromDate = searchParams.get("fromDate") || getDemoToday();

    const { data: appointments } = await supabase
      .from("appointments")
      .select("id")
      .eq("practice_id", practiceId)
      .eq("recurring_group_id", groupId)
      .gte("date", fromDate)
      .not("status", "in", '("Cancelled","Completed","No-Show")');

    if (!appointments || appointments.length === 0) {
      return NextResponse.json({ error: "No future appointments found in this series" }, { status: 404 });
    }

    const appointmentIds = appointments.map((a) => a.id);

    const { error: updateError } = await supabase
      .from("appointments")
      .update({ status: "Cancelled", cancelled_reason: reason, cancelled_at: new Date().toISOString() })
      .eq("practice_id", practiceId)
      .eq("recurring_group_id", groupId)
      .gte("date", fromDate)
      .not("status", "in", '("Cancelled","Completed","No-Show")');

    if (updateError) {
      log.error("Failed to cancel recurring appointments", updateError, { groupId });
      return NextResponse.json({ error: "Failed to cancel recurring appointments" }, { status: 500 });
    }

    await supabase
      .from("appointment_reminders")
      .update({ status: "cancelled" })
      .in("appointment_id", appointmentIds)
      .eq("status", "pending");

    log.info("Recurring appointments cancelled", { groupId, count: appointmentIds.length, reason });
    return NextResponse.json({ cancelled: appointmentIds.length, groupId });
  } catch (error) {
    log.error("Failed to cancel recurring appointments", error as Error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
