import { readVaultFile, listVaultDir } from './reader'
import type { DailyLog } from './types'

export function getRecentLogs(limit = 10): DailyLog[] {
  const files = listVaultDir('_daily-logs')
  return files
    .sort((a, b) => b.localeCompare(a)) // newest first
    .slice(0, limit)
    .map(f => parseLog(`_daily-logs/${f}`))
    .filter((l): l is DailyLog => l !== null)
}

export function getLogByDate(dateSlug: string): DailyLog | null {
  // Try exact filename match first, then prefix match
  const files = listVaultDir('_daily-logs')
  const match = files.find(f => f === `${dateSlug}.md` || f.startsWith(dateSlug))
  if (!match) return null
  return parseLog(`_daily-logs/${match}`)
}

function parseLog(relativePath: string): DailyLog | null {
  const file = readVaultFile(relativePath)
  if (!file) return null

  const fm = file.frontmatter
  const filename = relativePath.split('/').pop()?.replace('.md', '') || ''

  return {
    title: fm.title || filename,
    date: fm.date || filename.slice(0, 10),
    type: fm.type || 'daily-log',
    status: fm.status || 'draft',
    slug: filename,
    content: file.content.slice(0, 3000), // Truncate for list view
  }
}
