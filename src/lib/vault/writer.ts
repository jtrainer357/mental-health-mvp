import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { getVaultPath } from './reader'

/**
 * Update frontmatter fields on a vault file. Preserves existing fields,
 * merges in updates. Preserves markdown content below frontmatter.
 */
export function updateFrontmatter(relativePath: string, updates: Record<string, any>): boolean {
  try {
    const fullPath = getVaultPath(relativePath)
    const raw = fs.readFileSync(fullPath, 'utf-8')
    const { data, content } = matter(raw)

    const merged = { ...data, ...updates }
    const output = matter.stringify(content, merged)
    fs.writeFileSync(fullPath, output, 'utf-8')
    return true
  } catch (err) {
    console.error(`[vault-writer] updateFrontmatter failed for ${relativePath}:`, err)
    return false
  }
}

/**
 * Append content to a specific ## section in a markdown file.
 * If section doesn't exist, creates it at the end.
 */
export function appendToSection(relativePath: string, sectionHeading: string, content: string): boolean {
  try {
    const fullPath = getVaultPath(relativePath)
    const raw = fs.readFileSync(fullPath, 'utf-8')
    const { data, content: body } = matter(raw)

    const headingPattern = `## ${sectionHeading}`
    const lines = body.split('\n')
    let sectionStart = -1
    let sectionEnd = -1

    for (let i = 0; i < lines.length; i++) {
      if (lines[i]!.trim() === headingPattern || lines[i]!.trim().startsWith(`${headingPattern}\n`)) {
        sectionStart = i
        // Find the end — next ## heading or end of file
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j]!.match(/^##\s+/)) {
            sectionEnd = j
            break
          }
        }
        if (sectionEnd === -1) sectionEnd = lines.length
        break
      }
    }

    let newBody: string
    if (sectionStart !== -1) {
      // Insert content just before the next section (or end)
      lines.splice(sectionEnd, 0, content, '')
      newBody = lines.join('\n')
    } else {
      // Section doesn't exist — append at end
      newBody = body.trimEnd() + '\n\n' + headingPattern + '\n' + content + '\n'
    }

    const output = Object.keys(data).length > 0 ? matter.stringify(newBody, data) : newBody
    fs.writeFileSync(fullPath, output, 'utf-8')
    return true
  } catch (err) {
    console.error(`[vault-writer] appendToSection failed for ${relativePath}:`, err)
    return false
  }
}

/**
 * Move an inbox message from Unprocessed to Processed section.
 * Adds [PROCESSED YYYY-MM-DD] prefix.
 */
export function processInboxMessage(agentSlug: string, messageDate: string, messageSubject: string): boolean {
  try {
    const relativePath = `_agents/inbox-${agentSlug}.md`
    const fullPath = getVaultPath(relativePath)
    const raw = fs.readFileSync(fullPath, 'utf-8')
    const { data, content } = matter(raw)

    // Split into sections
    const unprocessedMatch = content.match(/(## Unprocessed\n)([\s\S]*?)(## Processed)/m)
    if (!unprocessedMatch) {
      console.error(`[vault-writer] Could not find Unprocessed/Processed sections in inbox-${agentSlug}.md`)
      return false
    }

    const unprocessedContent = unprocessedMatch[2] || ''
    const processedMarker = unprocessedMatch[3] || '## Processed'

    // Find the message block by matching date and subject
    const messagePattern = new RegExp(
      `(### \\[${escapeRegex(messageDate)}\\]\\s+From\\s+.+?:\\s+${escapeRegex(messageSubject)}[\\s\\S]*?)(?=### \\[|$)`,
      'm'
    )
    const msgMatch = unprocessedContent.match(messagePattern)
    if (!msgMatch || !msgMatch[1]) {
      console.error(`[vault-writer] Could not find message "${messageSubject}" dated ${messageDate} in inbox-${agentSlug}.md`)
      return false
    }

    const messageBlock = msgMatch[1].trim()
    const today = new Date().toISOString().split('T')[0]
    const processedBlock = `### [PROCESSED ${today}] ${messageBlock.replace(/^### /, '')}`

    // Remove from Unprocessed
    const newUnprocessed = unprocessedContent.replace(messagePattern, '').trim()
    const cleanUnprocessed = newUnprocessed || '(No messages)'

    // Add to Processed section
    const parts = content.split('## Processed')
    if (parts.length < 2) {
      console.error(`[vault-writer] No ## Processed section found in inbox-${agentSlug}.md`)
      return false
    }

    const newContent =
      parts[0]!.replace(/## Unprocessed\n[\s\S]*$/, '') +
      '## Unprocessed\n' + cleanUnprocessed + '\n\n' +
      '## Processed\n' + processedBlock + '\n' + (parts[1] || '')

    const output = Object.keys(data).length > 0 ? matter.stringify(newContent, data) : newContent
    fs.writeFileSync(fullPath, output, 'utf-8')
    return true
  } catch (err) {
    console.error(`[vault-writer] processInboxMessage failed:`, err)
    return false
  }
}

/**
 * Write a new structured message to an agent's inbox (Unprocessed section).
 */
export function writeInboxMessage(agentSlug: string, message: {
  from: string
  subject: string
  type: 'signal' | 'decision' | 'request' | 'alert' | 'question'
  priority: 'high' | 'medium' | 'low'
  content: string
  actionNeeded: string
  related: string[]
}): boolean {
  try {
    const relativePath = `_agents/inbox-${agentSlug}.md`
    const fullPath = getVaultPath(relativePath)
    const raw = fs.readFileSync(fullPath, 'utf-8')
    const { data, content } = matter(raw)

    const today = new Date().toISOString().split('T')[0]
    const relatedLinks = message.related.map(r => `[[${r}]]`).join(', ')

    const messageBlock = `### [${today}] From ${message.from}: ${message.subject}
**Type:** ${message.type}
**Priority:** ${message.priority}
**Content:** ${message.content}
**Action needed:** ${message.actionNeeded}
**Related:** ${relatedLinks}`

    // Find Unprocessed section and insert at top
    const unprocessedHeading = '## Unprocessed'
    const idx = content.indexOf(unprocessedHeading)
    if (idx === -1) {
      console.error(`[vault-writer] No ## Unprocessed section in inbox-${agentSlug}.md`)
      return false
    }

    const afterHeading = idx + unprocessedHeading.length
    const existingAfter = content.slice(afterHeading)

    // Remove "(No messages)" if present
    const cleaned = existingAfter.replace(/^\n\(No messages\)\s*/, '\n')

    const newContent = content.slice(0, afterHeading) + '\n' + messageBlock + '\n' + cleaned

    const output = Object.keys(data).length > 0 ? matter.stringify(newContent, data) : newContent
    fs.writeFileSync(fullPath, output, 'utf-8')
    return true
  } catch (err) {
    console.error(`[vault-writer] writeInboxMessage failed:`, err)
    return false
  }
}

/**
 * Append a new research request to research-queue.md
 */
export function createResearchRequest(request: {
  id: string
  title: string
  requestedBy: string
  priority: 'high' | 'medium' | 'low'
  context: string
  suggestedApproach: string
  relatedSignals: string[]
}): boolean {
  try {
    const relativePath = '_agents/research-queue.md'
    const fullPath = getVaultPath(relativePath)
    const raw = fs.readFileSync(fullPath, 'utf-8')

    const today = new Date().toISOString().split('T')[0]
    const signalRefs = request.relatedSignals.map(s => `[[${s}]]`).join(', ')

    const block = `

## ${request.id}: ${request.title}
**Filed:** ${today}
**Requested by:** ${request.requestedBy}
**Priority:** ${request.priority}
**Status:** open

**Context:** ${request.context}

**Suggested approach:** ${request.suggestedApproach}

**Related signals:** ${signalRefs}
`

    fs.writeFileSync(fullPath, raw.trimEnd() + '\n' + block, 'utf-8')
    return true
  } catch (err) {
    console.error(`[vault-writer] createResearchRequest failed:`, err)
    return false
  }
}

/**
 * Update sections in session-bootstrap.md
 */
export function updateBootstrapSections(updates: { hotItems?: string[]; overdueItems?: string[] }): boolean {
  try {
    const relativePath = '_agents/session-bootstrap.md'
    const fullPath = getVaultPath(relativePath)
    const raw = fs.readFileSync(fullPath, 'utf-8')
    const { data, content } = matter(raw)

    let newContent = content

    if (updates.hotItems) {
      const bullets = updates.hotItems.map(item => `- ${item}`).join('\n')
      newContent = replaceSection(newContent, 'Hot Items', bullets) ||
                   replaceSection(newContent, 'Hot Items (Top 5)', bullets) ||
                   newContent
    }

    if (updates.overdueItems) {
      const bullets = updates.overdueItems.map(item => `- ${item}`).join('\n')
      newContent = replaceSection(newContent, 'Overdue Items', bullets) || newContent
    }

    const output = Object.keys(data).length > 0 ? matter.stringify(newContent, data) : newContent
    fs.writeFileSync(fullPath, output, 'utf-8')
    return true
  } catch (err) {
    console.error(`[vault-writer] updateBootstrapSections failed:`, err)
    return false
  }
}

// --- Helpers ---

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Replace the content of a ## section, preserving the heading.
 * Returns the new full content, or null if section not found.
 */
function replaceSection(markdown: string, heading: string, newSectionContent: string): string | null {
  const lines = markdown.split('\n')
  let sectionStart = -1
  let sectionEnd = -1

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i]!.trim()
    if (trimmed === `## ${heading}` || trimmed.startsWith(`## ${heading}`)) {
      sectionStart = i
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j]!.match(/^##\s+/)) {
          sectionEnd = j
          break
        }
      }
      if (sectionEnd === -1) sectionEnd = lines.length
      break
    }
  }

  if (sectionStart === -1) return null

  const before = lines.slice(0, sectionStart + 1)
  const after = lines.slice(sectionEnd)
  return [...before, newSectionContent, '', ...after].join('\n')
}

/**
 * Find a decision file by its ID (D-XX) in design-decisions directory.
 * Searches frontmatter id, decision-refs, and content for the ID.
 */
export function findDecisionFilePath(decisionId: string): string | null {
  try {
    const dirPath = getVaultPath('product-design/design-decisions')
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md') && !f.startsWith('.'))

    for (const file of files) {
      const relativePath = `product-design/design-decisions/${file}`
      const fullPath = getVaultPath(relativePath)
      const raw = fs.readFileSync(fullPath, 'utf-8')
      const { data, content } = matter(raw)

      // Check frontmatter id
      if (data.id === decisionId) return relativePath

      // Check decision-refs array
      const refs = data['decision-refs'] || data.decisions || []
      if (Array.isArray(refs) && refs.includes(decisionId)) return relativePath

      // Check content for the ID pattern
      if (content.includes(decisionId)) return relativePath
    }

    return null
  } catch (err) {
    console.error(`[vault-writer] findDecisionFilePath failed for ${decisionId}:`, err)
    return null
  }
}
