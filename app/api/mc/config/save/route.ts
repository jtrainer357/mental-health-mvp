import { NextResponse } from 'next/server'
import fs from 'fs'
import matter from 'gray-matter'
import { getVaultPath } from '@/src/lib/vault/reader'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { file, content } = body as { file: string; content: string }

    if (!file || typeof file !== 'string') {
      return NextResponse.json({ error: 'file is required' }, { status: 400 })
    }
    if (typeof content !== 'string') {
      return NextResponse.json({ error: 'content is required' }, { status: 400 })
    }

    // Security: only allow _agents/*.md files
    if (!file.startsWith('_agents/') || !file.endsWith('.md')) {
      return NextResponse.json(
        { error: 'Only _agents/*.md files can be edited' },
        { status: 403 }
      )
    }

    // Prevent path traversal
    if (file.includes('..') || file.includes('//')) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 403 })
    }

    const fullPath = getVaultPath(file)

    // File must already exist
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Read existing file to preserve frontmatter
    const raw = fs.readFileSync(fullPath, 'utf-8')
    const { data: frontmatter } = matter(raw)

    // Reconstruct with preserved frontmatter + new content body
    const output = Object.keys(frontmatter).length > 0
      ? matter.stringify(content, frontmatter)
      : content

    fs.writeFileSync(fullPath, output, 'utf-8')

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[mc/config/save] Error:', err)
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 })
  }
}
