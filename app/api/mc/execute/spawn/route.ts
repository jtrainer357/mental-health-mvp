import { NextResponse } from 'next/server'
import { quickAgentTask } from '@/src/lib/vault/executor'

export const dynamic = 'force-dynamic'

const VALID_AGENTS = ['maren', 'reid', 'ava', 'kai', 'syd']

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { agent, task } = body || {}

    if (!agent || !VALID_AGENTS.includes(agent)) {
      return NextResponse.json(
        { success: false, error: `Invalid agent. Must be one of: ${VALID_AGENTS.join(', ')}` },
        { status: 400 }
      )
    }

    if (!task || typeof task !== 'string' || task.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: task (non-empty string)' },
        { status: 400 }
      )
    }

    const response = await quickAgentTask(agent, task.trim())

    return NextResponse.json({
      success: true,
      agent,
      response,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[api/mc/execute/spawn]', err)
    return NextResponse.json(
      { success: false, error: 'Failed to execute agent task' },
      { status: 500 }
    )
  }
}
