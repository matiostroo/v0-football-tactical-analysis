import type { AnalysisContext, MatchResult, TitularityPattern, Absence, SquadPlayer } from './context-builder'

export function buildPrompt(ctx: AnalysisContext): string {
  const matchDate = new Date(ctx.match.scheduledAt).toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  })

  return `Sos un analista táctico experto en fútbol argentino. Tu tarea es generar un informe táctico completo para el cuerpo técnico de ${ctx.ownTeam.name} sobre el próximo partido.

IMPORTANTE: Respondé ÚNICAMENTE con un JSON válido. Sin texto previo, sin markdown, sin explicaciones fuera del JSON.

${'━'.repeat(60)}
PARTIDO
${'━'.repeat(60)}
Fecha: ${matchDate}
${ctx.ownTeam.shortName} juega de ${ctx.match.isHome ? 'LOCAL' : 'VISITANTE'}${ctx.match.venue ? ` — Estadio: ${ctx.match.venue}` : ''}
Competencia: ${ctx.match.competition}${ctx.match.round ? ` | ${ctx.match.round}` : ''}
Días de descanso ${ctx.ownTeam.shortName}: ${ctx.match.ownTeamDaysRest} días
Días de descanso ${ctx.rival.shortName}: ${ctx.match.rivalDaysRest} días

${'━'.repeat(60)}
TABLA DE POSICIONES
${'━'.repeat(60)}
${formatStanding(ctx.ownTeam.shortName, ctx.ownTeam.tablePosition, ctx.ownTeam.tablePoints)}
${formatStanding(ctx.rival.shortName, ctx.rival.tablePosition, ctx.rival.tablePoints)}

${'━'.repeat(60)}
MI EQUIPO: ${ctx.ownTeam.name.toUpperCase()}
${'━'.repeat(60)}

Plantilla disponible:
${formatSquad(ctx.ownTeam.squad, ctx.ownTeam.absences)}

Últimos 5 resultados:
${formatResults(ctx.ownTeam.last5Results, ctx.ownTeam.shortName) || '  Sin resultados disponibles'}

Bajas confirmadas:
${formatAbsences(ctx.ownTeam.absences)}

${'━'.repeat(60)}
RIVAL: ${ctx.rival.name.toUpperCase()}
${'━'.repeat(60)}

Últimos 5 resultados:
${formatResults(ctx.rival.last5Results, ctx.rival.shortName) || '  Sin resultados disponibles'}

Patrones de titularidad (últimos 20 partidos):
A partir de estos datos inferí el sistema táctico probable, los jugadores que seguramente jueguen y el perfil del equipo. NO des una alineación confirmada — trabajá desde patrones históricos, igual que lo hace el DT rival.
${formatPatterns(ctx.rival.titularityPatterns) || '  Sin datos suficientes de titularidades'}

Bajas del rival:
${formatAbsences(ctx.rival.absences)}

${'━'.repeat(60)}
INSTRUCCIONES
${'━'.repeat(60)}
1. Analizá al rival inferiendo su sistema táctico desde los patrones de titularidad y los resultados recientes.
2. Las recomendaciones deben ser específicas y accionables, con razonamiento explícito para que el DT pueda concordar o discrepar. Evitá generalidades.
3. "jugadores_propios_recomendados": elegí de la plantilla disponible los jugadores que tienen un perfil ideal para este partido puntual, explicando por qué.
4. Considerá el factor localía, el cansancio acumulado (días de descanso), la competencia en juego y la presión de tabla.
5. Si hay bajas importantes (propias o del rival), explicá cómo cambian el análisis.
6. El resumen debe ser denso, sin relleno: un analista profesional lo va a leer 10 minutos antes de dar el informe al DT.

${'━'.repeat(60)}
ESTRUCTURA JSON DE RESPUESTA (estricta)
${'━'.repeat(60)}
{
  "resumen": "3-4 oraciones: quién es el rival, cómo llega al partido y cuál es el factor clave del encuentro",
  "fortalezas": ["3-5 fortalezas específicas y observables del rival"],
  "debilidades": ["3-5 debilidades concretas que se pueden explotar"],
  "patrones_ofensivos": ["3-4 patrones de ataque del rival inferidos de los datos"],
  "patrones_defensivos": ["3-4 patrones defensivos del rival"],
  "pelota_parada": {
    "ofensiva": ["2-3 ítems sobre cómo ataca el rival en pelota parada"],
    "defensiva": ["2-3 ítems sobre cómo defiende el rival en pelota parada"]
  },
  "jugadores_clave_rival": [
    { "nombre": "string", "posicion": "string", "descripcion": "1-2 oraciones sobre su rol y amenaza", "amenaza": "alta|media|baja" }
  ],
  "jugadores_propios_recomendados": [
    { "nombre": "string", "posicion": "string", "razon": "por qué este jugador es clave para este partido específico" }
  ],
  "recomendaciones": [
    { "titulo": "string corto", "detalle": "2-3 oraciones explicando qué hacer", "razonamiento": "por qué tiene sentido dado el análisis del rival" }
  ]
}`
}

// ─── Formatters ────────────────────────────────────────────────────────────

function formatStanding(name: string, position: number | null, points: number | null): string {
  if (position === null) return `  ${name}: posición no disponible`
  return `  ${name}: Puesto ${position}${points !== null ? `, ${points} puntos` : ''}`
}

function formatSquad(squad: SquadPlayer[], absences: Absence[]): string {
  if (!squad.length) return '  Sin datos de plantilla'

  const absentNames = new Set(absences.map((a) => a.playerName))
  const available = squad.filter((p) => !absentNames.has(p.name))

  const byPosition: Record<string, string[]> = { GK: [], DEF: [], MID: [], FWD: [] }
  for (const p of available) {
    byPosition[p.position]?.push(p.name)
  }

  return [
    byPosition.GK.length ? `  GK: ${byPosition.GK.join(', ')}` : null,
    byPosition.DEF.length ? `  DEF: ${byPosition.DEF.join(', ')}` : null,
    byPosition.MID.length ? `  MID: ${byPosition.MID.join(', ')}` : null,
    byPosition.FWD.length ? `  FWD: ${byPosition.FWD.join(', ')}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

function formatResults(results: MatchResult[], teamShortName: string): string {
  return results
    .map((r, i) => {
      const date = new Date(r.date).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
      })
      const loc = r.isHome ? 'L' : 'V'
      const scoreStr = r.isHome
        ? `${teamShortName} ${r.goalsFor}-${r.goalsAgainst} ${r.opponent}`
        : `${r.opponent} ${r.goalsAgainst}-${r.goalsFor} ${teamShortName}`

      const starterStr =
        r.starters.length > 0
          ? r.starters
              .map((s) => {
                const extras = [
                  s.goals > 0 ? `${s.goals}G` : null,
                  s.assists > 0 ? `${s.assists}A` : null,
                  s.rating ? `nota ${s.rating}` : null,
                ]
                  .filter(Boolean)
                  .join(', ')
                return `${s.name}(${s.position}${extras ? `:${extras}` : ''})`
              })
              .join(', ')
          : 'sin datos de once'

      return `  ${i + 1}. [${loc}] ${date} | ${scoreStr} → ${r.result} (${r.competition})\n     ${starterStr}`
    })
    .join('\n')
}

function formatPatterns(patterns: TitularityPattern[]): string {
  return patterns
    .map((p) => {
      const pct = Math.round((p.startsInLast20 / 20) * 100)
      const extras = [
        p.goalsInLast20 > 0 ? `${p.goalsInLast20} goles` : null,
        p.assistsInLast20 > 0 ? `${p.assistsInLast20} asist.` : null,
        p.avgRating ? `nota prom. ${p.avgRating}` : null,
      ]
        .filter(Boolean)
        .join(', ')
      return `  ${p.playerName} (${p.position}) — ${p.startsInLast20}/20 partidos titular (${pct}%)${extras ? ` | ${extras}` : ''}`
    })
    .join('\n')
}

function formatAbsences(absences: Absence[]): string {
  if (!absences.length) return '  Sin bajas confirmadas'
  return absences
    .map((a) => {
      const status = a.confirmed ? 'CONFIRMADO' : 'probable'
      const type = a.type === 'injury' ? 'Lesión' : a.type === 'suspension' ? 'Sanción' : 'Personal'
      const ret = a.expectedReturn ? ` (retorno: ${a.expectedReturn})` : ''
      return `  ${a.playerName} (${a.position}) — ${type}${a.description ? `: ${a.description}` : ''} [${status}]${ret}`
    })
    .join('\n')
}
