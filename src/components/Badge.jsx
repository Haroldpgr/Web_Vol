const styles = {
  disponible: 'bg-green-100 text-green-800 border-green-300',
  ocupada: 'bg-amber-100 text-amber-800 border-amber-300',
  mantenimiento: 'bg-neutral-200 text-neutral-700 border-neutral-300',
}

const dotStyles = {
  disponible: 'bg-green-600',
  ocupada: 'bg-amber-500',
  mantenimiento: 'bg-neutral-500',
}

const labels = {
  disponible: 'Disponible',
  ocupada: 'Ocupada',
  mantenimiento: 'Mantenimiento',
}

export default function Badge({ estado = 'disponible', className = '' }) {
  const key = styles[estado] ? estado : 'disponible'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[key]} ${className}`}
    >
      <span className={`h-2 w-2 rounded-full ${dotStyles[key]}`} aria-hidden="true" />
      {labels[key]}
    </span>
  )
}
