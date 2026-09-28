import { useQuery } from '@tanstack/react-query'
import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import Cinta from '../components/Cinta.jsx'
import Opiniones from '../components/Opiniones.jsx'
import Reveal from '../components/Reveal.jsx'
import { API_URL, fetchConfiguracion, fetchVolquetas, textoPrecio } from '../lib/api.js'
import { setSeo, siteUrl } from '../lib/seo.js'

const MapPatio = lazy(() => import('../components/MapPatio.jsx'))

function CountUp({ hasta, sufijo = '' }) {
  const ref = useRef(null)
  const [n, setN] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    let raf = 0
    let iniciado = false
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !iniciado) {
          iniciado = true
          const t0 = performance.now()
          const dur = 1200
          const tick = (t) => {
            const p = Math.min(1, (t - t0) / dur)
            setN(Math.round(hasta * (1 - Math.pow(1 - p, 3))))
            if (p < 1) raf = requestAnimationFrame(tick)
          }
          raf = requestAnimationFrame(tick)
          obs.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    obs.observe(el)
    return () => {
      obs.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [hasta])

  return (
    <span ref={ref}>
      {n}
      {sufijo}
    </span>
  )
}

const MATERIALES = [
  { nombre: 'Arena de río', desc: 'Lavada y zarandeada del Cusiana.' },
  { nombre: 'Gravilla', desc: 'Para concretos y filtros.' },
  { nombre: 'Triturado', desc: 'Vías y bases compactadas.' },
  { nombre: 'Recebo', desc: 'Rellenos y nivelaciones.' },
  { nombre: 'Balastro', desc: 'Afirmado de vías veredales.' },
  { nombre: 'Escombros', desc: 'Retiro y disposición.' },
]

const PASOS = [
  { n: '1', titulo: 'Elige tu volqueta', desc: 'Por capacidad de tolva: 7, 10 o 14 m³ según tu obra.' },
  { n: '2', titulo: 'Cotiza por WhatsApp', desc: 'Respuesta directa del operador, sin intermediarios.' },
  { n: '3', titulo: 'Recibe el material', desc: 'Despacho desde el patio base en Aguazul.' },
]

const FAQS = [
  { q: '¿Atienden fuera de Aguazul?', a: 'Sí. La base está en Aguazul y cubrimos Yopal, Maní, Tauramena y veredas cercanas. El flete se cotiza según destino.' },
  { q: '¿Cómo se cobra el viaje?', a: 'Por viaje según capacidad y distancia. El precio que ves en cada ficha es un estimado; el valor final se confirma por WhatsApp.' },
  { q: '¿Qué capacidad necesito?', a: 'Obras pequeñas: 7 m³. Placas y vías: 10–14 m³. Si dudas, escríbenos y te asesoramos sin costo.' },
  { q: '¿Retiran escombros?', a: 'Sí, con la sencilla de 7 m³ entramos a calles estrechas para el retiro.' },
  { q: '¿Cómo pago?', a: 'Nequi, transferencia o efectivo contra entrega. Factura disponible para empresas.' },
]

function aCard(v) {
  return {
    titulo: v.titulo,
    foto: v.foto_portada,
    capacidadM3: v.capacidad_m3,
    capacidadToneladas: v.capacidad_toneladas,
    ciudadBase: v.departamento_base ? `${v.ciudad_base}, ${v.departamento_base}` : (v.ciudad_base ?? ''),
    estado: v.estado,
    precio: (() => { const p = textoPrecio(v); return p ? `${p.linea} / viaje` : null })(),
    slug: v.slug,
  }
}

export default function Home() {
  useEffect(() => {
    setSeo({
      title: 'Volquetas en Aguazul, Casanare | Volquetas Aguazul',
      description:
        'Arena, gravilla, triturado y escombros con flota local y patio base en Aguazul. Cotiza al instante por WhatsApp.',
      url: `${siteUrl()}/`,
    })
    fetch(`${API_URL}/visitas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }).catch(() => {})
  }, [])

  const config = useQuery({
    queryKey: ['configuracion'],
    queryFn: fetchConfiguracion,
    staleTime: 5 * 60 * 1000,
  })
  const flota = useQuery({
    queryKey: ['volquetas', '', '', '', '', 'destacados'],
    queryFn: () => fetchVolquetas({ orden: 'destacados' }),
    staleTime: 60 * 1000,
  })

  const waNumero = (config.data?.data?.whatsapp ?? '573001234567').replace(/\D/g, '')
  const waUrl = `https://wa.me/${waNumero}?text=${encodeURIComponent('Hola, necesito cotizar un servicio de volqueta en Aguazul.')}`
  const destacadas = (flota.data?.data ?? []).slice(0, 3)

  // Contenidos editables desde el admin (con valores por defecto).
  const contenidos = config.data?.data?.contenidos ?? {}
  const heroTitulo = contenidos.hero_titulo || 'Volquetas para tu obra,'
  const heroResaltado = contenidos.hero_resaltado || 'sin vueltas'
  const heroSubtitulo =
    contenidos.hero_subtitulo ||
    'Arena, gravilla, triturado y escombros con flota local y patio base en Aguazul. Cotiza al instante por WhatsApp.'
  const heroImagen =
    contenidos.hero_imagen ||
    'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=900&q=80'
  const lista = (clave, defecto) =>
    String(contenidos[clave] ?? defecto)
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean)
  const marquesina = lista('marquesina', 'Arena de río|Gravilla|Triturado|Recebo|Balastro|Escombros|Aguazul|Yopal|Maní')
  const cinta2 = lista('cinta2', 'Despacho el mismo día|Cubicaje garantizado|Sin intermediarios|Patio en Aguazul|Nequi y transferencia')

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* HERO */}
      <header className="relative overflow-hidden bg-carbon-900 text-white">
        <div aria-hidden="true" className="dots-grid pointer-events-none absolute inset-0 opacity-60" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand/30 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-brand-dark/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:py-20 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="animate-fade-up inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-brand-light ring-1 ring-white/15">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#25D366]" />
              Aguazul · Casanare · Disponibles hoy
            </p>
            <h1 className="animate-fade-up mt-4 max-w-2xl text-4xl font-extrabold leading-[1.05] md:text-6xl" style={{ animationDelay: '80ms' }}>
              {heroTitulo} <span className="text-gradient-brand">{heroResaltado}</span>
            </h1>
            <p className="animate-fade-up mt-4 max-w-xl text-sm leading-relaxed text-neutral-300 md:text-base" style={{ animationDelay: '160ms' }}>
              {heroSubtitulo}
            </p>
            <div className="animate-fade-up mt-7 flex flex-wrap gap-3" style={{ animationDelay: '240ms' }}>
              <Link to="/volquetas">
                <Button variant="primary" size="lg">Ver volquetas</Button>
              </Link>
              <a href={waUrl} target="_blank" rel="noreferrer">
                <Button variant="whatsapp" size="lg">WhatsApp directo</Button>
              </a>
            </div>
            <dl className="animate-fade-up mt-8 flex flex-wrap gap-4 text-xs text-neutral-400" style={{ animationDelay: '320ms' }}>
              {['Sin intermediarios', 'Cubicaje garantizado', 'Patio en Aguazul'].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  {t}
                </div>
              ))}
            </dl>
          </div>
          <div className="animate-fade-up relative hidden lg:block" style={{ animationDelay: '200ms' }}>
            <div className="overflow-hidden rounded-3xl border border-white/15 shadow-2xl">
              <img
                src={heroImagen}
                alt="Volqueta de la flota en ruta"
                className="animate-kenburns aspect-[4/5] w-full object-cover"
                loading="eager"
              />
            </div>
            <div className="animate-float absolute -left-8 top-10 rounded-2xl bg-white p-3 pr-4 text-industrial shadow-xl">
              <p className="text-2xl font-extrabold">14 m³</p>
              <p className="text-xs font-semibold text-neutral-500">Tolva mayor</p>
            </div>
            <div className="animate-float absolute -bottom-5 right-6 rounded-2xl bg-white p-3 pr-4 text-industrial shadow-xl" style={{ animationDelay: '1.2s' }}>
              <p className="flex items-center gap-1.5 text-sm font-extrabold">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#25D366]" />
                Respuesta en minutos
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">WhatsApp directo al operador</p>
            </div>
            <div className="absolute -right-4 -top-4 -z-0 h-full w-full rounded-3xl border-2 border-brand/40" aria-hidden="true" />
          </div>
        </div>
        <div aria-hidden="true" className="relative h-1.5 bg-gradient-to-r from-brand via-brand-light to-brand" />
      </header>

      {/* MARQUESINA */}
      <Cinta items={marquesina} variante="oscura" />

      {/* STATS */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-3 py-6 md:grid-cols-4">
          {[
            { n: <CountUp hasta={4} />, label: 'Volquetas en flota' },
            { n: <CountUp hasta={14} sufijo=" m³" />, label: 'Tolva mayor' },
            { n: <CountUp hasta={6} />, label: 'Materiales' },
            { n: <CountUp hasta={3} />, label: 'Rutas principales' },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-center shadow-sm">
                <p className="text-3xl font-extrabold text-industrial">{s.n}</p>
                <p className="mt-1 text-xs font-semibold text-neutral-500">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FLOTA */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-dark">Flota destacada</p>
              <h2 className="mt-1 text-2xl font-extrabold text-industrial md:text-3xl">Lista para despachar</h2>
            </div>
            <Link to="/volquetas" className="text-sm font-bold text-brand-dark hover:underline">
              Ver catálogo completo →
            </Link>
          </div>
        </Reveal>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {flota.isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border bg-white">
                  <div className="skeleton h-48" />
                  <div className="space-y-3 p-4">
                    <div className="skeleton h-5 w-3/4 rounded" />
                    <div className="skeleton h-10 rounded-lg" />
                  </div>
                </div>
              ))
            : destacadas.map((v, i) => (
                <Reveal key={v.slug} delay={i * 90}>
                  <Card volqueta={aCard(v)} />
                </Reveal>
              ))}
        </div>
      </section>

      {/* MATERIALES */}
      <section className="mt-8 bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-dark">Materiales</p>
            <h2 className="mt-1 text-2xl font-extrabold text-industrial md:text-3xl">Lo que movemos</h2>
          </Reveal>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {MATERIALES.map((m, i) => (
              <Reveal key={m.nombre} delay={(i % 6) * 70}>
                <div className="group h-full rounded-2xl border border-neutral-200 bg-neutral-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand hover:shadow-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-industrial text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l9 5-9 5-9-5 9-5zm-9 9l9 5 9-5M3 17l9 5 9-5" />
                    </svg>
                  </div>
                  <p className="mt-3 text-sm font-extrabold text-industrial">{m.nombre}</p>
                  <p className="mt-1 text-xs text-neutral-500">{m.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PASOS */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-dark">Así de fácil</p>
          <h2 className="mt-1 text-2xl font-extrabold text-industrial md:text-3xl">Cotiza en 3 pasos</h2>
        </Reveal>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {PASOS.map((p, i) => (
            <Reveal key={p.n} delay={i * 100}>
              <div className="relative h-full overflow-hidden rounded-2xl bg-industrial p-6 text-white shadow-sm">
                <span aria-hidden="true" className="absolute -right-2 -top-4 text-7xl font-extrabold text-white/10">{p.n}</span>
                <p className="text-sm font-extrabold text-brand-light">Paso {p.n}</p>
                <h3 className="mt-1 text-lg font-extrabold">{p.titulo}</h3>
                <p className="mt-2 text-sm text-neutral-300">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* COBERTURA */}
      <section className="bg-white py-12">
        <div className="mx-auto grid max-w-6xl items-start gap-6 px-4 lg:grid-cols-2">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-dark">Cobertura</p>
            <h2 className="mt-1 text-2xl font-extrabold text-industrial md:text-3xl">Operamos desde Aguazul</h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600">
              Trabajamos desde nuestra casa en Aguazul, Casanare, y despachamos a
              diario hacia Yopal, Maní, Tauramena y veredas cercanas.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Aguazul', 'Yopal', 'Maní', 'Tauramena', 'Monterrey'].map((r) => (
                <span key={r} className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-dark">
                  {r}
                </span>
              ))}
            </div>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=5.176984366918817,-72.540844431474"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-bold text-industrial shadow-sm transition-all hover:-translate-y-0.5 hover:shadow"
            >
              Cómo llegar
            </a>
          </Reveal>
          <Reveal delay={120}>
            <Suspense fallback={<div className="skeleton h-64 w-full rounded-2xl md:h-80" />}>
              <MapPatio latitud={5.176984366918817} longitud={-72.540844431474} titulo="Casa base — Aguazul, Casanare" />
            </Suspense>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-12">
        <Reveal>
          <h2 className="text-center text-2xl font-extrabold text-industrial md:text-3xl">Preguntas frecuentes</h2>
        </Reveal>
        <div className="mt-6 space-y-3">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 60}>
              <details className="group rounded-2xl border border-neutral-200 bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow">
                <summary className="cursor-pointer list-none text-sm font-extrabold text-industrial">
                  {f.q}
                  <span className="float-right text-brand transition-transform group-open:rotate-180">▼</span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CINTA 2: mensajes en movimiento inverso */}
      <Cinta items={cinta2} variante="naranja" reversa />

      {/* OPINIONES */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-dark">Clientes</p>
          <h2 className="mt-1 text-2xl font-extrabold text-industrial md:text-3xl">Opiniones de la zona</h2>
          <p className="mt-2 max-w-xl text-sm text-neutral-600">
            Experiencias reales de quienes ya trabajaron con la flota.
          </p>
        </Reveal>
        <div className="mt-6">
          <Opiniones />
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-industrial px-6 py-10 text-center text-white md:py-14">
            <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand/30 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-brand/20 blur-3xl" />
            <h2 className="relative text-2xl font-extrabold md:text-3xl">¿Necesitas material esta semana?</h2>
            <p className="relative mx-auto mt-2 max-w-md text-sm text-neutral-300">
              Escríbenos ahora y te confirmamos disponibilidad y precio en minutos.
            </p>
            <div className="relative mt-6 flex flex-wrap justify-center gap-3">
              <a href={waUrl} target="_blank" rel="noreferrer">
                <Button variant="whatsapp" size="lg">Cotizar por WhatsApp</Button>
              </a>
              <Link to="/volquetas">
                <Button variant="secondary" size="lg" className="!bg-transparent !text-white !border-white/30 hover:!bg-white/10">
                  Ver flota
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
