import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { adminTestimonios, getAdminToken } from '../lib/api.js'

const FILTROS = [
  { id: 'pendientes', label: 'Pendientes' },
  { id: 'aprobados', label: 'Aprobados' },
  { id: 'todos', label: 'Todos' },
]

export default function Testimonios() {
  const queryClient = useQueryClient()
  const [filtro, setFiltro] = useState('pendientes')
  const [actuando, setActuando] = useState(null)

  const lista = useQuery({
    queryKey: ['admin-testimonios', filtro],
    queryFn: () => adminTestimonios.listar(filtro),
    enabled: Boolean(getAdminToken()),
    retry: false,
  })

  const refrescar = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-testimonios'] })
    queryClient.invalidateQueries({ queryKey: ['testimonios'] })
  }

  const actuar = async (id, accion) => {
    setActuando(id)
    try {
      if (accion === 'eliminar') await adminTestimonios.eliminar(id)
      else await adminTestimonios.aprobar(id, accion === 'aprobar')
      refrescar()
    } finally {
      setActuando(null)
    }
  }

  const items = lista.data?.data ?? []
  const pendientes = lista.data?.pendientes ?? 0

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-industrial">Opiniones</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Lo que escriben los clientes.{' '}
            {pendientes > 0 && <strong className="text-brand-dark">{pendientes} pendientes</strong>}
          </p>
        </div>
        <div className="flex gap-1.5 rounded-xl bg-white p-1 shadow-sm">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltro(f.id)}
              aria-pressed={filtro === f.id}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                filtro === f.id ? 'bg-industrial text-white shadow' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {lista.isLoading ? (
        <div className="mt-6 space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-2xl border bg-white p-5">
              <div className="skeleton h-5 w-1/3 rounded" />
              <div className="skeleton mt-2 h-4 w-full rounded" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="animate-fade-up mt-6 rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center">
          <p className="text-lg font-extrabold text-industrial">Nada por aquí</p>
          <p className="mt-1 text-sm text-neutral-500">No hay opiniones en esta vista.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((t, i) => (
            <li
              key={t.id}
              className="animate-fade-up rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
              style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-extrabold text-industrial">
                  {t.nombre}{' '}
                  <span className="text-brand">{'★'.repeat(t.calificacion)}</span>
                </p>
                {t.aprobado ? (
                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-800">
                    Visible
                  </span>
                ) : (
                  <span className="animate-pulse rounded-full bg-brand px-2.5 py-1 text-xs font-extrabold text-white">
                    Pendiente
                  </span>
                )}
              </div>
              <p className="mt-2 rounded-xl bg-neutral-50 p-3 text-sm text-neutral-700">{t.mensaje}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {!t.aprobado && (
                  <button
                    type="button"
                    disabled={actuando === t.id}
                    onClick={() => actuar(t.id, 'aprobar')}
                    className="rounded-xl bg-brand px-4 py-2 text-xs font-extrabold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
                  >
                    Aprobar y publicar
                  </button>
                )}
                {t.aprobado && (
                  <button
                    type="button"
                    disabled={actuando === t.id}
                    onClick={() => actuar(t.id, 'ocultar')}
                    className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
                  >
                    Ocultar
                  </button>
                )}
                <button
                  type="button"
                  disabled={actuando === t.id}
                  onClick={() => actuar(t.id, 'eliminar')}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
