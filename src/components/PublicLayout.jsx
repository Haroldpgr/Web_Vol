import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import Footer from './Footer.jsx'

const enlaces = [
  { to: '/', label: 'Inicio', fin: true },
  { to: '/volquetas', label: 'Volquetas', fin: false },
  { to: '/contacto', label: 'Contacto', fin: false },
]

function ItemNav({ to, label, fin, onClick }) {
  return (
    <NavLink
      to={to}
      end={fin}
      onClick={onClick}
      className={({ isActive }) =>
        `group relative rounded-xl px-4 py-2 text-sm font-bold transition-all ${
          isActive ? 'text-brand-dark' : 'text-neutral-600 hover:text-industrial'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={`absolute inset-0 rounded-xl transition-all ${isActive ? 'bg-brand-50' : 'group-hover:bg-neutral-100'}`} aria-hidden="true" />
          <span className="relative">{label}</span>
          <span
            aria-hidden="true"
            className={`absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-brand to-brand-light transition-all ${
              isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
            }`}
          />
        </>
      )}
    </NavLink>
  )
}

export default function PublicLayout() {
  const [abierto, setAbierto] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <nav className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/90 shadow-[0_1px_20px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-3">
          <Link to="/" className="group mr-2 flex items-center gap-2.5" onClick={() => setAbierto(false)}>
            <img
              src="/favicon.svg"
              alt="Volquetas Aguazul"
              className="h-9 w-9 rounded-xl shadow-md shadow-brand/30 transition-transform group-hover:rotate-6 group-hover:scale-105"
            />
            <span className="leading-tight">
              <span className="block font-extrabold text-industrial">Volquetas Aguazul</span>
              <span className="block text-[11px] font-semibold text-neutral-500">Casanare · Colombia</span>
            </span>
          </Link>
          <div className="ml-auto hidden items-center gap-1 md:flex">
            {enlaces.map((e) => (
              <ItemNav key={e.to} to={e.to} label={e.label} fin={e.fin} />
            ))}
            <a
              href="https://wa.me/573001234567?text=Hola%2C%20necesito%20cotizar%20un%20servicio%20de%20volqueta%20en%20Aguazul."
              target="_blank"
              rel="noreferrer"
              className="group ml-2 flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-extrabold text-white shadow-md shadow-green-600/25 transition-all hover:-translate-y-0.5 hover:bg-[#1DA851] hover:shadow-lg"
            >
              <svg className="h-4 w-4 transition-transform group-hover:rotate-12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm4.6 12.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.3-.4 0-.5.1-.7l.5-.6c.1-.2.1-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.2-.7.6-.9 2 .3 4.7 2.7 6.4a8.8 8.8 0 005.4 2.2c.8.1 1.5-.1 2-.3.6-.3 1.5-.9 1.7-1.7.1-.4.1-.9 0-1l-.9-.6z" />
              </svg>
              WhatsApp
            </a>
          </div>
          <button
            type="button"
            className="ml-auto rounded-xl p-2 text-industrial transition-colors hover:bg-neutral-100 md:hidden"
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
                <ItemNav key={e.to} to={e.to} label={e.label} fin={e.fin} onClick={() => setAbierto(false)} />
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
