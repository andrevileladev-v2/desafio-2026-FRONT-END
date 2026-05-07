import { useEffect, useState, useRef, useMemo } from 'react'
import {
  SlidersHorizontal, X,
  MapPin, Flame, Layers, Waves,
  Wind, Droplets, Thermometer, Satellite,
} from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { HeatmapPoint, Observation, Cluster, BayesianResult } from '../../shared/types'
import { analyticsApi } from '../../shared/api/analytics'
import { speciesApi } from '../../shared/api/species'
import type { Species } from '../../shared/types'
import { HeatLayer } from './HeatLayer'
import { SatelliteLayer, SATELLITE_LABELS, SATELLITE_GROUPS } from './SatelliteLayer'
import type { SatelliteProduct } from './SatelliteLayer'
import { WindyEmbed } from './WindyEmbed'

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

const BIOME_VIEW: Record<string, { center: [number, number]; zoom: number }> = {
  Amazônia: { center: [-5, -60], zoom: 5 },
  Cerrado: { center: [-15, -47], zoom: 5 },
  Pantanal: { center: [-19, -57], zoom: 6 },
  'Mata Atlântica': { center: [-22, -44], zoom: 6 },
  Caatinga: { center: [-9, -38], zoom: 6 },
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
type ViewMode = 'points' | 'heatmap' | 'clusters' | 'windy'
type WindyLayer = 'waves' | 'wind' | 'temp' | 'currents' | 'swell1'

type IconComponent = React.ComponentType<LucideProps>

const VIEW_CONFIG: Record<ViewMode, { label: string; Icon: IconComponent }> = {
  points: { label: 'Pontos', Icon: MapPin },
  heatmap: { label: 'Calor', Icon: Flame },
  clusters: { label: 'Clusters', Icon: Layers },
  windy: { label: 'Ondas', Icon: Waves },
}

const WINDY_CONFIG: Record<WindyLayer, { label: string; Icon: IconComponent }> = {
  waves: { label: 'Ondas', Icon: Waves },
  swell1: { label: 'Swell', Icon: Waves },
  wind: { label: 'Vento', Icon: Wind },
  currents: { label: 'Correntes', Icon: Droplets },
  temp: { label: 'Temperatura', Icon: Thermometer },
}

function MapZoomController({ biome }: { biome: string }) {
  const map = useMap()
  const prev = useRef('')
  useEffect(() => {
    if (biome === prev.current) return
    prev.current = biome
    if (biome && BIOME_VIEW[biome]) {
      const { center, zoom } = BIOME_VIEW[biome]
      map.flyTo(center, zoom, { duration: 1.2 })
    } else if (!biome) {
      map.flyTo([-14, -55], 4, { duration: 1.2 })
    }
  }, [map, biome])
  return null
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function defaultSatelliteDate() {
  const d = new Date()
  d.setDate(d.getDate() - 3)
  return d.toISOString().slice(0, 10)
}

export function MapPage() {
  const [observations, setObservations] = useState<Observation[]>([])
  const [heatmap, setHeatmap] = useState<HeatmapPoint[]>([])
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [bayesian, setBayesian] = useState<BayesianResult[]>([])
  const [speciesList, setSpeciesList] = useState<Species[]>([])
  const [selectedSpecies, setSelectedSpecies] = useState('')
  const [selectedBiome, setSelectedBiome] = useState('')
  const [view, setView] = useState<ViewMode>('windy')
  const [colorMode, setColorMode] = useState<ColorMode>('status')
  const [loading, setLoading] = useState(true)
  const [allYears, setAllYears] = useState<number[]>([])
  const [yearFilter, setYearFilter] = useState(0)
  const [panelOpen, setPanelOpen] = useState(false)

  const [satelliteProduct, setSatelliteProduct] = useState<SatelliteProduct>('none')
  const [satelliteDate, setSatelliteDate] = useState(defaultSatelliteDate())
  const [satelliteOpacity, setSatelliteOpacity] = useState(0.75)
  const [windyLayer, setWindyLayer] = useState<WindyLayer>('currents')

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

  const selectedBiomeFromSpecies = useMemo(() => {
    if (!selectedSpecies) return ''
    return speciesList.find((s) => s.id === selectedSpecies)?.biome ?? ''
  }, [selectedSpecies, speciesList])

  const targetBiome = selectedBiomeFromSpecies || selectedBiome

  const yearCounts = useMemo(() => {
    const counts: Record<number, number> = {}
    observations.forEach((o) => {
      const y = parseInt(o.date.slice(0, 4))
      counts[y] = (counts[y] || 0) + 1
    })
    return counts
  }, [observations])

  const filteredObs = useMemo(() => observations.filter((o) => {
    if (selectedSpecies && o.speciesId !== selectedSpecies) return false
    if (selectedBiome && o.biome !== selectedBiome) return false
    if (yearFilter && parseInt(o.date.slice(0, 4)) !== yearFilter) return false
    return true
  }), [observations, selectedSpecies, selectedBiome, yearFilter])

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

  const visibleCount = view === 'points'
    ? filteredObs.length
    : view === 'clusters'
      ? clusters.length
      : heatPoints.length

  return (
    <div className="map-full">
      {/* Mobile overlay — closes panel on tap outside */}
      {panelOpen && (
        <div className="mp-overlay" onClick={() => setPanelOpen(false)} />
      )}

      {/* ── Left control panel ─────────────────────────────────── */}
      <div className={`mp${panelOpen ? ' open' : ''}`}>

        {/* Species filter */}
        <div className="mp-section">
          <div className="mp-label">ESPÉCIE</div>
          <select
            className="mp-select"
            value={selectedSpecies}
            onChange={(e) => setSelectedSpecies(e.target.value)}
          >
            <option value="">Todas as espécies</option>
            {speciesList.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Biome filter */}
        <div className="mp-section">
          <div className="mp-label">BIOMA</div>
          <select
            className="mp-select"
            value={selectedBiome}
            onChange={(e) => setSelectedBiome(e.target.value)}
          >
            <option value="">Todos os biomas</option>
            {biomes.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* View mode */}
        <div className="mp-section">
          <div className="mp-label">VISUALIZAÇÃO</div>
          <div className="mp-view-grid">
            {(['points', 'heatmap', 'clusters', 'windy'] as ViewMode[]).map((v) => {
              const { label, Icon } = VIEW_CONFIG[v]
              return (
                <button
                  key={v}
                  className={`mp-view-btn${view === v ? ' active' : ''}`}
                  onClick={() => setView(v)}
                >
                  <Icon size={13} strokeWidth={1.8} />
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Color mode — only for points */}
        {view === 'points' && (
          <div className="mp-section">
            <div className="mp-label">COR POR</div>
            <div className="mp-toggle">
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
          </div>
        )}

        {/* Satellite controls */}
        {view !== 'windy' && (
          <div className="mp-section">
            <div className="mp-label"><Satellite size={10} strokeWidth={1.8} /> SATÉLITE</div>
            <select
              className="mp-select"
              value={satelliteProduct}
              onChange={(e) => setSatelliteProduct(e.target.value as SatelliteProduct)}
            >
              <option value="none">Nenhuma</option>
              {Object.entries(SATELLITE_GROUPS).map(([group, products]) => (
                <optgroup key={group} label={group}>
                  {products.map((p) => (
                    <option key={p} value={p}>{SATELLITE_LABELS[p]}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {satelliteProduct !== 'none' && (
              <>
                <input
                  type="date"
                  className="mp-select"
                  style={{ marginTop: 6 }}
                  value={satelliteDate}
                  max={todayISO()}
                  onChange={(e) => setSatelliteDate(e.target.value)}
                />
                <div className="mp-opacity">
                  <span>Opac.</span>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={Math.round(satelliteOpacity * 100)}
                    onChange={(e) => setSatelliteOpacity(parseInt(e.target.value) / 100)}
                  />
                  <span>{Math.round(satelliteOpacity * 100)}%</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Windy layer selector */}
        {view === 'windy' && (
          <div className="mp-section">
            <div className="mp-label"><Waves size={10} strokeWidth={1.8} /> CAMADA OCEÂNICA</div>
            <div className="mp-windy-list">
              {(['waves', 'swell1', 'wind', 'currents', 'temp'] as WindyLayer[]).map((l) => {
                const { label, Icon } = WINDY_CONFIG[l]
                return (
                  <button
                    key={l}
                    className={`mp-windy-btn${windyLayer === l ? ' active' : ''}`}
                    onClick={() => setWindyLayer(l)}
                  >
                    <Icon size={13} strokeWidth={1.8} />
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Legend */}
        <div className="mp-section mp-legend-section">
          <div className="mp-label">LEGENDA</div>
          {view === 'heatmap' ? (
            <>
              <div className="mp-heat-bar" />
              {HEAT_LEGEND.map(({ color, label }) => (
                <div key={label} className="mp-legend-item">
                  <span className="mp-legend-dot" style={{ background: color }} />
                  <span>{label}</span>
                </div>
              ))}
            </>
          ) : view === 'clusters' ? (
            <div className="mp-legend-item">
              <span className="mp-legend-dot" style={{ background: '#06b6d4' }} />
              <span>Área de densidade</span>
            </div>
          ) : view === 'points' ? (
            legendEntries.map(([label, color]) => (
              <div key={label} className="mp-legend-item">
                <span className="mp-legend-dot" style={{ background: color }} />
                <span>{label}</span>
              </div>
            ))
          ) : null}
          {satelliteProduct !== 'none' && view !== 'windy' && (
            <div className="mp-satellite-badge">
              <Satellite size={10} strokeWidth={1.8} /> {SATELLITE_LABELS[satelliteProduct]}
            </div>
          )}
        </div>

        {/* Stats footer */}
        <div className="mp-footer">
          <span className="mp-stat-value">{visibleCount}</span>
          <span className="mp-stat-label"> registros</span>
        </div>
      </div>

      {/* ── Map area ───────────────────────────────────────────── */}
      <div className="map-area">
        {/* Toggle button — only visible on mobile */}
        <button
          className="map-panel-toggle"
          onClick={() => setPanelOpen((p) => !p)}
          aria-label="Abrir/fechar painel"
        >
          {panelOpen ? <X size={14} /> : <SlidersHorizontal size={14} />}
          {panelOpen ? 'Fechar' : 'Filtros'}
        </button>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : view === 'windy' ? (
          <WindyEmbed layer={windyLayer} lat={-14} lng={-38} zoom={5} />
        ) : (
          <>
            <MapContainer
              center={[-14, -55]}
              zoom={4}
              style={{ height: '100%', width: '100%' }}
            >
              {satelliteProduct !== 'none' ? (
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="Tiles &copy; Esri"
                  opacity={0.4}
                />
              ) : (
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; OpenStreetMap &copy; CARTO'
                />
              )}

              <SatelliteLayer
                product={satelliteProduct}
                date={satelliteDate}
                opacity={satelliteOpacity}
              />

              <MapZoomController biome={targetBiome} />

              {view === 'points' && filteredObs.map((obs) => {
                const prob = getBayesianProb(obs.speciesName, obs.region)
                const year = parseInt(obs.date.slice(0, 4))
                const isCurrentYear = yearFilter !== 0 && year === yearFilter
                return (
                  <CircleMarker
                    key={obs.id}
                    center={[obs.lat, obs.lng]}
                    radius={isCurrentYear ? 8 : 6}
                    pathOptions={{
                      fillColor: getColor(obs.speciesName),
                      color: isCurrentYear ? '#fff' : getColor(obs.speciesName),
                      weight: isCurrentYear ? 1.5 : 1,
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

              {view === 'heatmap' && <HeatLayer points={heatPoints} radius={35} blur={25} />}

              {view === 'clusters' && clusters.map((cl) => (
                <Circle
                  key={cl.id}
                  center={[cl.lat, cl.lng]}
                  radius={30000 + (cl.count / maxClusterCount) * 120000}
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
                        {cl.species.slice(0, 5).map((s) => <div key={s}>· {s}</div>)}
                        {cl.species.length > 5 && (
                          <div style={{ color: '#64748b' }}>
                            +{cl.species.length - 5} espécies
                          </div>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Circle>
              ))}
            </MapContainer>

            {/* Year timeline — floating bottom bar */}
            {allYears.length > 0 && view !== 'clusters' && (
              <div className="map-year-bar">
                <span className="year-bar-label">ANO</span>
                <div className="year-bar-items">
                  <button
                    className={`year-btn${yearFilter === 0 ? ' active' : ''}`}
                    onClick={() => setYearFilter(0)}
                  >
                    <span>Todos</span>
                    <span className="year-count">{observations.length}</span>
                  </button>
                  {allYears.map((year) => (
                    <button
                      key={year}
                      className={`year-btn${yearFilter === year ? ' active' : ''}`}
                      onClick={() => setYearFilter(year)}
                    >
                      <span>{year}</span>
                      <span className="year-count">{yearCounts[year] ?? 0}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
