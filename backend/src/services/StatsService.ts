import type { ISpeciesRepository } from '../repositories/ISpeciesRepository'
import type { IObservationRepository } from '../repositories/IObservationRepository'

export class StatsService {
  constructor(
    private species: ISpeciesRepository,
    private observations: IObservationRepository,
  ) {}

  getStats() {
    const allSpecies = this.species.findAll()
    const allObs = this.observations.findAll()

    const byCategory = Object.entries(
      allSpecies.reduce<Record<string, number>>((acc, s) => {
        acc[s.category] = (acc[s.category] ?? 0) + 1
        return acc
      }, {}),
    ).map(([category, count]) => ({ category, count }))

    const byStatus = Object.entries(
      allSpecies.reduce<Record<string, number>>((acc, s) => {
        acc[s.status] = (acc[s.status] ?? 0) + 1
        return acc
      }, {}),
    ).map(([status, count]) => ({ status, count }))

    const topSpeciesMap = allObs.reduce<Record<string, number>>((acc, o) => {
      acc[o.speciesName] = (acc[o.speciesName] ?? 0) + 1
      return acc
    }, {})
    const topSpecies = Object.entries(topSpeciesMap)
      .map(([species, count]) => ({ species, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const byRegion = Object.entries(
      allObs.reduce<Record<string, number>>((acc, o) => {
        acc[o.region] = (acc[o.region] ?? 0) + 1
        return acc
      }, {}),
    ).map(([region, count]) => ({ region, count }))

    const byBiome = Object.entries(
      allObs.reduce<Record<string, number>>((acc, o) => {
        acc[o.biome] = (acc[o.biome] ?? 0) + 1
        return acc
      }, {}),
    ).map(([biome, count]) => ({ biome, count }))

    const biomeSpeciesMap: Record<string, Set<string>> = {}
    const biomeObsMap: Record<string, number> = {}
    for (const o of allObs) {
      if (!biomeSpeciesMap[o.biome]) biomeSpeciesMap[o.biome] = new Set()
      biomeSpeciesMap[o.biome]!.add(o.speciesName)
      biomeObsMap[o.biome] = (biomeObsMap[o.biome] ?? 0) + 1
    }
    const biomeCorrelation = Object.entries(biomeSpeciesMap).map(([biome, species]) => ({
      biome,
      speciesCount: species.size,
      obsCount: biomeObsMap[biome] ?? 0,
    }))

    return {
      totalSpecies: allSpecies.length,
      totalObservations: allObs.length,
      byCategory,
      byStatus,
      topSpecies,
      byRegion,
      byBiome,
      biomeCorrelation,
    }
  }

  getHeatmap() {
    return this.observations.findAll().map((o) => ({
      lat: o.lat,
      lng: o.lng,
      intensity: 1,
      speciesName: o.speciesName,
    }))
  }

  getClusters() {
    const obs = this.observations.findAll()
    const gridSize = 3

    const grid: Record<string, { lat: number; lng: number; count: number; species: Set<string> }> = {}

    for (const o of obs) {
      const key = `${Math.round(o.lat / gridSize)}_${Math.round(o.lng / gridSize)}`
      if (!grid[key]) {
        grid[key] = { lat: o.lat, lng: o.lng, count: 0, species: new Set() }
      }
      grid[key]!.count++
      grid[key]!.species.add(o.speciesName)
    }

    return Object.entries(grid).map(([id, c]) => ({
      id,
      lat: c.lat,
      lng: c.lng,
      count: c.count,
      species: Array.from(c.species),
    }))
  }

  getTimeSeries(speciesId?: string, granularity: 'month' | 'year' = 'month') {
    const obs = speciesId
      ? this.observations.findBySpeciesId(speciesId)
      : this.observations.findAll()

    const counts: Record<string, number> = {}
    for (const o of obs) {
      const key = granularity === 'month' ? o.date.slice(0, 7) : o.date.slice(0, 4)
      counts[key] = (counts[key] ?? 0) + 1
    }

    return Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  getBayesian() {
    const allObs = this.observations.findAll()
    const regions = [...new Set(allObs.map((o) => o.region))]
    const speciesList = [...new Set(allObs.map((o) => o.speciesName))]

    const total = allObs.length
    const alpha = 1 // Laplace smoothing

    return speciesList.slice(0, 8).map((species) => {
      const speciesObs = allObs.filter((o) => o.speciesName === species)
      return {
        species,
        probabilities: regions.map((region) => {
          const regionObs = allObs.filter((o) => o.region === region).length
          const jointObs = speciesObs.filter((o) => o.region === region).length
          const p = (jointObs + alpha) / (regionObs + alpha * regions.length)
          return { region, probability: parseFloat(p.toFixed(4)) }
        }),
        total: speciesObs.length,
        priorProbability: parseFloat(((speciesObs.length + alpha) / (total + alpha * speciesList.length)).toFixed(4)),
      }
    })
  }
}
