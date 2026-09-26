import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import Footer from './Footer.jsx'

const linkBase = 'rounded-xl px-3 py-2 text-sm font-semibold transition-all'
const linkActivo = 'bg-brand-50 text-brand-dark'
const linkInactivo = 'text-neutral-600 hover:bg-neutral-100 hover:text-industrial'

const enlaces = [
  { to: '/volquetas', label: 'Volquetas' },
  { to: '/contacto', label: 'Contacto' },
  { to: '/design-preview', label: 'Diseño' },
]

export default function PublicLayout() {
  const [abierto, setAbierto] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <nav className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/90 shadow-[0_1px_20px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-3">
          <Link to="/" className="group mr-2 flex items-center gap-2.5" onClick={() => setAbierto(false)}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-dark text-base font-extrabold text-white shadow-md shadow-brand/30 transition-transform group-hover:scale-105">
              V
            </span>
            <span className="leading-tight">
              <span className="block font-extrabold text-industrial">Volquetas Aguazul</span>
              <span className="block text-[11px] font-semibold text-neutral-500">Casanare · Colombia</span>
            </span>
          </Link>
          <div className="ml-auto hidden items-center gap-1 md:flex">
            {enlaces.map((e) => (
              <NavLink
                key={e.to}
                to={e.to}
                className={({ isActive }) => `${linkBase} ${isActive ? linkActivo : linkInactivo}`}
              >
                {e.label}
              </NavLink>
            ))}
            <a
              href="https://wa.me/573001234567?text=Hola%2C%20necesito%20cotizar%20un%20servicio%20de%20volqueta%20en%20Aguazul."
              target="_blank"
              rel="noreferrer"
              className="ml-2 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-extrabold text-white shadow-md shadow-green-600/25 transition-all hover:-translate-y-0.5 hover:bg-[#1DA851]"
            >
              WhatsApp
            </a>
          </div>
          <button
            type="button"
            className="ml-auto rounded-xl p-2 text-industrial hover:bg-neutral-100 md:hidden"
            aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={abierto}
            onClick={() => setAbierto((v) => !v)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              {abierto ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
        {abierto && (
          <div className="animate-fade-up border-t border-neutral-100 bg-white px-4 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {enlaces.map((e) => (
                <NavLink
                  key={e.to}
                  to={e.to}
                  onClick={() => setAbierto(false)}
                  className={({ isActive }) => `${linkBase} ${isActive ? linkActivo : linkInactivo}`}
                >
                  {e.label}
                </NavLink>
              ))}
              <a
                href="https://wa.me/573001234567"
                target="_blank"
                rel="noreferrer"
                className="mt-1 rounded-xl bg-[#25D366] px-4 py-2.5 text-center text-sm font-extrabold text-white"
              >
                WhatsApp directo
              </a>
            </div>
          </div>
        )}
      </nav>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
