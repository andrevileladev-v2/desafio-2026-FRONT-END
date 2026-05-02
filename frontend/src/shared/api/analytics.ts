import type { Stats, HeatmapPoint, Cluster, TimeSeriesPoint, BayesianResult, Observation } from '../types'
import { api } from './client'

export const analyticsApi = {
  getStats: () => api.get<Stats>('/api/stats').then((r) => r.data),

  getHeatmap: () => api.get<HeatmapPoint[]>('/api/heatmap').then((r) => r.data),

  getClusters: () => api.get<Cluster[]>('/api/clusters').then((r) => r.data),

  getTimeSeries: (speciesId?: string, granularity?: 'month' | 'year') =>
    api
      .get<TimeSeriesPoint[]>('/api/timeseries', { params: { speciesId, granularity } })
      .then((r) => r.data),

  getBayesian: () => api.get<BayesianResult[]>('/api/bayesian').then((r) => r.data),

  getObservations: (params?: { speciesId?: string; startDate?: string; endDate?: string }) =>
    api.get<Observation[]>('/api/observations', { params }).then((r) => r.data),
}
