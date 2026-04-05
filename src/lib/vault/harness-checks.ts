import { readVaultFile } from './reader'
import type { HarnessStatus, HarnessCheck, HarnessRunLogEntry } from './types'

function daysBetween(dateStr: string): number {
  if (!dateStr) return Infinity
  const then = Date.parse(dateStr)
  if (Number.isNaN(then)) return Infinity
  return Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24))
}

function normalizeDate(raw: unknown): string {
  if (!raw) return 'Never'
  if (raw instanceof Date) return raw.toISOString().slice(0, 10)
  const s = String(raw)
  // If it starts with a recognizable date (4-digit year), slice to YYYY-MM-DD
  const match = s.match(/^(\d{4}-\d{2}-\d{2})/)
  if (match) return match[1]!
  // If Date.parse can handle it, normalize it
  const parsed = Date.parse(s)
  if (!Number.isNaN(parsed)) return new Date(parsed).toISOString().slice(0, 10)
  return s
}

function parseChecks(content: string): HarnessCheck[] {
  const checks: HarnessCheck[] = []
  const lines = content.split('\n')
  for (const line of lines) {
    // Match: - [x] **HC-01**: description   or   - [ ] **HC-01**: description
    const match = line.match(/^\s*-\s*\[(x|X|\s)\]\s*\*\*(HC-\d+)\*\*:\s*(.+)$/)
    if (match && match[1] !== undefined && match[2] && match[3]) {
      checks.push({
        id: match[2],
        passing: match[1].toLowerCase() === 'x',
        description: match[3].trim(),
      })
    }
  }
  return checks
}

function parseRunLog(content: string): HarnessRunLogEntry[] {
  const entries: HarnessRunLogEntry[] = []
  // Table rows after "## Last Run Log": `| date | by | passed | failed | notes |`
  const logIdx = content.indexOf('## Last Run Log')
  if (logIdx < 0) return entries
  const slice = content.slice(logIdx)
  const lines = slice.split('\n')
  for (const line of lines) {
    const match = line.match(/^\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*([^|]+?)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*([^|]*?)\s*\|/)
    if (match) {
      entries.push({
        date: match[1]!,
        by: match[2]!.trim(),
        passed: parseInt(match[3]!, 10),
        failed: parseInt(match[4]!, 10),
        notes: match[5]!.trim(),
      })
    }
  }
  return entries
}

export function getHarnessStatus(): HarnessStatus {
  const file = readVaultFile('_agents/harness-checks.md')
  const empty: HarnessStatus = {
    lastRun: 'Never',
    lastRunBy: 'none',
    status: 'stale',
    checks: [],
    runLog: [],
    isStale: true,
    daysSinceLastRun: Infinity,
  }
  if (!file) return empty

  const fm = (file.frontmatter || {}) as Record<string, any>
  const lastRun = normalizeDate(fm.last_run)
  const lastRunBy = String(fm.last_run_by || 'unknown')
  const rawStatus = String(fm.status || 'stale').toLowerCase()
  const status: HarnessStatus['status'] =
    rawStatus === 'passing' || rawStatus === 'warning' || rawStatus === 'failing' ? rawStatus : 'stale'

  const daysSinceLastRun = daysBetween(lastRun)
  const isStale = daysSinceLastRun > 3

  return {
    lastRun,
    lastRunBy,
    status: isStale && status === 'passing' ? 'stale' : status,
    checks: parseChecks(file.content),
    runLog: parseRunLog(file.content),
    isStale,
    daysSinceLastRun: Number.isFinite(daysSinceLastRun) ? daysSinceLastRun : -1,
  }
}
