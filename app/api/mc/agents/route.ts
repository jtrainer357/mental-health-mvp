import { NextResponse } from 'next/server'
import { getAllAgentStates, getCached } from '@/src/lib/vault'

export const dynamic = 'force-dynamic'

export async function GET() {
  const agents = getCached('agents-all', 30_000, () => getAllAgentStates())
  return NextResponse.json({ agents, timestamp: new Date().toISOString() })
}
