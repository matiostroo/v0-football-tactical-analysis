import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlayerAttributeChart } from '@/components/dashboard/player-attribute-chart'
import { RivalAIAnalysis } from '@/components/dashboard/rival-ai-analysis'
import {
  Swords,
  Shield,
  Target,
  Users,
  Zap
} from 'lucide-react'

const ARSENAL_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'

export default async function RivalPage() {
  const supabase = await createClient()

  const { data: rival } = await supabase
    .from('teams')
    .select('*')
    .eq('id', ARSENAL_ID)
    .single()

  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', ARSENAL_ID)
    .order('is_starter', { ascending: false })

  const starters = players?.filter(p => p.is_starter) || []
  const subs = players?.filter(p => !p.is_starter) || []

  // Group by position
  const groupByPosition = (playerList: typeof starters) => {
    const gk = playerList.filter(p => p.position === 'GK')
    const def = playerList.filter(p => ['CB', 'RB', 'LB', 'RWB', 'LWB'].includes(p.position))
    const mid = playerList.filter(p => ['CM', 'DM', 'AM', 'CDM', 'CAM'].includes(p.position))
    const att = playerList.filter(p => ['ST', 'RW', 'LW', 'CF', 'SS'].includes(p.position))
    return { gk, def, mid, att }
  }

  const grouped = groupByPosition(starters)

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Análisis Detallado del Rival</h1>
        <p className="text-slate-600 mt-1">{rival?.name} - Plantilla y atributos</p>
      </div>

      <Tabs defaultValue="starters" className="space-y-6">
        <TabsList className="bg-white">
          <TabsTrigger value="starters">Titulares</TabsTrigger>
          <TabsTrigger value="subs">Suplentes</TabsTrigger>
          <TabsTrigger value="analysis">Análisis IA</TabsTrigger>
        </TabsList>

        <TabsContent value="starters" className="space-y-6">
          {/* Formation display */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-600" />
                Formación: {rival?.formation}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Attackers */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Swords className="w-4 h-4 text-red-500" />
                    <h3 className="text-sm font-semibold text-slate-700">Ataque</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {grouped.att.map(player => (
                      <PlayerCard key={player.id} player={player} color={rival?.primary_color} />
                    ))}
                  </div>
                </div>

                {/* Midfielders */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-semibold text-slate-700">Mediocampo</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {grouped.mid.map(player => (
                      <PlayerCard key={player.id} player={player} color={rival?.primary_color} />
                    ))}
                  </div>
                </div>

                {/* Defenders */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <h3 className="text-sm font-semibold text-slate-700">Defensa</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {grouped.def.map(player => (
                      <PlayerCard key={player.id} player={player} color={rival?.primary_color} />
                    ))}
                  </div>
                </div>

                {/* Goalkeeper */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-semibold text-slate-700">Portero</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {grouped.gk.map(player => (
                      <PlayerCard key={player.id} player={player} color={rival?.primary_color} />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Player attributes chart */}
          <PlayerAttributeChart players={starters} teamName={rival?.short_name || 'ARS'} />
        </TabsContent>

        <TabsContent value="subs" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Banco de Suplentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {subs.map(player => (
                  <PlayerCard key={player.id} player={player} color={rival?.primary_color} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <RivalAIAnalysis rival={rival} players={players || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PlayerCard({ player, color }: { player: any; color?: string | null }) {
  const getAttributeColor = (value: number) => {
    if (value >= 85) return 'text-emerald-600 bg-emerald-50'
    if (value >= 75) return 'text-blue-600 bg-blue-50'
    if (value >= 65) return 'text-amber-600 bg-amber-50'
    return 'text-slate-600 bg-slate-50'
  }

  return (
    <Card className="border border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: color || '#EF0107' }}
          >
            {player.jersey_number}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 truncate">{player.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">{player.position}</Badge>
              <span className="text-xs text-slate-500">{player.nationality}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className={`text-center rounded-lg p-2 ${getAttributeColor(player.speed)}`}>
            <p className="text-xs font-medium">VEL</p>
            <p className="font-bold">{player.speed}</p>
          </div>
          <div className={`text-center rounded-lg p-2 ${getAttributeColor(player.attack)}`}>
            <p className="text-xs font-medium">ATQ</p>
            <p className="font-bold">{player.attack}</p>
          </div>
          <div className={`text-center rounded-lg p-2 ${getAttributeColor(player.defense)}`}>
            <p className="text-xs font-medium">DEF</p>
            <p className="font-bold">{player.defense}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className={`text-center rounded-lg p-2 ${getAttributeColor(player.passing)}`}>
            <p className="text-xs font-medium">PAS</p>
            <p className="font-bold">{player.passing}</p>
          </div>
          <div className={`text-center rounded-lg p-2 ${getAttributeColor(player.physical)}`}>
            <p className="text-xs font-medium">FIS</p>
            <p className="font-bold">{player.physical}</p>
          </div>
          <div className={`text-center rounded-lg p-2 ${getAttributeColor(player.recovery)}`}>
            <p className="text-xs font-medium">REC</p>
            <p className="font-bold">{player.recovery}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
