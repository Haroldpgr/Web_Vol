import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { getAdminInfo, logoutAdmin } from '../lib/api.js'

const items = [
  { to: '/admin', fin: true, label: 'Dashboard' },
  { to: '/admin/volquetas', fin: false, label: 'Volquetas' },
  { to: '/admin/mensajes', fin: false, label: 'Mensajes' },
  { to: '/admin/testimonios', fin: false, label: 'Opiniones' },
  { to: '/admin/configuracion', fin: false, label: 'Configuración' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const admin = getAdminInfo()

  const salir = async () => {
    await logoutAdmin()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-neutral-100 lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="bg-industrial text-white lg:min-h-screen">
        <div className="flex items-center justify-between gap-2 p-4">
          <p className="font-extrabold">
            Volquetas Aguazul <span className="text-brand-light">· Admin</span>
          </p>
          <button
            type="button"
            onClick={salir}
            className="rounded-lg border border-white/30 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-white/10 lg:hidden"
          >
            Salir
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-6">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.fin}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-brand text-white shadow'
                    : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {it.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden border-t border-white/10 p-4 text-xs text-neutral-400 lg:block">
          {admin?.nombre && <p className="font-semibold text-neutral-200">{admin.nombre}</p>}
          {admin?.email && <p className="truncate">{admin.email}</p>}
          <button
            type="button"
            onClick={salir}
            className="mt-3 w-full rounded-lg border border-white/30 px-3 py-2 font-semibold text-white transition-colors hover:bg-white/10"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="min-w-0">
        <main>
          <Outlet />
        </main>
        <p className="px-6 pb-6 text-center text-xs text-neutral-400 md:px-8">
          ¿Necesitas ver el sitio?{' '}
          <Link to="/" className="underline hover:text-neutral-600">
            Abrir página pública
          </Link>
        </p>
      </div>
    </div>
  )
}
