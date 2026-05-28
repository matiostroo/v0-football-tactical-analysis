# TacticAI — Contexto del Proyecto

## Qué es esto
Plataforma de inteligencia táctica para cuerpos técnicos y analistas de fútbol profesional, especialmente pensada para el fútbol argentino/sudamericano.

## Modelo de negocio
- B2B SaaS vendido a clubes de fútbol profesionales
- NO es un reemplazo de Wyscout/Hudl, es una capa de inteligencia encima de ellas
- El club abre la app y ya encuentra los análisis hechos, no tiene que cargar nada
- Posicionamiento: "Wyscout te muestra qué pasó. Nosotros te ayudamos a convertir eso en un plan de partido."

## Usuario principal
Analista de video / cuerpo técnico de clubes de Primera División argentina

## Producto actual (MVP)
- Dashboard con análisis del próximo rival
- Secciones: Análisis Rival, Patrones Tácticos, Estadísticas, Simulador, Búsqueda de equipos
- Todo el contenido hoy está hardcodeado con datos de PSG vs Arsenal como demo
- El objetivo inmediato es conectar el análisis a IA real (API de Claude)

## Qué NO queremos construir
- Otra base de videos
- Otro software de scouting
- Otro dashboard de estadísticas genérico
- Competir de frente con Wyscout/Hudl

## Diferencial real
- Análisis táctico pre-generado por IA, listo antes del partido
- Integra contexto externo: calendario, lesiones, viajes, localía, presión por tabla
- Adaptado al fútbol argentino: canchas difíciles, planteles cortos, torneos locales + copa
- Cada recomendación explica el razonamiento para que el DT pueda concordar o discrepar

## Stack técnico
- Next.js (App Router)
- Desplegado en Vercel
- API de Anthropic (Claude) para generación de análisis
- Variable de entorno: ANTHROPIC_API_KEY
