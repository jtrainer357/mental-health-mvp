import { NextResponse } from 'next/server'
import { getLogByDate } from '@/src/lib/vault'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ date: string }> }) {
  const { date } = await params
  const log = getLogByDate(date)
  if (!log) {
    return NextResponse.json({ error: `Log not found: ${date}` }, { status: 404 })
  }
  return NextResponse.json({ log, timestamp: new Date().toISOString() })
}
