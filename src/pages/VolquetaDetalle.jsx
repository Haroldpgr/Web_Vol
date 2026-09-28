import { useQuery } from '@tanstack/react-query'
import { Suspense, lazy, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import Badge from '../components/Badge.jsx'
import Card from '../components/Card.jsx'
import Gallery from '../components/Gallery.jsx'
import QuoteForm from '../components/QuoteForm.jsx'
import Reveal from '../components/Reveal.jsx'
import { fetchConfiguracion, fetchVolquetas, fetchVolqueta, textoPrecio } from '../lib/api.js'
import { removeJsonLd, schemaFichaVolqueta, setJsonLd, setSeo, siteUrl } from '../lib/seo.js'

const MapPatio = lazy(() => import('../components/MapPatio.jsx'))

const WHATSAPP_FALLBACK = '573001234567'

function WhatsAppIcon({ className = 'h-6 w-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.3-.4 0-.5.1-.7l.5-.6c.1-.2.1-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.2-.7.6-.9 2 .3 4.7 2.7 6.4a8.8 8.8 0 005.4 2.2c.8.1 1.5-.1 2-.3.6-.3 1.5-.9 1.7-1.7.1-.4.1-.9 0-1l-.7-.3z" />
    </svg>
  )
}

export default function VolquetaDetalle() {
  const { slug } = useParams()

  const ficha = useQuery({
    queryKey: ['volqueta', slug],
    queryFn: () => fetchVolqueta(slug),
    retry: (intentos, error) => (error.status === 404 ? false : intentos < 1),
  })
  const config = useQuery({
    queryKey: ['configuracion'],
    queryFn: fetchConfiguracion,
    staleTime: 5 * 60 * 1000,
  })
  const relacionadas = useQuery({
    queryKey: ['volquetas-relacionadas', slug],
    queryFn: () => fetchVolquetas({}),
    staleTime: 60 * 1000,
  })

  const v = ficha.data?.data

  useEffect(() => {
    if (!v) return undefined
    const portada =
      v.fotos?.find((f) => f.es_portada)?.url_imagen ?? v.fotos?.[0]?.url_imagen ?? ''
    const url = `${siteUrl()}/volquetas/${v.slug}`
    setSeo({
      title: `${v.titulo} | Volquetas Aguazul`,
      description: (v.descripcion || `${v.titulo}: ${v.capacidad_m3} m³ en ${v.ciudad_base}.`).slice(0, 160),
      image: portada,
      url,
      type: 'article',
    })
    setJsonLd(
      'ficha-volqueta',
      schemaFichaVolqueta({
        volqueta: v,
        foto: portada,
        telefono: config.data?.data?.whatsapp ?? null,
        url,
      }),
    )
    return () => {
      removeJsonLd('ficha-volqueta')
    }
  }, [v, config.data])

  if (ficha.isLoading) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse px-4 py-8">
        <div className="skeleton h-6 w-48 rounded" />
        <div className="skeleton mt-4 aspect-video w-full rounded-2xl" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            <div className="skeleton h-8 w-2/3 rounded" />
            <div className="skeleton h-4 w-1/3 rounded" />
            <div className="skeleton h-24 w-full rounded-xl" />
          </div>
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (ficha.isError) {
    const es404 = ficha.error?.status === 404
    return (
      <div className="mx-auto max-w-2xl px-4 py-14 text-center">
        <div className="animate-fade-up rounded-2xl border border-neutral-200 bg-white p-10 shadow-sm">
          <p className="text-5xl font-extrabold text-industrial">{es404 ? '404' : 'Error'}</p>
          <h1 className="mt-3 text-xl font-extrabold text-industrial">
            {es404 ? 'Esta volqueta no existe' : 'No pudimos cargar la ficha'}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-600">
            {es404
              ? 'El enlace puede estar desactualizado o la volqueta ya no hace parte de la flota.'
              : 'Revisa tu conexión e inténtalo de nuevo.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {es404 ? (
              <Link
                to="/volquetas"
                className="rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow transition-colors hover:bg-brand-dark"
              >
                Volver al catálogo
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => ficha.refetch()}
                className="rounded-xl bg-industrial px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-black"
              >
                Reintentar
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const numero = ((v.contacto_whatsapp || config.data?.data?.whatsapp) ?? WHATSAPP_FALLBACK).replace(/\D/g, '')
  const encargado = v.contacto_nombre || ''
  const textoWa = `Hola${encargado ? ` ${encargado}` : ''}, necesito cotizar un servicio de transporte con la volqueta: ${v.titulo}`
  const waUrl = `https://wa.me/${numero}?text=${encodeURIComponent(textoWa)}`
  const tieneGps = Number.isFinite(v.latitud) && Number.isFinite(v.longitud)
  const materiales =
    v.caracteristicas
      .find((c) => c.nombre.toLowerCase() === 'materiales aptos')
      ?.valor.split(',')
      .map((m) => m.trim())
      .filter(Boolean) ?? []
  const precio = textoPrecio(v)

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        {/* Miga de pan */}
        <nav aria-label="Miga de pan" className="animate-fade-up text-xs text-neutral-500">
          <Link to="/volquetas" className="font-semibold text-brand hover:underline">
            Volquetas
          </Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-700">{v.titulo}</span>
        </nav>

        {/* 1. Galería */}
        <div className="animate-fade-up mt-4" style={{ animationDelay: '60ms' }}>
          <Gallery
            images={(v.fotos ?? []).map((f, i) => ({
              url: f.url_imagen,
              alt: `Foto ${i + 1} de ${v.titulo}`,
            }))}
          />
        </div>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
          <div className="animate-fade-up space-y-6" style={{ animationDelay: '120ms' }}>
            {/* 2. Título, capacidades, placa/modelo, estado */}
            <div>
              <Badge estado={v.estado} />
              <h1 className="mt-2 text-2xl font-extrabold leading-tight text-industrial md:text-3xl">
                {v.titulo}
              </h1>
              <p className="mt-1 text-sm text-neutral-600">
                {v.ciudad_base}
                {v.departamento_base ? `, ${v.departamento_base}` : ''}
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { k: 'Tolva', v: v.capacidad_m3 != null ? `${v.capacidad_m3} m³` : '—' },
                  { k: 'Carga', v: v.capacidad_toneladas != null ? `${v.capacidad_toneladas} t` : '—' },
                  { k: 'Placa', v: v.placa ?? '—' },
                  { k: 'Modelo', v: v.modelo_vehiculo ?? '—' },
                ].map((d) => (
                  <div key={d.k} className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
                    <dt className="text-xs text-neutral-500">{d.k}</dt>
                    <dd className="mt-0.5 truncate text-sm font-extrabold text-industrial" title={d.v}>
                      {d.v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* 4. Descripción + materiales */}
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
              <h2 className="text-lg font-extrabold text-industrial">Descripción</h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                {v.descripcion || 'Sin descripción por ahora.'}
              </p>
              {materiales.length > 0 && (
                <>
                  <h3 className="mt-5 text-sm font-extrabold text-industrial">
                    Materiales aptos
                  </h3>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {materiales.map((m) => (
                      <li
                        key={m}
                        className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-dark"
                      >
                        {m}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {v.caracteristicas.length > 0 && (
                <dl className="mt-5 divide-y divide-neutral-100 border-t border-neutral-100 text-sm">
                  {v.caracteristicas.map((c) => (
                    <div key={c.id} className="flex justify-between gap-4 py-2">
                      <dt className="text-neutral-500">{c.nombre}</dt>
                      <dd className="text-right font-semibold text-industrial">{c.valor}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>

            {/* 5 + 6. Mapa + cómo llegar */}
            {tieneGps && (
              <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
                <h2 className="text-lg font-extrabold text-industrial">Ubicación base</h2>
                <p className="mb-3 mt-1 text-sm text-neutral-600">
                  {v.ciudad_base}, {v.departamento_base}
                </p>
                <Suspense fallback={<div className="skeleton h-64 w-full rounded-2xl md:h-80" />}>
                  <MapPatio latitud={v.latitud} longitud={v.longitud} titulo={v.titulo} />
                </Suspense>
              </section>
            )}

            {/* 7. Formulario secundario */}
            <section
              id="cotizar-escrito"
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6"
            >
              <h2 className="text-lg font-extrabold text-industrial">Cotización escrita</h2>
              <p className="mb-4 mt-1 text-sm text-neutral-600">
                Canal alternativo. Para respuesta inmediata usa el botón de WhatsApp.
              </p>
              <QuoteForm
                volquetaId={v.id}
                tituloVolqueta={v.titulo}
                whatsappUrl={waUrl}
              />
            </section>
          </div>

          {/* 3. Tarjeta de contacto: WhatsApp prioritario */}
          <aside
            className="animate-fade-up lg:sticky lg:top-4"
            style={{ animationDelay: '180ms' }}
          >
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-lg md:p-6">
              {precio && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Precio por viaje
                  </p>
                  <p className="mt-1 text-3xl font-extrabold text-industrial">{precio.rango}</p>
                  <p className="text-xs text-neutral-500">{v.moneda} · según distancia y material</p>
                  <p className="mt-3 rounded-xl bg-brand-50 px-3 py-2 text-xs leading-relaxed text-brand-dark">
                    {precio.nota}
                  </p>
                </>
              )}
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-6 py-4 text-lg font-extrabold text-white shadow-lg shadow-green-600/25 transition-all hover:-translate-y-0.5 hover:bg-[#1DA851] hover:shadow-xl"
              >
                <WhatsAppIcon />
                Cotizar por WhatsApp
              </a>
              <p className="mt-2 text-center text-xs text-neutral-500">
                {encargado ? `Habla directo con ${encargado}` : 'Respuesta directa del operador en Aguazul'}
              </p>
              <div className="mt-4 border-t border-neutral-100 pt-4 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-neutral-500">Estado</span>
                  <Badge estado={v.estado} />
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-500">Base</span>
                  <span className="font-semibold text-industrial">
                    {v.ciudad_base} · {v.departamento_base}
                  </span>
                </div>
                {encargado && (
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-500">Encargado</span>
                    <span className="font-semibold text-industrial">{encargado}</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-neutral-500">Fotos</span>
                  <span className="font-semibold text-industrial">{v.fotos?.length ?? 0}</span>
                </div>
              </div>
              <a
                href="#cotizar-escrito"
                className="mt-4 block text-center text-xs font-semibold text-neutral-500 underline hover:text-industrial"
              >
                Prefiero dejar una solicitud escrita
              </a>
            </div>
          </aside>
        </div>

        {/* Relacionadas */}
        {(() => {
          const otras = ((relacionadas.data?.data ?? []).filter((r) => r.slug !== v.slug)).slice(0, 3)
          if (otras.length === 0) return null
          return (
            <section className="mt-10">
              <Reveal>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <h2 className="text-xl font-extrabold text-industrial md:text-2xl">
                    Te puede interesar
                  </h2>
                  <Link to="/volquetas" className="text-sm font-bold text-brand-dark hover:underline">
                    Ver todas →
                  </Link>
                </div>
              </Reveal>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {otras.map((r, i) => (
                  <Reveal key={r.slug} delay={i * 90}>
                    <Card
                      volqueta={{
                        titulo: r.titulo,
                        foto: r.foto_portada,
                        capacidadM3: r.capacidad_m3,
                        capacidadToneladas: r.capacidad_toneladas,
                        ciudadBase: r.departamento_base ? `${r.ciudad_base}, ${r.departamento_base}` : (r.ciudad_base ?? ''),
                        estado: r.estado,
                        precio: r.precio_estimado_viaje != null ? `$${Number(r.precio_estimado_viaje).toLocaleString('es-CO')} / viaje est.` : null,
                        slug: r.slug,
                      }}
                    />
                  </Reveal>
                ))}
              </div>
            </section>
          )
        })()}
      </div>
    </div>
  )
}
