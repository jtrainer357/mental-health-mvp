/**
 * PATCH /api/appointments/[id]/status - Update appointment status
 * Agent: GAMMA | Feature: Scheduling Production
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { createLogger } from "@/src/lib/logger";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";
import { type AppointmentStatus, APPOINTMENT_STATUS_TRANSITIONS } from "@/src/lib/supabase/scheduling-types";

const log = createLogger("api/appointments/[id]/status");

interface StatusUpdateBody {
  status: AppointmentStatus;
  cancelReason?: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body: StatusUpdateBody = await request.json();
    const practiceId = DEMO_PRACTICE_ID;

    const { status: newStatus, cancelReason } = body;

    if (!newStatus) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const { data: currentAppt, error: fetchError } = await supabase
      .from("appointments")
      .select("status")
      .eq("id", id)
      .eq("practice_id", practiceId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
      }
      log.error("Failed to fetch appointment", fetchError, { id });
      return NextResponse.json({ error: "Failed to fetch appointment" }, { status: 500 });
    }

    const currentStatus = currentAppt.status as AppointmentStatus;

    if (newStatus !== "Cancelled") {
      const allowedTransitions = APPOINTMENT_STATUS_TRANSITIONS[currentStatus] || [];
      if (!allowedTransitions.includes(newStatus)) {
        return NextResponse.json({
          error: "Invalid status transition",
          currentStatus,
          attemptedStatus: newStatus,
          allowedTransitions,
        }, { status: 400 });
      }
    }

    const updateData: Record<string, unknown> = { status: newStatus };

    if (newStatus === "Cancelled") {
      updateData.cancelled_reason = cancelReason || "provider";
      updateData.cancelled_at = new Date().toISOString();

      await supabase
        .from("appointment_reminders")
        .update({ status: "cancelled" })
        .eq("appointment_id", id)
        .eq("status", "pending");
    }

    const { data, error: updateError } = await supabase
      .from("appointments")
      .update(updateData)
      .eq("id", id)
      .eq("practice_id", practiceId)
      .select(`*, patient:patients(id, first_name, last_name, avatar_url, phone_mobile, risk_level, date_of_birth)`)
      .single();

    if (updateError) {
      log.error("Failed to update appointment status", updateError, { id });
      return NextResponse.json({ error: "Failed to update appointment status" }, { status: 500 });
    }

    log.info("Appointment status updated", {
      appointmentId: id,
      fromStatus: currentStatus,
      toStatus: newStatus,
      cancelReason: newStatus === "Cancelled" ? cancelReason : undefined,
    });

    return NextResponse.json({ appointment: data, previousStatus: currentStatus, newStatus });
  } catch (error) {
    log.error("Failed to update appointment status", error as Error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
