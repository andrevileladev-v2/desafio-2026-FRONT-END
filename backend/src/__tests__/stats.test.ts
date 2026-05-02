import { InMemorySpeciesRepository } from '../repositories/InMemorySpeciesRepository'
import { InMemoryObservationRepository } from '../repositories/InMemoryObservationRepository'
import { StatsService } from '../services/StatsService'
import type { Species } from '../domain/Species'
import type { Observation } from '../domain/Observation'

const species: Species[] = [
  { id: 's1', name: 'Arara', scientificName: 'A. hyacinthinus', category: 'Bird', status: 'Vulnerable', description: '', biome: 'Pantanal', observationCount: 3, createdAt: '' },
  { id: 's2', name: 'Onça', scientificName: 'P. onca', category: 'Mammal', status: 'Near Threatened', description: '', biome: 'Amazônia', observationCount: 2, createdAt: '' },
  { id: 's3', name: 'Boto', scientificName: 'I. geoffrensis', category: 'Mammal', status: 'Endangered', description: '', biome: 'Amazônia', observationCount: 1, createdAt: '' },
]

const observations: Observation[] = [
  { id: 'o1', speciesId: 's1', speciesName: 'Arara', lat: -19.0, lng: -56.0, date: '2023-01-10', region: 'Pantanal', biome: 'Pantanal', notes: '' },
  { id: 'o2', speciesId: 's1', speciesName: 'Arara', lat: -19.5, lng: -57.0, date: '2023-02-15', region: 'Pantanal', biome: 'Pantanal', notes: '' },
  { id: 'o3', speciesId: 's1', speciesName: 'Arara', lat: -20.0, lng: -58.0, date: '2023-03-20', region: 'Pantanal', biome: 'Pantanal', notes: '' },
  { id: 'o4', speciesId: 's2', speciesName: 'Onça', lat: -3.0, lng: -60.0, date: '2023-04-01', region: 'Amazônia Ocidental', biome: 'Amazônia', notes: '' },
  { id: 'o5', speciesId: 's2', speciesName: 'Onça', lat: -4.0, lng: -61.0, date: '2023-05-10', region: 'Amazônia Ocidental', biome: 'Amazônia', notes: '' },
  { id: 'o6', speciesId: 's3', speciesName: 'Boto', lat: -2.0, lng: -59.0, date: '2023-06-05', region: 'Amazônia Oriental', biome: 'Amazônia', notes: '' },
]

describe('StatsService', () => {
  let service: StatsService

  beforeEach(() => {
    const speciesRepo = new InMemorySpeciesRepository(species)
    const obsRepo = new InMemoryObservationRepository(observations)
    service = new StatsService(speciesRepo, obsRepo)
  })

  describe('getStats', () => {
    it('returns correct totals', () => {
      const stats = service.getStats()
      expect(stats.totalSpecies).toBe(3)
      expect(stats.totalObservations).toBe(6)
    })

    it('aggregates byCategory correctly', () => {
      const stats = service.getStats()
      const birdCount = stats.byCategory.find((c) => c.category === 'Bird')?.count
      const mammalCount = stats.byCategory.find((c) => c.category === 'Mammal')?.count
      expect(birdCount).toBe(1)
      expect(mammalCount).toBe(2)
    })

    it('aggregates byStatus correctly', () => {
      const stats = service.getStats()
      const vulnerable = stats.byStatus.find((s) => s.status === 'Vulnerable')?.count
      expect(vulnerable).toBe(1)
    })

    it('returns topSpecies sorted by count descending', () => {
      const stats = service.getStats()
      expect(stats.topSpecies[0]?.species).toBe('Arara')
      expect(stats.topSpecies[0]?.count).toBe(3)
    })

    it('aggregates byBiome correctly', () => {
      const stats = service.getStats()
      const amazonia = stats.byBiome.find((b) => b.biome === 'Amazônia')?.count
      const pantanal = stats.byBiome.find((b) => b.biome === 'Pantanal')?.count
      expect(amazonia).toBe(3)
      expect(pantanal).toBe(3)
    })
  })

  describe('getHeatmap', () => {
    it('returns one point per observation', () => {
      expect(service.getHeatmap()).toHaveLength(6)
    })

    it('each point has lat, lng and intensity', () => {
      const points = service.getHeatmap()
      expect(points[0]).toMatchObject({ lat: expect.any(Number), lng: expect.any(Number), intensity: 1 })
    })
  })

  describe('getTimeSeries', () => {
    it('returns monthly aggregation by default', () => {
      const ts = service.getTimeSeries()
      expect(ts.every((p) => /^\d{4}-\d{2}$/.test(p.date))).toBe(true)
    })

    it('filters by speciesId', () => {
      const ts = service.getTimeSeries('s1')
      const total = ts.reduce((acc, p) => acc + p.count, 0)
      expect(total).toBe(3)
    })

    it('returns yearly aggregation when requested', () => {
      const ts = service.getTimeSeries(undefined, 'year')
      expect(ts.every((p) => /^\d{4}$/.test(p.date))).toBe(true)
    })
  })

  describe('getBayesian', () => {
    it('returns results for each unique species', () => {
      const results = service.getBayesian()
      expect(results.length).toBeGreaterThan(0)
    })

    it('probabilities sum is positive for each species', () => {
      const results = service.getBayesian()
      for (const r of results) {
        expect(r.priorProbability).toBeGreaterThan(0)
      }
    })
  })
})
