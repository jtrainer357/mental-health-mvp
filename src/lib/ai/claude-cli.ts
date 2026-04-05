import { execFile } from 'child_process'
import { writeFileSync, unlinkSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const CLAUDE_BIN = process.env.CLAUDE_BIN || '/opt/homebrew/bin/claude'

/**
 * Call the Claude CLI in print mode (-p) with a system prompt and user message.
 * Uses the user's Max subscription — no API key needed.
 * Writes system prompt to a temp file to avoid ARG_MAX limits.
 */
export function callClaude(opts: {
  systemPrompt: string
  message: string
  model?: string
  maxTokens?: number
}): Promise<string> {
  const { systemPrompt, message, model = 'sonnet', maxTokens } = opts

  // Write system prompt to temp file to avoid ARG_MAX limits
  const tmpFile = join(tmpdir(), `mc-prompt-${Date.now()}-${Math.random().toString(36).slice(2)}.txt`)
  writeFileSync(tmpFile, systemPrompt, 'utf-8')

  const args = [
    '-p',
    '--system-prompt-file', tmpFile,
    '--model', model,
    '--no-session-persistence',
  ]

  if (maxTokens) {
    args.push('--max-budget-usd', String(Math.ceil(maxTokens / 10000)))
  }

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      try { unlinkSync(tmpFile) } catch { /* ignore */ }
    }

    const proc = execFile(CLAUDE_BIN, args, {
      maxBuffer: 1024 * 1024,
      timeout: 120_000,
      env: { ...process.env, TERM: 'dumb' },
    }, (error, stdout, stderr) => {
      cleanup()
      if (error) {
        console.error('[claude-cli] stderr:', stderr)
        reject(new Error(`Claude CLI failed: ${error.message}`))
        return
      }
      resolve(stdout.trim())
    })

    // Send user message via stdin
    proc.stdin?.write(message)
    proc.stdin?.end()
  })
}
