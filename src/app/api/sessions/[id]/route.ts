import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function transformSession(row: Record<string, unknown>) {
  return { id: row.id, practiceId: row.practice_id, patientId: row.patient_id, sessionDate: row.session_date, noteType: row.note_type, subjective: row.subjective, objective: row.objective, assessment: row.assessment, plan: row.plan, biopsychosocialHistory: row.biopsychosocial_history, safetyAssessment: row.safety_assessment, safetyPlan: row.safety_plan, cptCode: row.cpt_code, status: row.status, signedBy: row.signed_by, signedAt: row.signed_at, signerName: row.signer_name, signerCredentials: row.signer_credentials, isLateEntry: row.is_late_entry, lastSavedAt: row.last_saved_at, totalMinutes: row.total_minutes, createdAt: row.created_at, updatedAt: row.updated_at };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data, error } = await supabase.from('session_notes').select('*').eq('id', id).single();
    if (error) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    return NextResponse.json(transformSession(data));
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();
    const { data: existing } = await supabase.from('session_notes').select('status').eq('id', id).single();
    if (!existing) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    if (existing.status === 'signed') return NextResponse.json({ error: 'Cannot edit a signed note' }, { status: 403 });
    const updateData: Record<string, unknown> = { last_saved_at: new Date().toISOString() };
    if (body.subjective !== undefined) updateData.subjective = body.subjective;
    if (body.objective !== undefined) updateData.objective = body.objective;
    if (body.assessment !== undefined) updateData.assessment = body.assessment;
    if (body.plan !== undefined) updateData.plan = body.plan;
    if (body.biopsychosocialHistory !== undefined) updateData.biopsychosocial_history = body.biopsychosocialHistory;
    if (body.safetyAssessment !== undefined) updateData.safety_assessment = body.safetyAssessment;
    if (body.safetyPlan !== undefined) updateData.safety_plan = body.safetyPlan;
    if (body.cptCode !== undefined) updateData.cpt_code = body.cptCode;
    if (body.totalMinutes !== undefined) updateData.total_minutes = body.totalMinutes;
    const { data, error } = await supabase.from('session_notes').update(updateData).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    return NextResponse.json(transformSession(data));
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
