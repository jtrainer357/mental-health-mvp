import { NextResponse } from 'next/server'
import { getBootstrapData, getCached } from '@/src/lib/vault'

export const dynamic = 'force-dynamic'

export async function GET() {
  const bootstrap = getCached('bootstrap', 30_000, () => getBootstrapData())
  return NextResponse.json({ bootstrap, timestamp: new Date().toISOString() })
}
