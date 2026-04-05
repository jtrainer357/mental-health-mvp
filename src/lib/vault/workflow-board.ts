import { readVaultFile } from './reader'
import type { WorkflowBoard, WorkflowStream, WorkflowState } from './types'

const VALID_STATES: WorkflowState[] = ['planned', 'executing', 'awaiting_external', 'blocked', 'done']

function normalizeDate(raw: unknown): string {
  if (!raw) return ''
  if (raw instanceof Date) return raw.toISOString().slice(0, 10)
  const s = String(raw)
  const match = s.match(/^(\d{4}-\d{2}-\d{2})/)
  if (match) return match[1]!
  const parsed = Date.parse(s)
  if (!Number.isNaN(parsed)) return new Date(parsed).toISOString().slice(0, 10)
  return s
}

function normalizeState(raw: string): WorkflowState {
  const cleaned = raw.trim().toLowerCase().replace(/\s+/g, '_')
  return (VALID_STATES as string[]).includes(cleaned) ? (cleaned as WorkflowState) : 'planned'
}

function parseBulletFields(block: string): Record<string, string> {
  const fields: Record<string, string> = {}
  const lines = block.split('\n')
  for (const line of lines) {
    const match = line.match(/^\s*-\s*\*\*([^:]+):\*\*\s*(.*)$/)
    if (match && match[1] && match[2] !== undefined) {
      fields[match[1].trim().toLowerCase().replace(/\s+/g, '_')] = match[2].trim()
    }
  }
  return fields
}

function parseRelated(raw: string): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map(s => s.trim().replace(/^\[\[|\]\]$/g, ''))
    .filter(Boolean)
}

function parseStream(block: string): WorkflowStream | null {
  // First line looks like: ### WF-001 — Title
  const firstLine = block.split('\n')[0] || ''
  const headerMatch = firstLine.match(/^###\s+(WF-\d+)\s*[—-]\s*(.+?)\s*$/)
  if (!headerMatch || !headerMatch[1] || !headerMatch[2]) return null

  const id = headerMatch[1]
  const title = headerMatch[2].trim()
  const fields = parseBulletFields(block)

  return {
    id,
    title,
    state: normalizeState(fields['state'] || 'planned'),
    owner: fields['owner'] || 'Unknown',
    lastUpdated: fields['last_updated'] || '',
    nextStep: fields['next_step'] || '',
    safeResume: fields['safe_resume'] || '',
    related: parseRelated(fields['related'] || ''),
    blockers: fields['blockers'] || 'none',
    due: fields['due'] || undefined,
  }
}

export function getWorkflowBoard(): WorkflowBoard {
  const file = readVaultFile('_agents/workflow-board.md')
  const empty: WorkflowBoard = {
    lastUpdated: 'Unknown',
    streams: [],
    counts: { planned: 0, executing: 0, awaiting_external: 0, blocked: 0, done: 0 },
  }
  if (!file) return empty

  const content = file.content
  const lastUpdated = normalizeDate(
    (file.frontmatter as any)?.updated ?? file.lastModified
  )

  // Isolate the "Active Streams" section before splitting on `### WF-`
  const activeIdx = content.indexOf('## Active Streams')
  const completedIdx = content.indexOf('## Recently Completed')
  const sliceEnd = completedIdx > activeIdx ? completedIdx : content.length
  const activeBlock = activeIdx >= 0 ? content.slice(activeIdx, sliceEnd) : content

  // Split on `### WF-` — first element is the "## Active Streams" header, skip it
  const rawBlocks = activeBlock.split(/\n(?=###\s+WF-)/).slice(1)

  const streams: WorkflowStream[] = []
  for (const raw of rawBlocks) {
    const parsed = parseStream(raw)
    if (parsed) streams.push(parsed)
  }

  const counts: Record<WorkflowState, number> = {
    planned: 0,
    executing: 0,
    awaiting_external: 0,
    blocked: 0,
    done: 0,
  }
  for (const s of streams) counts[s.state]++

  return { lastUpdated, streams, counts }
}
