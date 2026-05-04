import { WMSTileLayer } from 'react-leaflet'

export type SatelliteProduct =
  | 'none'
  | 'sst'            // SST diária — GHRSST MUR (NASA)
  | 'sst_anomaly'    // Anomalia de temperatura (NASA)
  | 'chlorophyll'    // Clorofila-a — Sentinel-3 OLCI (NASA GIBS)
  | 'truecolor'      // Cor real — MODIS Terra (NASA)
  | 'truecolor_aqua' // Cor real — MODIS Aqua (NASA)
  | 'sh_truecolor'   // Cor real — Sentinel-2 L1C (Sentinel Hub)
  | 'sh_falsecolor'  // Falsa cor — Sentinel-2 (Sentinel Hub)
  | 'sh_ndwi'        // Índice de água — Sentinel-2 (Sentinel Hub)
  | 'sh_moisture'    // Índice de umidade — Sentinel-2 (Sentinel Hub)

const SH_ID = import.meta.env.VITE_SENTINEL_HUB_INSTANCE_ID as string | undefined
const SH_BASE = SH_ID ? `https://services.sentinel-hub.com/ogc/wms/${SH_ID}` : null

// NASA GIBS WMS — gratuito, sem chave, nomes verificados via GetCapabilities
const GIBS_WMS = 'https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi'

const GIBS_CONFIG: Partial<Record<SatelliteProduct, { layer: string; format: string; transparent: boolean }>> = {
  sst: {
    layer: 'GHRSST_L4_MUR_Sea_Surface_Temperature',
    format: 'image/png',
    transparent: true,
  },
  sst_anomaly: {
    layer: 'GHRSST_L4_MUR_Sea_Surface_Temperature_Anomalies',
    format: 'image/png',
    transparent: true,
  },
  chlorophyll: {
    // Sentinel-3 OLCI via NASA GIBS — disponível sem conta Sentinel Hub
    layer: 'S3A_OLCI_Chlorophyll_a',
    format: 'image/png',
    transparent: true,
  },
  truecolor: {
    layer: 'MODIS_Terra_CorrectedReflectance_TrueColor',
    format: 'image/jpeg',
    transparent: false,
  },
  truecolor_aqua: {
    layer: 'MODIS_Aqua_CorrectedReflectance_TrueColor',
    format: 'image/jpeg',
    transparent: false,
  },
}

// Sentinel Hub — nomes reais verificados via GetCapabilities da conta do usuário
const SH_CONFIG: Partial<Record<SatelliteProduct, string>> = {
  sh_truecolor:  '1_TRUE-COLOR-L1C',
  sh_falsecolor: '2_FALSE-COLOR-L1C',
  sh_ndwi:       '7_NDWI-L1C',
  sh_moisture:   '5_MOISTURE-INDEX-L1C',
}

export const SATELLITE_LABELS: Record<SatelliteProduct, string> = {
  none:           'Nenhuma',
  sst:            '🌡 Temperatura Superficial (SST)',
  sst_anomaly:    '🌡 Anomalia de Temperatura',
  chlorophyll:    '🟢 Clorofila-a (Sentinel-3)',
  truecolor:      '🌍 Cor Real (MODIS Terra)',
  truecolor_aqua: '🌍 Cor Real (MODIS Aqua)',
  sh_truecolor:   '🛰 Cor Real (Sentinel-2)',
  sh_falsecolor:  '🔵 Falsa Cor (Sentinel-2)',
  sh_ndwi:        '💧 Índice de Água NDWI',
  sh_moisture:    '💦 Índice de Umidade',
}

export const SATELLITE_GROUPS = {
  'NASA GIBS — gratuito, escala global': [
    'sst', 'sst_anomaly', 'chlorophyll', 'truecolor', 'truecolor_aqua',
  ] as SatelliteProduct[],
  'Sentinel Hub — alta resolução (zoom ≥ 10)': [
    'sh_truecolor', 'sh_falsecolor', 'sh_ndwi', 'sh_moisture',
  ] as SatelliteProduct[],
}

interface Props {
  product: SatelliteProduct
  date: string
  opacity?: number
}

export function SatelliteLayer({ product, date, opacity = 0.75 }: Props) {
  if (product === 'none') return null

  // NASA GIBS via WMS — funciona em qualquer zoom, sem chave
  const gibs = GIBS_CONFIG[product]
  if (gibs) {
    return (
      <WMSTileLayer
        key={`${product}-${date}`}
        url={GIBS_WMS}
        layers={gibs.layer}
        format={gibs.format}
        transparent={gibs.transparent}
        version="1.1.1"
        // @ts-expect-error TIME é param WMS válido
        TIME={date}
        opacity={opacity}
        tileSize={256}
        attribution='<a href="https://earthdata.nasa.gov">NASA GIBS</a>'
      />
    )
  }

  // Sentinel Hub WMS — requer zoom alto (Sentinel-2 tem limite de resolução no free tier)
  const shLayer = SH_CONFIG[product]
  if (shLayer) {
    if (!SH_BASE) {
      console.warn('[SatelliteLayer] VITE_SENTINEL_HUB_INSTANCE_ID não definido — reinicie o servidor após criar .env.local')
      return null
    }
    return (
      <WMSTileLayer
        key={`${product}-${date}`}
        url={SH_BASE}
        layers={shLayer}
        format="image/png"
        transparent
        version="1.3.0"
        // @ts-expect-error TIME é param WMS válido
        TIME={date}
        opacity={opacity}
        tileSize={256}
        minZoom={10}
        attribution='<a href="https://sentinel-hub.com">Copernicus / Sentinel Hub</a>'
      />
    )
  }

  return null
}
