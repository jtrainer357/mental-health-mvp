import { getAllAgentStates } from './agents'
import { getConfirmedSignals, getEmergingSignals } from './signals'
import { getAllDecisions } from './decisions'
import { getDisagreements } from './disagreements'
import { getResearchQueue } from './research-queue'
import { getFileModTime, readVaultFile } from './reader'
import type { VaultHealth } from './types'

function countKaiActions(): { open: number; total: number } {
  const file = readVaultFile('_agents/state-kai.md')
  if (!file) return { open: 0, total: 0 }

  const lines = file.content.split('\n').filter(l => /^\|\s*ACT-\d+/.test(l))
  const open = lines.filter(l => {
    const cols = l.split('|').map(c => c.trim())
    const status = cols[5]?.toLowerCase() || ''
    return status === 'pending' || status === 'in-progress' || status === 'blocked'
  }).length

  return { open, total: lines.length }
}

export function getVaultHealth(): VaultHealth {
  const agents = getAllAgentStates()
  const confirmed = getConfirmedSignals()
  const emerging = getEmergingSignals()
  const decisions = getAllDecisions()
  const disagreements = getDisagreements()
  const researchQueue = getResearchQueue()
  const kaiActions = countKaiActions()

  const staleSignals = confirmed.filter(s => s.isStale)
  const totalInbox = agents.reduce((sum, a) => sum + a.inboxCount, 0)

  // Get last vault sync time from most recently modified agent state file
  const stateTimes = ['maren', 'reid', 'ava', 'kai', 'syd']
    .map(s => getFileModTime(`_agents/state-${s}.md`))
    .filter((t): t is Date => t !== null)
  const lastSync = stateTimes.length > 0
    ? new Date(Math.max(...stateTimes.map(t => t.getTime()))).toISOString()
    : 'Unknown'

  return {
    agentCount: agents.length,
    signalCount: {
      confirmed: confirmed.length,
      emerging: emerging.length,
      archive: 0, // Could read archive file
    },
    decisionCount: decisions.length,
    disagreementCount: disagreements.filter(d => d.status === 'active').length,
    researchQueueCount: researchQueue.filter(r => r.status === 'open').length,
    actionCount: kaiActions.open,
    inboxTotal: totalInbox,
    lastVaultSync: lastSync,
    staleSignalCount: staleSignals.length,
  }
}
