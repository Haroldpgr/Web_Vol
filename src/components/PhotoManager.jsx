import { useRef, useState } from 'react'
import { urlFoto } from '../lib/api.js'

// Zona de fotos: arrastrar y soltar, miniaturas, portada y reorden.
export default function PhotoManager({
  fotos = [],
  onSubir,
  onPortada,
  onMover,
  onEliminar,
  subiendo = false,
}) {
  const inputRef = useRef(null)
  const [arrastre, setArrastre] = useState(false)

  const soltar = (e) => {
    e.preventDefault()
    setArrastre(false)
    const archivos = [...(e.dataTransfer?.files ?? [])].filter((f) => f.type.startsWith('image/'))
    if (archivos.length > 0) onSubir?.(archivos)
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setArrastre(true)
        }}
        onDragLeave={() => setArrastre(false)}
        onDrop={soltar}
        className={`flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-all ${
          arrastre ? 'border-brand bg-brand-50 scale-[1.01]' : 'border-neutral-300 bg-neutral-50 hover:border-brand hover:bg-brand-50/50'
        }`}
      >
        <svg className="h-8 w-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16l5-5 4 4 3-3 6 6M3 16v5h18v-5M12 4v9" />
        </svg>
        <p className="mt-2 text-sm font-bold text-industrial">
          {subiendo ? 'Subiendo…' : 'Arrastra fotos aquí o haz clic para elegirlas'}
        </p>
        <p className="mt-1 text-xs text-neutral-500">JPG o PNG, máx. 15 MB por foto</p>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length > 0) onSubir?.([...e.target.files])
          e.target.value = ''
        }}
      />

      {fotos.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {fotos.map((f, i) => (
            <li key={f.id} className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <img
                src={urlFoto(f.url_imagen)}
                alt={`Foto ${i + 1} de la volqueta`}
                className="h-32 w-full object-cover"
                loading="lazy"
              />
              {f.es_portada && (
                <span className="absolute left-2 top-2 rounded-full bg-brand px-2 py-0.5 text-[11px] font-extrabold text-white shadow">
                  Portada
                </span>
              )}
              <div className="flex items-center justify-between gap-1 p-1.5">
                <div className="flex gap-1">
                  <button
                    type="button"
                    title="Mover a la izquierda"
                    aria-label={`Mover foto ${i + 1} a la izquierda`}
                    disabled={i === 0}
                    onClick={() => onMover?.(f.id, 'atras')}
                    className="rounded-lg px-2 py-1 text-sm font-bold text-neutral-600 hover:bg-neutral-100 disabled:opacity-30"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    title="Mover a la derecha"
                    aria-label={`Mover foto ${i + 1} a la derecha`}
                    disabled={i === fotos.length - 1}
                    onClick={() => onMover?.(f.id, 'adelante')}
                    className="rounded-lg px-2 py-1 text-sm font-bold text-neutral-600 hover:bg-neutral-100 disabled:opacity-30"
                  >
                    ›
                  </button>
                </div>
                <div className="flex gap-1">
                  {!f.es_portada && (
                    <button
                      type="button"
                      title="Marcar como portada"
                      onClick={() => onPortada?.(f.id)}
                      className="rounded-lg px-2 py-1 text-sm text-brand-dark hover:bg-brand-50"
                      aria-label={`Marcar foto ${i + 1} como portada`}
                    >
                      ★
                    </button>
                  )}
                  <button
                    type="button"
                    title="Eliminar foto"
                    onClick={() => onEliminar?.(f.id)}
                    className="rounded-lg px-2 py-1 text-sm font-bold text-red-500 hover:bg-red-50"
                    aria-label={`Eliminar foto ${i + 1}`}
                  >
                    ×
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
