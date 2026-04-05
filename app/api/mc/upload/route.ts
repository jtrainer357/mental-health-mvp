import { NextResponse } from 'next/server'
import { getVaultPath } from '@/src/lib/vault/reader'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

/**
 * Accepts file uploads, saves to vault _inbox/, returns the file path and extracted text content.
 * Supports any file type. Text-based files get their content returned for context injection.
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate safe filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filename = `${timestamp}_${safeName}`

    // Save to vault _inbox/uploads/
    const uploadDir = getVaultPath('_inbox', 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    const filePath = path.join(uploadDir, filename)
    fs.writeFileSync(filePath, buffer)

    // Extract text content for context injection
    let textContent: string | null = null
    const ext = path.extname(file.name).toLowerCase()
    const textExtensions = ['.md', '.txt', '.csv', '.json', '.yml', '.yaml', '.xml', '.html', '.tsx', '.ts', '.js', '.jsx', '.css', '.py', '.sh', '.env', '.toml', '.ini', '.log', '.vtt', '.srt']

    if (textExtensions.includes(ext)) {
      textContent = buffer.toString('utf-8').slice(0, 10000) // Cap at 10K chars
    }

    const relativePath = `_inbox/uploads/${filename}`

    return NextResponse.json({
      success: true,
      filename,
      relativePath,
      size: buffer.length,
      type: file.type,
      textContent,
    })
  } catch (err) {
    console.error('[api/mc/upload]', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
