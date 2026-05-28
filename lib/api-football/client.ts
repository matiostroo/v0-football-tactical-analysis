const BASE_URL = 'https://v3.football.api-sports.io'

export async function apiFetch<T = unknown>(
  endpoint: string,
  params: Record<string, string | number> = {},
): Promise<T> {
  const url = new URL(`${BASE_URL}/${endpoint}`)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v))
  }

  const res = await fetch(url.toString(), {
    headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY! },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`API-Football [${endpoint}] HTTP ${res.status}`)
  }

  const json = await res.json()

  if (json.errors && Object.keys(json.errors).length > 0) {
    throw new Error(`API-Football [${endpoint}]: ${JSON.stringify(json.errors)}`)
  }

  return json.response as T
}
