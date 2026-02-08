import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function transformAddendum(row: Record<string, unknown>) {
  return { id: row.id, sessionNoteId: row.session_note_id, authorId: row.author_id, authorName: row.author_name, authorCredentials: row.author_credentials, content: row.content, createdAt: row.created_at };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data, error } = await supabase.from('session_addendums').select('*').eq('session_note_id', id).order('created_at', { ascending: true });
    if (error) return NextResponse.json({ error: 'Failed to fetch addendums' }, { status: 500 });
    return NextResponse.json(data.map(transformAddendum));
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { authorName, authorCredentials, content } = body;
    if (!authorName || !content) return NextResponse.json({ error: 'authorName and content are required' }, { status: 400 });
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: session } = await supabase.from('session_notes').select('status').eq('id', id).single();
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    if (session.status !== 'signed') return NextResponse.json({ error: 'Addendums can only be added to signed notes' }, { status: 400 });
    const { data, error } = await supabase.from('session_addendums').insert({ session_note_id: id, author_id: user?.id || null, author_name: authorName, author_credentials: authorCredentials || null, content: content.trim() }).select().single();
    if (error) return NextResponse.json({ error: 'Failed to create addendum' }, { status: 500 });
    return NextResponse.json(transformAddendum(data));
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
