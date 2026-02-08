import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isLateEntry } from '@/lib/session/types';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { signerName, signerCredentials } = body;
    if (!signerName) return NextResponse.json({ error: 'signerName is required' }, { status: 400 });
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: existing } = await supabase.from('session_notes').select('*').eq('id', id).single();
    if (!existing) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    if (existing.status === 'signed') return NextResponse.json({ error: 'Session is already signed' }, { status: 400 });
    const signedAt = new Date().toISOString();
    const lateEntry = isLateEntry(existing.session_date, signedAt);
    const { data, error } = await supabase.from('session_notes').update({ status: 'signed', signed_by: user?.id || null, signed_at: signedAt, signer_name: signerName, signer_credentials: signerCredentials || null, is_late_entry: lateEntry, last_saved_at: signedAt }).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: 'Failed to sign session' }, { status: 500 });
    return NextResponse.json({ id: data.id, status: data.status, signedAt: data.signed_at, signerName: data.signer_name, isLateEntry: data.is_late_entry });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
