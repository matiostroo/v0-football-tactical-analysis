import { createClient } from '@/lib/supabase/server'
import { RivalSummary } from '@/components/dashboard/rival-summary'
import { QuickStats } from '@/components/dashboard/quick-stats'
import { HeadToHead } from '@/components/dashboard/head-to-head'
import { RecommendationsPanel } from '@/components/dashboard/recommendations-panel'

// Team IDs for PSG vs Arsenal final
const PSG_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const ARSENAL_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch rival team (Arsenal) with analysis
  const { data: rival } = await supabase
    .from('teams')
    .select('*')
    .eq('id', ARSENAL_ID)
    .single()

  const { data: rivalAnalysis } = await supabase
    .from('tactical_analysis')
    .select('*')
    .eq('team_id', ARSENAL_ID)
    .single()

  const { data: rivalStats } = await supabase
    .from('team_stats')
    .select('*')
    .eq('team_id', ARSENAL_ID)
    .eq('competition', 'Champions League')
    .single()

  const { data: rivalPlayers } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', ARSENAL_ID)
    .order('is_starter', { ascending: false })

  // Fetch your team (PSG)
  const { data: yourTeam } = await supabase
    .from('teams')
    .select('*')
    .eq('id', PSG_ID)
    .single()

  const { data: yourStats } = await supabase
    .from('team_stats')
    .select('*')
    .eq('team_id', PSG_ID)
    .eq('competition', 'Champions League')
    .single()

  // Fetch head to head
  const { data: headToHead } = await supabase
    .from('match_history')
    .select('*')
    .or(`home_team_id.eq.${PSG_ID},away_team_id.eq.${PSG_ID}`)
    .or(`home_team_id.eq.${ARSENAL_ID},away_team_id.eq.${ARSENAL_ID}`)
    .order('match_date', { ascending: false })

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Resumen Táctico del Rival</h1>
        <p className="text-slate-600 mt-1">Análisis completo de {rival?.name} para la final</p>
      </div>

      {/* Quick stats comparison */}
      <QuickStats 
        yourTeam={yourTeam} 
        yourStats={yourStats} 
        rival={rival} 
        rivalStats={rivalStats} 
      />

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Rival summary - takes 2 columns */}
        <div className="xl:col-span-2">
          <RivalSummary 
            rival={rival} 
            analysis={rivalAnalysis} 
            players={rivalPlayers || []}
          />
        </div>

        {/* Side panels */}
        <div className="space-y-6">
          <RecommendationsPanel recommendations={rivalAnalysis?.recommendations || []} />
          <HeadToHead 
            matches={headToHead || []} 
            yourTeamId={PSG_ID}
            yourTeamName={yourTeam?.short_name || 'PSG'}
            rivalName={rival?.short_name || 'ARS'}
          />
        </div>
      </div>
    </div>
  )
}
