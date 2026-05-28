import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { syncFixtures, syncMatchDetails, syncStandings } from '@/lib/api-football/sync'

// Competition API-Football IDs — confirm these against api-football.com/coverage
// before first deploy
const COMPETITIONS = [
  { id: 128,  name: 'Liga Profesional Argentina' },
  { id: 1032, name: 'Copa de la Liga Profesional' },
  { id: 130,  name: 'Copa Argentina' },
  { id: 13,   name: 'Copa Libertadores' },
  { id: 11,   name: 'Copa Sudamericana' },
]

const SEASON = new Date().getFullYear()

function isAuthorized(request: NextRequest): boolean {
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${process.env.CRON_SECRET}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServiceClient()
  const results: Record<string, unknown> = {}
  const errors: string[] = []

  // ── 1. Sync fixtures for all competitions ────────────────────────────────
  for (const comp of COMPETITIONS) {
    try {
      await syncFixtures(comp.id, SEASON)
      results[`fixtures_${comp.name}`] = 'ok'
    } catch (err) {
      const msg = `fixtures [${comp.name}]: ${String(err)}`
      errors.push(msg)
      console.error('[cron/sync]', msg)
    }
  }

  // ── 2. Sync standings ────────────────────────────────────────────────────
  for (const comp of COMPETITIONS) {
    try {
      await syncStandings(comp.id, SEASON)
      results[`standings_${comp.name}`] = 'ok'
    } catch (err) {
      const msg = `standings [${comp.name}]: ${String(err)}`
      errors.push(msg)
      console.error('[cron/sync]', msg)
    }
  }

  // ── 3. Sync details for recently finished matches (last 48 h) ────────────
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  const { data: recentlyFinished } = await db
    .from('matches')
    .select('id, api_football_id, last_synced_at')
    .eq('status', 'finished')
    .gte('scheduled_at', cutoff)

  let detailsSynced = 0
  for (const match of recentlyFinished ?? []) {
    // Skip if we synced details in the last 6 h
    if (
      match.last_synced_at &&
      Date.now() - new Date(match.last_synced_at).getTime() < 6 * 60 * 60 * 1000
    ) {
      continue
    }
    try {
      await syncMatchDetails(match.api_football_id)
      detailsSynced++
    } catch (err) {
      const msg = `match details [${match.api_football_id}]: ${String(err)}`
      errors.push(msg)
      console.error('[cron/sync]', msg)
    }
  }
  results.matchDetailsSynced = detailsSynced

  return NextResponse.json({ ok: errors.length === 0, results, errors })
}
