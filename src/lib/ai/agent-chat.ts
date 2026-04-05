import { callClaude } from './claude-cli'
import { readVaultFile } from '@/src/lib/vault/reader'

const AGENT_DEFS: Record<string, string> = {
  maren: 'researcher.md',
  reid: 'strategist.md',
  ava: 'designer.md',
  kai: 'pm.md',
  syd: 'engineer.md',
}

const AGENT_NAMES: Record<string, string> = {
  maren: 'Maren (Researcher)',
  reid: 'Reid (Strategist)',
  ava: 'Ava (Designer)',
  kai: 'Kai (PM)',
  syd: 'Syd (Engineer)',
}

export const VALID_AGENTS = Object.keys(AGENT_DEFS)

function buildSystemPrompt(slug: string): string {
  const def = readVaultFile(`_agents/${AGENT_DEFS[slug]}`)
  const state = readVaultFile(`_agents/state-${slug}.md`)
  const inbox = readVaultFile(`_agents/inbox-${slug}.md`)
  const signals = readVaultFile(`_agents/signals-confirmed.md`)

  return `You are ${AGENT_NAMES[slug] || slug}, a specialized agent in Jay's five-agent product design system for the Tebra Mental Health MVP.

## Your Agent Definition
${def?.content?.slice(0, 3000) || ''}

## Your Current State (Hot Context)
${state?.content?.slice(0, 2000) || 'No state loaded.'}

## Your Inbox
${inbox?.content?.slice(0, 1000) || 'No messages.'}

## Confirmed Signals (recent)
${signals?.content?.slice(0, 2000) || ''}

Respond in character as ${AGENT_NAMES[slug]}. Be warm, direct, and action-oriented. Use Jay's voice — no corporate jargon. When you reference vault artifacts, use [[wikilink]] syntax.`
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function chatWithAgent(
  slug: string,
  message: string,
  history: ChatMessage[] = []
): Promise<string> {
  const systemPrompt = buildSystemPrompt(slug)

  // Build a single message that includes conversation history
  const historyText = history
    .map(m => `${m.role === 'user' ? 'Jay' : AGENT_NAMES[slug]}: ${m.content}`)
    .join('\n\n')

  const fullMessage = historyText
    ? `Previous conversation:\n${historyText}\n\nJay: ${message}`
    : message

  return callClaude({
    systemPrompt,
    message: fullMessage,
    model: 'sonnet',
  })
}
