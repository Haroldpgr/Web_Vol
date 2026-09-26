import { useState } from 'react'

export default function Gallery({ images = [] }) {
  const [selected, setSelected] = useState(0)
  if (images.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-sm text-neutral-500">
        Sin fotos disponibles
      </div>
    )
  }
  const current = images[selected] ?? images[0]

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
        <img
          src={current.url}
          alt={current.alt ?? `Foto ${selected + 1} de la volqueta`}
          className="aspect-video w-full object-cover"
        />
      </div>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {images.map((img, i) => (
          <button
            key={`${img.url}-${i}`}
            type="button"
            onClick={() => setSelected(i)}
            aria-label={`Ver foto ${i + 1}`}
            className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
              i === selected
                ? 'border-brand ring-2 ring-brand/30'
                : 'border-transparent opacity-70 hover:opacity-100'
            }`}
          >
            <img
              src={img.url}
              alt={img.alt ?? `Miniatura ${i + 1}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
