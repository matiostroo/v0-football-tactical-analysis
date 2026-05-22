import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Swords, 
  Shield, 
  Target,
  TrendingUp,
  TrendingDown,
  ArrowRight
} from 'lucide-react'

const ARSENAL_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'
const PSG_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

export default async function PatternsPage() {
  const supabase = await createClient()

  const { data: arsenalAnalysis } = await supabase
    .from('tactical_analysis')
    .select('*')
    .eq('team_id', ARSENAL_ID)
    .single()

  const { data: psgAnalysis } = await supabase
    .from('tactical_analysis')
    .select('*')
    .eq('team_id', PSG_ID)
    .single()

  const patterns = [
    {
      title: 'Patrón Ofensivo Arsenal',
      icon: Swords,
      color: 'red',
      items: [
        {
          name: 'Combinación Saka-Ødegaard',
          description: 'El balón llega al pie de Ødegaard en la media luna, quien busca el pase filtrado a Saka por derecha. Saka recorta hacia dentro para disparar o centrar.',
          frequency: 'Muy frecuente',
          danger: 'Alto',
        },
        {
          name: 'Desmarque de Martinelli',
          description: 'Cuando el equipo recupera, Martinelli arranca en diagonal desde la izquierda buscando el espacio detrás del lateral. Pase largo directo.',
          frequency: 'Frecuente',
          danger: 'Alto',
        },
        {
          name: 'Llegada de Rice',
          description: 'En posicional, Rice se suma al ataque ocupando espacios libres en el área. Peligroso en segundas jugadas de córner.',
          frequency: 'Ocasional',
          danger: 'Medio',
        },
        {
          name: 'Falso 9 de Havertz',
          description: 'Havertz baja a recibir dejando espacio para las llegadas de Saka y Martinelli. Buen juego de espaldas pero no fija centrales.',
          frequency: 'Constante',
          danger: 'Medio',
        },
      ],
    },
    {
      title: 'Patrón Defensivo Arsenal',
      icon: Shield,
      color: 'blue',
      items: [
        {
          name: 'Bloque 4-4-2 bajo',
          description: 'Sin balón, Havertz y Saka forman una línea de 4 con los mediocampistas. Las líneas muy juntas dificultan el juego entre líneas.',
          frequency: 'Constante',
          danger: 'Bajo',
        },
        {
          name: 'Presión tras pérdida',
          description: 'Los primeros 5 segundos tras perder el balón, presión intensa coordinada. Si no recuperan, repliegue ordenado.',
          frequency: 'Siempre',
          danger: 'Bajo',
        },
        {
          name: 'Cobertura de Saliba',
          description: 'Saliba cubre los espacios que deja Zinchenko cuando sube. Excelente anticipación pero puede dejar hueco si tiene que cubrir dos atacantes.',
          frequency: 'Frecuente',
          danger: 'Medio',
        },
      ],
    },
    {
      title: 'Pelota Parada Ofensiva',
      icon: Target,
      color: 'emerald',
      items: [
        {
          name: 'Corners al primer palo',
          description: 'Saka o Ødegaard ejecutan. Gabriel ataca el primer palo con potencia. Saliba al segundo palo para rechaces.',
          frequency: 'Frecuente',
          danger: 'Alto',
        },
        {
          name: 'Faltas laterales',
          description: 'Centro directo al área con Havertz como referencia. También usan jugadas ensayadas con desmarques cruzados.',
          frequency: 'Ocasional',
          danger: 'Alto',
        },
        {
          name: 'Penales',
          description: 'Saka es el ejecutor designado. Suele elegir su derecha natural con potencia.',
          frequency: 'N/A',
          danger: 'Alto',
        },
      ],
    },
  ]

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Patrones Tácticos</h1>
        <p className="text-slate-600 mt-1">Movimientos y patrones de juego identificados</p>
      </div>

      {/* Pattern cards */}
      <div className="space-y-6">
        {patterns.map((pattern) => (
          <Card key={pattern.title} className="border-0 shadow-lg">
            <CardHeader className={`bg-${pattern.color}-50 rounded-t-lg`}>
              <CardTitle className="flex items-center gap-2">
                <pattern.icon className={`w-5 h-5 text-${pattern.color}-600`} />
                {pattern.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {pattern.items.map((item, i) => (
                  <div key={i} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900">{item.name}</h3>
                          <Badge 
                            variant={item.danger === 'Alto' ? 'destructive' : item.danger === 'Medio' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            Peligro: {item.danger}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-slate-500">Frecuencia</p>
                        <p className="text-sm font-medium text-slate-700">{item.frequency}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tactical comparison */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Comparativa Táctica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 rounded bg-blue-500"></div>
                <span className="font-semibold">PSG</span>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800 mb-2">Estilo Ofensivo</p>
                <p className="text-sm text-slate-700">{psgAnalysis?.attack_style}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800 mb-2">Estilo Defensivo</p>
                <p className="text-sm text-slate-700">{psgAnalysis?.defense_style}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 rounded bg-red-500"></div>
                <span className="font-semibold">Arsenal</span>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800 mb-2">Estilo Ofensivo</p>
                <p className="text-sm text-slate-700">{arsenalAnalysis?.attack_style}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800 mb-2">Estilo Defensivo</p>
                <p className="text-sm text-slate-700">{arsenalAnalysis?.defense_style}</p>
              </div>
            </div>
          </div>

          {/* Key matchups */}
          <div className="mt-8">
            <h3 className="font-semibold text-slate-900 mb-4">Duelos Clave</h3>
            <div className="space-y-3">
              {[
                { psg: 'Dembélé', vs: 'Zinchenko', advantage: 'psg', reason: 'Velocidad de Dembélé vs defensa de Zinchenko' },
                { psg: 'Marquinhos', vs: 'Havertz', advantage: 'psg', reason: 'Experiencia y anticipación de Marquinhos' },
                { psg: 'Vitinha', vs: 'Rice', advantage: 'arsenal', reason: 'Físico y recuperación de Rice' },
                { psg: 'Hakimi', vs: 'Martinelli', advantage: 'even', reason: 'Duelo muy parejo en velocidad' },
              ].map((duel, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className={`font-medium ${duel.advantage === 'psg' ? 'text-blue-600' : 'text-slate-700'}`}>
                      {duel.psg}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <span className={`font-medium ${duel.advantage === 'arsenal' ? 'text-red-600' : 'text-slate-700'}`}>
                      {duel.vs}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {duel.advantage === 'psg' && <TrendingUp className="w-4 h-4 text-blue-500" />}
                    {duel.advantage === 'arsenal' && <TrendingDown className="w-4 h-4 text-red-500" />}
                    <span className="text-xs text-slate-500">{duel.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
