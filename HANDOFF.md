# TacticAI — Handoff para el equipo

> Fecha: 28 de mayo de 2026  
> Estado: Backend nuevo deployable, frontend todavía en demo

---

## Qué es el producto

Plataforma B2B SaaS de inteligencia táctica para cuerpos técnicos y analistas de fútbol profesional. Pensada para el fútbol argentino/sudamericano.

**Diferencial:** el club abre la app y encuentra los análisis pre-generados por IA, listos antes del partido, sin tener que cargar nada. Cada recomendación explica el razonamiento para que el DT pueda concordar o discrepar.

**NO es:** otra base de videos, otro software de scouting, ni un dashboard de estadísticas genérico.

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js (App Router) |
| Deploy | Vercel |
| Base de datos | Supabase (Postgres) |
| IA | Anthropic Claude (`claude-sonnet-4-6`) |
| Datos deportivos | API-Football v3 (`v3.football.api-sports.io`) |
| Package manager | pnpm |

**Variables de entorno necesarias:**
```
ANTHROPIC_API_KEY=...
API_FOOTBALL_KEY=...
CRON_SECRET=...           # para autenticar los cron jobs de Vercel
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## Lo que ya está construido

### 1. Integración con API-Football (`lib/api-football/`)

- **`client.ts`** — wrapper sobre `v3.football.api-sports.io` con la API key del header
- **`sync.ts`** — tres funciones principales:
  - `syncFixtures(leagueId, season)` — baja partidos de una competencia y los guarda en Supabase
  - `syncMatchDetails(apiFootballMatchId)` — baja formaciones y estadísticas de un partido terminado
  - `syncStandings(leagueId, season)` — baja tabla de posiciones

**IDs de competencias configurados** (`app/api/cron/sync/route.ts`):
```
128  → Liga Profesional Argentina
1032 → Copa de la Liga Profesional
130  → Copa Argentina
13   → Copa Libertadores
11   → Copa Sudamericana
```

### 2. Pipeline de análisis IA (`lib/analysis/`)

- **`context-builder.ts`** — lee Supabase y arma un `AnalysisContext` con:
  - Datos del partido (fecha, competencia, localía, estadio)
  - Días de descanso propios y del rival
  - Posición y puntos en la tabla
  - Últimos 5 resultados con oncena completa (propios y rival)
  - Patrones de titularidad del rival (últimos 20 partidos)
  - Bajas confirmadas de ambos equipos
  - Plantilla disponible propia

- **`prompt.ts`** — toma el `AnalysisContext` y genera un prompt estructurado en español, orientado al fútbol argentino

- **`generator.ts`** — llama a Claude con el contexto, parsea el JSON de respuesta y hace upsert en la tabla `team_analysis` de Supabase

**Schema JSON que devuelve Claude:**
```json
{
  "resumen": "3-4 oraciones sobre el rival y el factor clave",
  "fortalezas": ["..."],
  "debilidades": ["..."],
  "patrones_ofensivos": ["..."],
  "patrones_defensivos": ["..."],
  "pelota_parada": {
    "ofensiva": ["..."],
    "defensiva": ["..."]
  },
  "jugadores_clave_rival": [
    { "nombre": "...", "posicion": "...", "descripcion": "...", "amenaza": "alta|media|baja" }
  ],
  "jugadores_propios_recomendados": [
    { "nombre": "...", "posicion": "...", "razon": "..." }
  ],
  "recomendaciones": [
    { "titulo": "...", "detalle": "...", "razonamiento": "..." }
  ]
}
```

### 3. Cron jobs (`app/api/cron/`)

Definidos en `vercel.json`, se autentican con `Authorization: Bearer $CRON_SECRET`:

| Ruta | Frecuencia | Qué hace |
|------|-----------|----------|
| `/api/cron/sync` | Cada 6 horas | Sync de fixtures y standings de las 5 competencias |
| `/api/cron/analysis` | Cada hora | Genera/regenera análisis para partidos en los próximos 14 días |

La lógica de refresco del análisis: si el partido está a 7 días o menos y el análisis tiene más de 24 horas, se regenera automáticamente.

### 4. Endpoint legado (`app/api/analyze-rival`)

Endpoint simple POST que toma `{ teamName, formation, keyPlayers }` y llama a Claude sin contexto de BD. **Está siendo reemplazado por el pipeline completo.** Lo sigue usando el frontend demo.

### 5. Frontend demo (todavía hardcodeado)

- `app/dashboard/rival/page.tsx` — usa un UUID hardcodeado de Arsenal y consulta las tablas viejas (`teams`, `players` con atributos FIFA)
- `components/dashboard/rival-ai-analysis.tsx` — llama al endpoint legado, muestra schema viejo

---

## Schema de base de datos necesario (todavía no existe)

Estas son las tablas que el pipeline nuevo asume que existen. **Falta crear las migraciones en Supabase.**

```
organizations       → id, club_id (FK clubs), is_active
clubs               → id, name, short_name, api_football_id
competitions        → id, name, type, country, api_football_id, season
matches             → id, home_club_id, away_club_id, competition_id,
                      scheduled_at, status, round, venue,
                      home_score, away_score, api_football_id, last_synced_at
players             → id, club_id, name, position, jersey_number,
                      is_active, api_football_id
match_lineups       → id, match_id, club_id, player_id,
                      is_starter, position_played
player_match_stats  → id, match_id, club_id, player_id,
                      goals, assists, rating
standings           → id, competition_id, club_id, position, points,
                      matches_played, last_synced_at
player_absences     → id, club_id, player_id, type (injury|suspension|personal),
                      description, expected_return_date, confirmed
team_analysis       → id, organization_id, match_id, rival_club_id,
                      analysis (jsonb), prompt_context (jsonb), model_version,
                      generated_at, needs_refresh
                      UNIQUE (organization_id, match_id)
```

---

## Lo que falta hacer (plan de acción)

Ver `PLAN.md` para el detalle paso a paso.

---

## Estructura del repositorio

```
app/
  api/
    analyze-rival/route.ts   ← endpoint legado (POST simple)
    cron/
      sync/route.ts           ← cron de sync de datos
      analysis/route.ts       ← cron de generación de análisis
  dashboard/
    rival/page.tsx            ← página del rival (todavía demo)
    ...
lib/
  api-football/
    client.ts                 ← HTTP client para API-Football
    sync.ts                   ← lógica de sync a Supabase
  analysis/
    context-builder.ts        ← arma el contexto desde Supabase
    prompt.ts                 ← formatea el prompt para Claude
    generator.ts              ← llama a Claude + guarda en BD
  supabase/
    client.ts                 ← cliente browser
    server.ts                 ← cliente servidor (cookies)
    service.ts                ← cliente con service role key
components/
  dashboard/
    rival-ai-analysis.tsx     ← UI del análisis (usa endpoint legado)
    ...
vercel.json                   ← config de crons de Vercel
CLAUDE.md                     ← instrucciones para el agente IA del proyecto
```
