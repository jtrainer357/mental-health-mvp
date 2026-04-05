import { NextResponse } from 'next/server'
import { readVaultFile } from '@/src/lib/vault/reader'
import { getCached } from '@/src/lib/vault'

export const dynamic = 'force-dynamic'

export interface ActionItem {
  id: string
  description: string
  owner: string
  due: string
  status: string
}

function parseKaiActions(): ActionItem[] {
  const file = readVaultFile('_agents/state-kai.md')
  if (!file) return []

  return file.content
    .split('\n')
    .filter(l => /^\|\s*ACT-\d+/.test(l) && !l.includes('~~ACT-') && !l.includes('*archived') && !l.includes('*likely done') && !l.includes('*done —'))
    .map(line => {
      const cols = line.split('|').map(c => c.trim()).filter(Boolean)
      return {
        id: cols[0] || '',
        description: cols[1] || '',
        owner: cols[2] || '',
        due: cols[3] || '',
        status: (cols[4] || '').replace(/\*/g, '').toLowerCase(),
      }
    })
}

export async function GET() {
  const all = getCached('kai-actions', 30_000, parseKaiActions)
  return NextResponse.json({ actions: all, timestamp: new Date().toISOString() })
}
