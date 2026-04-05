import { NextResponse } from 'next/server'
import { readVaultFile } from '@/src/lib/vault/reader'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const file = searchParams.get('file')

  if (!file) {
    return NextResponse.json({ error: 'file parameter is required' }, { status: 400 })
  }

  // Security: only allow _agents/*.md files
  if (!file.startsWith('_agents/') || !file.endsWith('.md')) {
    return NextResponse.json({ error: 'Only _agents/*.md files can be read' }, { status: 403 })
  }

  if (file.includes('..') || file.includes('//')) {
    return NextResponse.json({ error: 'Invalid file path' }, { status: 403 })
  }

  const result = readVaultFile(file)
  if (!result) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  return NextResponse.json({
    content: result.content,
    lastModified: result.lastModified.toISOString(),
  })
}
