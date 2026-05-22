import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MatchHistory } from '@/lib/types'
import { History } from 'lucide-react'

interface HeadToHeadProps {
  matches: MatchHistory[]
  yourTeamId: string
  yourTeamName: string
  rivalName: string
}

export function HeadToHead({ matches, yourTeamId, yourTeamName, rivalName }: HeadToHeadProps) {
  // Calculate stats
  let wins = 0
  let draws = 0
  let losses = 0
  let goalsFor = 0
  let goalsAgainst = 0

  matches.forEach(match => {
    const isHome = match.home_team_id === yourTeamId
    const yourGoals = isHome ? match.home_score : match.away_score
    const theirGoals = isHome ? match.away_score : match.home_score
    
    goalsFor += yourGoals
    goalsAgainst += theirGoals
    
    if (yourGoals > theirGoals) wins++
    else if (yourGoals < theirGoals) losses++
    else draws++
  })

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-slate-600" />
          Historial Directo
        </CardTitle>
      </CardHeader>
      <CardContent>
        {matches.length === 0 ? (
          <p className="text-sm text-slate-500">No hay enfrentamientos previos</p>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-emerald-600">{wins}</p>
                <p className="text-xs text-slate-600">Victorias</p>
              </div>
              <div className="bg-slate-100 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-slate-600">{draws}</p>
                <p className="text-xs text-slate-600">Empates</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{losses}</p>
                <p className="text-xs text-slate-600">Derrotas</p>
              </div>
            </div>

            <div className="text-center mb-4 py-2 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Goles: </span>
              <span className="font-semibold text-emerald-600">{goalsFor}</span>
              <span className="text-slate-400 mx-1">-</span>
              <span className="font-semibold text-red-600">{goalsAgainst}</span>
            </div>

            {/* Recent matches */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 uppercase">Últimos partidos</p>
              {matches.slice(0, 4).map((match) => {
                const isHome = match.home_team_id === yourTeamId
                const yourGoals = isHome ? match.home_score : match.away_score
                const theirGoals = isHome ? match.away_score : match.home_score
                const result = yourGoals > theirGoals ? 'win' : yourGoals < theirGoals ? 'loss' : 'draw'
                
                return (
                  <div 
                    key={match.id} 
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        result === 'win' ? 'bg-emerald-500' : 
                        result === 'loss' ? 'bg-red-500' : 'bg-slate-400'
                      }`} />
                      <span className="text-xs text-slate-600">
                        {new Date(match.match_date).toLocaleDateString('es-AR', { 
                          year: '2-digit', 
                          month: 'short' 
                        })}
                      </span>
                    </div>
                    <div className="text-sm font-medium">
                      <span className={yourGoals > theirGoals ? 'text-emerald-600' : 'text-slate-700'}>
                        {yourTeamName} {yourGoals}
                      </span>
                      <span className="text-slate-400 mx-1">-</span>
                      <span className={theirGoals > yourGoals ? 'text-red-600' : 'text-slate-700'}>
                        {theirGoals} {rivalName}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
