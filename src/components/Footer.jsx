import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchConfiguracion } from '../lib/api.js'

// Pie público. A propósito SIN ningún enlace a /admin (URL privada, Zona 7).
export default function Footer() {
  const config = useQuery({
    queryKey: ['configuracion'],
    queryFn: fetchConfiguracion,
    staleTime: 5 * 60 * 1000,
  })
  const c = config.data?.data ?? {}
  const waNumero = (c.whatsapp ?? '573001234567').replace(/\D/g, '')

  return (
    <footer className="relative overflow-hidden bg-carbon-900 text-neutral-300">
      <div aria-hidden="true" className="h-1.5 bg-gradient-to-r from-brand via-brand-light to-brand" />
      {/* CTA */}
      <div className="mx-auto max-w-6xl px-4 pt-10">
        <div className="flex flex-col items-start justify-between gap-4 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur md:flex-row md:items-center md:p-8">
          <div>
            <p className="text-xl font-extrabold text-white md:text-2xl">
              ¿Material para esta semana?
            </p>
            <p className="mt-1 text-sm text-neutral-400">
              Cotiza en minutos por WhatsApp, sin formularios eternos.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${waNumero}?text=${encodeURIComponent('Hola, necesito cotizar un servicio de volqueta en Aguazul.')}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-[#25D366] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-green-600/25 transition-all hover:-translate-y-0.5 hover:bg-[#1DA851]"
            >
              Cotizar ahora
            </a>
            <Link
              to="/volquetas"
              className="rounded-2xl border border-white/20 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              Ver flota
            </Link>
          </div>
        </div>
      </div>
      {/* Columnas */}
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2 md:col-span-1">
          <p className="text-lg font-extrabold text-white">
            {c.nombre_empresa || 'Volquetas Aguazul'}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-400">
            Flota local con patio base en Aguazul, Casanare. Arena, gravilla,
            triturado, recebo y escombros.
          </p>
        </div>
        <nav aria-label="Enlaces del sitio">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-white">Sitio</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/" className="transition-colors hover:text-brand-light">Inicio</Link></li>
            <li><Link to="/volquetas" className="transition-colors hover:text-brand-light">Catálogo de volquetas</Link></li>
            <li><Link to="/contacto" className="transition-colors hover:text-brand-light">Contacto y cotizaciones</Link></li>
          </ul>
        </nav>
        <nav aria-label="Materiales">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-white">Materiales</p>
          <ul className="mt-3 space-y-2 text-sm">
            {['Arena de río', 'Gravilla y triturado', 'Recebo y balastro', 'Retiro de escombros'].map((m) => (
              <li key={m}>
                <Link to="/volquetas" className="transition-colors hover:text-brand-light">{m}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-white">Contacto</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Aguazul, Casanare · Colombia</li>
            {c.telefono_contacto && <li>Tel: {c.telefono_contacto}</li>}
            {c.correo_contacto && <li className="break-all">{c.correo_contacto}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-neutral-500">
          © {new Date().getFullYear()} {c.nombre_empresa || 'Volquetas Aguazul'} · Aguazul, Casanare
        </p>
      </div>
    </footer>
  )
}
