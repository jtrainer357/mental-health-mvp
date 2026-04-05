import { NextResponse } from 'next/server'
import { getVaultHealth, getCached } from '@/src/lib/vault'

export const dynamic = 'force-dynamic'

export async function GET() {
  const health = getCached('vault-health', 30_000, () => getVaultHealth())
  return NextResponse.json({ health, timestamp: new Date().toISOString() })
}
