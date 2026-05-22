import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Users, MapPin, Trophy } from 'lucide-react'

export default async function SearchPage() {
  const supabase = await createClient()

  const { data: teams } = await supabase
    .from('teams')
    .select('*')
    .order('name')

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Buscar Equipos</h1>
        <p className="text-slate-600 mt-1">Explorá los equipos disponibles en el sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams?.map((team) => (
          <Card key={team.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: team.primary_color || '#374151' }}
                >
                  {team.short_name}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{team.name}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {team.country}
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      {team.league}
                    </span>
                  </div>
                  <div className="mt-3">
                    <Badge variant="outline">{team.formation}</Badge>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t flex gap-2">
                <Link
                  href={`/dashboard/rival?team=${team.id}`}
                  className="flex-1 text-center px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors"
                >
                  Ver Análisis
                </Link>
                <Link
                  href={`/dashboard/simulator?rival=${team.id}`}
                  className="flex-1 text-center px-4 py-2 bg-emerald-100 hover:bg-emerald-200 rounded-lg text-sm font-medium text-emerald-700 transition-colors"
                >
                  Simular
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!teams || teams.length === 0) && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2">No hay equipos</h3>
            <p className="text-sm text-slate-500">
              No se encontraron equipos en la base de datos.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Info card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-800 to-slate-900">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Final Champions League</h3>
          <p className="text-slate-300 text-sm mb-4">
            Este MVP está configurado para la final PSG vs Arsenal. 
            Podés analizar ambos equipos y simular diferentes escenarios tácticos.
          </p>
          <div className="flex gap-4">
            <div className="flex-1 bg-white/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">PSG</p>
              <p className="text-xs text-slate-400">Tu equipo</p>
            </div>
            <div className="flex items-center text-slate-500">VS</div>
            <div className="flex-1 bg-white/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-400">ARS</p>
              <p className="text-xs text-slate-400">Rival</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
