import type { Species } from '../domain/Species'

export interface ISpeciesRepository {
  findAll(): Species[]
  findById(id: string): Species | undefined
  create(species: Omit<Species, 'id' | 'observationCount' | 'createdAt'>): Species
  update(id: string, data: Partial<Species>): Species | undefined
  delete(id: string): boolean
}
