import type { Observation } from '../domain/Observation'

export interface IObservationRepository {
  findAll(filters?: { speciesId?: string; startDate?: string; endDate?: string }): Observation[]
  findById(id: string): Observation | undefined
  create(obs: Omit<Observation, 'id'>): Observation
  findBySpeciesId(speciesId: string): Observation[]
}
