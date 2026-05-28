import { createServiceClient } from '@/lib/supabase/service'
import { apiFetch } from './client'

// ─── API-Football response shapes (minimal) ───────────────────────────────

interface ApiFixture {
  fixture: { id: number; date: string; status: { short: string }; venue: { name: string | null } }
  league:  { id: number; name: string; round: string; season: number }
  teams:   { home: ApiTeam; away: ApiTeam }
  goals:   { home: number | null; away: number | null }
}

interface ApiTeam {
  id: number
  name: string
  logo: string
}

interface ApiPlayer {
  player: { id: number; name: string; nationality: string | null; age: number | null }
  statistics: Array<{
    team: { id: number }
    games: { position: string | null; minutes: number | null; rating: string | null; captain: boolean }
    goals: { total: number | null; assists: number | null }
    cards: { yellow: number; red: number }
    shots: { total: number | null; on: number | null }
    passes: { total: number | null; accuracy: string | null }
  }>
}

interface ApiLineupPlayer {
  id: number
  name: string
  number: number
  pos: string
  grid: string | null
}

interface ApiLineup {
  team: { id: number }
  formation: string
  startXI: Array<{ player: ApiLineupPlayer }>
  substitutes: Array<{ player: ApiLineupPlayer }>
}

// ─── Status mapping ────────────────────────────────────────────────────────

function mapStatus(short: string): string {
  if (['FT', 'AET', 'PEN', 'AWD', 'WO'].includes(short)) return 'finished'
  if (['1H', '2H', 'ET', 'BT', 'P', 'LIVE', 'INT'].includes(short)) return 'live'
  if (['PST', 'CANC', 'ABD', 'SUSP'].includes(short)) return 'postponed'
  return 'scheduled'
}

// ─── Upsert helpers ────────────────────────────────────────────────────────

async function findOrCreateCompetition(
  db: ReturnType<typeof createServiceClient>,
  leagueId: number,
  name: string,
  season: number,
) {
  const { data: existing } = await db
    .from('competitions')
    .select('id')
    .eq('api_football_id', leagueId)
    .single()

  if (existing) return existing.id as string

  const { data } = await db
    .from('competitions')
    .insert({ api_football_id: leagueId, name, type: 'league', country: 'Argentina', season })
    .select('id')
    .single()

  return data!.id as string
}

async function upsertClub(db: ReturnType<typeof createServiceClient>, team: ApiTeam) {
  const { data } = await db
    .from('clubs')
    .upsert(
      {
        api_football_id: team.id,
        name: team.name,
        short_name: team.name.split(' ').slice(-1)[0],
        logo_url: team.logo,
      },
      { onConflict: 'api_football_id' },
    )
    .select('id')
    .single()
  return data!.id as string
}

// ─── Public sync functions ─────────────────────────────────────────────────

/**
 * Sync upcoming + recent fixtures for a competition.
 * Call once per day per competition to keep matches table up to date.
 */
export async function syncFixtures(competitionApiId: number, season: number): Promise<void> {
  const db = createServiceClient()
  const fixtures = await apiFetch<ApiFixture[]>('fixtures', {
    league: competitionApiId,
    season,
  })

  for (const f of fixtures) {
    const [competitionId, homeClubId, awayClubId] = await Promise.all([
      findOrCreateCompetition(db, f.league.id, f.league.name, f.league.season),
      upsertClub(db, f.teams.home),
      upsertClub(db, f.teams.away),
    ])

    await db.from('matches').upsert(
      {
        api_football_id: f.fixture.id,
        competition_id: competitionId,
        season: f.league.season,
        round: f.league.round,
        home_club_id: homeClubId,
        away_club_id: awayClubId,
        scheduled_at: f.fixture.date,
        status: mapStatus(f.fixture.status.short),
        home_score: f.goals.home,
        away_score: f.goals.away,
        venue: f.fixture.venue.name,
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: 'api_football_id' },
    )
  }
}

/**
 * Sync lineups and player stats for a single finished match.
 * After syncing, marks all team_analysis rows for either team as needs_refresh.
 */
export async function syncMatchDetails(matchApiId: number): Promise<void> {
  const db = createServiceClient()

  const [lineups, players] = await Promise.all([
    apiFetch<ApiLineup[]>('fixtures/lineups', { fixture: matchApiId }),
    apiFetch<ApiPlayer[]>('fixtures/players', { fixture: matchApiId }),
  ])

  const { data: match } = await db
    .from('matches')
    .select('id, home_club_id, away_club_id')
    .eq('api_football_id', matchApiId)
    .single()

  if (!match) return

  const clubByApiId = new Map<number, string>()
  const { data: clubs } = await db
    .from('clubs')
    .select('id, api_football_id')
    .in('id', [match.home_club_id, match.away_club_id])

  for (const c of clubs ?? []) {
    clubByApiId.set(c.api_football_id, c.id)
  }

  // Upsert lineups
  for (const lineup of lineups) {
    const clubId = clubByApiId.get(lineup.team.id)
    if (!clubId) continue

    const toUpsert = [
      ...lineup.startXI.map(({ player }) => ({
        api_football_id: player.id,
        name: player.name,
        is_starter: true,
        jersey_number: player.number,
        position: normalizePosition(player.pos),
      })),
      ...lineup.substitutes.map(({ player }) => ({
        api_football_id: player.id,
        name: player.name,
        is_starter: false,
        jersey_number: player.number,
        position: normalizePosition(player.pos),
      })),
    ]

    for (const p of toUpsert) {
      const { data: player } = await db
        .from('players')
        .upsert(
          { api_football_id: p.api_football_id, club_id: clubId, name: p.name, position: p.position },
          { onConflict: 'api_football_id' },
        )
        .select('id')
        .single()

      if (!player) continue

      await db
        .from('match_lineups')
        .upsert(
          {
            match_id: match.id,
            club_id: clubId,
            player_id: player.id,
            is_starter: p.is_starter,
            position_played: p.position,
          },
          { onConflict: 'match_id,player_id' },
        )
    }
  }

  // Upsert player stats
  for (const entry of players) {
    const stat = entry.statistics[0]
    if (!stat) continue

    const clubId = clubByApiId.get(stat.team.id)
    if (!clubId) continue

    const { data: player } = await db
      .from('players')
      .select('id')
      .eq('api_football_id', entry.player.id)
      .single()

    if (!player) continue

    await db
      .from('player_match_stats')
      .upsert(
        {
          match_id: match.id,
          player_id: player.id,
          club_id: clubId,
          minutes_played: stat.games.minutes ?? 0,
          goals: stat.goals.total ?? 0,
          assists: stat.goals.assists ?? 0,
          yellow_cards: stat.cards.yellow,
          red_cards: stat.cards.red,
          rating: stat.games.rating ? parseFloat(stat.games.rating) : null,
          shots: stat.shots.total ?? 0,
          shots_on_target: stat.shots.on ?? 0,
          passes: stat.passes.total ?? 0,
          pass_accuracy: stat.passes.accuracy ? parseFloat(stat.passes.accuracy) : null,
        },
        { onConflict: 'match_id,player_id' },
      )
  }

  // Mark analyses for both teams as needing refresh
  await db
    .from('team_analysis')
    .update({ needs_refresh: true })
    .or(
      `rival_club_id.eq.${match.home_club_id},rival_club_id.eq.${match.away_club_id}`,
    )
}

interface ApiStandingRow {
  rank: number
  team: ApiTeam
  points: number
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } }
}

interface ApiStandingsResponse {
  league: { id: number; name: string; season: number; standings: ApiStandingRow[][] }
}

/**
 * Sync league standings for a competition.
 */
export async function syncStandings(competitionApiId: number, season: number): Promise<void> {
  const db = createServiceClient()
  const raw = await apiFetch<ApiStandingsResponse[]>('standings', { league: competitionApiId, season })

  const leagueData = raw[0]?.league
  if (!leagueData) return

  const standings = leagueData.standings[0] ?? []
  const competitionId = await findOrCreateCompetition(db, competitionApiId, leagueData.name, season)

  for (const row of standings) {
    const clubId = await upsertClub(db, row.team)

    await db.from('standings').upsert(
      {
        competition_id: competitionId,
        season,
        club_id: clubId,
        position: row.rank,
        points: row.points,
        matches_played: row.all.played,
        wins: row.all.win,
        draws: row.all.draw,
        losses: row.all.lose,
        goals_for: row.all.goals.for,
        goals_against: row.all.goals.against,
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: 'competition_id,season,club_id' },
    )
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function normalizePosition(pos: string): 'GK' | 'DEF' | 'MID' | 'FWD' {
  if (pos === 'G') return 'GK'
  if (pos === 'D') return 'DEF'
  if (pos === 'M') return 'MID'
  return 'FWD'
}
