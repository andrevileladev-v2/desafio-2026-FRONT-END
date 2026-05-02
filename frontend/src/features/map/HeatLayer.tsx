import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'

interface HeatPoint {
  lat: number
  lng: number
  intensity?: number
}

interface Props {
  points: HeatPoint[]
  radius?: number
  blur?: number
  maxZoom?: number
  gradient?: Record<string, string>
}

declare module 'leaflet' {
  function heatLayer(
    latlngs: Array<[number, number, number?]>,
    options?: {
      minOpacity?: number
      maxZoom?: number
      max?: number
      radius?: number
      blur?: number
      gradient?: Record<string, string>
    },
  ): L.Layer
}

export function HeatLayer({ points, radius = 30, blur = 20, maxZoom = 18, gradient }: Props) {
  const map = useMap()
  const layerRef = useRef<L.Layer | null>(null)

  const defaultGradient = {
    0.0: '#0a0e1a',
    0.2: '#0c4a6e',
    0.4: '#06b6d4',
    0.6: '#84cc16',
    0.75: '#f59e0b',
    0.9: '#ef4444',
    1.0: '#dc2626',
  }

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current)
    }

    if (points.length === 0) return

    const latlngs: Array<[number, number, number]> = points.map((p) => [
      p.lat,
      p.lng,
      p.intensity ?? 1,
    ])

    const layer = L.heatLayer(latlngs, {
      radius,
      blur,
      maxZoom,
      minOpacity: 0.4,
      gradient: gradient ?? defaultGradient,
    })

    layer.addTo(map)
    layerRef.current = layer

    return () => {
      map.removeLayer(layer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, radius, blur, maxZoom, map])

  return null
}
