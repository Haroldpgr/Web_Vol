import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getAdminToken } from '../lib/api.js'

// Todas las rutas /admin (salvo /admin/login) exigen sesión local.
// La validez real del JWT la verifica cada endpoint (401 → login).
export default function RequireAdmin() {
  const location = useLocation()
  const token = getAdminToken()
  if (!token) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
