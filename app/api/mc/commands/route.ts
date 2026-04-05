import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export const dynamic = 'force-dynamic'

interface Command {
  name: string
  description: string
  category: string
}

const COMMAND_CATEGORIES: Record<string, string> = {
  resume: 'Morning Routine',
  dashboard: 'Morning Routine',
  standup: 'Morning Routine',
  debrief: 'Research',
  synthesize: 'Research',
  'prep-guide': 'Research',
  capture: 'Research',
  weekplan: 'Planning',
  timeline: 'Planning',
  'scope-check': 'Planning',
  risks: 'Planning',
  decisions: 'Design',
  critique: 'Design',
  challenge: 'Design',
  handoff: 'Design',
  shutdown: 'Operations',
  log: 'Operations',
  healthcheck: 'Operations',
  actions: 'Operations',
  meeting: 'Operations',
  retro: 'Operations',
  evidence: 'Evidence',
  xpoll: 'Evidence',
  feedback: 'Evidence',
  status: 'Communication',
  brief: 'Communication',
  tldr: 'Communication',
  weekdiff: 'Communication',
}

export async function GET() {
  const commands: Command[] = []

  // Read from .claude/skills/ directory
  const skillsDir = path.resolve(process.cwd(), '..', '.claude', 'skills')

  try {
    const dirs = fs.readdirSync(skillsDir)
    for (const dir of dirs) {
      const skillPath = path.join(skillsDir, dir, 'SKILL.md')
      try {
        const raw = fs.readFileSync(skillPath, 'utf-8')
        const { data } = matter(raw)
        if (data.name) {
          commands.push({
            name: data.name,
            description: data.description || '',
            category: COMMAND_CATEGORIES[data.name] || 'Other',
          })
        }
      } catch { /* skip unreadable skills */ }
    }
  } catch { /* skills dir not found */ }

  // Sort by category then name
  commands.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))

  return NextResponse.json({ commands, timestamp: new Date().toISOString() })
}
