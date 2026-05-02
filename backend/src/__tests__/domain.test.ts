import { InMemorySpeciesRepository } from '../repositories/InMemorySpeciesRepository'
import { InMemoryObservationRepository } from '../repositories/InMemoryObservationRepository'
import type { Species } from '../domain/Species'
import type { Observation } from '../domain/Observation'

const sampleSpecies: Species[] = [
  {
    id: 's1',
    name: 'Arara-azul',
    scientificName: 'Anodorhynchus hyacinthinus',
    category: 'Bird',
    status: 'Vulnerable',
    description: 'Test species',
    biome: 'Pantanal',
    observationCount: 5,
    createdAt: '2022-01-01T00:00:00Z',
  },
  {
    id: 's2',
    name: 'Onça-pintada',
    scientificName: 'Panthera onca',
    category: 'Mammal',
    status: 'Near Threatened',
    description: 'Test species 2',
    biome: 'Amazônia',
    observationCount: 3,
    createdAt: '2022-02-01T00:00:00Z',
  },
]

const sampleObs: Observation[] = [
  { id: 'o1', speciesId: 's1', speciesName: 'Arara-azul', lat: -19.5, lng: -56.5, date: '2023-03-15', region: 'Pantanal', biome: 'Pantanal', notes: '' },
  { id: 'o2', speciesId: 's1', speciesName: 'Arara-azul', lat: -19.8, lng: -57.0, date: '2023-06-20', region: 'Pantanal', biome: 'Pantanal', notes: '' },
  { id: 'o3', speciesId: 's2', speciesName: 'Onça-pintada', lat: -3.0, lng: -60.0, date: '2023-09-10', region: 'Amazônia Ocidental', biome: 'Amazônia', notes: '' },
]

describe('InMemorySpeciesRepository', () => {
  let repo: InMemorySpeciesRepository

  beforeEach(() => {
    repo = new InMemorySpeciesRepository(sampleSpecies)
  })

  it('returns all species', () => {
    expect(repo.findAll()).toHaveLength(2)
  })

  it('finds species by id', () => {
    const found = repo.findById('s1')
    expect(found).toBeDefined()
    expect(found?.name).toBe('Arara-azul')
  })

  it('returns undefined for unknown id', () => {
    expect(repo.findById('unknown')).toBeUndefined()
  })

  it('creates a new species', () => {
    const created = repo.create({
      name: 'Capivara',
      scientificName: 'Hydrochoerus hydrochaeris',
      category: 'Mammal',
      status: 'Least Concern',
      description: 'Test',
      biome: 'Pantanal',
    })
    expect(created.id).toBeDefined()
    expect(created.observationCount).toBe(0)
    expect(repo.findAll()).toHaveLength(3)
  })

  it('updates an existing species', () => {
    const updated = repo.update('s1', { name: 'Arara-azul-grande' })
    expect(updated?.name).toBe('Arara-azul-grande')
    expect(repo.findById('s1')?.name).toBe('Arara-azul-grande')
  })

  it('returns undefined when updating unknown id', () => {
    expect(repo.update('unknown', { name: 'X' })).toBeUndefined()
  })

  it('deletes a species', () => {
    expect(repo.delete('s1')).toBe(true)
    expect(repo.findAll()).toHaveLength(1)
  })

  it('returns false when deleting unknown id', () => {
    expect(repo.delete('unknown')).toBe(false)
  })
})

describe('InMemoryObservationRepository', () => {
  let repo: InMemoryObservationRepository

  beforeEach(() => {
    repo = new InMemoryObservationRepository(sampleObs)
  })

  it('returns all observations sorted by date desc', () => {
    const all = repo.findAll()
    expect(all).toHaveLength(3)
    expect(all[0]?.date).toBe('2023-09-10')
  })

  it('filters by speciesId', () => {
    const result = repo.findAll({ speciesId: 's1' })
    expect(result).toHaveLength(2)
    expect(result.every((o) => o.speciesId === 's1')).toBe(true)
  })

  it('filters by startDate', () => {
    const result = repo.findAll({ startDate: '2023-06-01' })
    expect(result).toHaveLength(2)
  })

  it('filters by endDate', () => {
    const result = repo.findAll({ endDate: '2023-06-30' })
    expect(result).toHaveLength(2)
  })

  it('filters by date range', () => {
    const result = repo.findAll({ startDate: '2023-06-01', endDate: '2023-06-30' })
    expect(result).toHaveLength(1)
    expect(result[0]?.date).toBe('2023-06-20')
  })

  it('finds observations by species id', () => {
    const result = repo.findBySpeciesId('s2')
    expect(result).toHaveLength(1)
    expect(result[0]?.speciesName).toBe('Onça-pintada')
  })

  it('creates a new observation with uuid', () => {
    const obs = repo.create({
      speciesId: 's1', speciesName: 'Arara-azul',
      lat: -20.0, lng: -55.0, date: '2024-01-01',
      region: 'Pantanal', biome: 'Pantanal', notes: '',
    })
    expect(obs.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(repo.findAll()).toHaveLength(4)
  })
})
