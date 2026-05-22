'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TeamWithPlayers, 
  TacticType, 
  SimulationResult,
  SimulationScenario,
  FORMATIONS,
  TACTICS 
} from '@/lib/types'
import { runSimulation, compareTactics } from '@/lib/simulation-engine'
import { 
  Play, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react'

interface SimulatorClientProps {
  homeTeam: TeamWithPlayers
  awayTeam: TeamWithPlayers
}

export function SimulatorClient({ homeTeam, awayTeam }: SimulatorClientProps) {
  const [homeFormation, setHomeFormation] = useState(homeTeam.formation)
  const [awayFormation, setAwayFormation] = useState(awayTeam.formation)
  const [homeTactic, setHomeTactic] = useState<TacticType>('balanced')
  const [awayTactic, setAwayTactic] = useState<TacticType>('balanced')
  const [scenario, setScenario] = useState<SimulationScenario | undefined>()
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [tacticComparison, setTacticComparison] = useState<{ tactic: TacticType; result: SimulationResult }[] | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  const runMatch = () => {
    setIsSimulating(true)
    
    // Small delay for UX
    setTimeout(() => {
      const simResult = runSimulation({
        homeTeam,
        awayTeam,
        homeFormation,
        awayFormation,
        homeTactic,
        awayTactic,
        scenario,
      })
      setResult(simResult)
      setIsSimulating(false)
    }, 800)
  }

  const findBestTactic = () => {
    setIsSimulating(true)
    
    setTimeout(() => {
      const comparison = compareTactics(homeTeam, awayTeam, awayTactic)
      setTacticComparison(comparison)
      setIsSimulating(false)
    }, 1000)
  }

  const addScenario = (type: 'red_card' | 'none', team?: 'home' | 'away') => {
    if (type === 'none') {
      setScenario(undefined)
    } else {
      setScenario({
        type,
        team: team!,
      })
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Configuration panel */}
      <div className="xl:col-span-2 space-y-6">
        {/* Team configs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Home team */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: homeTeam.primary_color || '#004170' }}
                >
                  {homeTeam.short_name}
                </div>
                <div>
                  <CardTitle className="text-lg">{homeTeam.name}</CardTitle>
                  <Badge variant="outline" className="mt-1">Local</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Formación</Label>
                <Select value={homeFormation} onValueChange={setHomeFormation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMATIONS.map(f => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Táctica</Label>
                <Select value={homeTactic} onValueChange={(v) => setHomeTactic(v as TacticType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TACTICS.map(t => (
                      <SelectItem key={t.value} value={t.value}>
                        <div className="flex flex-col">
                          <span>{t.label}</span>
                          <span className="text-xs text-slate-500">{t.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Away team */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: awayTeam.primary_color || '#EF0107' }}
                >
                  {awayTeam.short_name}
                </div>
                <div>
                  <CardTitle className="text-lg">{awayTeam.name}</CardTitle>
                  <Badge variant="secondary" className="mt-1">Visitante</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Formación (Esperada)</Label>
                <Select value={awayFormation} onValueChange={setAwayFormation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMATIONS.map(f => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Táctica (Esperada)</Label>
                <Select value={awayTactic} onValueChange={(v) => setAwayTactic(v as TacticType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TACTICS.map(t => (
                      <SelectItem key={t.value} value={t.value}>
                        <div className="flex flex-col">
                          <span>{t.label}</span>
                          <span className="text-xs text-slate-500">{t.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scenarios */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Escenarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={!scenario ? 'default' : 'outline'}
                size="sm"
                onClick={() => addScenario('none')}
              >
                Sin modificadores
              </Button>
              <Button
                variant={scenario?.type === 'red_card' && scenario?.team === 'away' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => addScenario('red_card', 'away')}
              >
                Expulsión Rival
              </Button>
              <Button
                variant={scenario?.type === 'red_card' && scenario?.team === 'home' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => addScenario('red_card', 'home')}
              >
                Expulsión Propia
              </Button>
            </div>
            {scenario && (
              <p className="mt-3 text-sm text-slate-600">
                Escenario activo: <span className="font-medium text-slate-900">
                  Expulsión en {scenario.team === 'home' ? homeTeam.short_name : awayTeam.short_name}
                </span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex gap-4">
          <Button 
            onClick={runMatch} 
            disabled={isSimulating}
            className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Play className="w-5 h-5 mr-2" />
            {isSimulating ? 'Simulando...' : 'Simular Partido'}
          </Button>
          <Button 
            onClick={findBestTactic} 
            disabled={isSimulating}
            variant="outline"
            className="flex-1 h-12"
          >
            <Lightbulb className="w-5 h-5 mr-2" />
            Encontrar Mejor Táctica
          </Button>
        </div>

        {/* Tactic comparison results */}
        {tacticComparison && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Comparativa de Tácticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tacticComparison.map((item, i) => {
                  const tacticInfo = TACTICS.find(t => t.value === item.tactic)
                  return (
                    <div 
                      key={item.tactic}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        i === 0 ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {i === 0 && <Badge className="bg-emerald-600">Recomendada</Badge>}
                        <div>
                          <p className="font-semibold text-slate-900">{tacticInfo?.label}</p>
                          <p className="text-xs text-slate-500">{tacticInfo?.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-600">{item.result.homeWinProbability}%</p>
                        <p className="text-xs text-slate-500">Prob. Victoria</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results panel */}
      <div className="space-y-6">
        {result ? (
          <>
            {/* Probabilities */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Probabilidades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-blue-600">{homeTeam.short_name}</span>
                      <span className="text-sm font-bold">{result.homeWinProbability}%</span>
                    </div>
                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${result.homeWinProbability}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">Empate</span>
                      <span className="text-sm font-bold">{result.drawProbability}%</span>
                    </div>
                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-slate-400 rounded-full transition-all duration-500"
                        style={{ width: `${result.drawProbability}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-red-600">{awayTeam.short_name}</span>
                      <span className="text-sm font-bold">{result.awayWinProbability}%</span>
                    </div>
                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full transition-all duration-500"
                        style={{ width: `${result.awayWinProbability}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Expected goals */}
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-slate-500 mb-3">Goles Esperados (xG)</p>
                  <div className="flex items-center justify-center gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">{result.expectedHomeGoals}</p>
                      <p className="text-xs text-slate-500">{homeTeam.short_name}</p>
                    </div>
                    <span className="text-2xl text-slate-300">-</span>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-600">{result.expectedAwayGoals}</p>
                      <p className="text-xs text-slate-500">{awayTeam.short_name}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Análisis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-700 leading-relaxed">{result.analysis}</p>
                
                {/* Key factors */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Factores Clave</p>
                  {result.keyFactors.map((factor, i) => (
                    <div key={i} className="flex items-start gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">{factor}</span>
                    </div>
                  ))}
                </div>

                {/* Risks */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Riesgos</p>
                  {result.risks.map((risk, i) => (
                    <div key={i} className="flex items-start gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">{risk}</span>
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Recomendaciones</p>
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Configurá y Simulá</h3>
              <p className="text-sm text-slate-500">
                Ajustá las formaciones, tácticas y escenarios, luego ejecutá la simulación para ver las probabilidades y análisis.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
