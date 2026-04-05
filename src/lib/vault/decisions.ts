import { readVaultFile, listVaultDir } from './reader'
import type { DesignDecision } from './types'

/**
 * Sources for decisions:
 * 1. Individual DD-*.md files in product-design/design-decisions/
 * 2. Embedded decisions (D-33+) in daily log synthesis files
 */
export function getAllDecisions(): DesignDecision[] {
  // Source 1: Individual decision files
  const files = listVaultDir('product-design/design-decisions')
  const fromFiles = files
    .map(f => parseDecision(`product-design/design-decisions/${f}`))
    .filter((d): d is DesignDecision => d !== null)

  // Source 2: Embedded decisions from daily logs
  const embeddedSources = [
    { path: '_daily-logs/2026-03-30-31-onsite-master-synthesis.md', defaultDate: '2026-03-31' },
    { path: '_daily-logs/2026-04-01-wireframe-walkthrough-analysis.md', defaultDate: '2026-04-01' },
  ]
  const fromEmbedded: DesignDecision[] = []
  for (const source of embeddedSources) {
    fromEmbedded.push(...parseEmbeddedDecisions(source.path, source.defaultDate))
  }

  const all = [...fromFiles, ...fromEmbedded]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Deduplicate by ID — keep the most recently dated version
  const seen = new Map<string, DesignDecision>()
  for (const dec of all) {
    if (!seen.has(dec.id) || new Date(dec.date) > new Date(seen.get(dec.id)!.date)) {
      seen.set(dec.id, dec)
    }
  }
  return Array.from(seen.values())
}

/**
 * Parse embedded decisions from daily log files.
 * Format: **D-XX: Title**\n- bullet points of context
 */
function parseEmbeddedDecisions(relativePath: string, defaultDate: string): DesignDecision[] {
  const file = readVaultFile(relativePath)
  if (!file) return []

  const results: DesignDecision[] = []
  const lines = file.content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    // Match lines like: **D-33: "Title here"** or ### D-75: Title here
    const line = lines[i] || ''
    const match = line.match(/^\*\*(D-\d+):\s*(.+?)\*\*/) || line.match(/^###\s+(D-\d+):\s*(.+)/)
    if (!match || !match[1] || !match[2]) continue

    const id: string = match[1]
    const title: string = match[2].replace(/^[\u201C""]|[\u201D""]$/g, '').trim()

    // Collect bullet points below as content
    const contentLines: string[] = []
    let j = i + 1
    while (j < lines.length) {
      const nextLine = lines[j] || ''
      if (nextLine.startsWith('- ') || nextLine.trim() === '') {
        if (nextLine.startsWith('- ')) contentLines.push(nextLine)
        j++
      } else {
        break
      }
    }

    // Extract owner/author from bullet text
    const ownerLine = contentLines.find(l => /owner:/i.test(l))
    const author = ownerLine ? ownerLine.replace(/^-\s*owner:\s*/i, '').trim() : ''

    // Check for signal refs in content
    const allContent = contentLines.join('\n')
    const sigRefs = Array.from(allContent.matchAll(/SIG-\d+/g)).map(m => m[0])
    const prdRefs = Array.from(allContent.matchAll(/REQ-[A-Z]+-\d+/g)).map(m => m[0])

    results.push({
      id,
      title,
      status: 'accepted',
      date: defaultDate,
      author,
      signalRefs: sigRefs,
      decisionRefs: [],
      prdRefs,
      wireflowRefs: [],
      tags: ['onsite'],
      content: contentLines.join('\n').slice(0, 2000),
    })
  }

  return results
}

function parseDecision(relativePath: string): DesignDecision | null {
  const file = readVaultFile(relativePath)
  if (!file) return null

  const fm = file.frontmatter

  // Try to extract decision ID from content or filename
  const idMatch = file.content.match(/\b(D-\d+)\b/) || relativePath.match(/DD-(.+)\.md/)

  return {
    id: fm.id || fm['decision-refs']?.[0] || (idMatch ? idMatch[1] : relativePath),
    title: fm.title || relativePath.replace(/\.md$/, '').split('/').pop() || '',
    status: fm.status || 'draft',
    date: fm.date || '',
    author: fm.author || '',
    signalRefs: fm['signal-refs'] || fm.signals || [],
    decisionRefs: fm['decision-refs'] || fm.decisions || [],
    prdRefs: fm['prd-refs'] || fm.prdRefs || [],
    wireflowRefs: fm['wireflow-refs'] || fm.wireflows || [],
    tags: fm.tags || [],
    content: file.content.slice(0, 2000), // Truncate for API response
  }
}
