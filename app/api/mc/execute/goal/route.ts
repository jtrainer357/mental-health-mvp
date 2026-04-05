import { NextResponse } from 'next/server'
import { generateFlightPlan } from '@/src/lib/vault/executor'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { goal } = body || {}

    if (!goal || typeof goal !== 'string' || goal.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: goal (non-empty string)' },
        { status: 400 }
      )
    }

    const plan = await generateFlightPlan(goal.trim())

    return NextResponse.json({
      success: true,
      plan,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[api/mc/execute/goal]', err)
    return NextResponse.json(
      { success: false, error: 'Failed to generate flight plan' },
      { status: 500 }
    )
  }
}
