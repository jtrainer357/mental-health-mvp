import { readVaultFile } from './reader'
import type { Signal } from './types'

export function getConfirmedSignals(): Signal[] {
  return parseSignalFile('_agents/signals-confirmed.md', 'confirmed')
}

export function getEmergingSignals(): Signal[] {
  return parseSignalFile('_agents/signals-emerging.md', 'emerging')
}

export function getAllSignals(): Signal[] {
  return [...getConfirmedSignals(), ...getEmergingSignals()]
}

function parseSignalFile(path: string, defaultLifecycle: Signal['lifecycle']): Signal[] {
  const file = readVaultFile(path)
  if (!file) return []

  const signals: Signal[] = []
  const blocks = file.content.split(/(?=^### SIG-)/m).filter(b => b.startsWith('### SIG-'))

  for (const block of blocks) {
    const headerMatch = block.match(/^### (SIG-\d+):?\s*(.*)/)
    if (!headerMatch) continue

    const id = headerMatch[1]!
    const title = headerMatch[2]?.trim() || id

    const getField = (name: string): string => {
      const match = block.match(new RegExp(`[-*]\\s+\\*\\*${name}:?\\*\\*\\s*(.+)`, 'i'))
      return match?.[1]?.trim() || ''
    }

    const strength = getField('Strength').toLowerCase() as Signal['strength'] || 'moderate'
    const lifecycle = getField('Lifecycle').toLowerCase() as Signal['lifecycle'] || defaultLifecycle
    const filed = getField('Filed')
    const lastValidated = getField('Last validated')
    const finding = getField('Finding') || getField('Summary')
    const strategyImpact = getField('Strategy impact') || getField('Strategy')
    const designImpact = getField('Design impact') || getField('Design')

    // Check staleness (>14 days since last validated)
    let isStale = false
    if (lastValidated) {
      try {
        const validatedDate = new Date(lastValidated)
        const daysSince = (Date.now() - validatedDate.getTime()) / (1000 * 60 * 60 * 24)
        isStale = daysSince > 14
      } catch { /* ignore parse errors */ }
    }

    signals.push({
      id, title, strength, lifecycle, filed, lastValidated,
      finding, strategyImpact, designImpact,
      sources: [], // Could extract from wikilinks
      isStale,
    })
  }

  return signals
}
