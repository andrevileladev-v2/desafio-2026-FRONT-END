// Windy.com embed — visualização animada de ondas, vento e correntes oceânicas
// Documentação: https://api.windy.com/embed

interface Props {
  lat?: number
  lng?: number
  zoom?: number
  layer?: 'waves' | 'wind' | 'temp' | 'currents' | 'swell1'
}

export function WindyEmbed({ lat = -14, lng = -38, zoom = 5, layer = 'waves' }: Props) {
  const src =
    `https://embed.windy.com/embed2.html` +
    `?lat=${lat}&lon=${lng}&detailLat=${lat}&detailLon=${lng}` +
    `&width=100%&height=100%&zoom=${zoom}` +
    `&level=surface&overlay=${layer}&product=ecmwf` +
    `&menu=&message=&marker=&calendar=now&pressure=&type=map` +
    `&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`

  return (
    <iframe
      title="Windy — Ondas e Correntes"
      src={src}
      style={{ width: '100%', height: '100%', border: 'none', borderRadius: 12 }}
      allowFullScreen
    />
  )
}
