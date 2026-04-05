import { NextResponse } from 'next/server'
import { callClaude } from '@/src/lib/ai/claude-cli'

export const dynamic = 'force-dynamic'

/**
 * Generates 2-3 decision options from context via Claude (Haiku for speed).
 * Called separately from card-context so the panel can show context immediately.
 */
export async function POST(req: Request) {
  try {
    const { question, contextText } = await req.json() as {
      question: string
      contextText: string
    }

    if (!contextText) {
      return NextResponse.json({ options: [] })
    }

    const prompt = `Based on this decision context, what are the 2-3 realistic options Jay could choose? Be concrete and specific to this decision — not generic.

Question: ${question || 'What should Jay decide here?'}

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
    if (!jsonMatch) return NextResponse.json({ options: [] })

    const parsed = JSON.parse(jsonMatch[0])
    if (!Array.isArray(parsed)) return NextResponse.json({ options: [] })

    const options = parsed
      .filter((o: any) => o.label && o.detail)
      .slice(0, 3)
      .map((o: any) => ({ label: String(o.label), detail: String(o.detail).slice(0, 120) }))

    return NextResponse.json({ options })
  } catch (err) {
    console.error('[api/mc/card-options]', err)
    return NextResponse.json({ options: [] })
  }
}
