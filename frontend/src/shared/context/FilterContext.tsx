import { createContext, useContext, useState } from 'react'

interface FilterState {
  selectedSpeciesId: string
  selectedBiome: string
  selectedYear: number
  setSelectedSpeciesId: (id: string) => void
  setSelectedBiome: (biome: string) => void
  setSelectedYear: (year: number) => void
  reset: () => void
}

const FilterContext = createContext<FilterState | null>(null)

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [selectedSpeciesId, setSelectedSpeciesId] = useState('')
  const [selectedBiome, setSelectedBiome] = useState('')
  const [selectedYear, setSelectedYear] = useState(0)

  return (
    <FilterContext.Provider value={{
      selectedSpeciesId, selectedBiome, selectedYear,
      setSelectedSpeciesId, setSelectedBiome, setSelectedYear,
      reset: () => { setSelectedSpeciesId(''); setSelectedBiome(''); setSelectedYear(0) },
    }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters() {
  const ctx = useContext(FilterContext)
  if (!ctx) throw new Error('useFilters must be used inside FilterProvider')
  return ctx
}
