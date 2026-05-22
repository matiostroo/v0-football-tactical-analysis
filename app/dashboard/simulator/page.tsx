import { createClient } from '@/lib/supabase/server'
import { SimulatorClient } from '@/components/dashboard/simulator-client'

const PSG_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const ARSENAL_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'

export default async function SimulatorPage() {
  const supabase = await createClient()

  // Fetch PSG with players
  const { data: psgTeam } = await supabase
    .from('teams')
    .select('*')
    .eq('id', PSG_ID)
    .single()

  const { data: psgPlayers } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', PSG_ID)
    .order('is_starter', { ascending: false })

  // Fetch Arsenal with players
  const { data: arsenalTeam } = await supabase
    .from('teams')
    .select('*')
    .eq('id', ARSENAL_ID)
    .single()

  const { data: arsenalPlayers } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', ARSENAL_ID)
    .order('is_starter', { ascending: false })

  const homeTeam = psgTeam ? { ...psgTeam, players: psgPlayers || [] } : null
  const awayTeam = arsenalTeam ? { ...arsenalTeam, players: arsenalPlayers || [] } : null

  if (!homeTeam || !awayTeam) {
    return (
      <div className="p-6">
        <p className="text-slate-500">Error cargando datos de equipos</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Simulador de Partidos</h1>
        <p className="text-slate-600 mt-1">Ajustá tácticas y simulá diferentes escenarios</p>
      </div>

      <SimulatorClient 
        homeTeam={homeTeam}
        awayTeam={awayTeam}
      />
    </div>
  )
}
