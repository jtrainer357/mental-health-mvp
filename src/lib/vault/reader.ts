import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const VAULT_ROOT = process.env.VAULT_ROOT || path.resolve(process.cwd(), '..', 'mental-health-mvp')

export function getVaultPath(...segments: string[]): string {
  return path.join(VAULT_ROOT, ...segments)
}

export function readVaultFile(relativePath: string): { frontmatter: Record<string, any>; content: string; lastModified: Date } | null {
  try {
    const fullPath = getVaultPath(relativePath)
    const raw = fs.readFileSync(fullPath, 'utf-8')
    const stats = fs.statSync(fullPath)
    const { data, content } = matter(raw)
    return { frontmatter: data, content, lastModified: stats.mtime }
  } catch {
    return null
  }
}

export function listVaultDir(relativePath: string): string[] {
  try {
    const fullPath = getVaultPath(relativePath)
    return fs.readdirSync(fullPath).filter(f => f.endsWith('.md') && !f.startsWith('.'))
  } catch {
    return []
  }
}

export function getFileModTime(relativePath: string): Date | null {
  try {
    const fullPath = getVaultPath(relativePath)
    return fs.statSync(fullPath).mtime
  } catch {
    return null
  }
}
