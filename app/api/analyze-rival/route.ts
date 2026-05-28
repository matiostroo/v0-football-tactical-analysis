import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { teamName, formation, keyPlayers } = body

    if (!teamName) {
      return NextResponse.json({ error: 'teamName es requerido' }, { status: 400 })
    }

    const playersInfo =
      Array.isArray(keyPlayers) && keyPlayers.length > 0
        ? `Jugadores del equipo: ${keyPlayers
            .map((p: { name: string; position: string }) => `${p.name} (${p.position})`)
            .join(', ')}.`
        : ''

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: `Eres un analista táctico experto en fútbol. Analizas equipos rivales y generas informes tácticos detallados. Responde ÚNICAMENTE con un JSON válido y sin texto adicional, siguiendo exactamente esta estructura:

{
  "fortalezasOfensivas": ["string"],
  "debilidadesOfensivas": ["string"],
  "fortalezasDefensivas": ["string"],
  "debilidadesDefensivas": ["string"],
  "patronesTacticos": ["string"],
  "recomendaciones": ["string"],
  "jugadoresClave": [
    { "nombre": "string", "posicion": "string", "descripcion": "string" }
  ]
}

Cada array debe tener entre 3 y 5 items relevantes y específicos al equipo analizado.`,
      messages: [
        {
          role: 'user',
          content: `Analiza al equipo ${teamName} con formación ${formation || 'desconocida'}. ${playersInfo} Genera el análisis táctico completo basado en el conocimiento real del equipo.`,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Respuesta inesperada del modelo')
    }

    // Strip markdown code blocks if present
    const raw = content.text.trim()
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    const analysis = JSON.parse(jsonStr)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('[analyze-rival]', error)
    return NextResponse.json({ error: 'Error al generar el análisis' }, { status: 500 })
  }
}
