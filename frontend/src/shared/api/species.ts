import type { Species, Observation } from '../types'
import { api } from './client'

export const speciesApi = {
  getAll: () => api.get<Species[]>('/api/species').then((r) => r.data),

  getById: (id: string) => api.get<Species>(`/api/species/${id}`).then((r) => r.data),

  create: (data: Omit<Species, 'id' | 'observationCount' | 'createdAt'>) =>
    api.post<Species>('/api/species', data).then((r) => r.data),

  update: (id: string, data: Partial<Species>) =>
    api.put<Species>(`/api/species/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/api/species/${id}`),

  getObservations: (id: string) =>
    api.get<Observation[]>(`/api/species/${id}/observations`).then((r) => r.data),
}
