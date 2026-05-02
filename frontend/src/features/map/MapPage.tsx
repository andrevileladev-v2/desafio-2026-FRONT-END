import { useEffect, useState, useRef } from 'react'
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
  const [view, setView] = useState<'points' | 'heatmap'>('points')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      analyticsApi.getObservations(),
      analyticsApi.getHeatmap(),
      speciesApi.getAll(),
    ]).then(([obs, hm, sp]) => {
      setObservations(obs)
      setHeatmap(hm)
      setSpeciesList(sp)
      setLoading(false)
    })
  }, [])

  const filteredObs = selectedSpecies
    ? observations.filter((o) => o.speciesId === selectedSpecies)
    : observations

  const filteredHeatmap = selectedSpecies
    ? heatmap.filter((h) => {
      const sp = speciesList.find((s) => s.id === selectedSpecies)
      return sp ? h.speciesName === sp.name : true
    })
    : heatmap

  const activePoints = view === 'points' ? filteredObs : filteredHeatmap

  const speciesStatusMap = Object.fromEntries(speciesList.map((s) => [s.name, s.status]))

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
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <div className="view-toggle">
          <button
            className={view === 'points' ? 'active' : ''}
            onClick={() => setView('points')}
          >
            Pontos
          </button>
          <button
            className={view === 'heatmap' ? 'active' : ''}
            onClick={() => setView('heatmap')}
          >
            Calor
          </button>
        </div>

        <div className="map-stats">
          <span>{activePoints.length} registros visíveis</span>
        </div>
      </div>

      <div className="map-wrap">
        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
          </div>
        ) : (
          <MapContainer
            center={[-14, -55]}
            zoom={4}
            style={{ height: '100%', width: '100%', borderRadius: 12 }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <FitBounds points={heatmap} />

            {view === 'points' &&
              filteredObs.map((obs) => {
                const status = speciesStatusMap[obs.speciesName] ?? 'Least Concern'
                const color = STATUS_COLOR[status] ?? '#06b6d4'
                return (
                  <CircleMarker
                    key={obs.id}
                    center={[obs.lat, obs.lng]}
                    radius={6}
                    pathOptions={{
                      fillColor: color,
                      color: color,
                      weight: 1,
                      opacity: 0.9,
                      fillOpacity: 0.7,
                    }}
                  >
                    <Popup className="map-popup">
                      <div className="popup-content">
                        <strong>{obs.speciesName}</strong>
                        <div>{obs.date}</div>
                        <div>{obs.region}</div>
                        <div>{obs.biome}</div>
                        {obs.notes && <em>{obs.notes}</em>}
                      </div>
                    </Popup>
                  </CircleMarker>
                )
              })}

            {view === 'heatmap' &&
              filteredHeatmap.map((pt, i) => {
                const status = speciesStatusMap[pt.speciesName] ?? 'Least Concern'
                const color = STATUS_COLOR[status] ?? '#06b6d4'
                return (
                  <CircleMarker
                    key={i}
                    center={[pt.lat, pt.lng]}
                    radius={10}
                    pathOptions={{
                      fillColor: color,
                      color: 'transparent',
                      fillOpacity: 0.35,
                    }}
                  >
                    <Popup>
                      <div className="popup-content">
                        <strong>{pt.speciesName}</strong>
                      </div>
                    </Popup>
                  </CircleMarker>
                )
              })}
          </MapContainer>
        )}
      </div>

      <div className="map-legend">
        {Object.entries(STATUS_COLOR).map(([status, color]) => (
          <div key={status} className="legend-item">
            <span className="legend-dot" style={{ background: color }} />
            <span>{status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
