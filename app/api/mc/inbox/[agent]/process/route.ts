import { NextResponse } from 'next/server'
import { processInboxMessage } from '@/src/lib/vault/writer'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ agent: string }> }
) {
  try {
    const { agent } = await params
    const body = await request.json()
    const { date, subject } = body || {}

    if (!date || !subject) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: date, subject' },
        { status: 400 }
      )
    }

    const success = processInboxMessage(agent, date, subject)

    if (!success) {
      return NextResponse.json(
        { success: false, error: `Failed to process message in inbox-${agent}.md` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, agent, date, subject })
  } catch (err) {
    console.error('[api/mc/inbox/process]', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
