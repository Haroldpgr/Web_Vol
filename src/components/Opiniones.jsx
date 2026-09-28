import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { fetchTestimonios, postTestimonio } from '../lib/api.js'
import Button from './Button.jsx'
import { Input, TextArea } from './Input.jsx'
import Reveal from './Reveal.jsx'

function Estrellas({ n = 5 }) {
  return (
    <span className="text-brand" aria-label={`${n} de 5 estrellas`}>
      {'★'.repeat(n)}
      <span className="text-neutral-300">{'★'.repeat(5 - n)}</span>
    </span>
  )
}

// Opiniones reales de clientes (moderadas desde el admin).
export default function Opiniones() {
  const queryClient = useQueryClient()
  const lista = useQuery({
    queryKey: ['testimonios'],
    queryFn: fetchTestimonios,
    staleTime: 60 * 1000,
  })

  const [nombre, setNombre] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [calificacion, setCalificacion] = useState(5)
  const [empresa, setEmpresa] = useState('')
  const [estado, setEstado] = useState('idle')
  const [errores, setErrores] = useState({})

  const enviar = async (e) => {
    e.preventDefault()
    if (estado === 'sending') return
    const locales = {}
    if (!nombre.trim()) locales.nombre = 'Tu nombre.'
    if (mensaje.trim().length < 10) locales.mensaje = 'Cuéntanos un poco más (mín. 10 caracteres).'
    setErrores(locales)
    if (Object.keys(locales).length > 0) return
    setEstado('sending')
    try {
      await postTestimonio({ nombre: nombre.trim(), mensaje: mensaje.trim(), calificacion, empresa: empresa || undefined })
      setEstado('success')
      setNombre('')
      setMensaje('')
      setCalificacion(5)
    } catch (err) {
      if (err.status === 400 && err.errores) {
        setErrores({ nombre: err.errores.nombre, mensaje: err.errores.mensaje })
        setEstado('idle')
      } else {
        setEstado('error')
      }
    }
  }

  const items = lista.data?.data ?? []

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
      <div>
        {lista.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-2xl border bg-white p-5">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton mt-3 h-16 w-full rounded" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center">
            <p className="font-extrabold text-industrial">Aún no hay opiniones</p>
            <p className="mt-1 text-sm text-neutral-500">Sé la primera persona en contar tu experiencia.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((t, i) => (
              <Reveal key={t.id} delay={Math.min(i, 4) * 80}>
                <figure className="h-full rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <Estrellas n={t.calificacion} />
                  <blockquote className="mt-3 text-sm leading-relaxed text-neutral-700">
                    “{t.mensaje}”
                  </blockquote>
                  <figcaption className="mt-3 text-xs font-bold text-neutral-500">{t.nombre}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      <Reveal delay={120}>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
          <h3 className="text-base font-extrabold text-industrial">Déjanos tu opinión</h3>
          <p className="mb-4 mt-1 text-xs text-neutral-500">
            La publicamos tras revisarla.
          </p>
          {estado === 'success' ? (
            <div className="animate-fade-up rounded-xl border border-green-200 bg-green-50 p-4 text-center">
              <p className="font-extrabold text-green-900">¡Gracias por opinar!</p>
              <p className="mt-1 text-sm text-green-800">Tu mensaje quedó pendiente de revisión.</p>
              <button
                type="button"
                onClick={() => {
                  setEstado('idle')
                  queryClient.invalidateQueries({ queryKey: ['testimonios'] })
                }}
                className="mt-3 text-sm font-bold text-green-700 underline"
              >
                Escribir otra
              </button>
            </div>
          ) : (
            <form onSubmit={enviar} className="relative space-y-3" noValidate>
              <input
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute h-0 w-0 overflow-hidden opacity-0"
              />
              <Input label="Tu nombre" id="op-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="¿Cómo te llamas?" error={errores.nombre} />
              <div>
                <span className="mb-1 block text-sm font-semibold text-industrial">Calificación</span>
                <div className="flex gap-1" role="radiogroup" aria-label="Calificación">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={calificacion === n}
                      aria-label={`${n} estrellas`}
                      onClick={() => setCalificacion(n)}
                      className={`text-2xl transition-transform hover:scale-110 ${n <= calificacion ? 'text-brand' : 'text-neutral-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <TextArea label="Tu experiencia" id="op-msg" rows={3} value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="¿Qué tal el servicio?" error={errores.mensaje} />
              {estado === 'error' && (
                <p className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
                  No se pudo enviar. Inténtalo de nuevo.
                </p>
              )}
              <Button type="submit" variant="primary" disabled={estado === 'sending'} className="w-full">
                {estado === 'sending' ? 'Enviando…' : 'Publicar opinión'}
              </Button>
            </form>
          )}
        </div>
      </Reveal>
    </div>
  )
}
