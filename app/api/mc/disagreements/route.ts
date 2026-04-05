import { NextResponse } from 'next/server'
import { getDisagreements, getCached } from '@/src/lib/vault'

export const dynamic = 'force-dynamic'

export async function GET() {
  const disagreements = getCached('disagreements', 30_000, () => getDisagreements())
  return NextResponse.json({ disagreements, timestamp: new Date().toISOString() })
}
