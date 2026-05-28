import { createServiceClient } from '@/lib/supabase/service'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface MatchResult {
  date: string
  competition: string
  opponent: string
  isHome: boolean
  goalsFor: number
  goalsAgainst: number
  result: 'W' | 'D' | 'L'
  starters: {
    name: string
    position: string
    goals: number
    assists: number
    rating: number | null
  }[]
}

export interface TitularityPattern {
  playerName: string
  position: string
  startsInLast20: number
  goalsInLast20: number
  assistsInLast20: number
  avgRating: number | null
}

export interface Absence {
  playerName: string
  position: string
  type: 'injury' | 'suspension' | 'personal'
  description: string | null
  expectedReturn: string | null
  confirmed: boolean
}

export interface SquadPlayer {
  name: string
  position: string
  jerseyNumber: number | null
}

export interface AnalysisContext {
  match: {
    id: string
    scheduledAt: string
    competition: string
    round: string | null
    isHome: boolean
    venue: string | null
    ownTeamDaysRest: number
    rivalDaysRest: number
  }
  ownTeam: {
    name: string
    shortName: string
    clubId: string
    tablePosition: number | null
    tablePoints: number | null
    last5Results: MatchResult[]
    squad: SquadPlayer[]
    absences: Absence[]
  }
  rival: {
    name: string
    shortName: string
    clubId: string
    tablePosition: number | null
    tablePoints: number | null
    last5Results: MatchResult[]
    titularityPatterns: TitularityPattern[]
    absences: Absence[]
  }
}

// ─── Main function ─────────────────────────────────────────────────────────

export async function buildAnalysisContext(
  organizationId: string,
  matchId: string,
): Promise<AnalysisContext> {
  const db = createServiceClient()

  // ── 1. Organization's club ───────────────────────────────────────────────
  const { data: org } = await db
    .from('organizations')
    .select('club_id, clubs(id, name, short_name)')
    .eq('id', organizationId)
    .single()

  if (!org?.club_id) throw new Error('La organización no tiene club asignado')
  const ownClub = org.clubs as unknown as { id: string; name: string; short_name: string }

  // ── 2. Match details ─────────────────────────────────────────────────────
  const { data: match } = await db
    .from('matches')
    .select(`
      id, scheduled_at, round, venue,
      home_club_id, away_club_id,
      competitions ( name ),
      home_club:clubs!matches_home_club_id_fkey ( id, name, short_name ),
      away_club:clubs!matches_away_club_id_fkey ( id, name, short_name )
    `)
    .eq('id', matchId)
    .single()

  if (!match) throw new Error('Partido no encontrado')

  const isHome = match.home_club_id === ownClub.id
  const rivalClub = (isHome ? match.away_club : match.home_club) as unknown as {
    id: string; name: string; short_name: string
  }
  const competition = (match.competitions as unknown as { name: string }).name

  // ── 3. Rest days ─────────────────────────────────────────────────────────
  const [ownLastMatch, rivalLastMatch] = await Promise.all([
    getLastFinishedMatch(db, ownClub.id, match.scheduled_at),
    getLastFinishedMatch(db, rivalClub.id, match.scheduled_at),
  ])
  const ownDaysRest = ownLastMatch ? daysBetween(ownLastMatch, match.scheduled_at) : 7
  const rivalDaysRest = rivalLastMatch ? daysBetween(rivalLastMatch, match.scheduled_at) : 7

  // ── 4. Standings ─────────────────────────────────────────────────────────
  const [ownStanding, rivalStanding] = await Promise.all([
    getStanding(db, ownClub.id),
    getStanding(db, rivalClub.id),
  ])

  // ── 5 & 6. Last 5 results ─────────────────────────────────────────────────
  const [ownLast5, rivalLast5] = await Promise.all([
    getRecentResults(db, ownClub.id, match.scheduled_at, 5),
    getRecentResults(db, rivalClub.id, match.scheduled_at, 5),
  ])

  // ── 7. Rival titularity patterns (last 20 matches) ────────────────────────
  const titularityPatterns = await getTitularityPatterns(db, rivalClub.id, match.scheduled_at)

  // ── 8. Own squad ──────────────────────────────────────────────────────────
  const { data: squadRows } = await db
    .from('players')
    .select('name, position, jersey_number')
    .eq('club_id', ownClub.id)
    .eq('is_active', true)
    .order('position')

  const squad: SquadPlayer[] = (squadRows ?? []).map((p) => ({
    name: p.name,
    position: p.position,
    jerseyNumber: p.jersey_number,
  }))

  // ── 9. Absences ───────────────────────────────────────────────────────────
  const [ownAbsences, rivalAbsences] = await Promise.all([
    getAbsences(db, ownClub.id),
    getAbsences(db, rivalClub.id),
  ])

  return {
    match: {
      id: match.id,
      scheduledAt: match.scheduled_at,
      competition,
      round: match.round,
      isHome,
      venue: match.venue,
      ownTeamDaysRest: ownDaysRest,
      rivalDaysRest,
    },
    ownTeam: {
      name: ownClub.name,
      shortName: ownClub.short_name,
      clubId: ownClub.id,
      tablePosition: ownStanding?.position ?? null,
      tablePoints: ownStanding?.points ?? null,
      last5Results: ownLast5,
      squad,
      absences: ownAbsences,
    },
    rival: {
      name: rivalClub.name,
      shortName: rivalClub.short_name,
      clubId: rivalClub.id,
      tablePosition: rivalStanding?.position ?? null,
      tablePoints: rivalStanding?.points ?? null,
      last5Results: rivalLast5,
      titularityPatterns,
      absences: rivalAbsences,
    },
  }
}

// ─── Query helpers ─────────────────────────────────────────────────────────

type DB = ReturnType<typeof createServiceClient>

async function getLastFinishedMatch(db: DB, clubId: string, before: string) {
  const { data } = await db
    .from('matches')
    .select('scheduled_at')
    .or(`home_club_id.eq.${clubId},away_club_id.eq.${clubId}`)
    .eq('status', 'finished')
    .lt('scheduled_at', before)
    .order('scheduled_at', { ascending: false })
    .limit(1)
    .single()
  return data?.scheduled_at ?? null
}

async function getStanding(db: DB, clubId: string) {
  const { data } = await db
    .from('standings')
    .select('position, points, matches_played')
    .eq('club_id', clubId)
    .order('last_synced_at', { ascending: false })
    .limit(1)
    .single()
  return data
}

async function getRecentResults(
  db: DB,
  clubId: string,
  before: string,
  limit: number,
): Promise<MatchResult[]> {
  const { data: matches } = await db
    .from('matches')
    .select(`
      id, scheduled_at, home_score, away_score, home_club_id, away_club_id,
      competitions ( name ),
      home_club:clubs!matches_home_club_id_fkey ( short_name ),
      away_club:clubs!matches_away_club_id_fkey ( short_name )
    `)
    .or(`home_club_id.eq.${clubId},away_club_id.eq.${clubId}`)
    .eq('status', 'finished')
    .lt('scheduled_at', before)
    .order('scheduled_at', { ascending: false })
    .limit(limit)

  if (!matches?.length) return []

  const matchIds = matches.map((m) => m.id)

  // Get starters for all these matches in a single query
  const { data: lineups } = await db
    .from('match_lineups')
    .select('match_id, player_id, position_played, players ( name, position )')
    .eq('club_id', clubId)
    .eq('is_starter', true)
    .in('match_id', matchIds)

  // Get stats for all these matches in a single query
  const { data: stats } = await db
    .from('player_match_stats')
    .select('match_id, player_id, goals, assists, rating')
    .eq('club_id', clubId)
    .in('match_id', matchIds)

  // Index by match_id and player_id for fast lookup
  const lineupsByMatch = groupBy(lineups ?? [], (l) => l.match_id)
  const statsByKey = new Map(
    (stats ?? []).map((s) => [`${s.match_id}:${s.player_id}`, s]),
  )

  return matches.map((m) => {
    const isHome = m.home_club_id === clubId
    const goalsFor = isHome ? (m.home_score ?? 0) : (m.away_score ?? 0)
    const goalsAgainst = isHome ? (m.away_score ?? 0) : (m.home_score ?? 0)
    const result: 'W' | 'D' | 'L' =
      goalsFor > goalsAgainst ? 'W' : goalsFor === goalsAgainst ? 'D' : 'L'
    const homeClub = m.home_club as unknown as { short_name: string }
    const awayClub = m.away_club as unknown as { short_name: string }
    const comp = m.competitions as unknown as { name: string }

    const matchLineups = lineupsByMatch.get(m.id) ?? []
    const starters = matchLineups.map((l) => {
      const s = statsByKey.get(`${m.id}:${l.player_id}`)
      const player = l.players as unknown as { name: string; position: string }
      return {
        name: player.name,
        position: l.position_played ?? player.position,
        goals: s?.goals ?? 0,
        assists: s?.assists ?? 0,
        rating: s?.rating ? Number(s.rating) : null,
      }
    })

    return {
      date: m.scheduled_at,
      competition: comp.name,
      opponent: isHome ? awayClub.short_name : homeClub.short_name,
      isHome,
      goalsFor,
      goalsAgainst,
      result,
      starters,
    }
  })
}

async function getTitularityPatterns(
  db: DB,
  clubId: string,
  before: string,
): Promise<TitularityPattern[]> {
  const { data: last20Matches } = await db
    .from('matches')
    .select('id')
    .or(`home_club_id.eq.${clubId},away_club_id.eq.${clubId}`)
    .eq('status', 'finished')
    .lt('scheduled_at', before)
    .order('scheduled_at', { ascending: false })
    .limit(20)

  if (!last20Matches?.length) return []

  const matchIds = last20Matches.map((m) => m.id)

  const { data: lineups } = await db
    .from('match_lineups')
    .select('player_id, match_id, is_starter, players ( name, position )')
    .eq('club_id', clubId)
    .in('match_id', matchIds)

  const { data: stats } = await db
    .from('player_match_stats')
    .select('player_id, match_id, goals, assists, rating')
    .eq('club_id', clubId)
    .in('match_id', matchIds)

  const statsByKey = new Map(
    (stats ?? []).map((s) => [`${s.match_id}:${s.player_id}`, s]),
  )

  // Aggregate per player
  type Agg = { name: string; position: string; starts: number; goals: number; assists: number; ratings: number[] }
  const agg = new Map<string, Agg>()

  for (const l of lineups ?? []) {
    const player = l.players as unknown as { name: string; position: string }
    if (!agg.has(l.player_id)) {
      agg.set(l.player_id, { name: player.name, position: player.position, starts: 0, goals: 0, assists: 0, ratings: [] })
    }
    const a = agg.get(l.player_id)!
    if (l.is_starter) a.starts++
    const s = statsByKey.get(`${l.match_id}:${l.player_id}`)
    if (s) {
      a.goals += s.goals ?? 0
      a.assists += s.assists ?? 0
      if (s.rating) a.ratings.push(Number(s.rating))
    }
  }

  return Array.from(agg.values())
    .filter((p) => p.starts >= 2)
    .sort((a, b) => b.starts - a.starts)
    .slice(0, 18)
    .map((p) => ({
      playerName: p.name,
      position: p.position,
      startsInLast20: p.starts,
      goalsInLast20: p.goals,
      assistsInLast20: p.assists,
      avgRating:
        p.ratings.length > 0
          ? Math.round((p.ratings.reduce((a, b) => a + b, 0) / p.ratings.length) * 100) / 100
          : null,
    }))
}

async function getAbsences(db: DB, clubId: string): Promise<Absence[]> {
  const { data: playerRows } = await db
    .from('players')
    .select('id, name, position')
    .eq('club_id', clubId)
    .eq('is_active', true)

  if (!playerRows?.length) return []

  const playerIds = playerRows.map((p) => p.id)
  const playerMap = new Map(playerRows.map((p) => [p.id, p]))

  const today = new Date().toISOString().split('T')[0]

  const { data: absences } = await db
    .from('player_absences')
    .select('player_id, type, description, expected_return_date, confirmed')
    .in('player_id', playerIds)
    .or(`expected_return_date.is.null,expected_return_date.gte.${today}`)

  return (absences ?? []).map((a) => {
    const player = playerMap.get(a.player_id)!
    return {
      playerName: player.name,
      position: player.position,
      type: a.type as Absence['type'],
      description: a.description,
      expectedReturn: a.expected_return_date,
      confirmed: a.confirmed,
    }
  })
}

// ─── Utility ───────────────────────────────────────────────────────────────

function groupBy<T>(arr: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const item of arr) {
    const k = key(item)
    if (!map.has(k)) map.set(k, [])
    map.get(k)!.push(item)
  }
  return map
}

function daysBetween(from: string, to: string): number {
  return Math.round(
    (new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24),
  )
}
