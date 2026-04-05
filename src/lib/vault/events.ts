import { readVaultFile, listVaultDir } from './reader'
import type { EventLogEntry } from './types'

function parseRow(line: string): EventLogEntry | null {
  // Table row: | timestamp | source | type | artifact | result |
  // Skip header rows (contain dashes), skip empty lines.
  if (!line.trim().startsWith('|')) return null
  if (line.includes('---')) return null

  const cols = line.split('|').map(c => c.trim()).filter((_c, i, arr) => i > 0 && i < arr.length - 1)
  if (cols.length < 5) return null

  const [timestamp, source, type, artifact, result] = cols
  if (!timestamp || timestamp.toLowerCase() === 'timestamp') return null
  // Require at least an ISO-8601-looking date prefix
  if (!/^\d{4}-\d{2}-\d{2}/.test(timestamp)) return null

  return {
    timestamp,
    source: source || 'unknown',
    type: type || 'unknown',
    artifact: artifact || '',
    result: result || '',
  }
}

function parseEventTable(content: string): EventLogEntry[] {
  const entries: EventLogEntry[] = []
  for (const line of content.split('\n')) {
    const entry = parseRow(line)
    if (entry) entries.push(entry)
  }
  return entries
}

export function getRecentEvents(limit = 50): EventLogEntry[] {
  const entries: EventLogEntry[] = []

  // Current month
  const current = readVaultFile('_agents/event-log.md')
  if (current) entries.push(...parseEventTable(current.content))

  // Prior months if we still need more
  if (entries.length < limit) {
    const files = listVaultDir('_agents').filter(f => /^event-log-\d{4}-\d{2}\.md$/.test(f))
    // Sort descending by filename (which is YYYY-MM so lexical == chronological)
    files.sort().reverse()
    for (const f of files) {
      if (entries.length >= limit) break
      const prior = readVaultFile(`_agents/${f}`)
      if (prior) entries.push(...parseEventTable(prior.content))
    }
  }

  // Sort descending by timestamp
  entries.sort((a, b) => (a.timestamp < b.timestamp ? 1 : a.timestamp > b.timestamp ? -1 : 0))

  return entries.slice(0, limit)
}

export function getEventsByType(type: string, limit = 20): EventLogEntry[] {
  return getRecentEvents(500).filter(e => e.type === type).slice(0, limit)
}
