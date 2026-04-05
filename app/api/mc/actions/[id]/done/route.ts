import { NextResponse } from 'next/server'
import { readVaultFile, getVaultPath } from '@/src/lib/vault/reader'
import { invalidateCache } from '@/src/lib/vault'
import fs from 'fs'

export const dynamic = 'force-dynamic'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const file = readVaultFile('_agents/state-kai.md')
    if (!file) return NextResponse.json({ success: false, error: 'Kai state not found' }, { status: 404 })

    // Find the line with this ACT-ID and replace status with "done"
    const lines = file.content.split('\n')
    let found = false
    for (let i = 0; i < lines.length; i++) {
      if (lines[i]!.includes(id)) {
        // Replace the status column (last before closing |)
        lines[i] = lines[i]!.replace(
          /\|\s*(?:pending|in-progress|open|blocked|\*\*URGENT\*\*)\s*\|$/i,
          '| done |'
        )
        found = true
        break
      }
    }

    if (!found) {
      return NextResponse.json({ success: false, error: `${id} not found` }, { status: 404 })
    }

    const fullPath = getVaultPath('_agents/state-kai.md')
    const matter = await import('gray-matter')
    const output = matter.default.stringify(lines.join('\n'), file.frontmatter)
    fs.writeFileSync(fullPath, output, 'utf-8')

    invalidateCache('kai-actions')
    invalidateCache('health')

    return NextResponse.json({ success: true, id })
  } catch (err) {
    console.error('[api/mc/actions/done]', err)
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 })
  }
}
