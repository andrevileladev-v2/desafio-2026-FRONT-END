import { api } from './client'

export interface MLCluster {
  cluster_id: number
  lat: number
  lng: number
  count: number
  species: string[]
  biomes: string[]
  centroid_lat: number
  centroid_lng: number
}

export interface MLTimeSeriesPoint {
  date: string
  count: number
  is_forecast: boolean
  lower_ci?: number
  upper_ci?: number
}

export interface PCAPoint {
  speciesName: string
  pc1: number
  pc2: number
  cluster: number
}

export interface PCAResult {
  points: PCAPoint[]
  explained_variance: number[]
  components: number[][]
}

export interface AnomalyResult {
  id: string
  speciesName: string
  lat: number
  lng: number
  date: string
  region: string
  anomaly_score: number
  is_anomaly: boolean
}

export interface ClassifyResult {
  accuracy: number
  feature_importance: Record<string, number>
  confusion_labels: string[]
  confusion_matrix: number[][]
  top_rules: string[]
}

export const mlApi = {
  getClusters: (n_clusters = 5) =>
    api.get<MLCluster[]>('/api/ml/clusters', { params: { n_clusters } }).then((r) => r.data),

  getTimeSeries: (speciesId?: string, granularity = 'month', steps = 6) =>
    api.get<MLTimeSeriesPoint[]>('/api/ml/timeseries', { params: { speciesId, granularity, steps } }).then((r) => r.data),

  getPCA: () =>
    api.get<PCAResult>('/api/ml/pca').then((r) => r.data),

  getAnomalies: (contamination = 0.05) =>
    api.get<AnomalyResult[]>('/api/ml/anomalies', { params: { contamination } }).then((r) => r.data),

  getClassify: (target = 'biome') =>
    api.get<ClassifyResult>('/api/ml/classify', { params: { target } }).then((r) => r.data),
}
