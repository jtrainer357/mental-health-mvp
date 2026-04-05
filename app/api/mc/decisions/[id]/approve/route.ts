import { NextResponse } from 'next/server'
import { updateFrontmatter, findDecisionFilePath } from '@/src/lib/vault/writer'
import { invalidateCache } from '@/src/lib/vault'

export const dynamic = 'force-dynamic'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const filePath = findDecisionFilePath(id)
    if (!filePath) {
      return NextResponse.json(
        { success: false, error: `Decision ${id} not found` },
        { status: 404 }
      )
    }

    const success = updateFrontmatter(filePath, {
      status: 'approved',
      reviewed: new Date().toISOString().split('T')[0],
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
    console.error('[api/mc/decisions/approve]', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
