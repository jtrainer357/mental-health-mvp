import { NextResponse } from 'next/server'
import { getResearchQueue, getCached } from '@/src/lib/vault'

export const dynamic = 'force-dynamic'

export async function GET() {
  const queue = getCached('research-queue', 30_000, () => getResearchQueue())
  return NextResponse.json({ queue, timestamp: new Date().toISOString() })
}
