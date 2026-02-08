import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/sessions - List session notes
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const patientId = searchParams.get("patientId");
    const status = searchParams.get("status");
    const noteType = searchParams.get("noteType");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query = supabase
      .from("session_notes")
      .select("*")
      .order("session_date", { ascending: false });

    if (patientId) {
      query = query.eq("patient_id", patientId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (noteType) {
      query = query.eq("note_type", noteType);
    }

    if (startDate) {
      query = query.gte("session_date", startDate);
    }

    if (endDate) {
      query = query.lte("session_date", endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching sessions:", error);
      return NextResponse.json(
        { error: "Failed to fetch sessions" },
        { status: 500 }
      );
    }

    // Transform snake_case to camelCase
    const sessions = data.map((session) => ({
      id: session.id,
      patientId: session.patient_id,
      providerId: session.provider_id,
      sessionDate: session.session_date,
      sessionStartTime: session.session_start_time,
      sessionEndTime: session.session_end_time,
      durationMinutes: session.duration_minutes,
      noteType: session.note_type,
      status: session.status,
      cptCode: session.cpt_code,
      cptDescription: session.cpt_description,
      subjective: session.subjective,
      objective: session.objective,
      assessment: session.assessment,
      plan: session.plan,
      interventions: session.interventions,
      riskAssessment: session.risk_assessment,
      signedAt: session.signed_at,
      signedBy: session.signed_by,
      signatureHash: session.signature_hash,
      isLateEntry: session.is_late_entry,
      lateEntryReason: session.late_entry_reason,
      lastAutoSavedAt: session.last_auto_saved_at,
      autoSaveVersion: session.auto_save_version,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
    }));

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Sessions API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sessions - Create a new session note
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("session_notes")
      .insert({
        patient_id: body.patientId,
        provider_id: user.id,
        session_date: body.sessionDate || new Date().toISOString().split("T")[0],
        session_start_time: body.sessionStartTime,
        session_end_time: body.sessionEndTime,
        duration_minutes: body.durationMinutes,
        note_type: body.noteType || "progress_note",
        status: "draft",
        cpt_code: body.cptCode,
        cpt_description: body.cptDescription,
        subjective: body.subjective,
        objective: body.objective,
        assessment: body.assessment,
        plan: body.plan,
        interventions: body.interventions,
        risk_assessment: body.riskAssessment,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating session:", error);
      return NextResponse.json(
        { error: "Failed to create session" },
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
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  } catch (error) {
    console.error("Sessions POST API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
