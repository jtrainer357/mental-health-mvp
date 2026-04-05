import { NextResponse } from 'next/server'
import { readVaultFile, listVaultDir } from '@/src/lib/vault/reader'
import { callClaude } from '@/src/lib/ai/claude-cli'

export const dynamic = 'force-dynamic'

/**
 * Returns full vault context for a Team Board card so Jay can take action.
 * POST body: { title: string, type: 'decision' | 'disagreement' | 'inbox' | 'action', agentSlug?: string, id?: string }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, type, agentSlug, id } = body as {
      title: string
      type: string
      agentSlug?: string
      id?: string
    }

    let context: CardContext | null = null

    if (type === 'decision') {
      context = findDecisionContext(title, id)
    } else if (type === 'disagreement') {
      context = findDisagreementContext(title, id)
    } else if (type === 'inbox' && agentSlug) {
      context = findInboxContext(agentSlug)
    } else if (type === 'action') {
      context = findActionContext(title)
    }

    if (!context) {
      // Fallback: search agent state files for the title
      context = searchAgentStates(title, agentSlug)
    }

    // Return context immediately — options will be fetched separately via /api/mc/card-options
    return NextResponse.json({ context, timestamp: new Date().toISOString() })
  } catch (err) {
    console.error('[api/mc/card-context]', err)
    return NextResponse.json({ context: null, error: 'Failed to load context' }, { status: 500 })
  }
}

interface CardContext {
  summary: string
  sections: { heading: string; content: string }[]
  signals: string[]
  source: string
  options?: { label: string; detail: string }[]
  question?: string
}

function findDecisionContext(title: string, id?: string): CardContext | null {
  // Extract D-XX or DIS-XXX from the title
  const decId = id || title.match(/\b(D-\d+|DIS-\d+)\b/)?.[1]

  // Search design-decisions directory
  const files = listVaultDir('product-design/design-decisions')
  for (const f of files) {
    const file = readVaultFile(`product-design/design-decisions/${f}`)
    if (!file) continue

    const matchesId = decId && file.content.includes(decId)
    const matchesTitle = file.frontmatter.title && title.includes(file.frontmatter.title.slice(0, 30))
    const filenameMatch = f.toLowerCase().includes((decId || '').toLowerCase().replace('-', ''))

    if (matchesId || matchesTitle || filenameMatch) {
      return parseFileToContext(file, `product-design/design-decisions/${f}`)
    }
  }

  // Also search the onsite decisions and other locations
  const stateFiles = ['state-reid.md', 'state-ava.md', 'state-kai.md']
  for (const sf of stateFiles) {
    const file = readVaultFile(`_agents/${sf}`)
    if (!file || !decId) continue

    const lines = file.content.split('\n')
    const matchIdx = lines.findIndex(l => l.includes(decId))
    if (matchIdx >= 0) {
      // Extract surrounding context (10 lines before and after)
      const start = Math.max(0, matchIdx - 5)
      const end = Math.min(lines.length, matchIdx + 15)
      const excerpt = lines.slice(start, end).join('\n')

      return {
        summary: `Found in ${sf.replace('state-', '').replace('.md', '')}'s working state`,
        sections: [
          { heading: 'Decision Context', content: excerpt },
        ],
        signals: extractSignalRefs(excerpt),
        source: `_agents/${sf}`,
      }
    }
  }

  return null
}

function findDisagreementContext(title: string, id?: string): CardContext | null {
  const file = readVaultFile('_agents/disagreements.md')
  if (!file) return null

  const disId = id || title.match(/\b(DIS-\d+)\b/)?.[1]
  if (!disId) {
    // Search by title fragment
    const idx = file.content.indexOf(title.slice(0, 40))
    if (idx < 0) return null
    const excerpt = file.content.slice(Math.max(0, idx - 200), idx + 1000)
    return {
      summary: 'Disagreement record',
      sections: [{ heading: 'Details', content: excerpt.trim() }],
      signals: extractSignalRefs(excerpt),
      source: '_agents/disagreements.md',
    }
  }

  // Find the section for this disagreement
  const sections = file.content.split(/(?=^###?\s)/m)
  const match = sections.find(s => s.includes(disId))
  if (match) {
    return {
      summary: `Disagreement ${disId} — needs tiebreaker`,
      sections: [{ heading: 'Disagreement Record', content: match.trim() }],
      signals: extractSignalRefs(match),
      source: '_agents/disagreements.md',
    }
  }

  return null
}

function findInboxContext(agentSlug: string): CardContext | null {
  const file = readVaultFile(`_agents/inbox-${agentSlug}.md`)
  if (!file) return null

  // Extract unprocessed items
  const unprocessedMatch = file.content.match(/## Unprocessed\s*([\s\S]*?)(?=## Processed|$)/)
  const unprocessed = unprocessedMatch?.[1]?.trim() || 'No unprocessed items'

  return {
    summary: `${agentSlug}'s inbox — items awaiting action`,
    sections: [{ heading: 'Unprocessed Items', content: unprocessed }],
    signals: extractSignalRefs(unprocessed),
    source: `_agents/inbox-${agentSlug}.md`,
  }
}

function findActionContext(title: string): CardContext | null {
  // Check Kai's state for action items
  const file = readVaultFile('_agents/state-kai.md')
  if (!file) return null

  const actId = title.match(/\b(ACT-\d+)\b/)?.[1]
  if (actId) {
    const lines = file.content.split('\n')
    const matchIdx = lines.findIndex(l => l.includes(actId))
    if (matchIdx >= 0) {
      const start = Math.max(0, matchIdx - 3)
      const end = Math.min(lines.length, matchIdx + 10)
      return {
        summary: `Action item ${actId}`,
        sections: [{ heading: 'Action Item', content: lines.slice(start, end).join('\n') }],
        signals: extractSignalRefs(lines.slice(start, end).join('\n')),
        source: '_agents/state-kai.md',
      }
    }
  }

  return null
}

function searchAgentStates(title: string, agentSlug?: string): CardContext | null {
  const slugs = agentSlug ? [agentSlug] : ['reid', 'ava', 'maren', 'kai', 'syd']

  for (const slug of slugs) {
    const file = readVaultFile(`_agents/state-${slug}.md`)
    if (!file) continue

    // Search for the title text in the file
    const searchTerm = title.slice(0, 50)
    const idx = file.content.indexOf(searchTerm)
    if (idx < 0) continue

    // Extract surrounding paragraph
    const before = file.content.lastIndexOf('\n\n', idx)
    const after = file.content.indexOf('\n\n', idx + searchTerm.length)
    const excerpt = file.content.slice(
      Math.max(0, before),
      after > 0 ? after : Math.min(file.content.length, idx + 500)
    ).trim()

    return {
      summary: `Found in ${slug}'s working state`,
      sections: [{ heading: 'Context', content: excerpt }],
      signals: extractSignalRefs(excerpt),
      source: `_agents/state-${slug}.md`,
    }
  }

  return null
}

function extractSignalRefs(text: string): string[] {
  const matches = text.match(/SIG-\d+/g) || []
  return [...new Set(matches)]
}

function parseFileToContext(
  file: { frontmatter: Record<string, any>; content: string },
  sourcePath: string
): CardContext {
  const fm = file.frontmatter
  const content = file.content

  // Parse markdown sections
  const sections: { heading: string; content: string }[] = []
  const parts = content.split(/(?=^##\s)/m)
  for (const part of parts) {
    const headingMatch = part.match(/^##\s+(.+)\n/)
    if (headingMatch) {
      sections.push({
        heading: headingMatch[1]!.trim(),
        content: part.slice(headingMatch[0].length).trim().slice(0, 1500),
      })
    } else if (part.trim() && sections.length === 0) {
      sections.push({
        heading: 'Overview',
        content: part.trim().slice(0, 1500),
      })
    }
  }

  // Extract options from content (look for Option A/B/C, numbered options, or positions)
  const options = extractOptions(content)

  // Extract the core question (look for "The Question" section or "## Decision" etc.)
  const questionSection = sections.find(s =>
    /question|decision needed|what.*decide|choose/i.test(s.heading)
  )
  const question = questionSection?.content?.slice(0, 300) || undefined

  return {
    summary: fm.title || sourcePath,
    sections: sections.slice(0, 8),
    signals: [
      ...(fm['signal-refs'] || []),
      ...extractSignalRefs(content),
    ],
    source: sourcePath,
    options: options.length > 0 ? options : undefined,
    question,
  }
}

function extractOptions(content: string): { label: string; detail: string }[] {
  const options: { label: string; detail: string }[] = []
  let match

  // Pattern 1: **Option A:** or **Option B:** etc. — explicit decision options
  const optionPattern = /\*\*Option\s+([A-Z\d])(?::\s*|\*\*:\s*|\*\*\s*[-—]\s*)(.+?)(?=\*\*Option|\n##|\n\*\*|$)/g
  while ((match = optionPattern.exec(content)) !== null) {
    options.push({
      label: `Option ${match[1]}`,
      detail: match[2]!.replace(/\*\*/g, '').trim().split('\n')[0]!.slice(0, 120),
    })
  }
  if (options.length >= 2 && options.length <= 4) return options

  // Pattern 2: Agent positions in disagreements like "Reid's position:" or "**Rich:**"
  const agentPosPattern = /\*\*((?:Reid|Ava|Maren|Kai|Syd|Rich|Caitlin|EJ)(?:'s position)?)\*?\*?[:\s—-]+(.+?)(?=\*\*(?:Reid|Ava|Maren|Kai|Syd|Rich|Caitlin|EJ)|\n##|$)/gi
  while ((match = agentPosPattern.exec(content)) !== null) {
    const label = match[1]!.replace(/'s position/, '').trim()
    const detail = match[2]!.replace(/\*\*/g, '').trim().split('\n')[0]!.slice(0, 120)
    // Avoid duplicates
    if (!options.find(o => o.label === label)) {
      options.push({ label, detail })
    }
  }
  if (options.length >= 2 && options.length <= 4) return options

  // No numbered pattern — it was matching pipeline steps as "positions" which is wrong.
  // Only return options when we have clear 2-4 distinct choices, not sequential steps.
  return []
}

async function generateDecisionOptions(context: CardContext): Promise<{ label: string; detail: string }[]> {
  const contextText = context.sections.map(s => `## ${s.heading}\n${s.content}`).join('\n\n')

  const prompt = `Based on this decision context, what are the 2-3 realistic options Jay could choose? Be concrete and specific to this decision — not generic.

Question: ${context.question}

Context:
${contextText.slice(0, 3000)}

Respond with ONLY valid JSON array, no markdown:
[{"label":"Option A","detail":"one-line description of this choice"},{"label":"Option B","detail":"one-line description"}]`

  const result = await callClaude({
    systemPrompt: 'You synthesize design decision options for a product leader. Return only a JSON array of 2-3 options. Each option has a "label" (short name) and "detail" (one sentence, under 100 chars). Be specific to the decision context, not generic.',
    message: prompt,
    model: 'haiku',
  })

  const jsonMatch = result.match(/\[[\s\S]*\]/)
  if (!jsonMatch) return []

  const parsed = JSON.parse(jsonMatch[0])
  if (!Array.isArray(parsed)) return []

  return parsed
    .filter((o: any) => o.label && o.detail)
    .slice(0, 3)
    .map((o: any) => ({ label: String(o.label), detail: String(o.detail).slice(0, 120) }))
}
