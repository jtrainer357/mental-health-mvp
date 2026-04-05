import { NextResponse } from 'next/server'
import { updateFrontmatter, findDecisionFilePath } from '@/src/lib/vault/writer'
import { invalidateCache } from '@/src/lib/vault'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const feedback = body?.feedback

    if (!feedback || typeof feedback !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing required field: feedback' },
        { status: 400 }
      )
    }

    const filePath = findDecisionFilePath(id)
    if (!filePath) {
      return NextResponse.json(
        { success: false, error: `Decision ${id} not found` },
        { status: 404 }
      )
    }

    const success = updateFrontmatter(filePath, {
      status: 'needs-revision',
      'review-feedback': feedback,
    })

    if (!success) {
      return NextResponse.json(
        { success: false, error: `Failed to update decision ${id}` },
        { status: 500 }
      )
    }

    invalidateCache('decisions-all')

    return NextResponse.json({ success: true, id })
  } catch (err) {
    console.error('[api/mc/decisions/reject]', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
