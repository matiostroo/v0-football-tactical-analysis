import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/service'
import { buildAnalysisContext } from './context-builder'
import { buildPrompt } from './prompt'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MODEL = 'claude-sonnet-4-6'

/**
 * Generates (or regenerates) the AI analysis for a specific match
 * from a specific organization's perspective, then saves to team_analysis.
 */
export async function generateAnalysis(
  organizationId: string,
  matchId: string,
): Promise<void> {
  const db = createServiceClient()

  // Build context from Supabase data
  const context = await buildAnalysisContext(organizationId, matchId)
  const prompt = buildPrompt(context)

  // Call Claude
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Respuesta inesperada de Claude')

  // Strip markdown code fences if present
  const raw = content.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const analysis = JSON.parse(raw)

  // Persist to team_analysis (upsert — one row per org+match)
  await db.from('team_analysis').upsert(
    {
      organization_id: organizationId,
      match_id: matchId,
      rival_club_id: context.rival.clubId,
      analysis,
      prompt_context: {
        ownTeam: context.ownTeam.name,
        rival: context.rival.name,
        matchDate: context.match.scheduledAt,
        competition: context.match.competition,
        ownLast5Count: context.ownTeam.last5Results.length,
        rivalLast5Count: context.rival.last5Results.length,
        titularityPatternsCount: context.rival.titularityPatterns.length,
        ownAbsencesCount: context.ownTeam.absences.length,
        rivalAbsencesCount: context.rival.absences.length,
      },
      model_version: MODEL,
      generated_at: new Date().toISOString(),
      needs_refresh: false,
    },
    { onConflict: 'organization_id,match_id' },
  )
}

/**
 * Returns the existing analysis for a match, or generates it on the spot
 * if it doesn't exist yet. Used by the dashboard for on-demand rendering.
 */
export async function getOrGenerateAnalysis(organizationId: string, matchId: string) {
  const db = createServiceClient()

  const { data: existing } = await db
    .from('team_analysis')
    .select('analysis, generated_at, needs_refresh')
    .eq('organization_id', organizationId)
    .eq('match_id', matchId)
    .single()

  // Return cached unless it's flagged for refresh
  if (existing && !existing.needs_refresh) {
    return existing.analysis
  }

  await generateAnalysis(organizationId, matchId)

  const { data: fresh } = await db
    .from('team_analysis')
    .select('analysis')
    .eq('organization_id', organizationId)
    .eq('match_id', matchId)
    .single()

  return fresh?.analysis ?? null
}
