import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function transformSession(row: Record<string, unknown>) {
  return { id: row.id, practiceId: row.practice_id, patientId: row.patient_id, appointmentId: row.appointment_id, sessionDate: row.session_date, sessionStartTime: row.session_start_time, sessionEndTime: row.session_end_time, totalMinutes: row.total_minutes, noteType: row.note_type, subjective: row.subjective, objective: row.objective, assessment: row.assessment, plan: row.plan, biopsychosocialHistory: row.biopsychosocial_history, safetyAssessment: row.safety_assessment, safetyPlan: row.safety_plan, cptCode: row.cpt_code, cptCodeSuggested: row.cpt_code_suggested, cptOverrideReason: row.cpt_override_reason, status: row.status, signedBy: row.signed_by, signedAt: row.signed_at, signerName: row.signer_name, signerCredentials: row.signer_credentials, isLateEntry: row.is_late_entry, lastSavedAt: row.last_saved_at, aiGenerated: row.ai_generated, createdAt: row.created_at, updatedAt: row.updated_at };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');
    const supabase = await createClient();
    let query = supabase.from('session_notes').select('*');
    if (patientId) query = query.eq('patient_id', patientId);
    if (status) query = query.eq('status', status);
    query = query.order('session_date', { ascending: false });
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    return NextResponse.json(data.map(transformSession));
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { practiceId, patientId, appointmentId, noteType, sessionDate } = body;
    if (!practiceId || !patientId) return NextResponse.json({ error: 'practiceId and patientId are required' }, { status: 400 });
    const supabase = await createClient();
    const { data, error } = await supabase.from('session_notes').insert({ practice_id: practiceId, patient_id: patientId, appointment_id: appointmentId || null, note_type: noteType || 'progress_note', session_date: sessionDate || new Date().toISOString().split('T')[0], status: 'draft', last_saved_at: new Date().toISOString() }).select().single();
    if (error) return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    return NextResponse.json(transformSession(data));
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
