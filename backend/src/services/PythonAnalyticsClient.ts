import type { Observation } from '../domain/Observation'

const PYTHON_URL = process.env.PYTHON_ANALYTICS_URL ?? 'http://localhost:8000'

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${PYTHON_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Python service error: ${res.status}`)
  return res.json() as Promise<T>
}

export const pythonAnalytics = {
  clusters: (observations: Observation[], n_clusters = 5) =>
    post('/analytics/clusters', { observations, n_clusters }),

  timeseries: (observations: Observation[], steps = 6, granularity = 'month') =>
    post('/analytics/timeseries', { observations, steps, granularity }),

  pca: (observations: Observation[], n_components = 2) =>
    post('/analytics/pca', { observations, n_components }),

  anomalies: (observations: Observation[], contamination = 0.05) =>
    post('/analytics/anomalies', { observations, contamination }),

  classify: (observations: Observation[], target = 'biome') =>
    post('/analytics/classify', { observations, target }),
}
