import { randomUUID } from 'crypto'
import type { Observation } from '../domain/Observation'
import type { IObservationRepository } from './IObservationRepository'

export class InMemoryObservationRepository implements IObservationRepository {
  private store: Map<string, Observation>

  constructor(seed: Observation[]) {
    this.store = new Map(seed.map((o) => [o.id, o]))
  }

  findAll(filters?: { speciesId?: string; startDate?: string; endDate?: string }): Observation[] {
    let result = Array.from(this.store.values())

    if (filters?.speciesId) {
      result = result.filter((o) => o.speciesId === filters.speciesId)
    }
    if (filters?.startDate) {
      result = result.filter((o) => o.date >= filters.startDate!)
    }
    if (filters?.endDate) {
      result = result.filter((o) => o.date <= filters.endDate!)
    }

    return result.sort((a, b) => b.date.localeCompare(a.date))
  }

  findById(id: string): Observation | undefined {
    return this.store.get(id)
  }

  create(data: Omit<Observation, 'id'>): Observation {
    const obs: Observation = { ...data, id: randomUUID() }
    this.store.set(obs.id, obs)
    return obs
  }

  findBySpeciesId(speciesId: string): Observation[] {
    return Array.from(this.store.values()).filter((o) => o.speciesId === speciesId)
  }
}
