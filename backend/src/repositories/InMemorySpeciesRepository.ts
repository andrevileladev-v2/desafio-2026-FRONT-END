import { randomUUID } from 'crypto'
import type { Species } from '../domain/Species'
import type { ISpeciesRepository } from './ISpeciesRepository'

export class InMemorySpeciesRepository implements ISpeciesRepository {
  private store: Map<string, Species>

  constructor(seed: Species[]) {
    this.store = new Map(seed.map((s) => [s.id, s]))
  }

  findAll(): Species[] {
    return Array.from(this.store.values())
  }

  findById(id: string): Species | undefined {
    return this.store.get(id)
  }

  create(data: Omit<Species, 'id' | 'observationCount' | 'createdAt'>): Species {
    const species: Species = {
      ...data,
      id: randomUUID(),
      observationCount: 0,
      createdAt: new Date().toISOString(),
    }
    this.store.set(species.id, species)
    return species
  }

  update(id: string, data: Partial<Species>): Species | undefined {
    const existing = this.store.get(id)
    if (!existing) return undefined
    const updated = { ...existing, ...data, id }
    this.store.set(id, updated)
    return updated
  }

  delete(id: string): boolean {
    return this.store.delete(id)
  }
}
