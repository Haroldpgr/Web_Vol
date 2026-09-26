import { useEffect } from 'react'

export default function Modal({ open, onClose, title = 'Diálogo', children, footer }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => onClose?.()}
      role="presentation"
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold text-industrial">{title}</h2>
          <button
            type="button"
            onClick={() => onClose?.()}
            aria-label="Cerrar diálogo"
            className="rounded-lg px-2 py-1 text-xl leading-none text-neutral-500 hover:bg-neutral-100"
          >
            ×
          </button>
        </div>
        <div className="mt-4 text-sm text-neutral-700">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}
