import { NextResponse } from 'next/server'
import { chatWithAgent, VALID_AGENTS } from '@/src/lib/ai/agent-chat'
import type { ChatMessage } from '@/src/lib/ai/agent-chat'

export const dynamic = 'force-dynamic'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ agent: string }> }
) {
  const { agent } = await params

  if (!VALID_AGENTS.includes(agent)) {
    return NextResponse.json(
      { error: `Invalid agent: ${agent}. Valid agents: ${VALID_AGENTS.join(', ')}` },
      { status: 400 }
    )
  }

  try {
    const body = await req.json()
    const { message, history } = body as { message: string; history?: ChatMessage[] }

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'message is required and must be a string' }, { status: 400 })
    }

    const response = await chatWithAgent(agent, message, history || [])

    return NextResponse.json({
      response,
      agent,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error(`[mc/chat/${agent}] Error:`, err)
    return NextResponse.json(
      { error: 'Failed to get agent response' },
      { status: 500 }
    )
  }
}
