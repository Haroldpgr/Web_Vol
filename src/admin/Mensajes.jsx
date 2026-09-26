import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { adminMensajes, getAdminToken } from '../lib/api.js'

const FILTROS = [
  { id: 'nuevos', label: 'Sin atender' },
  { id: 'atendidos', label: 'Atendidos' },
  { id: 'todos', label: 'Todos' },
]

function fechaCorta(iso) {
  try {
    return new Date(iso).toLocaleString('es-CO', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

export default function Mensajes() {
  const queryClient = useQueryClient()
  const [filtro, setFiltro] = useState('nuevos')
  const [marcando, setMarcando] = useState(null)

  const lista = useQuery({
    queryKey: ['admin-mensajes', filtro],
    queryFn: () => adminMensajes.listar(filtro),
    enabled: Boolean(getAdminToken()),
    retry: false,
  })

  const refrescar = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-mensajes'] })
  }

  const marcar = async (id, atendido) => {
    setMarcando(id)
    try {
      await adminMensajes.marcar(id, atendido)
      refrescar()
    } finally {
      setMarcando(null)
    }
  }

  const mensajes = lista.data?.data ?? []
  const sinAtender = lista.data?.totalSinAtender ?? 0

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-industrial">Mensajes</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Cotizaciones que llegan del sitio.{' '}
            {sinAtender > 0 && (
              <strong className="text-brand-dark">
                {sinAtender} sin atender
              </strong>
            )}
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
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-white p-5">
              <div className="skeleton h-5 w-1/3 rounded" />
              <div className="skeleton mt-2 h-4 w-full rounded" />
            </div>
          ))}
        </div>
      ) : lista.isError ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-white p-8 text-center">
          <p className="font-bold text-red-700">No pudimos cargar los mensajes.</p>
          <button
            type="button"
            onClick={() => lista.refetch()}
            className="mt-3 font-semibold text-red-600 underline"
          >
            Reintentar
          </button>
        </div>
      ) : mensajes.length === 0 ? (
        <div className="animate-fade-up mt-6 rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center">
          <p className="text-lg font-extrabold text-industrial">Bandeja al día</p>
          <p className="mt-1 text-sm text-neutral-500">
            {filtro === 'nuevos'
              ? 'No hay mensajes sin atender.'
              : 'No hay mensajes en esta vista.'}
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {mensajes.map((m, i) => {
            const tel = (m.telefono || '').replace(/\D/g, '')
            const waUrl = tel
              ? `https://wa.me/${tel.startsWith('57') ? tel : `57${tel}`}?text=${encodeURIComponent(`Hola ${m.nombre}, te escribo de Volquetas Aguazul por tu cotización. `)}`
              : ''
            return (
              <li
                key={m.id}
                className={`animate-fade-up rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${
                  m.atendido ? 'border-neutral-200 opacity-80' : 'border-brand/40'
                }`}
                style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-extrabold text-industrial">
                      {m.nombre}{' '}
                      <span className="ml-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-bold text-neutral-600">
                        {m.telefono}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {fechaCorta(m.creado_en)}
                      {m.volqueta && (
                        <>
                          {' '}·{' '}
                          <Link
                            to={`/volquetas/${m.volqueta.slug}`}
                            target="_blank"
                            className="font-semibold text-brand-dark hover:underline"
                          >
                            {m.volqueta.titulo}
                          </Link>
                        </>
                      )}
                      {!m.volqueta && ' · Contacto general'}
                    </p>
                  </div>
                  {m.atendido ? (
                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-800">
                      Atendido
                    </span>
                  ) : (
                    <span className="animate-pulse rounded-full bg-brand px-2.5 py-1 text-xs font-extrabold text-white">
                      Nuevo
                    </span>
                  )}
                </div>
                <p className="mt-3 rounded-xl bg-neutral-50 p-3 text-sm leading-relaxed text-neutral-700">
                  {m.mensaje}
                </p>
                {m.email && <p className="mt-2 text-xs text-neutral-500">{m.email}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl bg-[#25D366] px-4 py-2 text-xs font-extrabold text-white transition-all hover:-translate-y-0.5 hover:bg-[#1DA851]"
                    >
                      WhatsApp al cliente
                    </a>
                  )}
                  <button
                    type="button"
                    disabled={marcando === m.id}
                    onClick={() => marcar(m.id, !m.atendido)}
                    className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-bold text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-50"
                  >
                    {m.atendido ? 'Marcar sin atender' : 'Marcar atendido'}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
