import { NextResponse } from 'next/server'
import { updateBootstrapSections } from '@/src/lib/vault/writer'
import { invalidateCache } from '@/src/lib/vault'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { hotItems, overdueItems } = body || {}

    if (!hotItems && !overdueItems) {
      return NextResponse.json(
        { success: false, error: 'Must provide at least one of: hotItems, overdueItems' },
        { status: 400 }
      )
    }

    if (hotItems && !Array.isArray(hotItems)) {
      return NextResponse.json(
        { success: false, error: 'hotItems must be an array of strings' },
        { status: 400 }
      )
    }

    if (overdueItems && !Array.isArray(overdueItems)) {
      return NextResponse.json(
        { success: false, error: 'overdueItems must be an array of strings' },
        { status: 400 }
      )
    }

    const success = updateBootstrapSections({ hotItems, overdueItems })

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to update bootstrap sections' },
        { status: 500 }
      )
    }

    invalidateCache('bootstrap')

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[api/mc/bootstrap/update]', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
