# Plan de acción — TacticAI

> Estado al 28/05/2026. Backend listo, pendiente schema DB + frontend conectado.

---

## Prioridad 1 — Base de datos (bloqueante para todo lo demás)

### 1.1 Crear schema en Supabase
Escribir y correr las migraciones SQL con todas las tablas que el pipeline ya asume:
`organizations`, `clubs`, `competitions`, `matches`, `players`,
`match_lineups`, `player_match_stats`, `standings`, `player_absences`, `team_analysis`.

Ver el detalle de columnas en `HANDOFF.md`.

**RLS (Row Level Security):** la tabla `team_analysis` necesita que cada organización solo vea sus propios análisis.

### 1.2 Cargar dato semilla: primer club
Insertar en `clubs` + `organizations` al menos un club real con su `api_football_id` de API-Football, para poder probar el sync completo de punta a punta.

---

## Prioridad 2 — Fix bug en cron de análisis

**Archivo:** `app/api/cron/analysis/route.ts`, línea 60  
**Problema:** busca la columna `last_updated_at` pero `generator.ts` guarda `generated_at`.  
**Fix:** cambiar `existing.last_updated_at` → `existing.generated_at` en el cron.

---

## Prioridad 3 — Conectar el frontend al nuevo pipeline

### 3.1 Nuevo componente de análisis
Reemplazar `components/dashboard/rival-ai-analysis.tsx` para que muestre el nuevo schema JSON:
- Resumen ejecutivo
- Fortalezas / debilidades
- Patrones ofensivos y defensivos
- Pelota parada
- Jugadores clave del rival (con badge de amenaza alta/media/baja)
- Jugadores propios recomendados para este partido
- Recomendaciones con título + detalle + razonamiento

### 3.2 Nuevo `rival/page.tsx`
Reemplazar la página para que:
1. Lea el `organization_id` del usuario autenticado (desde Supabase Auth)
2. Consulte el próximo partido del club de esa organización
3. Llame a `getOrGenerateAnalysis(organizationId, matchId)` o lo exponga vía un API route
4. Muestre los datos reales del rival (desde `clubs` + `matches`) en vez del hardcodeo de Arsenal

### 3.3 Loading state + error state
- Mostrar skeleton mientras se genera por primera vez (puede tardar ~10s)
- Botón "Regenerar" que marque `needs_refresh = true` en `team_analysis` y recargue

---

## Prioridad 4 — Autenticación y multi-tenant

### 4.1 Ligar usuario a organización
Al registrarse, cada usuario debe quedar asociado a una `organization`. Definir flujo:
- ¿El admin crea la org y luego invita usuarios?
- ¿O hay un paso de onboarding donde el usuario elige/crea su club?

### 4.2 Middleware
Asegurarse de que `/dashboard/*` solo sea accesible para usuarios con organización activa asignada.

---

## Prioridad 5 — Testing del sync end-to-end

Con la BD lista y un club seed:
1. Llamar manualmente a `/api/cron/sync` con el header `Authorization: Bearer $CRON_SECRET`
2. Verificar que se poblen `matches`, `standings`
3. Llamar a `/api/cron/analysis` y verificar que se genere un registro en `team_analysis`
4. Verificar que el análisis tenga el JSON correcto

---

## Backlog (post-MVP)

- **Bajas del rival:** hoy se leen de `player_absences` que se llena a mano. Automatizar desde API-Football (`/injuries`) o desde un input manual del analista.
- **Búsqueda de equipos** (`/dashboard/search`) — todavía hardcodeada
- **Simulador** (`/dashboard/simulator`) — todavía hardcodeado
- **Patrones tácticos** (`/dashboard/patterns`) — todavía hardcodeado
- **Notificaciones:** avisar al cuerpo técnico cuando el análisis del próximo partido esté listo
- **Historial de análisis:** poder ver análisis de partidos pasados
- **Export PDF** del informe pre-partido
