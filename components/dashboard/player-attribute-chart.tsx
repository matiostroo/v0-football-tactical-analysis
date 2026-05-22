'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Player } from '@/lib/types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts'

interface PlayerAttributeChartProps {
  players: Player[]
  teamName: string
}

export function PlayerAttributeChart({ players, teamName }: PlayerAttributeChartProps) {
  // Calculate average attributes
  const avgAttributes = {
    Velocidad: Math.round(players.reduce((sum, p) => sum + p.speed, 0) / players.length),
    Ataque: Math.round(players.reduce((sum, p) => sum + p.attack, 0) / players.length),
    Defensa: Math.round(players.reduce((sum, p) => sum + p.defense, 0) / players.length),
    Pase: Math.round(players.reduce((sum, p) => sum + p.passing, 0) / players.length),
    Físico: Math.round(players.reduce((sum, p) => sum + p.physical, 0) / players.length),
    Recuperación: Math.round(players.reduce((sum, p) => sum + p.recovery, 0) / players.length),
  }

  const radarData = Object.entries(avgAttributes).map(([attr, value]) => ({
    attribute: attr,
    value,
    fullMark: 100,
  }))

  // Top players by attribute
  const topBySpeed = [...players].sort((a, b) => b.speed - a.speed).slice(0, 5)
  const topByAttack = [...players].sort((a, b) => b.attack - a.attack).slice(0, 5)

  const barDataSpeed = topBySpeed.map(p => ({
    name: p.name.split(' ').pop(),
    value: p.speed,
  }))

  const barDataAttack = topByAttack.map(p => ({
    name: p.name.split(' ').pop(),
    value: p.attack,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Team radar chart */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Perfil del Equipo - {teamName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis 
                  dataKey="attribute" 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <Radar
                  name={teamName}
                  dataKey="value"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Legend />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top speed players */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Jugadores Más Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barDataSpeed} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b' }} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={80}
                  tick={{ fill: '#374151', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value}`, 'Velocidad']}
                />
                <Bar 
                  dataKey="value" 
                  fill="#3b82f6" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top attack players */}
      <Card className="border-0 shadow-lg lg:col-span-2">
        <CardHeader>
          <CardTitle>Top 5 - Capacidad Ofensiva</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barDataAttack}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#374151', fontSize: 12 }}
                />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value}`, 'Ataque']}
                />
                <Bar 
                  dataKey="value" 
                  fill="#ef4444" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
