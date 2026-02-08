import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const practiceId = searchParams.get('practiceId');
    if (!practiceId) return NextResponse.json({ error: 'practiceId is required' }, { status: 400 });
    const supabase = await createClient();
    const { count, error } = await supabase.from('session_notes').select('*', { count: 'exact', head: true }).eq('practice_id', practiceId).eq('status', 'draft');
    if (error) return NextResponse.json({ error: 'Failed to fetch unsigned count' }, { status: 500 });
    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
