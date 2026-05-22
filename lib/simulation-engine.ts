import { 
  Player, 
  TeamWithPlayers, 
  SimulationInput, 
  SimulationResult,
  TacticType 
} from '@/lib/types'

// Tactic modifiers affect team performance
const TACTIC_MODIFIERS: Record<TacticType, { attack: number; defense: number; midfield: number }> = {
  balanced: { attack: 1.0, defense: 1.0, midfield: 1.0 },
  attacking: { attack: 1.25, defense: 0.8, midfield: 0.95 },
  defensive: { attack: 0.75, defense: 1.3, midfield: 1.0 },
  counter_attack: { attack: 1.1, defense: 1.15, midfield: 0.9 },
  high_press: { attack: 1.15, defense: 0.9, midfield: 1.2 },
  possession: { attack: 0.95, defense: 1.05, midfield: 1.25 },
}

// Calculate team strength based on players and formation
function calculateTeamStrength(team: TeamWithPlayers, tactic: TacticType): {
  attack: number
  defense: number
  midfield: number
  overall: number
} {
  const starters = team.players.filter(p => p.is_starter)
  const modifier = TACTIC_MODIFIERS[tactic]
  
  // Group by position
  const defenders = starters.filter(p => ['CB', 'RB', 'LB', 'RWB', 'LWB'].includes(p.position))
  const midfielders = starters.filter(p => ['CM', 'DM', 'AM', 'CDM', 'CAM'].includes(p.position))
  const attackers = starters.filter(p => ['ST', 'RW', 'LW', 'CF', 'SS'].includes(p.position))
  const goalkeeper = starters.find(p => p.position === 'GK')
  
  // Calculate averages
  const avgAttribute = (players: Player[], attr: keyof Player) => {
    if (players.length === 0) return 70
    return players.reduce((sum, p) => sum + (p[attr] as number), 0) / players.length
  }
  
  // Attack strength (attackers' attack + midfielders' passing + speed)
  const attackStrength = (
    avgAttribute(attackers, 'attack') * 0.5 +
    avgAttribute(midfielders, 'passing') * 0.3 +
    avgAttribute(attackers, 'speed') * 0.2
  ) * modifier.attack
  
  // Defense strength (defenders' defense + goalkeeper + physical)
  const defenseStrength = (
    avgAttribute(defenders, 'defense') * 0.5 +
    (goalkeeper?.defense || 80) * 0.3 +
    avgAttribute(defenders, 'physical') * 0.2
  ) * modifier.defense
  
  // Midfield strength (passing + recovery)
  const midfieldStrength = (
    avgAttribute(midfielders, 'passing') * 0.4 +
    avgAttribute(midfielders, 'recovery') * 0.3 +
    avgAttribute(midfielders, 'physical') * 0.3
  ) * modifier.midfield
  
  const overall = (attackStrength + defenseStrength + midfieldStrength) / 3
  
  return { attack: attackStrength, defense: defenseStrength, midfield: midfieldStrength, overall }
}

// Calculate expected goals using modified Poisson-like distribution
function calculateExpectedGoals(
  attackStrength: number,
  opponentDefenseStrength: number,
  midfieldControl: number
): number {
  const baseGoals = 1.5 // Average goals per team in a match
  const attackFactor = attackStrength / 75 // Normalize to ~75 average
  const defenseFactor = 75 / opponentDefenseStrength
  const midfieldFactor = (midfieldControl + 100) / 200 // 0.5-1.0 range
  
  return Math.max(0.3, Math.min(4.5, baseGoals * attackFactor * defenseFactor * midfieldFactor))
}

// Calculate win probabilities using Bradley-Terry model variant
function calculateProbabilities(homeXG: number, awayXG: number): {
  homeWin: number
  draw: number
  awayWin: number
} {
  const homeAdvantage = 1.15 // Home team advantage
  const adjustedHomeXG = homeXG * homeAdvantage
  
  const totalStrength = adjustedHomeXG + awayXG
  const homeWinRaw = adjustedHomeXG / totalStrength
  const awayWinRaw = awayXG / totalStrength
  
  // Adjust for draw probability (higher when teams are close)
  const xgDiff = Math.abs(adjustedHomeXG - awayXG)
  const drawBase = 0.25 - (xgDiff * 0.05) // More draws when xG is close
  const drawProb = Math.max(0.15, Math.min(0.35, drawBase))
  
  const remainingProb = 1 - drawProb
  const homeWin = homeWinRaw * remainingProb
  const awayWin = awayWinRaw * remainingProb
  
  return {
    homeWin: Math.round(homeWin * 100),
    draw: Math.round(drawProb * 100),
    awayWin: Math.round(awayWin * 100),
  }
}

// Generate analysis text based on simulation results
function generateAnalysis(
  input: SimulationInput,
  homeStrength: ReturnType<typeof calculateTeamStrength>,
  awayStrength: ReturnType<typeof calculateTeamStrength>,
  homeXG: number,
  awayXG: number,
  probabilities: ReturnType<typeof calculateProbabilities>
): { analysis: string; keyFactors: string[]; risks: string[]; recommendations: string[] } {
  const keyFactors: string[] = []
  const risks: string[] = []
  const recommendations: string[] = []
  
  // Analyze strengths comparison
  if (homeStrength.attack > awayStrength.defense + 5) {
    keyFactors.push(`${input.homeTeam.short_name} tiene superioridad ofensiva sobre la defensa rival`)
  }
  if (awayStrength.attack > homeStrength.defense + 5) {
    keyFactors.push(`${input.awayTeam.short_name} puede explotar espacios defensivos`)
    risks.push('Cuidado con las transiciones del rival')
  }
  if (homeStrength.midfield > awayStrength.midfield + 5) {
    keyFactors.push('Control del mediocampo a favor')
    recommendations.push('Mantener posesión para dominar el ritmo')
  }
  
  // Tactic-specific analysis
  if (input.homeTactic === 'high_press' && awayStrength.midfield < 75) {
    keyFactors.push('La presión alta puede ser muy efectiva contra su salida')
    recommendations.push('Presionar en campo rival los primeros 20 minutos')
  }
  if (input.awayTactic === 'counter_attack') {
    risks.push('El rival buscará contraataques rápidos')
    recommendations.push('Mantener línea defensiva equilibrada')
  }
  
  // Scenario analysis
  if (input.scenario) {
    if (input.scenario.type === 'red_card') {
      if (input.scenario.team === 'away') {
        keyFactors.push('Superioridad numérica puede ser decisiva')
        recommendations.push('Ampliar el campo y cansar al rival')
      } else {
        risks.push('Inferioridad numérica requiere ajuste táctico')
        recommendations.push('Compactar líneas y buscar contragolpes')
      }
    }
  }
  
  // Generate summary
  const favorite = probabilities.homeWin > probabilities.awayWin ? input.homeTeam : input.awayTeam
  const favProb = Math.max(probabilities.homeWin, probabilities.awayWin)
  
  let analysis = ''
  if (favProb >= 55) {
    analysis = `${favorite.short_name} parte como favorito con un ${favProb}% de probabilidades. `
  } else {
    analysis = `Partido muy parejo. `
  }
  
  analysis += `Se esperan aproximadamente ${homeXG.toFixed(1)} goles de ${input.homeTeam.short_name} y ${awayXG.toFixed(1)} de ${input.awayTeam.short_name}. `
  
  if (homeStrength.overall > awayStrength.overall) {
    analysis += `El conjunto local muestra mejor rendimiento colectivo basado en los atributos de sus jugadores.`
  } else {
    analysis += `El visitante presenta números individuales ligeramente superiores.`
  }
  
  // Add default recommendations if empty
  if (recommendations.length === 0) {
    recommendations.push('Mantener la concentración en los primeros 15 minutos')
    recommendations.push('Aprovechar jugadas a balón parado')
  }
  if (risks.length === 0) {
    risks.push('Evitar pérdidas en zona de inicio')
  }
  if (keyFactors.length === 0) {
    keyFactors.push('Partido equilibrado en todas las líneas')
  }
  
  return { analysis, keyFactors, risks, recommendations }
}

// Main simulation function
export function runSimulation(input: SimulationInput): SimulationResult {
  // Calculate team strengths
  let homeStrength = calculateTeamStrength(input.homeTeam, input.homeTactic)
  let awayStrength = calculateTeamStrength(input.awayTeam, input.awayTactic)
  
  // Apply scenario modifiers
  if (input.scenario) {
    if (input.scenario.type === 'red_card') {
      // Red card reduces team effectiveness by 20%
      if (input.scenario.team === 'home') {
        homeStrength = {
          attack: homeStrength.attack * 0.8,
          defense: homeStrength.defense * 0.85,
          midfield: homeStrength.midfield * 0.8,
          overall: homeStrength.overall * 0.82,
        }
      } else {
        awayStrength = {
          attack: awayStrength.attack * 0.8,
          defense: awayStrength.defense * 0.85,
          midfield: awayStrength.midfield * 0.8,
          overall: awayStrength.overall * 0.82,
        }
      }
    }
  }
  
  // Calculate midfield control
  const midfieldControl = homeStrength.midfield - awayStrength.midfield
  
  // Calculate expected goals
  const homeXG = calculateExpectedGoals(homeStrength.attack, awayStrength.defense, midfieldControl)
  const awayXG = calculateExpectedGoals(awayStrength.attack, homeStrength.defense, -midfieldControl)
  
  // Calculate probabilities
  const probabilities = calculateProbabilities(homeXG, awayXG)
  
  // Generate analysis
  const { analysis, keyFactors, risks, recommendations } = generateAnalysis(
    input,
    homeStrength,
    awayStrength,
    homeXG,
    awayXG,
    probabilities
  )
  
  return {
    homeWinProbability: probabilities.homeWin,
    drawProbability: probabilities.draw,
    awayWinProbability: probabilities.awayWin,
    expectedHomeGoals: Math.round(homeXG * 10) / 10,
    expectedAwayGoals: Math.round(awayXG * 10) / 10,
    analysis,
    keyFactors,
    risks,
    recommendations,
  }
}

// Compare tactics to find optimal setup
export function compareTactics(
  homeTeam: TeamWithPlayers,
  awayTeam: TeamWithPlayers,
  awayTactic: TacticType
): { tactic: TacticType; result: SimulationResult }[] {
  const tactics: TacticType[] = ['balanced', 'attacking', 'defensive', 'counter_attack', 'high_press', 'possession']
  
  return tactics.map(tactic => ({
    tactic,
    result: runSimulation({
      homeTeam,
      awayTeam,
      homeFormation: homeTeam.formation,
      awayFormation: awayTeam.formation,
      homeTactic: tactic,
      awayTactic,
    })
  })).sort((a, b) => b.result.homeWinProbability - a.result.homeWinProbability)
}
