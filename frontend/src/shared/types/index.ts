export type ConservationStatus =
  | 'Least Concern'
  | 'Near Threatened'
  | 'Vulnerable'
  | 'Endangered'
  | 'Critically Endangered'

export type SpeciesCategory =
  | 'Mammal'
  | 'Bird'
  | 'Reptile'
  | 'Amphibian'
  | 'Fish'
  | 'Invertebrate'

export interface Species {
  id: string
  name: string
  scientificName: string
  category: SpeciesCategory
  status: ConservationStatus
  description: string
  biome: string
  observationCount: number
  createdAt: string
}

export interface Observation {
  id: string
  speciesId: string
  speciesName: string
  lat: number
  lng: number
  date: string
  region: string
  biome: string
  notes: string
}

export interface Stats {
  totalSpecies: number
  totalObservations: number
  byCategory: { category: string; count: number }[]
  byStatus: { status: string; count: number }[]
  topSpecies: { species: string; count: number }[]
  byRegion: { region: string; count: number }[]
  byBiome: { biome: string; count: number }[]
  biomeCorrelation: { biome: string; speciesCount: number; obsCount: number }[]
}

export interface HeatmapPoint {
  lat: number
  lng: number
  intensity: number
  speciesName: string
}

export interface Cluster {
  id: string
  lat: number
  lng: number
  count: number
  species: string[]
}

export interface TimeSeriesPoint {
  date: string
  count: number
}

export interface BayesianResult {
  species: string
  probabilities: { region: string; probability: number }[]
  total: number
  priorProbability: number
}
