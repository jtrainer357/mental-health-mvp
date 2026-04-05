import { NextResponse } from 'next/server'
import { getRecentEvents, getCached } from '@/src/lib/vault'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 500)
  const type = url.searchParams.get('type')

  const cacheKey = `events-${limit}-${type || 'all'}`
  const events = getCached(cacheKey, 30_000, () => {
    const all = getRecentEvents(limit)
    return type ? all.filter(e => e.type === type) : all
  })

  return NextResponse.json({ events, timestamp: new Date().toISOString() })
}
