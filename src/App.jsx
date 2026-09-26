import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import PublicLayout from './components/PublicLayout.jsx'
import Contacto from './pages/Contacto.jsx'
import Home from './pages/Home.jsx'
import VolquetaDetalle from './pages/VolquetaDetalle.jsx'
import Volquetas from './pages/Volquetas.jsx'

// Secciones pesadas / privadas en chunks separados (carga diferida).
const DesignPreview = lazy(() => import('./pages/DesignPreview.jsx'))
const AdminLayout = lazy(() => import('./admin/AdminLayout.jsx'))
const Dashboard = lazy(() => import('./admin/Dashboard.jsx'))
const Login = lazy(() => import('./admin/Login.jsx'))
const Mensajes = lazy(() => import('./admin/Mensajes.jsx'))
const RequireAdmin = lazy(() => import('./admin/RequireAdmin.jsx'))
const VolquetaEditar = lazy(() => import('./admin/VolquetaEditar.jsx'))
const VolquetaNuevo = lazy(() => import('./admin/VolquetaNuevo.jsx'))
const VolquetasAdmin = lazy(() => import('./admin/VolquetasAdmin.jsx'))
const Configuracion = lazy(() => import('./admin/Configuracion.jsx'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function Cargando() {
  return (
    <div className="mx-auto max-w-6xl space-y-3 p-8">
      <div className="skeleton h-8 w-56 rounded" />
      <div className="skeleton h-40 w-full rounded-2xl" />
    </div>
  )
}

// Transición suave entre páginas (solo al cambiar de ruta, no de filtros).
function RutasAnimadas() {
  const { pathname } = useLocation()
  return (
    <div key={pathname} className="animate-fade-up" style={{ animationDuration: '0.35s' }}>
      <Suspense fallback={<Cargando />}>
        <Routes>
          {/* Rutas públicas */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/volquetas" element={<Volquetas />} />
            <Route path="/volquetas/:slug" element={<VolquetaDetalle />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/design-preview" element={<DesignPreview />} />
          </Route>

          {/* Rutas admin (privadas, sin enlaces desde el sitio público) */}
          <Route path="/admin/login" element={<Login />} />
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="volquetas" element={<VolquetasAdmin />} />
              <Route path="volquetas/nuevo" element={<VolquetaNuevo />} />
              <Route path="volquetas/:id/editar" element={<VolquetaEditar />} />
              <Route path="mensajes" element={<Mensajes />} />
              <Route path="configuracion" element={<Configuracion />} />
            </Route>
          </Route>

          <Route path="*" element={<div className="p-8">404 — Página no encontrada</div>} />
        </Routes>
      </Suspense>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <RutasAnimadas />
    </BrowserRouter>
  )
}

export default App
