import { readVaultFile } from './reader'
import type { ResearchRequest } from './types'

export function getResearchQueue(): ResearchRequest[] {
  const file = readVaultFile('_agents/research-queue.md')
  if (!file) return []

  const blocks = file.content.split(/(?=^## RQ-)/m).filter(b => b.startsWith('## RQ-'))

  return blocks.map(block => {
    const headerMatch = block.match(/^## (RQ-\d+):?\s*(.*)/)
    const priorityMatch = block.match(/\*\*Priority:\*\*\s*(.+)/i)
    const statusMatch = block.match(/\*\*Status:\*\*\s*(.+)/i)
    const filedMatch = block.match(/\*\*Filed:\*\*\s*(.+)/i)

    return {
      id: headerMatch?.[1] || 'unknown',
      title: headerMatch?.[2]?.trim() || '',
      priority: (priorityMatch?.[1]?.trim().toLowerCase() as ResearchRequest['priority']) || 'medium',
      status: (statusMatch?.[1]?.trim().toLowerCase() as ResearchRequest['status']) || 'open',
      filedDate: filedMatch?.[1]?.trim() || '',
      content: block,
    }
  })
}
