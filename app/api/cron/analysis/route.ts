import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { generateAnalysis } from '@/lib/analysis/generator'

// Regenerate if analysis is older than this many hours and match is within 7 days
const STALE_HOURS = 24

function isAuthorized(request: NextRequest): boolean {
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${process.env.CRON_SECRET}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServiceClient()
  const now = new Date()
  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const staleThreshold = new Date(now.getTime() - STALE_HOURS * 60 * 60 * 1000)

  // All active organizations with a club assigned
  const { data: orgs } = await db
    .from('organizations')
    .select('id, club_id')
    .eq('is_active', true)
    .not('club_id', 'is', null)

  if (!orgs?.length) {
    return NextResponse.json({ generated: 0, skipped: 0, errors: [] })
  }

  const generated: string[] = []
  const skipped: string[] = []
  const errors: { key: string; error: string }[] = []

  for (const org of orgs) {
    // Next 3 matches for this org's club within the next 14 days
    const { data: nextMatches } = await db
      .from('matches')
      .select('id, scheduled_at')
      .or(`home_club_id.eq.${org.club_id},away_club_id.eq.${org.club_id}`)
      .eq('status', 'scheduled')
      .gte('scheduled_at', now.toISOString())
      .lte('scheduled_at', in14Days.toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(3)

    if (!nextMatches?.length) continue

    for (const match of nextMatches) {
      const key = `org:${org.id} match:${match.id}`

      // Check existing analysis
      const { data: existing } = await db
        .from('team_analysis')
        .select('last_updated_at, needs_refresh')
        .eq('organization_id', org.id)
        .eq('match_id', match.id)
        .single()

      const matchDate = new Date(match.scheduled_at)
      const isWithin7Days = matchDate <= in7Days

      const shouldGenerate =
        !existing ||
        existing.needs_refresh ||
        (isWithin7Days && new Date(existing.last_updated_at) < staleThreshold)

      if (!shouldGenerate) {
        skipped.push(key)
        continue
      }

      try {
        await generateAnalysis(org.id, match.id)
        generated.push(key)
      } catch (err) {
        const errorMsg = String(err)
        errors.push({ key, error: errorMsg })
        console.error('[cron/analysis]', key, errorMsg)
      }
    }
  }

  return NextResponse.json({
    generated: generated.length,
    skipped: skipped.length,
    errors,
    generatedKeys: generated,
  })
}
