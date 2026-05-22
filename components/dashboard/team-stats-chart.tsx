'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TeamStats } from '@/lib/types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'

interface TeamStatsChartProps {
  psgStats: TeamStats | null | undefined
  arsenalStats: TeamStats | null | undefined
  competition: string
}

export function TeamStatsChart({ psgStats, arsenalStats, competition }: TeamStatsChartProps) {
  if (!psgStats || !arsenalStats) {
    return null
  }

  const comparisonData = [
    {
      metric: 'Victorias',
      PSG: psgStats.wins,
      Arsenal: arsenalStats.wins,
    },
    {
      metric: 'Empates',
      PSG: psgStats.draws,
      Arsenal: arsenalStats.draws,
    },
    {
      metric: 'Derrotas',
      PSG: psgStats.losses,
      Arsenal: arsenalStats.losses,
    },
    {
      metric: 'Goles F',
      PSG: psgStats.goals_for,
      Arsenal: arsenalStats.goals_for,
    },
    {
      metric: 'Goles C',
      PSG: psgStats.goals_against,
      Arsenal: arsenalStats.goals_against,
    },
  ]

  const radarData = [
    {
      stat: 'Posesión',
      PSG: Number(psgStats.possession_avg),
      Arsenal: Number(arsenalStats.possession_avg),
      fullMark: 100,
    },
    {
      stat: 'Precisión Pase',
      PSG: Number(psgStats.pass_accuracy),
      Arsenal: Number(arsenalStats.pass_accuracy),
      fullMark: 100,
    },
    {
      stat: 'Tiros/Partido',
      PSG: Number(psgStats.shots_per_game) * 5, // Scale for visibility
      Arsenal: Number(arsenalStats.shots_per_game) * 5,
      fullMark: 100,
    },
    {
      stat: 'Tiros a Puerta',
      PSG: Number(psgStats.shots_on_target) * 10,
      Arsenal: Number(arsenalStats.shots_on_target) * 10,
      fullMark: 100,
    },
    {
      stat: 'Eficiencia Def',
      PSG: 100 - (psgStats.goals_against / psgStats.matches_played) * 20,
      Arsenal: 100 - (arsenalStats.goals_against / arsenalStats.matches_played) * 20,
      fullMark: 100,
    },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Results comparison */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Resultados - {competition}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="metric" 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis tick={{ fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="PSG" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                  name="PSG"
                />
                <Bar 
                  dataKey="Arsenal" 
                  fill="#ef4444" 
                  radius={[4, 4, 0, 0]}
                  name="Arsenal"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance radar */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Perfil de Rendimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis 
                  dataKey="stat" 
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <Radar
                  name="PSG"
                  dataKey="PSG"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name="Arsenal"
                  dataKey="Arsenal"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Legend />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Goal difference */}
      <Card className="border-0 shadow-lg lg:col-span-2">
        <CardHeader>
          <CardTitle>Diferencia de Goles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-around py-8">
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-2">PSG</p>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-3xl font-bold text-emerald-600">+{psgStats.goals_for - psgStats.goals_against}</p>
                  <p className="text-xs text-slate-500">Diferencia</p>
                </div>
                <div className="h-16 w-px bg-slate-200" />
                <div>
                  <p className="text-lg font-semibold text-slate-700">
                    {(psgStats.goals_for / psgStats.matches_played).toFixed(1)}
                  </p>
                  <p className="text-xs text-slate-500">Goles/Partido</p>
                </div>
              </div>
            </div>
            
            <div className="text-6xl font-light text-slate-300">vs</div>
            
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-2">Arsenal</p>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-3xl font-bold text-emerald-600">+{arsenalStats.goals_for - arsenalStats.goals_against}</p>
                  <p className="text-xs text-slate-500">Diferencia</p>
                </div>
                <div className="h-16 w-px bg-slate-200" />
                <div>
                  <p className="text-lg font-semibold text-slate-700">
                    {(arsenalStats.goals_for / arsenalStats.matches_played).toFixed(1)}
                  </p>
                  <p className="text-xs text-slate-500">Goles/Partido</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
