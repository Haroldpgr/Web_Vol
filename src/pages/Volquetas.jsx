import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Card from '../components/Card.jsx'
import { fetchCiudades, fetchVolquetas, textoPrecio } from '../lib/api.js'
import { setSeo, siteUrl } from '../lib/seo.js'

const MIN_PRESETS = [
  { label: 'Todas', value: '' },
  { label: '7+ m³', value: '7' },
  { label: '10+ m³', value: '10' },
  { label: '14+ m³', value: '14' },
]


function Filtros({ ciudad, min, max, ciudades, onChange, onLimpiar, hayFiltros }) {
  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="filtro-ciudad" className="mb-1.5 block text-sm font-bold text-industrial">
          Ciudad base
        </label>
        <select
          id="filtro-ciudad"
          value={ciudad}
          onChange={(e) => onChange('ciudad', e.target.value)}
          className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/30"
        >
          <option value="">Todas las ciudades</option>
          {ciudades.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-bold text-industrial">
          Capacidad mínima
        </span>
        <div className="flex flex-wrap gap-2">
          {MIN_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => onChange('min', p.value)}
              aria-pressed={min === p.value}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                min === p.value
                  ? 'bg-industrial text-white shadow'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="filtro-min" className="mb-1.5 block text-sm font-bold text-industrial">
            Mín. m³
          </label>
          <input
            id="filtro-min"
            type="number"
            min="0"
            step="1"
            inputMode="decimal"
            value={min}
            onChange={(e) => onChange('min', e.target.value)}
            placeholder="0"
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <div>
          <label htmlFor="filtro-max" className="mb-1.5 block text-sm font-bold text-industrial">
            Máx. m³
          </label>
          <input
            id="filtro-max"
            type="number"
            min="0"
            step="1"
            inputMode="decimal"
            value={max}
            onChange={(e) => onChange('max', e.target.value)}
            placeholder="20"
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
        </div>
      </div>

      {hayFiltros && (
        <button
          type="button"
          onClick={onLimpiar}
          className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm font-bold text-neutral-700 transition-colors hover:bg-neutral-100"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="skeleton h-48 w-full" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="grid grid-cols-2 gap-2">
          <div className="skeleton h-12 rounded-lg" />
          <div className="skeleton h-12 rounded-lg" />
        </div>
        <div className="skeleton h-10 rounded-lg" />
      </div>
    </div>
  )
}

export default function Volquetas() {
  const [searchParams, setSearchParams] = useSearchParams()
  const ciudad = searchParams.get('ciudad') ?? ''
  const min = searchParams.get('min') ?? ''
  const max = searchParams.get('max') ?? ''
  const q = searchParams.get('q') ?? ''
  const orden = searchParams.get('orden') ?? 'destacados'

  // `key={q}` en el input lo reinicia si la URL cambia (atrás/adelante).
  const [localQ, setLocalQ] = useState(searchParams.get('q') ?? '')

  useEffect(() => {
    setSeo({
      title: 'Catálogo de volquetas en Aguazul | Volquetas Aguazul',
      description:
        'Volquetas disponibles en Aguazul, Casanare. Filtra por ciudad y capacidad de 7 a 14 m³ y cotiza por WhatsApp.',
      url: `${siteUrl()}/volquetas`,
    })
  }, [])
  useEffect(() => {
    if (localQ === q) return undefined
    const t = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (localQ.trim()) next.set('q', localQ.trim())
          else next.delete('q')
          return next
        },
        { replace: true },
      )
    }, 400)
    return () => clearTimeout(t)
  }, [localQ, q, setSearchParams])

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value !== '' && value !== undefined) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  const limpiarFiltros = () => {
    setLocalQ('')
    setSearchParams({})
  }

  const filtros = { ciudad, min, max, q, orden }

  const catalogo = useQuery({
    queryKey: ['volquetas', ciudad, min, max, q, orden],
    queryFn: () => fetchVolquetas(filtros),
    placeholderData: keepPreviousData,
  })

  const ciudadesQuery = useQuery({
    queryKey: ['volquetas-ciudades'],
    queryFn: fetchCiudades,
    staleTime: 5 * 60_1000,
  })

  const ciudades =
    ciudadesQuery.data?.data ??
    [...new Set((catalogo.data?.data ?? []).map((v) => v.ciudad_base).filter(Boolean))]

  const hayFiltros = Boolean(ciudad || min || max || q)
  const total = catalogo.data?.total ?? 0
  const items = catalogo.data?.data ?? []
  const firmaFiltros = [ciudad, min, max, q, orden].join('|')

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Hero */}
      <header className="relative overflow-hidden bg-carbon-900 text-white">
        <div aria-hidden="true" className="dots-grid pointer-events-none absolute inset-0 opacity-50" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-brand-dark/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-10 md:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-light">
            Catálogo
          </p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight md:text-4xl">
            Volquetas disponibles en Colombia
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-300">
            Filtra por ciudad y capacidad de la tolva. La disponibilidad se actualiza
            con la flota real del operador.
          </p>
          <div className="mt-6 max-w-xl">
            <div className="flex items-center gap-1 rounded-2xl bg-white p-2 shadow-xl transition-shadow focus-within:shadow-2xl focus-within:ring-2 focus-within:ring-brand">
              <svg
                className="ml-2 h-5 w-5 shrink-0 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M10 18a8 8 0 110-16 8 8 0 010 16z"
                />
              </svg>
              <input
                type="search"
                key={q}
                value={localQ}
                onChange={(e) => setLocalQ(e.target.value)}
                placeholder="Busca por nombre, modelo o material…"
                aria-label="Buscar volquetas"
                className="w-full bg-transparent px-2 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
              />
              {localQ && (
                <button
                  type="button"
                  onClick={() => setLocalQ('')}
                  aria-label="Limpiar búsqueda"
                  className="shrink-0 rounded-lg px-2 py-1 text-lg leading-none text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="h-1.5 bg-gradient-to-r from-brand via-brand-light to-brand" />
      </header>

      <div className="mx-auto max-w-6xl gap-6 px-4 py-6 md:py-8 lg:grid lg:grid-cols-[280px_1fr]">
        {/* Filtros móvil */}
        <details className="mb-4 rounded-2xl border border-neutral-200 bg-white shadow-sm lg:hidden">
          <summary className="cursor-pointer list-none px-5 py-4 text-sm font-bold text-industrial">
            Filtros {hayFiltros ? '(activos)' : ''}
            <span className="float-right text-brand">▼</span>
          </summary>
          <div className="border-t border-neutral-100 px-5 py-4">
            <Filtros
              ciudad={ciudad}
              min={min}
              max={max}
              ciudades={ciudades}
              onChange={updateParam}
              onLimpiar={limpiarFiltros}
              hayFiltros={hayFiltros}
            />
          </div>
        </details>

        {/* Filtros escritorio */}
        <aside className="hidden lg:block">
          <div className="sticky top-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-extrabold text-industrial">Filtros</h2>
            <p className="mb-4 mt-1 text-xs text-neutral-500">
              Se aplican al instante, sin recargar.
            </p>
            <Filtros
              ciudad={ciudad}
              min={min}
              max={max}
              ciudades={ciudades}
              onChange={updateParam}
              onLimpiar={limpiarFiltros}
              hayFiltros={hayFiltros}
            />
          </div>
        </aside>

        {/* Resultados */}
        <section aria-live="polite">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-600">
              {catalogo.isLoading ? (
                'Cargando catálogo…'
              ) : catalogo.isError ? (
                'No pudimos cargar el catálogo'
              ) : (
                <>
                  <strong className="text-industrial">{total}</strong>{' '}
                  {total === 1 ? 'volqueta encontrada' : 'volquetas encontradas'}
                  {catalogo.isFetching && (
                    <span className="ml-2 inline-block h-2 w-2 animate-pulse rounded-full bg-brand" />
                  )}
                </>
              )}
            </p>
            <label className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
              Orden
              <select
                value={orden}
                onChange={(e) => updateParam('orden', e.target.value === 'destacados' ? '' : e.target.value)}
                className="rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-xs font-bold text-industrial outline-none focus:border-brand"
              >
                <option value="destacados">Destacadas primero</option>
                <option value="recientes">Más recientes</option>
              </select>
            </label>
          </div>

          {catalogo.isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : catalogo.isError ? (
            <div className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <svg
                  className="h-7 w-7 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"
                  />
                </svg>
              </div>
              <h2 className="mt-4 text-lg font-extrabold text-industrial">
                Algo salió mal
              </h2>
              <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-600">
                No pudimos cargar las volquetas. Revisa tu conexión e inténtalo de nuevo.
              </p>
              <button
                type="button"
                onClick={() => catalogo.refetch()}
                className="mt-5 rounded-xl bg-industrial px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-black"
              >
                Reintentar
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="animate-fade-up rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center shadow-sm md:p-14">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
                <svg
                  className="h-9 w-9 text-brand"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M1 8h13v9H1zM14 11h4l3 3v3h-7zM5.5 20a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm12 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                  />
                </svg>
              </div>
              <h2 className="mt-5 text-lg font-extrabold text-industrial">
                Sin resultados
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-600">
                No encontramos volquetas con esos criterios, intenta ajustar el rango de
                capacidad m³ o ciudad.
              </p>
              <button
                type="button"
                onClick={limpiarFiltros}
                className="mt-6 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow transition-all hover:bg-brand-dark"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div
              key={firmaFiltros}
              className={`grid gap-5 sm:grid-cols-2 xl:grid-cols-3 ${
                catalogo.isFetching ? 'opacity-60' : ''
              } transition-opacity`}
            >
              {items.map((v, i) => (
                <div
                  key={v.slug}
                  className="animate-fade-up"
                  style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
                >
                  <Card
                    volqueta={{
                      titulo: v.titulo,
                      foto: v.foto_portada,
                      capacidadM3: v.capacidad_m3,
                      capacidadToneladas: v.capacidad_toneladas,
                      ciudadBase: v.departamento_base
                        ? `${v.ciudad_base}, ${v.departamento_base}`
                        : (v.ciudad_base ?? 'Colombia'),
                      estado: v.estado,
                      precio: (() => { const p = textoPrecio(v); return p ? `${p.linea} / viaje` : null })(),
                      slug: v.slug,
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
