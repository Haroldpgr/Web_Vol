// Cinta infinita de mensajes (loop perfecto: dos mitades idénticas + translateX(-50%)).
export default function Cinta({ items = [], variante = 'oscura', reversa = false }) {
  if (items.length === 0) return null
  const naranja = variante === 'naranja'

  const mitad = (oculta) => (
    <div aria-hidden={oculta || undefined} className="flex shrink-0 items-center">
      {items.map((m) => (
        <span key={`${oculta ? 'b' : 'a'}-${m}`} className="flex items-center whitespace-nowrap">
          <span className="px-5 text-sm font-extrabold uppercase tracking-[0.2em]">{m}</span>
          {naranja ? (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span className="shrink-0 text-brand" aria-hidden="true">◆</span>
          )}
        </span>
      ))}
    </div>
  )

  return (
    <div
      className={`overflow-hidden py-3 ${naranja ? 'bg-brand text-white' : 'border-b border-neutral-800 bg-industrial text-white/90'}`}
    >
      <div className={`flex w-max ${reversa ? 'animate-marquee-reverse' : 'animate-marquee'}`}>
        {mitad(false)}
        {mitad(true)}
      </div>
    </div>
  )
}
