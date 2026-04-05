import { NextResponse } from 'next/server'
import { getHarnessStatus, getCached } from '@/src/lib/vault'

export const dynamic = 'force-dynamic'

export async function GET() {
  const harness = getCached('harness-status', 30_000, () => getHarnessStatus())
  return NextResponse.json({ harness, timestamp: new Date().toISOString() })
}
