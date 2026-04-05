import { readVaultFile } from './reader'
import type { Disagreement } from './types'

export function getDisagreements(): Disagreement[] {
  const file = readVaultFile('_agents/disagreements.md')
  if (!file) return []

  const blocks = file.content.split(/(?=^## DIS-)/m).filter(b => b.startsWith('## DIS-'))

  return blocks.map(block => {
    const headerMatch = block.match(/^## (DIS-\d+):?\s*(.*)/)
    const statusMatch = block.match(/\*\*Status:\*\*\s*(.+)/i)
    const agentsMatch = block.match(/\*\*Agents:\*\*\s*(.+)/i)

    return {
      id: headerMatch?.[1] || 'unknown',
      title: headerMatch?.[2]?.trim() || '',
      date: '',
      agents: agentsMatch?.[1]?.split(/[,&]/).map(a => a.trim()) || [],
      status: statusMatch?.[1]?.toLowerCase().includes('resolved') ? 'resolved' as const : 'active' as const,
      positions: block,
    }
  })
}
