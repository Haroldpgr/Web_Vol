import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'

const iconoPatio = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export function googleMapsDirUrl(latitud, longitud) {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitud},${longitud}`
}

export default function MapPatio({ latitud, longitud, titulo }) {
  const posicion = [latitud, longitud]
  return (
    <div>
      <MapContainer
        center={posicion}
        zoom={15}
        scrollWheelZoom={false}
        className="z-0 h-64 w-full rounded-2xl border border-neutral-200 md:h-80"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={posicion} icon={iconoPatio}>
          <Popup>Patio base — {titulo}</Popup>
        </Marker>
      </MapContainer>
      <a
        href={googleMapsDirUrl(latitud, longitud)}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-bold text-industrial shadow-sm transition-all hover:-translate-y-0.5 hover:shadow"
      >
        <svg
          className="h-4 w-4 text-brand"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 20l-5.5-2.5v-13L9 7l6-2.5L20.5 7v13L15 17.5 9 20zm0 0v-13m6 10.5v-13"
          />
        </svg>
        Cómo llegar al patio
      </a>
    </div>
  )
}
