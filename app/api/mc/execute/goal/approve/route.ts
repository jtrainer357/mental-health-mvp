import { NextResponse } from 'next/server'
import { executeFlightPlan } from '@/src/lib/vault/executor'
import type { FlightPlan } from '@/src/lib/vault/executor'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const plan = body?.plan as FlightPlan | undefined

    if (!plan || !plan.id || !plan.goal || !Array.isArray(plan.steps) || plan.steps.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid flight plan. Must include id, goal, and non-empty steps array.' },
        { status: 400 }
      )
    }

    const result = await executeFlightPlan({ ...plan, status: 'approved' })

    return NextResponse.json({
      ...result,
      planId: plan.id,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[api/mc/execute/goal/approve]', err)
    return NextResponse.json(
      { success: false, error: 'Failed to execute flight plan' },
      { status: 500 }
    )
  }
}
