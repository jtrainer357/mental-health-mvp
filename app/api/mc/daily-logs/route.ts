import { NextResponse } from 'next/server'
import { getRecentLogs, getCached } from '@/src/lib/vault'

export const dynamic = 'force-dynamic'

export async function GET() {
  const logs = getCached('daily-logs', 30_000, () => getRecentLogs(20))
  return NextResponse.json({ logs, timestamp: new Date().toISOString() })
}
