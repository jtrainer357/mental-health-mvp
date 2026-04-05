import { NextResponse } from 'next/server'
import { getAgentState, getCached } from '@/src/lib/vault'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  try {
    const agent = getCached(`agent-${name}`, 30_000, () => getAgentState(name))
    return NextResponse.json({ agent, timestamp: new Date().toISOString() })
  } catch {
    return NextResponse.json({ error: `Unknown agent: ${name}` }, { status: 404 })
  }
}
