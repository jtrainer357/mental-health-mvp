import { NextResponse } from 'next/server'
import { getAllSignals, getCached } from '@/src/lib/vault'

export const dynamic = 'force-dynamic'

export async function GET() {
  const signals = getCached('signals-all', 30_000, () => getAllSignals())
  return NextResponse.json({ signals, timestamp: new Date().toISOString() })
}
