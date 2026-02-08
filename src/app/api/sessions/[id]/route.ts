import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/sessions/[id] - Get a single session note
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("session_notes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching session:", error);
      return NextResponse.json(
        { error: "Failed to fetch session" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: data.id,
      patientId: data.patient_id,
      providerId: data.provider_id,
      sessionDate: data.session_date,
      sessionStartTime: data.session_start_time,
      sessionEndTime: data.session_end_time,
      durationMinutes: data.duration_minutes,
      noteType: data.note_type,
      status: data.status,
      cptCode: data.cpt_code,
      cptDescription: data.cpt_description,
      subjective: data.subjective,
      objective: data.objective,
      assessment: data.assessment,
      plan: data.plan,
      interventions: data.interventions,
      riskAssessment: data.risk_assessment,
      signedAt: data.signed_at,
      signedBy: data.signed_by,
      signatureHash: data.signature_hash,
      isLateEntry: data.is_late_entry,
      lateEntryReason: data.late_entry_reason,
      lastAutoSavedAt: data.last_auto_saved_at,
      autoSaveVersion: data.auto_save_version,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  } catch (error) {
    console.error("Session GET API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/sessions/[id] - Update a session note
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if note exists and is owned by user
    const { data: existing } = await supabase
      .from("session_notes")
      .select("status, provider_id")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (existing.provider_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only allow updates to draft notes
    if (existing.status !== "draft") {
      return NextResponse.json(
        { error: "Cannot update signed notes" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (body.sessionDate !== undefined) updateData.session_date = body.sessionDate;
    if (body.sessionStartTime !== undefined)
      updateData.session_start_time = body.sessionStartTime;
    if (body.sessionEndTime !== undefined)
      updateData.session_end_time = body.sessionEndTime;
    if (body.durationMinutes !== undefined)
      updateData.duration_minutes = body.durationMinutes;
    if (body.noteType !== undefined) updateData.note_type = body.noteType;
    if (body.cptCode !== undefined) updateData.cpt_code = body.cptCode;
    if (body.cptDescription !== undefined)
      updateData.cpt_description = body.cptDescription;
    if (body.subjective !== undefined) updateData.subjective = body.subjective;
    if (body.objective !== undefined) updateData.objective = body.objective;
    if (body.assessment !== undefined) updateData.assessment = body.assessment;
    if (body.plan !== undefined) updateData.plan = body.plan;
    if (body.interventions !== undefined)
      updateData.interventions = body.interventions;
    if (body.riskAssessment !== undefined)
      updateData.risk_assessment = body.riskAssessment;

    // Update auto-save tracking
    updateData.last_auto_saved_at = new Date().toISOString();
    updateData.auto_save_version = (existing as { auto_save_version?: number }).auto_save_version
      ? (existing as { auto_save_version: number }).auto_save_version + 1
      : 1;

    const { data, error } = await supabase
      .from("session_notes")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating session:", error);
      return NextResponse.json(
        { error: "Failed to update session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: data.id,
      patientId: data.patient_id,
      providerId: data.provider_id,
      sessionDate: data.session_date,
      noteType: data.note_type,
      status: data.status,
      lastAutoSavedAt: data.last_auto_saved_at,
      autoSaveVersion: data.auto_save_version,
      updatedAt: data.updated_at,
    });
  } catch (error) {
    console.error("Session PATCH API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
