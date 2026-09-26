import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PhotoManager from '../components/PhotoManager.jsx'
import { adminFotos, adminVolquetas, getAdminToken } from '../lib/api.js'
import VolquetaForm from './VolquetaForm.jsx'

export default function VolquetaEditar() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [errorFotos, setErrorFotos] = useState('')

  const ficha = useQuery({
    queryKey: ['admin-volqueta', id],
    queryFn: () => adminVolquetas.obtener(id),
    enabled: Boolean(getAdminToken()),
    retry: false,
  })

  const refrescar = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-volqueta', id] })
    queryClient.invalidateQueries({ queryKey: ['admin-volquetas'] })
  }

  const guardar = async (datos) => {
    setGuardando(true)
    setError('')
    setOk(false)
    try {
      await adminVolquetas.actualizar(id, datos)
      setOk(true)
      refrescar()
    } catch (err) {
      setError(err.errores?.titulo || err.message || 'No se pudo guardar.')
    } finally {
      setGuardando(false)
    }
  }

  const subir = async (archivos) => {
    setSubiendo(true)
    setErrorFotos('')
    try {
      await adminVolquetas.subirFotos(id, archivos)
      refrescar()
    } catch (err) {
      setErrorFotos(err.message || 'No se pudieron subir las fotos.')
    } finally {
      setSubiendo(false)
    }
  }

  const mover = async (fotoId, dir) => {
    const fotos = [...(ficha.data?.data?.fotos ?? [])].sort((a, b) => a.orden - b.orden)
    const i = fotos.findIndex((f) => f.id === fotoId)
    const j = dir === 'adelante' ? i + 1 : i - 1
    if (i < 0 || j < 0 || j >= fotos.length) return
    await adminFotos.reordenar(fotoId, fotos[j].orden)
    refrescar()
  }

  const portada = async (fotoId) => {
    await adminFotos.marcarPortada(fotoId)
    refrescar()
  }

  const eliminarFoto = async (fotoId) => {
    await adminFotos.eliminar(fotoId)
    refrescar()
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 md:p-8">
      <div>
        <Link to="/admin/volquetas" className="text-sm font-bold text-brand-dark hover:underline">
          ← Volver a la flota
        </Link>
        <h1 className="mt-1 text-2xl font-extrabold text-industrial">Editar volqueta</h1>
      </div>

      {ficha.isLoading ? (
        <div className="space-y-4">
          <div className="skeleton h-64 rounded-2xl" />
          <div className="skeleton h-40 rounded-2xl" />
        </div>
      ) : ficha.isError ? (
        <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
          <p className="font-bold text-red-700">No pudimos cargar la volqueta.</p>
          <button
            type="button"
            onClick={() => ficha.refetch()}
            className="mt-3 font-semibold text-red-600 underline"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          {ok && (
            <p className="animate-fade-up rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-800">
              Cambios guardados.
            </p>
          )}
          <VolquetaForm
            key={ficha.data.data.id}
            inicial={ficha.data.data}
            onGuardar={guardar}
            guardando={guardando}
            errorServidor={error}
          />
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
            <h2 className="text-base font-extrabold text-industrial">Fotos</h2>
            <p className="mb-4 mt-1 text-xs text-neutral-500">
              La foto marcada como portada aparece en el catálogo y la ficha.
            </p>
            {errorFotos && (
              <p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {errorFotos}
              </p>
            )}
            <PhotoManager
              fotos={[...(ficha.data.data.fotos ?? [])].sort((a, b) => a.orden - b.orden)}
              onSubir={subir}
              onPortada={portada}
              onMover={mover}
              onEliminar={eliminarFoto}
              subiendo={subiendo}
            />
          </section>
        </>
      )}
    </div>
  )
}
