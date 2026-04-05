import { NextResponse } from 'next/server'
import { getWorkflowBoard, getCached } from '@/src/lib/vault'

export const dynamic = 'force-dynamic'

export async function GET() {
  const board = getCached('workflow-board', 30_000, () => getWorkflowBoard())
  return NextResponse.json({ board, timestamp: new Date().toISOString() })
}
