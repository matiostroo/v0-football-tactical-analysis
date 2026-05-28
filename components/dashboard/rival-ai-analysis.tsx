'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Swords,
  Shield,
  Target,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Brain,
  User,
} from 'lucide-react'
import type { Player, Team } from '@/lib/types'

interface AnalysisData {
  fortalezasOfensivas: string[]
  debilidadesOfensivas: string[]
  fortalezasDefensivas: string[]
  debilidadesDefensivas: string[]
  patronesTacticos: string[]
  recomendaciones: string[]
  jugadoresClave: { nombre: string; posicion: string; descripcion: string }[]
}

interface RivalAIAnalysisProps {
  rival: Team | null
  players: Player[]
}

export function RivalAIAnalysis({ rival, players }: RivalAIAnalysisProps) {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const starters = players.filter((p) => p.is_starter)
  const keyPlayers = starters.slice(0, 7).map((p) => ({
    name: p.name,
    position: p.position,
  }))

  const fetchAnalysis = async () => {
    if (!rival) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze-rival', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName: rival.name,
          formation: rival.formation,
          keyPlayers,
        }),
      })
      if (!res.ok) throw new Error('Error en la respuesta del servidor')
      const data = await res.json()
      setAnalysis(data)
    } catch {
      setError('No se pudo generar el análisis. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalysis()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!rival) return null

  if (loading) return <AnalysisSkeleton />

  if (error) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <Brain className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={fetchAnalysis} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-violet-600" />
          <span className="text-sm text-slate-500">Generado con Claude AI</span>
        </div>
        <Button onClick={fetchAnalysis} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Regenerar
        </Button>
      </div>

      {/* Offensive / Defensive strengths & weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Fortalezas Ofensivas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.fortalezasOfensivas.map((item, i) => (
                <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Debilidades Ofensivas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.debilidadesOfensivas.map((item, i) => (
                <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="w-5 h-5 text-blue-600" />
              Fortalezas Defensivas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.fortalezasDefensivas.map((item, i) => (
                <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Debilidades Defensivas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.debilidadesDefensivas.map((item, i) => (
                <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Tactical patterns */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="w-5 h-5 text-slate-700" />
            Patrones Tácticos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysis.patronesTacticos.map((pattern, i) => (
              <Badge key={i} variant="secondary" className="text-sm py-1 px-3">
                {pattern}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Swords className="w-5 h-5 text-violet-600" />
            Recomendaciones contra {rival.short_name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {analysis.recomendaciones.map((rec, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-xs font-bold text-violet-600 bg-violet-50 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-700">{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Key players */}
      {analysis.jugadoresClave.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-5 h-5 text-slate-700" />
              Jugadores Clave a Vigilar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.jugadoresClave.map((player, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-slate-900">{player.nombre}</span>
                      <Badge variant="outline" className="text-xs">{player.posicion}</Badge>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{player.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function AnalysisSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-violet-600 animate-pulse" />
        <span className="text-sm text-slate-500">Generando análisis con IA...</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-0 shadow-lg">
            <CardHeader>
              <Skeleton className="h-5 w-44" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-7 w-28 rounded-full" />
          ))}
        </CardContent>
      </Card>
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="w-5 h-5 rounded-full shrink-0" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
