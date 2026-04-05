import { NextResponse } from 'next/server'
import { createResearchRequest } from '@/src/lib/vault/writer'
import { invalidateCache } from '@/src/lib/vault'

export const dynamic = 'force-dynamic'

const VALID_PRIORITIES = ['high', 'medium', 'low'] as const

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, title, requestedBy, priority, context, suggestedApproach, relatedSignals } = body || {}

    if (!id || !title || !requestedBy || !priority || !context || !suggestedApproach) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: id, title, requestedBy, priority, context, suggestedApproach' },
        { status: 400 }
      )
    }

    if (!VALID_PRIORITIES.includes(priority)) {
      return NextResponse.json(
        { success: false, error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}` },
        { status: 400 }
      )
    }

    const success = createResearchRequest({
      id,
      title,
      requestedBy,
      priority,
      context,
      suggestedApproach,
      relatedSignals: Array.isArray(relatedSignals) ? relatedSignals : [],
    })

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to create research request' },
        { status: 500 }
      )
    }

    invalidateCache('research-queue')

    return NextResponse.json({ success: true, id })
  } catch (err) {
    console.error('[api/mc/research-queue/create]', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
