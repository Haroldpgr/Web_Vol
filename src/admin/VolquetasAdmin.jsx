import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../components/Badge.jsx'
import Button from '../components/Button.jsx'
import Modal from '../components/Modal.jsx'
import { adminVolquetas, getAdminToken, urlFoto } from '../lib/api.js'

const ESTADOS = ['disponible', 'ocupada', 'mantenimiento']

export default function VolquetasAdmin() {
  const queryClient = useQueryClient()
  const [eliminarId, setEliminarId] = useState(null)
  const [cambiando, setCambiando] = useState(null)

  const lista = useQuery({
    queryKey: ['admin-volquetas'],
    queryFn: () => adminVolquetas.listar(),
    enabled: Boolean(getAdminToken()),
    retry: false,
  })

  const refrescar = () => queryClient.invalidateQueries({ queryKey: ['admin-volquetas'] })

  const cambiarEstado = async (id, estado) => {
    setCambiando(id)
    try {
      await adminVolquetas.cambiarEstado(id, estado)
      refrescar()
    } catch {
      // el error se ve al recargar; mantener simple
    } finally {
      setCambiando(null)
    }
  }

  const eliminar = async () => {
    if (!eliminarId) return
    await adminVolquetas.eliminar(eliminarId)
    setEliminarId(null)
    refrescar()
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-industrial">Volquetas</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Todas, incluso en mantenimiento. El estado se cambia con un clic.
          </p>
        </div>
        <Link to="/admin/volquetas/nuevo">
          <Button variant="primary">+ Nueva volqueta</Button>
        </Link>
      </div>

      {lista.isLoading ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-white p-4">
              <div className="skeleton h-32 rounded-xl" />
              <div className="skeleton mt-3 h-5 w-2/3 rounded" />
            </div>
          ))}
        </div>
      ) : lista.isError ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-white p-8 text-center">
          <p className="font-bold text-red-700">No pudimos cargar la flota.</p>
          <button
            type="button"
            onClick={() => lista.refetch()}
            className="mt-3 font-semibold text-red-600 underline"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {(lista.data?.data ?? []).map((v, i) => (
            <li
              key={v.id}
              className="animate-fade-up rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
            >
              <div className="flex gap-4">
                <img
                  src={urlFoto(v.foto_portada) || 'https://placehold.co/160x120?text=Sin+foto'}
                  alt={`Foto de ${v.titulo}`}
                  className="h-20 w-28 shrink-0 rounded-xl bg-neutral-100 object-cover"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <Badge estado={v.estado} />
                  <p className="mt-1 truncate font-extrabold text-industrial" title={v.titulo}>
                    {v.titulo}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {v.ciudad_base} · {v.total_fotos} fotos · {v._count?.leads ?? 0} mensajes
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-neutral-100 pt-3">
                {ESTADOS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    disabled={cambiando === v.id}
                    onClick={() => cambiarEstado(v.id, e)}
                    aria-pressed={v.estado === e}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                      v.estado === e
                        ? 'bg-industrial text-white shadow'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {e === 'disponible' ? 'Disponible' : e === 'ocupada' ? 'Ocupada' : 'Taller'}
                  </button>
                ))}
                <span className="ml-auto flex gap-2">
                  <Link
                    to={`/admin/volquetas/${v.id}/editar`}
                    className="rounded-lg px-2 py-1 text-xs font-bold text-brand-dark hover:bg-brand-50"
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => setEliminarId(v.id)}
                    className="rounded-lg px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={eliminarId !== null}
        onClose={() => setEliminarId(null)}
        title="Eliminar volqueta"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEliminarId(null)}>
              Cancelar
            </Button>
            <button
              type="button"
              onClick={eliminar}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
            >
              Sí, eliminar
            </button>
          </>
        }
      >
        <p>Esta acción borra la volqueta, sus fotos y sus contadores. No se puede deshacer.</p>
      </Modal>
    </div>
  )
}
