// Database types for the tactical analysis platform

export interface Team {
  id: string
  name: string
  short_name: string
  country: string
  league: string
  logo_url: string | null
  primary_color: string | null
  secondary_color: string | null
  formation: string
  created_at: string
}

export interface Player {
  id: string
  team_id: string
  name: string
  position: string
  jersey_number: number | null
  nationality: string | null
  age: number | null
  speed: number
  attack: number
  defense: number
  recovery: number
  passing: number
  physical: number
  is_starter: boolean
  created_at: string
}

export interface TacticalAnalysis {
  id: string
  team_id: string
  attack_style: string | null
  attack_strengths: string[]
  attack_weaknesses: string[]
  defense_style: string | null
  defense_strengths: string[]
  defense_weaknesses: string[]
  set_piece_offense: string[]
  set_piece_defense: string[]
  key_players: string[]
  tactical_notes: string | null
  recommendations: string[]
  created_at: string
  updated_at: string
}

export interface TeamStats {
  id: string
  team_id: string
  season: string
  competition: string
  matches_played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  clean_sheets: number
  possession_avg: number
  shots_per_game: number
  shots_on_target: number
  pass_accuracy: number
  created_at: string
}

export interface MatchHistory {
  id: string
  home_team_id: string
  away_team_id: string
  home_score: number
  away_score: number
  competition: string
  match_date: string
  venue: string | null
  notes: string | null
  created_at: string
}

export interface Simulation {
  id: string
  user_id: string | null
  home_team_id: string
  away_team_id: string
  home_formation: string
  away_formation: string
  home_tactic: string | null
  away_tactic: string | null
  scenario_type: string | null
  scenario_details: Record<string, unknown> | null
  simulated_home_score: number | null
  simulated_away_score: number | null
  home_win_probability: number | null
  draw_probability: number | null
  away_win_probability: number | null
  analysis: string | null
  created_at: string
}

// Extended types with relations
export interface TeamWithPlayers extends Team {
  players: Player[]
}

export interface TeamWithAnalysis extends Team {
  tactical_analysis: TacticalAnalysis | null
  team_stats: TeamStats[]
}

export interface MatchHistoryWithTeams extends MatchHistory {
  home_team: Team
  away_team: Team
}

// Simulation engine types
export interface SimulationInput {
  homeTeam: TeamWithPlayers
  awayTeam: TeamWithPlayers
  homeFormation: string
  awayFormation: string
  homeTactic: TacticType
  awayTactic: TacticType
  scenario?: SimulationScenario
}

export interface SimulationResult {
  homeWinProbability: number
  drawProbability: number
  awayWinProbability: number
  expectedHomeGoals: number
  expectedAwayGoals: number
  analysis: string
  keyFactors: string[]
  risks: string[]
  recommendations: string[]
}

export type TacticType = 
  | 'balanced'
  | 'attacking'
  | 'defensive'
  | 'counter_attack'
  | 'high_press'
  | 'possession'

export interface SimulationScenario {
  type: 'red_card' | 'injury' | 'tactical_change'
  team: 'home' | 'away'
  playerId?: string
  minute?: number
  details?: string
}

export type PositionCategory = 'GK' | 'DEF' | 'MID' | 'ATT'

export const FORMATIONS = [
  '4-3-3',
  '4-4-2',
  '3-5-2',
  '4-2-3-1',
  '3-4-3',
  '5-3-2',
  '4-1-4-1',
] as const

export const TACTICS: { value: TacticType; label: string; description: string }[] = [
  { value: 'balanced', label: 'Equilibrado', description: 'Balance entre ataque y defensa' },
  { value: 'attacking', label: 'Ofensivo', description: 'Prioriza el ataque con más jugadores arriba' },
  { value: 'defensive', label: 'Defensivo', description: 'Bloque bajo y solidez defensiva' },
  { value: 'counter_attack', label: 'Contraataque', description: 'Defensa organizada y transiciones rápidas' },
  { value: 'high_press', label: 'Presión Alta', description: 'Presión intensa en campo rival' },
  { value: 'possession', label: 'Posesión', description: 'Control del balón y paciencia' },
]
