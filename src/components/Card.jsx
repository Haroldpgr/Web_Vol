import { Link } from 'react-router-dom'
import Badge from './Badge.jsx'
import Button from './Button.jsx'

export default function Card({ volqueta }) {
  const {
    titulo = 'Volqueta sin título',
    foto = '',
    capacidadM3 = '-',
    capacidadToneladas = '-',
    ciudadBase = '-',
    estado = 'disponible',
    precio = null,
    slug = 'ejemplo-slug',
  } = volqueta ?? {}

  return (
    <article className="group h-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative overflow-hidden">
        <img
          src={foto}
          alt={`Foto de ${titulo}`}
          className="h-48 w-full bg-neutral-200 object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
        <div className="absolute left-3 top-3 drop-shadow">
          <Badge estado={estado} />
        </div>
        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-brand to-brand-light" aria-hidden="true" />
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 min-h-14 text-lg font-bold leading-snug text-industrial">{titulo}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-neutral-600">
          <svg
            className="h-4 w-4 shrink-0 text-brand"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7-7.5 11-7.5 11s-7.5-4-7.5-11a7.5 7.5 0 0115 0z"
            />
          </svg>
          {ciudadBase}
        </p>

        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-neutral-50 p-2">
            <dt className="text-xs text-neutral-500">Capacidad</dt>
            <dd className="font-bold text-industrial">{capacidadM3} m³</dd>
          </div>
          <div className="rounded-lg bg-neutral-50 p-2">
            <dt className="text-xs text-neutral-500">Carga</dt>
            <dd className="font-bold text-industrial">{capacidadToneladas} t</dd>
          </div>
        </dl>

        {precio && <p className="mt-3 text-sm font-semibold text-industrial">{precio}</p>}

        <Link to={`/volquetas/${slug}`} className="mt-4 block">
          <Button variant="primary" className="w-full">
            Ver ficha
          </Button>
        </Link>
      </div>
    </article>
  )
}
