import { Card, CardContent } from '@/components/ui/card'
import { Team, TeamStats } from '@/lib/types'
import { TrendingUp, TrendingDown, Shield, Target } from 'lucide-react'

interface QuickStatsProps {
  yourTeam: Team | null
  yourStats: TeamStats | null
  rival: Team | null
  rivalStats: TeamStats | null
}

export function QuickStats({ yourTeam, yourStats, rival, rivalStats }: QuickStatsProps) {
  if (!yourStats || !rivalStats) return null

  const stats = [
    {
      label: 'Goles a Favor',
      yours: yourStats.goals_for,
      rival: rivalStats.goals_for,
      icon: Target,
      better: 'higher',
    },
    {
      label: 'Goles en Contra',
      yours: yourStats.goals_against,
      rival: rivalStats.goals_against,
      icon: Shield,
      better: 'lower',
    },
    {
      label: 'Posesión Promedio',
      yours: yourStats.possession_avg,
      rival: rivalStats.possession_avg,
      icon: TrendingUp,
      suffix: '%',
      better: 'higher',
    },
    {
      label: 'Vallas Invictas',
      yours: yourStats.clean_sheets,
      rival: rivalStats.clean_sheets,
      icon: Shield,
      better: 'higher',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const yoursValue = Number(stat.yours)
        const rivalValue = Number(stat.rival)
        const isYoursBetter = stat.better === 'higher' 
          ? yoursValue > rivalValue 
          : yoursValue < rivalValue
        const isRivalBetter = stat.better === 'higher'
          ? rivalValue > yoursValue
          : rivalValue < yoursValue

        return (
          <Card key={stat.label} className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {stat.label}
                </span>
                <stat.icon className="w-4 h-4 text-slate-400" />
              </div>
              
              <div className="flex items-end justify-between">
                <div className="text-center flex-1">
                  <p className="text-xs text-slate-500 mb-1">{yourTeam?.short_name}</p>
                  <p className={`text-2xl font-bold ${isYoursBetter ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {stat.yours}{stat.suffix || ''}
                  </p>
                  {isYoursBetter && <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto mt-1" />}
                </div>
                
                <div className="text-slate-300 text-lg font-light px-2">vs</div>
                
                <div className="text-center flex-1">
                  <p className="text-xs text-slate-500 mb-1">{rival?.short_name}</p>
                  <p className={`text-2xl font-bold ${isRivalBetter ? 'text-red-600' : 'text-slate-700'}`}>
                    {stat.rival}{stat.suffix || ''}
                  </p>
                  {isRivalBetter && <TrendingDown className="w-4 h-4 text-red-500 mx-auto mt-1" />}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
