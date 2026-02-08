/**
 * Patient Status API Route
 * PATCH /api/patients/[id]/status - Update patient status
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logAudit } from "@/src/lib/audit";
import { logger } from "@/src/lib/logger";
import type { Database } from "@/src/lib/supabase/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const VALID_STATUSES = ["Active", "Inactive", "Discharged"] as const;
type PatientStatus = (typeof VALID_STATUSES)[number];

interface UpdateStatusData {
  status: PatientStatus;
  reason?: string;
  practiceId: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as UpdateStatusData;

    if (!body.practiceId) {
      return NextResponse.json({ error: "Practice ID is required" }, { status: 400 });
    }

    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: Active, Inactive, Discharged" },
        { status: 400 }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      logger.error("[API] Supabase not configured");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { data: currentPatient } = await supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .eq("practice_id", body.practiceId)
      .single();

    if (!currentPatient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const { data: patient, error } = await supabase
      .from("patients")
      .update({
        status: body.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("practice_id", body.practiceId)
      .select()
      .single();

    if (error) {
      logger.error("[API] Failed to update patient status", { error: error.message });
      return NextResponse.json({ error: "Failed to update patient status" }, { status: 500 });
    }

    await logAudit({
      action: "update",
      resourceType: "patient",
      resourceId: id,
      practiceId: body.practiceId,
      details: {
        statusChange: {
          from: currentPatient.status,
          to: body.status,
          reason: body.reason || null,
        },
      },
      oldValues: { status: currentPatient.status },
      newValues: { status: body.status },
      isPhiAccess: true,
    });

    logger.info("[API] Patient status updated", {
      patientId: id,
      oldStatus: currentPatient.status,
      newStatus: body.status,
    });

    return NextResponse.json({ patient });
  } catch (error) {
    logger.error("[API] Error updating patient status", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
