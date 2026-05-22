import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TeamStatsChart } from '@/components/dashboard/team-stats-chart'
import { 
  Trophy,
  Target,
  Shield,
  TrendingUp,
  Percent
} from 'lucide-react'

const ARSENAL_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'
const PSG_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

export default async function StatsPage() {
  const supabase = await createClient()

  const { data: arsenalStats } = await supabase
    .from('team_stats')
    .select('*')
    .eq('team_id', ARSENAL_ID)

  const { data: psgStats } = await supabase
    .from('team_stats')
    .select('*')
    .eq('team_id', PSG_ID)

  const arsenalUCL = arsenalStats?.find(s => s.competition === 'Champions League')
  const arsenalLeague = arsenalStats?.find(s => s.competition === 'Premier League')
  const psgUCL = psgStats?.find(s => s.competition === 'Champions League')
  const psgLeague = psgStats?.find(s => s.competition === 'Ligue 1')

  const StatCard = ({ 
    label, 
    psgValue, 
    arsenalValue, 
    icon: Icon,
    suffix = '',
    higherIsBetter = true 
  }: { 
    label: string
    psgValue: number
    arsenalValue: number
    icon: React.ElementType
    suffix?: string
    higherIsBetter?: boolean
  }) => {
    const psgBetter = higherIsBetter ? psgValue > arsenalValue : psgValue < arsenalValue
    const arsenalBetter = higherIsBetter ? arsenalValue > psgValue : arsenalValue < psgValue

    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-600">{label}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-xs text-blue-600 font-medium">PSG</p>
              <p className={`text-2xl font-bold ${psgBetter ? 'text-emerald-600' : 'text-slate-700'}`}>
                {psgValue}{suffix}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center">
              <p className="text-xs text-red-600 font-medium">ARS</p>
              <p className={`text-2xl font-bold ${arsenalBetter ? 'text-emerald-600' : 'text-slate-700'}`}>
                {arsenalValue}{suffix}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Estadísticas Comparativas</h1>
        <p className="text-slate-600 mt-1">Rendimiento en Champions League y Liga</p>
      </div>

      <Tabs defaultValue="ucl" className="space-y-6">
        <TabsList className="bg-white">
          <TabsTrigger value="ucl">Champions League</TabsTrigger>
          <TabsTrigger value="league">Liga Doméstica</TabsTrigger>
        </TabsList>

        <TabsContent value="ucl" className="space-y-6">
          {/* UCL Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              label="Partidos Jugados"
              psgValue={psgUCL?.matches_played || 0}
              arsenalValue={arsenalUCL?.matches_played || 0}
              icon={Trophy}
            />
            <StatCard 
              label="Victorias"
              psgValue={psgUCL?.wins || 0}
              arsenalValue={arsenalUCL?.wins || 0}
              icon={Trophy}
            />
            <StatCard 
              label="Goles a Favor"
              psgValue={psgUCL?.goals_for || 0}
              arsenalValue={arsenalUCL?.goals_for || 0}
              icon={Target}
            />
            <StatCard 
              label="Goles en Contra"
              psgValue={psgUCL?.goals_against || 0}
              arsenalValue={arsenalUCL?.goals_against || 0}
              icon={Shield}
              higherIsBetter={false}
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              label="Vallas Invictas"
              psgValue={psgUCL?.clean_sheets || 0}
              arsenalValue={arsenalUCL?.clean_sheets || 0}
              icon={Shield}
            />
            <StatCard 
              label="Posesión"
              psgValue={Number(psgUCL?.possession_avg) || 0}
              arsenalValue={Number(arsenalUCL?.possession_avg) || 0}
              icon={Percent}
              suffix="%"
            />
            <StatCard 
              label="Disparos/Partido"
              psgValue={Number(psgUCL?.shots_per_game) || 0}
              arsenalValue={Number(arsenalUCL?.shots_per_game) || 0}
              icon={Target}
            />
            <StatCard 
              label="Precisión de Pase"
              psgValue={Number(psgUCL?.pass_accuracy) || 0}
              arsenalValue={Number(arsenalUCL?.pass_accuracy) || 0}
              icon={TrendingUp}
              suffix="%"
            />
          </div>

          {/* UCL Charts */}
          <TeamStatsChart 
            psgStats={psgUCL} 
            arsenalStats={arsenalUCL}
            competition="Champions League"
          />
        </TabsContent>

        <TabsContent value="league" className="space-y-6">
          {/* League Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              label="Partidos Jugados"
              psgValue={psgLeague?.matches_played || 0}
              arsenalValue={arsenalLeague?.matches_played || 0}
              icon={Trophy}
            />
            <StatCard 
              label="Victorias"
              psgValue={psgLeague?.wins || 0}
              arsenalValue={arsenalLeague?.wins || 0}
              icon={Trophy}
            />
            <StatCard 
              label="Goles a Favor"
              psgValue={psgLeague?.goals_for || 0}
              arsenalValue={arsenalLeague?.goals_for || 0}
              icon={Target}
            />
            <StatCard 
              label="Goles en Contra"
              psgValue={psgLeague?.goals_against || 0}
              arsenalValue={arsenalLeague?.goals_against || 0}
              icon={Shield}
              higherIsBetter={false}
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              label="Vallas Invictas"
              psgValue={psgLeague?.clean_sheets || 0}
              arsenalValue={arsenalLeague?.clean_sheets || 0}
              icon={Shield}
            />
            <StatCard 
              label="Posesión"
              psgValue={Number(psgLeague?.possession_avg) || 0}
              arsenalValue={Number(arsenalLeague?.possession_avg) || 0}
              icon={Percent}
              suffix="%"
            />
            <StatCard 
              label="Disparos/Partido"
              psgValue={Number(psgLeague?.shots_per_game) || 0}
              arsenalValue={Number(arsenalLeague?.shots_per_game) || 0}
              icon={Target}
            />
            <StatCard 
              label="Precisión de Pase"
              psgValue={Number(psgLeague?.pass_accuracy) || 0}
              arsenalValue={Number(arsenalLeague?.pass_accuracy) || 0}
              icon={TrendingUp}
              suffix="%"
            />
          </div>

          {/* League Charts */}
          <TeamStatsChart 
            psgStats={psgLeague} 
            arsenalStats={arsenalLeague}
            competition="Liga Doméstica"
          />
        </TabsContent>
      </Tabs>

      {/* Additional insights */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Análisis Comparativo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-blue-600">Ventajas PSG</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">+</span>
                  Mayor promedio de posesión en Champions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">+</span>
                  Más goles por partido en fase de grupos
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">+</span>
                  Superior precisión de pase en general
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-red-600">Ventajas Arsenal</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">+</span>
                  Mejor registro defensivo (menos goles en contra)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">+</span>
                  Más vallas invictas en Champions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">+</span>
                  Liga más competitiva (mejor preparación)
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
