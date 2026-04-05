import { NextResponse } from 'next/server'
import { getAllDecisions, getCached } from '@/src/lib/vault'

export const dynamic = 'force-dynamic'

export async function GET() {
  const decisions = getCached('decisions-all', 30_000, () => getAllDecisions())
  return NextResponse.json({ decisions, timestamp: new Date().toISOString() })
}
