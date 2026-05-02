import type { Species, Observation, Stats } from '../shared/types'

describe('Type contracts', () => {
  it('Species type has required fields', () => {
    const sp: Species = {
      id: 's1',
      name: 'Arara',
      scientificName: 'A. hyacinthinus',
      category: 'Bird',
      status: 'Vulnerable',
      description: 'Test',
      biome: 'Pantanal',
      observationCount: 5,
      createdAt: '2022-01-01T00:00:00Z',
    }
    expect(sp.id).toBe('s1')
    expect(sp.category).toBe('Bird')
    expect(sp.status).toBe('Vulnerable')
  })

  it('Observation type has lat/lng coordinates', () => {
    const obs: Observation = {
      id: 'o1',
      speciesId: 's1',
      speciesName: 'Arara',
      lat: -19.5,
      lng: -56.5,
      date: '2023-01-15',
      region: 'Pantanal',
      biome: 'Pantanal',
      notes: '',
    }
    expect(obs.lat).toBe(-19.5)
    expect(obs.lng).toBe(-56.5)
  })

  it('Stats type has all aggregation fields', () => {
    const stats: Stats = {
      totalSpecies: 15,
      totalObservations: 118,
      byCategory: [{ category: 'Bird', count: 3 }],
      byStatus: [{ status: 'Vulnerable', count: 6 }],
      topSpecies: [{ species: 'Arara', count: 12 }],
      byRegion: [{ region: 'Pantanal', count: 20 }],
      byBiome: [{ biome: 'Amazônia', count: 50 }],
    }
    expect(stats.totalSpecies).toBe(15)
    expect(stats.byBiome[0]?.biome).toBe('Amazônia')
  })
})
