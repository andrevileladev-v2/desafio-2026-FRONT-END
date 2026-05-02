import { useEffect, useState, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { HeatmapPoint, Observation, Cluster, BayesianResult } from '../../shared/types'
import { analyticsApi } from '../../shared/api/analytics'
import { speciesApi } from '../../shared/api/species'
import type { Species } from '../../shared/types'
import { HeatLayer } from './HeatLayer'

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

const HEAT_LEGEND = [
  { color: '#0c4a6e', label: 'Muito baixo' },
  { color: '#06b6d4', label: 'Baixo' },
  { color: '#84cc16', label: 'Médio' },
  { color: '#f59e0b', label: 'Alto' },
  { color: '#ef4444', label: 'Muito alto' },
  { color: '#dc2626', label: 'Crítico' },
]

type ColorMode = 'status' | 'biome'
type ViewMode = 'points' | 'heatmap' | 'clusters'

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
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [bayesian, setBayesian] = useState<BayesianResult[]>([])
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
      analyticsApi.getClusters(),
      analyticsApi.getBayesian(),
      speciesApi.getAll(),
    ]).then(([obs, hm, cl, bay, sp]) => {
      setObservations(obs)
      setHeatmap(hm)
      setClusters(cl)
      setBayesian(bay)
      setSpeciesList(sp)
      const years = [...new Set(obs.map((o) => parseInt(o.date.slice(0, 4))))].sort()
      setAllYears(years)
      setYearFilter(0)
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
  const bayesianMap = useMemo(
    () => Object.fromEntries(bayesian.map((b) => [b.species, b])),
    [bayesian],
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

  const heatPoints = useMemo(() => {
    const filtered = heatmap.filter((h) => {
      const sp = selectedSpecies ? speciesList.find((s) => s.id === selectedSpecies) : null
      if (sp && h.speciesName !== sp.name) return false
      if (selectedBiome && speciesBiomeMap[h.speciesName] !== selectedBiome) return false
      return true
    })
    const grid: Record<string, { lat: number; lng: number; count: number }> = {}
    filtered.forEach((h) => {
      const key = `${Math.round(h.lat * 4) / 4},${Math.round(h.lng * 4) / 4}`
      if (!grid[key]) grid[key] = { lat: h.lat, lng: h.lng, count: 0 }
      grid[key].count += h.intensity ?? 1
    })
    const values = Object.values(grid)
    const maxCount = Math.max(...values.map((v) => v.count), 1)
    return values.map((v) => ({ lat: v.lat, lng: v.lng, intensity: v.count / maxCount }))
  }, [heatmap, selectedSpecies, selectedBiome, speciesList, speciesBiomeMap])

  const maxClusterCount = useMemo(
    () => Math.max(...clusters.map((c) => c.count), 1),
    [clusters],
  )

  const getColor = (speciesName: string) => {
    if (colorMode === 'biome') return BIOME_COLOR[speciesBiomeMap[speciesName] ?? ''] ?? '#06b6d4'
    return STATUS_COLOR[speciesStatusMap[speciesName] ?? ''] ?? '#06b6d4'
  }

  const getBayesianProb = (speciesName: string, region: string) => {
    const entry = bayesianMap[speciesName]
    if (!entry) return null
    const prob = entry.probabilities.find((p) => p.region === region)
    return prob ? (prob.probability * 100).toFixed(1) : null
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
        <select
          className="map-select"
          value={selectedSpecies}
          onChange={(e) => setSelectedSpecies(e.target.value)}
        >
          <option value="">Todas as espécies</option>
          {speciesList.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select
          className="map-select"
          value={selectedBiome}
          onChange={(e) => setSelectedBiome(e.target.value)}
        >
          <option value="">Todos os biomas</option>
          {biomes.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>

        <div className="view-toggle">
          <button className={view === 'points' ? 'active' : ''} onClick={() => setView('points')}>
            Pontos
          </button>
          <button className={view === 'heatmap' ? 'active' : ''} onClick={() => setView('heatmap')}>
            Mapa de Calor
          </button>
          <button className={view === 'clusters' ? 'active' : ''} onClick={() => setView('clusters')}>
            Clusters
          </button>
        </div>

        {view === 'points' && (
          <div className="view-toggle">
            <button
              className={colorMode === 'status' ? 'active' : ''}
              onClick={() => setColorMode('status')}
            >
              Status
            </button>
            <button
              className={colorMode === 'biome' ? 'active' : ''}
              onClick={() => setColorMode('biome')}
            >
              Bioma
            </button>
          </div>
        )}

        <div className="map-stats">
          {view === 'points' ? filteredObs.length : view === 'clusters' ? clusters.length : heatPoints.length} registros
        </div>
      </div>

      {allYears.length > 0 && view !== 'clusters' && (
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
          <>
            <MapContainer
              center={[-14, -55]}
              zoom={4}
              style={{ height: '100%', width: '100%', borderRadius: 12 }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              <FitBounds points={heatmap} />

              {view === 'points' && filteredObs.map((obs) => {
                const prob = getBayesianProb(obs.speciesName, obs.region)
                return (
                  <CircleMarker
                    key={obs.id}
                    center={[obs.lat, obs.lng]}
                    radius={6}
                    pathOptions={{
                      fillColor: getColor(obs.speciesName),
                      color: getColor(obs.speciesName),
                      weight: 1,
                      opacity: 0.9,
                      fillOpacity: 0.8,
                    }}
                  >
                    <Popup className="map-popup">
                      <div className="popup-content">
                        <strong>{obs.speciesName}</strong>
                        <div>{obs.date}</div>
                        <div>{obs.region} · {obs.biome}</div>
                        {prob && (
                          <div className="popup-prob">
                            P(espécie|região): <span>{prob}%</span>
                          </div>
                        )}
                        {obs.notes && <em>{obs.notes}</em>}
                      </div>
                    </Popup>
                  </CircleMarker>
                )
              })}

              {view === 'heatmap' && (
                <HeatLayer points={heatPoints} radius={35} blur={25} />
              )}

              {view === 'clusters' && clusters.map((cl) => {
                const radius = 30000 + (cl.count / maxClusterCount) * 120000
                return (
                  <Circle
                    key={cl.id}
                    center={[cl.lat, cl.lng]}
                    radius={radius}
                    pathOptions={{
                      fillColor: '#06b6d4',
                      color: '#06b6d4',
                      weight: 1.5,
                      fillOpacity: 0.15,
                      opacity: 0.6,
                    }}
                  >
                    <Popup className="map-popup">
                      <div className="popup-content">
                        <strong>Cluster — {cl.count} obs.</strong>
                        <div style={{ marginTop: 4, fontSize: 11 }}>
                          {cl.species.slice(0, 5).map((s) => (
                            <div key={s}>· {s}</div>
                          ))}
                          {cl.species.length > 5 && (
                            <div style={{ color: '#64748b' }}>+{cl.species.length - 5} espécies</div>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Circle>
                )
              })}
            </MapContainer>

            <div className="map-legend-float">
              <div className="legend-title">
                {view === 'heatmap'
                  ? 'Intensidade'
                  : view === 'clusters'
                  ? 'Clusters'
                  : colorMode === 'status' ? 'Status' : 'Bioma'}
              </div>
              {view === 'heatmap' ? (
                <>
                  <div className="heat-gradient-bar" />
                  {HEAT_LEGEND.map(({ color, label }) => (
                    <div key={label} className="legend-item">
                      <span className="legend-dot" style={{ background: color }} />
                      <span>{label}</span>
                    </div>
                  ))}
                </>
              ) : view === 'clusters' ? (
                <>
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#06b6d4' }} />
                    <span>Área de densidade</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>
                    Raio proporcional ao nº de observações
                  </div>
                </>
              ) : (
                legendEntries.map(([label, color]) => (
                  <div key={label} className="legend-item">
                    <span className="legend-dot" style={{ background: color }} />
                    <span>{label}</span>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
