import { readVaultFile, getFileModTime } from './reader'
import type { AgentState, InboxMessage } from './types'

const AGENTS = [
  { name: 'Maren', slug: 'maren', role: 'Researcher' },
  { name: 'Reid', slug: 'reid', role: 'Strategist' },
  { name: 'Ava', slug: 'ava', role: 'Designer' },
  { name: 'Kai', slug: 'kai', role: 'PM' },
  { name: 'Syd', slug: 'syd', role: 'Engineer' },
] as const

export function getAllAgentStates(): AgentState[] {
  return AGENTS.map(a => getAgentState(a.slug))
}

export function getAgentState(slug: string): AgentState {
  const agent = AGENTS.find(a => a.slug === slug)
  if (!agent) throw new Error(`Unknown agent: ${slug}`)

  const stateFile = readVaultFile(`_agents/state-${slug}.md`)
  const inboxFile = readVaultFile(`_agents/inbox-${slug}.md`)

  const content = stateFile?.content || ''

  // Extract "Last updated" line
  const lastUpdatedMatch = content.match(/Last updated:\s*(.+?)(?:\n|$)/)
  const lastUpdated = lastUpdatedMatch?.[1]?.trim() || 'Unknown'

  // Extract sections by ## headings
  const sections = parseSections(content)

  // Hot Context items (bullet points under ## Hot Context)
  const hotContext = extractBulletItems(sections['Hot Context'] || sections['Hot Items'] || '')

  // Session Work (most recent)
  const sessionKey = Object.keys(sections).find(k => k.startsWith('Session Work'))
  const sessionWork = extractBulletItems(sections[sessionKey || ''] || '')

  // Currently Working On
  const currentlyWorkingOn = extractBulletItems(sections['Currently Working On'] || '')

  // Parse inbox
  const inboxContent = inboxFile?.content || ''
  const { count, messages } = parseInbox(inboxContent)

  return {
    name: agent.name,
    slug: agent.slug,
    role: agent.role,
    lastUpdated,
    hotContext: hotContext.slice(0, 10),
    sessionWork: sessionWork.slice(0, 10),
    currentlyWorkingOn: currentlyWorkingOn.slice(0, 10),
    inboxCount: count,
    unprocessedMessages: messages,
    derivedStatus: deriveAgentStatus(slug),
  }
}

function deriveAgentStatus(slug: string): 'working' | 'waiting' | 'idle' | 'blocked' {
  // Check state file modification time
  const stateModTime = getFileModTime(`_agents/state-${slug}.md`)
  const recentlyModified = stateModTime && (Date.now() - stateModTime.getTime()) < 5 * 60 * 1000 // 5 min

  // Check inbox for unprocessed messages
  const inboxFile = readVaultFile(`_agents/inbox-${slug}.md`)
  const hasUnprocessed = inboxFile?.content?.includes('### ') && !inboxFile.content.includes('(No messages)')

  // Check state for blocker mentions
  const stateFile = readVaultFile(`_agents/state-${slug}.md`)
  const hasBlockers = stateFile?.content?.toLowerCase().includes('blocked') || false

  if (hasBlockers) return 'blocked'
  if (recentlyModified) return 'working'
  if (hasUnprocessed) return 'waiting'
  return 'idle'
}

function parseSections(markdown: string): Record<string, string> {
  const sections: Record<string, string> = {}
  const lines = markdown.split('\n')
  let currentHeading = ''
  let currentContent: string[] = []

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.+)/)
    if (headingMatch) {
      if (currentHeading) {
        sections[currentHeading] = currentContent.join('\n').trim()
      }
      currentHeading = headingMatch[1]!.trim()
      currentContent = []
    } else {
      currentContent.push(line)
    }
  }
  if (currentHeading) {
    sections[currentHeading] = currentContent.join('\n').trim()
  }
  return sections
}

function extractBulletItems(text: string): string[] {
  return text
    .split('\n')
    .filter(line => line.match(/^\s*[-*]\s+/))
    .map(line => line.replace(/^\s*[-*]\s+/, '').trim())
    .filter(Boolean)
}

function parseInbox(content: string): { count: number; messages: InboxMessage[] } {
  const sections = parseSections(content)
  const unprocessed = sections['Unprocessed'] || ''

  if (unprocessed.includes('(No messages)') || !unprocessed.trim()) {
    return { count: 0, messages: [] }
  }

  // Parse individual messages (### headings within Unprocessed)
  const messages: InboxMessage[] = []
  const messageBlocks = unprocessed.split(/(?=^### )/m).filter(Boolean)

  for (const block of messageBlocks) {
    const headerMatch = block.match(/^###\s+\[(.+?)\]\s+From\s+(.+?):\s+(.+)/)
    if (!headerMatch) continue

    const typeMatch = block.match(/\*\*Type:\*\*\s*(.+)/)
    const priorityMatch = block.match(/\*\*Priority:\*\*\s*(.+)/)
    const contentMatch = block.match(/\*\*Content:\*\*\s*(.+)/)
    const actionMatch = block.match(/\*\*Action needed:\*\*\s*(.+)/)
    const relatedMatch = block.match(/\*\*Related:\*\*\s*(.+)/)

    messages.push({
      date: headerMatch[1] || '',
      from: headerMatch[2]?.trim() || '',
      subject: headerMatch[3]?.trim() || '',
      type: (typeMatch?.[1]?.trim() as InboxMessage['type']) || 'alert',
      priority: (priorityMatch?.[1]?.trim() as InboxMessage['priority']) || 'medium',
      content: contentMatch?.[1]?.trim() || '',
      actionNeeded: actionMatch?.[1]?.trim() || '',
      related: relatedMatch?.[1]?.match(/\[\[(.+?)\]\]/g)?.map(l => l.replace(/\[\[|\]\]/g, '')) || [],
    })
  }

  return { count: messages.length, messages }
}
