import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminVolquetas } from '../lib/api.js'
import VolquetaForm from './VolquetaForm.jsx'

export default function VolquetaNuevo() {
  const navigate = useNavigate()
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const crear = async (datos) => {
    setGuardando(true)
    setError('')
    try {
      const res = await adminVolquetas.crear(datos)
      navigate(`/admin/volquetas/${res.data.id}/editar`, { replace: true })
    } catch (err) {
      setError(err.errores?.titulo || err.message || 'No se pudo crear.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6 md:p-8">
      <h1 className="text-2xl font-extrabold text-industrial">Nueva volqueta</h1>
      <p className="mb-6 mt-1 text-sm text-neutral-500">
        Completa los datos; después agregarás las fotos en la edición.
      </p>
      <VolquetaForm onGuardar={crear} guardando={guardando} errorServidor={error} />
    </div>
  )
}
