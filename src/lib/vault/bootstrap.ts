import { readVaultFile } from './reader'
import type { BootstrapData } from './types'

export function getBootstrapData(): BootstrapData {
  const file = readVaultFile('_agents/session-bootstrap.md')
  if (!file) return { lastUpdated: 'Unknown', hotItems: [], agentDeltas: {}, openDecisions: [], overdueItems: [] }

  const content = file.content
  const sections = parseSections(content)

  const lastUpdatedMatch = content.match(/Last (?:session|updated):\s*(.+?)(?:\n|$)/)

  return {
    lastUpdated: lastUpdatedMatch?.[1]?.trim() || file.lastModified.toISOString(),
    hotItems: extractBullets(sections['Hot Items'] || sections['Hot Items (Top 5)'] || ''),
    agentDeltas: parseAgentDeltas(sections['Agent Deltas Since Last Session'] || ''),
    openDecisions: extractBullets(sections['Open Decisions Awaiting Jay'] || ''),
    overdueItems: extractBullets(sections['Overdue Items'] || ''),
  }
}

function parseSections(markdown: string): Record<string, string> {
  const sections: Record<string, string> = {}
  const lines = markdown.split('\n')
  let currentHeading = ''
  let currentContent: string[] = []

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.+)/)
    if (headingMatch) {
      if (currentHeading) sections[currentHeading] = currentContent.join('\n').trim()
      currentHeading = headingMatch[1]!.trim()
      currentContent = []
    } else {
      currentContent.push(line)
    }
  }
  if (currentHeading) sections[currentHeading] = currentContent.join('\n').trim()
  return sections
}

function extractBullets(text: string): string[] {
  return text.split('\n')
    .filter(line => line.match(/^\s*[-*\d.]\s+/))
    .map(line => line.replace(/^\s*[-*\d.]+\s+/, '').trim())
    .filter(Boolean)
}

function parseAgentDeltas(text: string): Record<string, string> {
  const deltas: Record<string, string> = {}
  const lines = text.split('\n').filter(l => l.match(/^\s*[-*]\s+\*\*/))
  for (const line of lines) {
    const match = line.match(/\*\*(.+?):\*\*\s*(.+)/)
    if (match && match[1] && match[2]) deltas[match[1].trim()] = match[2].trim()
  }
  return deltas
}
