import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lightbulb } from 'lucide-react'

interface RecommendationsPanelProps {
  recommendations: string[]
}

export function RecommendationsPanel({ recommendations }: RecommendationsPanelProps) {
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Recomendaciones Tácticas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {recommendations.map((rec, i) => (
            <li 
              key={i} 
              className="flex items-start gap-3 text-sm text-white/90"
            >
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">
                {i + 1}
              </span>
              {rec}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
