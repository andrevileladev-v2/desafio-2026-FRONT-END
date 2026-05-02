import { useEffect, useState, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { HeatmapPoint, Observation } from '../../shared/types'
import { analyticsApi } from '../../shared/api/analytics'
import { speciesApi } from '../../shared/api/species'
import type { Species } from '../../shared/types'

const STATUS_COLOR: Record<string, string> = {
  'Least Concern': '#10b981',
  'Near Threatened': '#f59e0b',
  Vulnerable: '#f97316',
  Endangered: '#ef4444',
  'Critically Endangered': '#dc2626',
}

const BIOME_COLOR: Record<string, string> = {
  Amazônia: '#06b6d4',
  Cerrado: '#f59e0b',
  Pantanal: '#10b981',
  'Mata Atlântica': '#8b5cf6',
  Caatinga: '#ef4444',
}

type ColorMode = 'status' | 'biome'
type ViewMode = 'points' | 'heatmap'

function FitBounds({ points }: { points: HeatmapPoint[] }) {
  const map = useMap()
  const fitted = useRef(false)
  useEffect(() => {
    if (!fitted.current && points.length > 0) {
      map.setView([-14, -55], 4)
      fitted.current = true
    }
  }, [map, points])
  return null
}

export function MapPage() {
  const [observations, setObservations] = useState<Observation[]>([])
  const [heatmap, setHeatmap] = useState<HeatmapPoint[]>([])
  const [speciesList, setSpeciesList] = useState<Species[]>([])
  const [selectedSpecies, setSelectedSpecies] = useState<string>('')
  const [selectedBiome, setSelectedBiome] = useState<string>('')
  const [view, setView] = useState<ViewMode>('points')
  const [colorMode, setColorMode] = useState<ColorMode>('status')
  const [loading, setLoading] = useState(true)

  const [allYears, setAllYears] = useState<number[]>([])
  const [yearFilter, setYearFilter] = useState<number>(0)

  useEffect(() => {
    Promise.all([
      analyticsApi.getObservations(),
      analyticsApi.getHeatmap(),
      speciesApi.getAll(),
    ]).then(([obs, hm, sp]) => {
      setObservations(obs)
      setHeatmap(hm)
      setSpeciesList(sp)

      const years = [...new Set(obs.map((o) => parseInt(o.date.slice(0, 4))))].sort()
      setAllYears(years)
      if (years.length > 0) setYearFilter(0)
      setLoading(false)
    })
  }, [])

  const speciesStatusMap = useMemo(
    () => Object.fromEntries(speciesList.map((s) => [s.name, s.status])),
    [speciesList],
  )
  const speciesBiomeMap = useMemo(
    () => Object.fromEntries(speciesList.map((s) => [s.name, s.biome])),
    [speciesList],
  )

  const biomes = useMemo(
    () => [...new Set(observations.map((o) => o.biome))].sort(),
    [observations],
  )

  const filteredObs = useMemo(() => {
    return observations.filter((o) => {
      if (selectedSpecies && o.speciesId !== selectedSpecies) return false
      if (selectedBiome && o.biome !== selectedBiome) return false
      if (yearFilter && parseInt(o.date.slice(0, 4)) !== yearFilter) return false
      return true
    })
  }, [observations, selectedSpecies, selectedBiome, yearFilter])

  const filteredHeatmap = useMemo(() => {
    if (!selectedSpecies && !selectedBiome && !yearFilter) return heatmap
    return heatmap.filter((h) => {
      const sp = selectedSpecies ? speciesList.find((s) => s.id === selectedSpecies) : null
      if (sp && h.speciesName !== sp.name) return false
      if (selectedBiome && speciesBiomeMap[h.speciesName] !== selectedBiome) return false
      return true
    })
  }, [heatmap, selectedSpecies, selectedBiome, yearFilter, speciesList, speciesBiomeMap])

  const activePoints = view === 'points' ? filteredObs : filteredHeatmap

  const getColor = (speciesName: string) => {
    if (colorMode === 'biome') return BIOME_COLOR[speciesBiomeMap[speciesName] ?? ''] ?? '#06b6d4'
    return STATUS_COLOR[speciesStatusMap[speciesName] ?? ''] ?? '#06b6d4'
  }

  const legendEntries = colorMode === 'status'
    ? Object.entries(STATUS_COLOR)
    : Object.entries(BIOME_COLOR)

  return (
    <div className="map-page">
      <div className="page-header">
        <h1>Mapa Geoespacial</h1>
        <p className="page-subtitle">Distribuição geográfica das espécies monitoradas</p>
      </div>

      <div className="map-controls">
        <select className="map-select" value={selectedSpecies} onChange={(e) => setSelectedSpecies(e.target.value)}>
          <option value="">Todas as espécies</option>
          {speciesList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <select className="map-select" value={selectedBiome} onChange={(e) => setSelectedBiome(e.target.value)}>
          <option value="">Todos os biomas</option>
          {biomes.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>

        <div className="view-toggle">
          <button className={view === 'points' ? 'active' : ''} onClick={() => setView('points')}>Pontos</button>
          <button className={view === 'heatmap' ? 'active' : ''} onClick={() => setView('heatmap')}>Calor</button>
        </div>

        <div className="view-toggle">
          <button className={colorMode === 'status' ? 'active' : ''} onClick={() => setColorMode('status')}>Status</button>
          <button className={colorMode === 'biome' ? 'active' : ''} onClick={() => setColorMode('biome')}>Bioma</button>
        </div>

        <div className="map-stats">{activePoints.length} registros visíveis</div>
      </div>

      {allYears.length > 0 && (
        <div className="map-timeline">
          <span>Ano:</span>
          <input
            type="range"
            className="timeline-range"
            min={0}
            max={allYears.length}
            value={allYears.indexOf(yearFilter) + (yearFilter === 0 ? -1 : 0) + 1}
            onChange={(e) => {
              const idx = parseInt(e.target.value)
              setYearFilter(idx === 0 ? 0 : (allYears[idx - 1] ?? 0))
            }}
          />
          <span className="timeline-label">{yearFilter === 0 ? 'Todos' : yearFilter}</span>
        </div>
      )}

      <div className="map-wrap">
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <MapContainer center={[-14, -55]} zoom={4} style={{ height: '100%', width: '100%', borderRadius: 12 }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <FitBounds points={heatmap} />

            {view === 'points' && filteredObs.map((obs) => (
              <CircleMarker
                key={obs.id}
                center={[obs.lat, obs.lng]}
                radius={6}
                pathOptions={{ fillColor: getColor(obs.speciesName), color: getColor(obs.speciesName), weight: 1, opacity: 0.9, fillOpacity: 0.75 }}
              >
                <Popup className="map-popup">
                  <div className="popup-content">
                    <strong>{obs.speciesName}</strong>
                    <div>{obs.date}</div>
                    <div>{obs.region} · {obs.biome}</div>
                    {obs.notes && <em>{obs.notes}</em>}
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {view === 'heatmap' && filteredHeatmap.map((pt, i) => (
              <CircleMarker
                key={i}
                center={[pt.lat, pt.lng]}
                radius={12}
                pathOptions={{ fillColor: getColor(pt.speciesName), color: 'transparent', fillOpacity: 0.3 }}
              >
                <Popup><div className="popup-content"><strong>{pt.speciesName}</strong></div></Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </div>

      <div className="map-legend">
        {legendEntries.map(([label, color]) => (
          <div key={label} className="legend-item">
            <span className="legend-dot" style={{ background: color }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
