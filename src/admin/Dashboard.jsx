import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchAdminStats, getAdminToken } from '../lib/api.js'

function BarrasTop({ top }) {
  const max = Math.max(1, ...top.map((t) => t.total_visitas))
  return (
    <ol className="mt-4 space-y-3">
      {top.map((t, i) => (
        <li key={t.volqueta_id}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-semibold text-industrial">
              <span className="mr-2 text-neutral-400">#{i + 1}</span>
              {t.volqueta?.titulo ?? `Volqueta ${t.volqueta_id}`}
            </span>
            <span className="shrink-0 font-extrabold text-industrial">{t.total_visitas}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand to-brand-light transition-all"
              style={{ width: `${Math.round((t.total_visitas / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ol>
  )
}

export default function Dashboard() {
  const token = getAdminToken()
  const stats = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => fetchAdminStats(token),
    enabled: Boolean(token),
    retry: false,
  })

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-extrabold text-industrial">Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-600">Flota de Aguazul, Casanare.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { to: '/admin/volquetas', titulo: 'Volquetas', desc: 'Crear, editar y fotos' },
          { to: '/admin/mensajes', titulo: 'Mensajes', desc: 'Cotizaciones recibidas' },
          { to: '/admin/configuracion', titulo: 'Configuración', desc: 'WhatsApp y datos' },
        ].map((a, i) => (
          <Link
            key={a.to}
            to={a.to}
            className="animate-fade-up group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-brand hover:shadow-lg"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <p className="font-extrabold text-industrial group-hover:text-brand-dark">{a.titulo}</p>
            <p className="mt-1 text-xs text-neutral-500">{a.desc}</p>
            <p className="mt-3 text-sm font-bold text-brand-dark">Abrir →</p>
          </Link>
        ))}
      </div>

      <div className="mt-5 grid max-w-3xl gap-5">
        <section className="animate-fade-up rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-extrabold text-industrial">Visitas</h2>
          {!token ? (
            <div className="mt-3 rounded-xl bg-neutral-50 p-4 text-sm text-neutral-600">
              Inicia sesión como administrador para ver las estadísticas.{' '}
              <Link to="/admin/login" className="font-bold text-brand hover:underline">
                Ir al login
              </Link>{' '}
              (disponible en la Zona 7).
            </div>
          ) : stats.isLoading ? (
            <div className="mt-4 space-y-3">
              <div className="skeleton h-10 w-32 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-2/3 rounded" />
            </div>
          ) : stats.isError ? (
            <div className="mt-3 rounded-xl bg-red-50 p-4 text-sm">
              <p className="font-bold text-red-700">
                {stats.error?.status === 401
                  ? 'Sesión inválida o vencida.'
                  : 'No pudimos cargar las estadísticas.'}
              </p>
              <Link to="/admin/login" className="mt-1 inline-block font-semibold text-red-600 underline">
                Volver a iniciar sesión
              </Link>
            </div>
          ) : (
            <>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Visitas totales
              </p>
              <p className="text-4xl font-extrabold text-industrial">
                {stats.data.data.total_sitio}
              </p>
              <h3 className="mt-5 text-sm font-extrabold text-industrial">
                Top 5 volquetas más vistas
              </h3>
              {stats.data.data.top.length === 0 ? (
                <p className="mt-2 text-sm text-neutral-500">Aún no hay visitas registradas.</p>
              ) : (
                <BarrasTop top={stats.data.data.top} />
              )}
              <h3 className="mt-6 text-sm font-extrabold text-industrial">
                Últimos visitantes
              </h3>
              {(stats.data.data.recientes ?? []).length === 0 ? (
                <p className="mt-2 text-sm text-neutral-500">Sin actividad reciente.</p>
              ) : (
                <ul className="mt-3 divide-y divide-neutral-100 rounded-xl border border-neutral-100">
                  {(stats.data.data.recientes ?? []).map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-industrial">{r.dispositivo}</p>
                        <p className="truncate text-xs text-neutral-500">
                          {r.titulo} · {r.pagina}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-neutral-400">
                        {new Date(r.creado_en).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
