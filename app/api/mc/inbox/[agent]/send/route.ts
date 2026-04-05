import { NextResponse } from 'next/server'
import { writeInboxMessage } from '@/src/lib/vault/writer'

export const dynamic = 'force-dynamic'

const VALID_TYPES = ['signal', 'decision', 'request', 'alert', 'question'] as const
const VALID_PRIORITIES = ['high', 'medium', 'low'] as const

export async function POST(
  request: Request,
  { params }: { params: Promise<{ agent: string }> }
) {
  try {
    const { agent } = await params
    const body = await request.json()

    const { from, subject, type, priority, content, actionNeeded, related } = body || {}

    if (!from || !subject || !type || !priority || !content || !actionNeeded) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: from, subject, type, priority, content, actionNeeded' },
        { status: 400 }
      )
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    if (!VALID_PRIORITIES.includes(priority)) {
      return NextResponse.json(
        { success: false, error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}` },
        { status: 400 }
      )
    }

    const success = writeInboxMessage(agent, {
      from,
      subject,
      type,
      priority,
      content,
      actionNeeded,
      related: Array.isArray(related) ? related : [],
    })

    if (!success) {
      return NextResponse.json(
        { success: false, error: `Failed to send message to inbox-${agent}.md` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, agent })
  } catch (err) {
    console.error('[api/mc/inbox/send]', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
