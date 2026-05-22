import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Team, TacticalAnalysis, Player } from '@/lib/types'
import { 
  Swords, 
  Shield, 
  Target,
  AlertTriangle,
  CheckCircle2,
  User
} from 'lucide-react'

interface RivalSummaryProps {
  rival: Team | null
  analysis: TacticalAnalysis | null
  players: Player[]
}

export function RivalSummary({ rival, analysis, players }: RivalSummaryProps) {
  if (!rival || !analysis) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-slate-500">No hay datos del rival disponibles</p>
        </CardContent>
      </Card>
    )
  }

  const starters = players.filter(p => p.is_starter)

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: rival.primary_color || '#EF0107' }}
            >
              {rival.short_name}
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900">{rival.name}</CardTitle>
              <p className="text-slate-500">{rival.league} - {rival.country}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-base px-3 py-1">
            {rival.formation}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Tactical styles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Swords className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold text-slate-900">Estilo Ofensivo</h3>
            </div>
            <p className="text-slate-700 text-sm">{analysis.attack_style}</p>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-slate-900">Estilo Defensivo</h3>
            </div>
            <p className="text-slate-700 text-sm">{analysis.defense_style}</p>
          </div>
        </div>

        {/* Strengths and Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Attack */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Fortalezas Ofensivas
            </h3>
            <ul className="space-y-2">
              {analysis.attack_strengths.map((strength, i) => (
                <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  {strength}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Debilidades Ofensivas
            </h3>
            <ul className="space-y-2">
              {analysis.attack_weaknesses.map((weakness, i) => (
                <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Defense */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              Fortalezas Defensivas
            </h3>
            <ul className="space-y-2">
              {analysis.defense_strengths.map((strength, i) => (
                <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                  {strength}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Debilidades Defensivas
            </h3>
            <ul className="space-y-2">
              {analysis.defense_weaknesses.map((weakness, i) => (
                <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Set Pieces */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-slate-700" />
            Pelota Parada
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Ofensiva</p>
              <ul className="space-y-1">
                {analysis.set_piece_offense.map((item, i) => (
                  <li key={i} className="text-sm text-slate-700">{item}</li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Defensiva</p>
              <ul className="space-y-1">
                {analysis.set_piece_defense.map((item, i) => (
                  <li key={i} className="text-sm text-slate-700">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Key Players */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-slate-700" />
            Titulares Clave
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {starters.slice(0, 8).map((player) => (
              <div key={player.id} className="bg-slate-50 rounded-lg p-3 text-center">
                <div 
                  className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: rival.primary_color || '#EF0107' }}
                >
                  {player.jersey_number}
                </div>
                <p className="text-sm font-medium text-slate-900 truncate">{player.name.split(' ').pop()}</p>
                <p className="text-xs text-slate-500">{player.position}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tactical Notes */}
        {analysis.tactical_notes && (
          <div className="border-t pt-6">
            <h3 className="font-semibold text-slate-900 mb-3">Notas Tácticas</h3>
            <p className="text-slate-700 text-sm leading-relaxed">{analysis.tactical_notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
