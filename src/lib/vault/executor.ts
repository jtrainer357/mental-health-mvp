import { callClaude } from '@/src/lib/ai/claude-cli'
import { readVaultFile } from './reader'
import { writeInboxMessage, appendToSection } from './writer'

// --- Agent metadata helpers ---

function getDefFile(slug: string): string {
  const map: Record<string, string> = {
    maren: 'researcher.md',
    reid: 'strategist.md',
    ava: 'designer.md',
    kai: 'pm.md',
    syd: 'engineer.md',
  }
  return map[slug] || `${slug}.md`
}

function getAgentName(slug: string): string {
  const map: Record<string, string> = {
    maren: 'Maren (Researcher)',
    reid: 'Reid (Strategist)',
    ava: 'Ava (Designer)',
    kai: 'Kai (PM)',
    syd: 'Syd (Engineer)',
  }
  return map[slug] || slug
}

/**
 * Build a system prompt for an agent by loading its definition, state,
 * and confirmed signals from the vault.
 */
function getAgentSystemPrompt(slug: string): string {
  const definition = readVaultFile(`_agents/${getDefFile(slug)}`)
  const state = readVaultFile(`_agents/state-${slug}.md`)
  const signals = readVaultFile(`_agents/signals-confirmed.md`)

  return `You are ${getAgentName(slug)}, a specialized agent in the Tebra Second Brain system.

## Your Definition
${definition?.content || ''}

## Your Current State
${state?.content?.slice(0, 3000) || 'No state loaded.'}

## Confirmed Signals (summary)
${signals?.content?.slice(0, 2000) || 'No signals loaded.'}

Respond in character. Be concise and action-oriented.`
}

// --- Flight Plan generation ---

/**
 * Use the Claude CLI to decompose a goal into an ordered sequence
 * of agent tasks (a "flight plan").
 */
export async function generateFlightPlan(goal: string): Promise<FlightPlan> {
  const bootstrap = readVaultFile('_agents/session-bootstrap.md')

  const systemPrompt = `You are the Mission Control orchestrator for a five-agent system (Maren=Researcher, Reid=Strategist, Ava=Designer, Kai=PM, Syd=Engineer). Given a goal, produce a flight plan — an ordered sequence of agent tasks that accomplish the goal.

Current system state:
${bootstrap?.content?.slice(0, 2000) || 'No bootstrap loaded.'}

Respond with ONLY valid JSON matching this schema:
{
  "goal": "the original goal",
  "summary": "one-line plan summary",
  "steps": [
    { "order": 1, "agent": "slug", "task": "what this agent should do", "dependsOn": null },
    { "order": 2, "agent": "slug", "task": "what this agent should do", "dependsOn": 1 }
  ],
  "estimatedMinutes": 5,
  "parallel": false
}`

  try {
    const text = await callClaude({
      systemPrompt,
      message: goal,
      model: 'sonnet',
    })

    // Extract JSON from response (may be wrapped in markdown code block)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in response')
    const plan = JSON.parse(jsonMatch[0])
    return {
      id: `fp-${Date.now()}`,
      goal,
      summary: plan.summary || goal,
      steps: plan.steps || [],
      estimatedMinutes: plan.estimatedMinutes || 5,
      parallel: plan.parallel || false,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
  } catch {
    // Fallback: simple single-agent plan
    return {
      id: `fp-${Date.now()}`,
      goal,
      summary: goal,
      steps: [{ order: 1, agent: 'kai', task: goal, dependsOn: null }],
      estimatedMinutes: 3,
      parallel: false,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
  }
}

// --- Flight Plan execution ---

/**
 * Execute a flight plan by writing structured messages into each
 * assigned agent's inbox. Claude Code picks these up on next session.
 */
export async function executeFlightPlan(
  plan: FlightPlan
): Promise<{ success: boolean; message: string }> {
  try {
    for (const step of plan.steps) {
      writeInboxMessage(step.agent, {
        from: 'Mission Control',
        subject: `Flight Plan: ${plan.summary}`,
        type: 'request',
        priority: 'high',
        content: `Goal: ${plan.goal}\n\nYour task (step ${step.order}): ${step.task}`,
        actionNeeded: step.task,
        related: [],
      })
    }

    // Log to bootstrap hot items
    appendToSection(
      '_agents/session-bootstrap.md',
      'Hot Items',
      `- [FLIGHT PLAN] ${plan.summary} -- ${plan.steps.length} agents queued`
    )

    return {
      success: true,
      message: `Flight plan queued: ${plan.steps.length} agent tasks created`,
    }
  } catch (e) {
    return { success: false, message: `Failed to execute: ${e}` }
  }
}

// --- Quick agent task ---

/**
 * Run a one-shot task against a single agent using the Claude CLI.
 * Returns the agent's text response immediately.
 */
export async function quickAgentTask(agentSlug: string, task: string): Promise<string> {
  const systemPrompt = getAgentSystemPrompt(agentSlug)

  return callClaude({
    systemPrompt,
    message: task,
    model: 'sonnet',
  })
}

// --- Types ---

export interface FlightPlan {
  id: string
  goal: string
  summary: string
  steps: FlightPlanStep[]
  estimatedMinutes: number
  parallel: boolean
  status: 'pending' | 'approved' | 'executing' | 'completed'
  createdAt: string
}

export interface FlightPlanStep {
  order: number
  agent: string
  task: string
  dependsOn: number | null
}
