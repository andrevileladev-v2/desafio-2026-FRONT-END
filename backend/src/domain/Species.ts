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
