import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { useEffect, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'

const icono = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const AGUAZUL = [5.1725, -72.5556]

export function extraerCoords(texto) {
  if (!texto || typeof texto !== 'string') return null
  const enRango = (lat, lng) =>
    Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
      ? { latitud: lat, longitud: lng }
      : null

  let m = texto.match(/@(-?\d{1,3}\.\d+),\s*(-?\d{1,3}\.\d+)/)
  if (m && enRango(+m[1], +m[2])) return enRango(+m[1], +m[2])

  m = texto.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
  if (m && enRango(+m[1], +m[2])) return enRango(+m[1], +m[2])

  m = texto.match(/[?&](?:q|query|destination)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/)
  if (m && enRango(+m[1], +m[2])) return enRango(+m[1], +m[2])

  m = texto.match(/(-?\d{1,3}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/)
  if (m && enRango(+m[1], +m[2])) return enRango(+m[1], +m[2])

  return null
}

function ClicParaFijar({ onFijar }) {
  useMapEvents({
    click(e) {
      onFijar(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function Centrar({ clave }) {
  const map = useMap()
  useEffect(() => {
    if (!clave) return
    const [lat, lng] = clave.split(',').map(Number)
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      map.setView([lat, lng], Math.max(map.getZoom(), 14))
    }
  }, [clave, map])
  return null
}

// Selector de ubicación del patio: mapa clicable/arrastrable + pegar enlace.
export default function LocationPicker({ latitud, longitud, onChange }) {
  const [texto, setTexto] = useState('')
  const [aviso, setAviso] = useState('')
  const pos = latitud != null && longitud != null ? [latitud, longitud] : null
  const clave = pos ? `${pos[0]},${pos[1]}` : ''

  const fijar = (lat, lng) => {
    onChange({ latitud: Number(lat.toFixed(6)), longitud: Number(lng.toFixed(6)) })
    setAviso('')
  }

  const pegar = () => {
    const coords = extraerCoords(texto)
    if (!coords) {
      setAviso('No encontramos coordenadas en ese texto. Pega el enlace de Google Maps o algo como “5.1725, -72.5556”.')
      return
    }
    fijar(coords.latitud, coords.longitud)
    setTexto('')
  }

  return (
    <div>
      <MapContainer
        center={pos ?? AGUAZUL}
        zoom={pos ? 15 : 13}
        scrollWheelZoom={false}
        className="z-0 h-64 w-full rounded-2xl border border-neutral-200"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClicParaFijar onFijar={fijar} />
        <Centrar clave={clave} />
        {pos && (
          <Marker
            position={pos}
            icon={icono}
            draggable
            eventHandlers={{
              dragend(e) {
                const p = e.target.getLatLng()
                fijar(p.lat, p.lng)
              },
            }}
          />
        )}
      </MapContainer>
      <p className="mt-2 text-xs text-neutral-500">
        Haz clic en el mapa o arrastra el pin para fijar el patio.
      </p>

      <label htmlFor="patio-enlace" className="mb-1.5 mt-4 block text-sm font-bold text-industrial">
        Pega aquí el enlace de Google Maps del patio
      </label>
      <div className="flex gap-2">
        <input
          id="patio-enlace"
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Enlace de Google Maps o coords 5.1725, -72.5556"
          className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/30"
        />
        <button
          type="button"
          onClick={pegar}
          className="shrink-0 rounded-xl bg-industrial px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-black"
        >
          Ubicar
        </button>
      </div>
      {aviso && <p className="mt-1.5 text-xs font-semibold text-red-600">{aviso}</p>}
      {pos ? (
        <p className="mt-2 text-xs text-neutral-600">
          Ubicación fijada: <strong>{pos[0]}, {pos[1]}</strong>{' '}
          <button
            type="button"
            onClick={() => onChange({ latitud: null, longitud: null })}
            className="ml-1 font-semibold text-red-600 underline"
          >
            Quitar
          </button>
        </p>
      ) : (
        <p className="mt-2 text-xs text-neutral-500">Sin ubicación: la ficha ocultará el mapa.</p>
      )}
    </div>
  )
}
