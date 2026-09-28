// Cliente HTTP del catálogo (Zona 3)
// OJO: cadena vacía cae al valor local y se quitan `/` finales (evita `//ruta` en prod).
const apiDeEnv = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '')
export const API_URL = apiDeEnv || 'http://localhost:3000'

export async function fetchVolquetas(params = {}) {
  const search = new URLSearchParams()
  if (params.ciudad) search.set('ciudad_base', params.ciudad)
  if (params.min !== '' && params.min !== undefined) search.set('capacidad_min_m3', params.min)
  if (params.max !== '' && params.max !== undefined) search.set('capacidad_max_m3', params.max)
  if (params.q) search.set('q', params.q)
  if (params.orden === 'recientes') search.set('destacados_primero', 'false')

  const res = await fetch(`${API_URL}/volquetas?${search.toString()}`)
  if (!res.ok) throw new Error(`Error ${res.status} al cargar el catálogo`)
  return res.json()
}

export async function fetchCiudades() {
  const res = await fetch(`${API_URL}/volquetas/ciudades`)
  if (!res.ok) throw new Error(`Error ${res.status} al cargar ciudades`)
  return res.json()
}

export async function fetchVolqueta(slug) {
  const res = await fetch(`${API_URL}/volquetas/${encodeURIComponent(slug)}`)
  if (res.status === 404) {
    const error = new Error('Volqueta no encontrada')
    error.status = 404
    throw error
  }
  if (!res.ok) throw new Error(`Error ${res.status} al cargar la volqueta`)
  return res.json()
}

export async function fetchConfiguracion() {
  const res = await fetch(`${API_URL}/configuracion`)
  if (!res.ok) throw new Error(`Error ${res.status} al cargar configuración`)
  return res.json()
}

export async function postContacto(payload) {
  const res = await fetch(`${API_URL}/contacto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.ok === false) {
    const error = new Error('No se pudo enviar la solicitud')
    error.status = res.status
    error.errores = data.errores ?? {}
    throw error
  }
  return data
}

export async function postVisita(volquetaId = null) {
  const res = await fetch(`${API_URL}/visitas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ volqueta_id: volquetaId }),
  })
  if (!res.ok) throw new Error(`Error ${res.status} al registrar visita`)
  return res.json()
}

export async function fetchAdminStats(token) {
  const res = await fetch(`${API_URL}/admin/estadisticas/visitas`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) {
    const error = new Error('No autorizado')
    error.status = 401
    throw error
  }
  if (!res.ok) throw new Error(`Error ${res.status} al cargar estadísticas`)
  return res.json()
}

// --- Panel admin (Zona 7) ---
const TOKEN_KEY = 'admin_token'
const ADMIN_KEY = 'admin_info'
export function getAdminToken() {
  return typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null
}

export function setAdminSession({ token, admin }) {
  window.localStorage.setItem(TOKEN_KEY, token)
  window.localStorage.setItem(ADMIN_KEY, JSON.stringify(admin))
}

export function clearAdminSession() {
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(ADMIN_KEY)
}

export function getAdminInfo() {
  try {
    return JSON.parse(window.localStorage.getItem(ADMIN_KEY) ?? 'null')
  } catch {
    return null
  }
}

export async function loginAdmin(email, password) {
  const res = await fetch(`${API_URL}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.ok === false) {
    const error = new Error(data.error || 'No se pudo iniciar sesión')
    error.status = res.status
    throw error
  }
  return data
}

export async function logoutAdmin() {
  try {
    const token = getAdminToken()
    await fetch(`${API_URL}/admin/auth/logout`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  } catch {
    // best-effort
  } finally {
    clearAdminSession()
  }
}

// --- Gestión de volquetas (Zona 8) ---
async function adminFetch(path, opciones = {}) {
  const token = getAdminToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...opciones,
    headers: {
      ...(opciones.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(opciones.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (res.status === 401) {
    const error = new Error('Sesión vencida. Vuelve a entrar.')
    error.status = 401
    throw error
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.ok === false) {
    const error = new Error(data.error || 'Error en la operación')
    error.status = res.status
    error.errores = data.errores ?? {}
    throw error
  }
  return data
}

export const adminVolquetas = {
  listar: () => adminFetch('/admin/volquetas'),
  obtener: (id) => adminFetch(`/admin/volquetas/${id}`),
  crear: (datos) =>
    adminFetch('/admin/volquetas', { method: 'POST', body: JSON.stringify(datos) }),
  actualizar: (id, datos) =>
    adminFetch(`/admin/volquetas/${id}`, { method: 'PATCH', body: JSON.stringify(datos) }),
  eliminar: (id) => adminFetch(`/admin/volquetas/${id}`, { method: 'DELETE' }),
  cambiarEstado: (id, estado) =>
    adminFetch(`/admin/volquetas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    }),
  subirFotos: (id, archivos) => {
    const form = new FormData()
    for (const f of archivos) form.append('fotos', f)
    return adminFetch(`/admin/volquetas/${id}/fotos`, { method: 'POST', body: form })
  },
}

export const adminFotos = {
  eliminar: (id) => adminFetch(`/admin/fotos/${id}`, { method: 'DELETE' }),
  reordenar: (id, orden) =>
    adminFetch(`/admin/fotos/${id}/orden`, {
      method: 'PATCH',
      body: JSON.stringify({ orden }),
    }),
  marcarPortada: (id) => adminFetch(`/admin/fotos/${id}/portada`, { method: 'PATCH' }),
}

export const NOTA_PRECIO_DEFECTO =
  'Dentro del pueblo: tarifa base. Fuera del pueblo el valor depende de la distancia y el tipo de material.'

export function formatoCOP(n) {
  return `$${Number(n).toLocaleString('es-CO')}`
}

// Precio abierto: desde (pueblo) hasta (fuera, según distancia/material).
// Devuelve { linea, rango, nota } o null si no hay precio.
export function textoPrecio(v) {
  const desde = v.precio_desde ?? v.precio_estimado_viaje ?? null
  const hasta = v.precio_hasta ?? null
  if (desde == null) return null
  const nota = v.precio_nota || NOTA_PRECIO_DEFECTO
  if (hasta != null && hasta !== desde) {
    return { linea: `Desde ${formatoCOP(desde)}`, rango: `${formatoCOP(desde)} – ${formatoCOP(hasta)}`, nota }
  }
  return { linea: formatoCOP(desde), rango: formatoCOP(desde), nota }
}

// URL absoluta para fotos (las locales viven en el backend).
export function urlFoto(url) {
  if (!url) return ''
  if (/^https?:\/\//.test(url)) return url
  return `${API_URL}${url}`
}

// --- Opiniones de clientes ---
export async function fetchTestimonios() {
  const res = await fetch(`${API_URL}/testimonios`)
  if (!res.ok) throw new Error('No se pudieron cargar las opiniones')
  return res.json()
}

export async function postTestimonio(payload) {
  const res = await fetch(`${API_URL}/testimonios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.ok === false) {
    const error = new Error('No se pudo enviar tu opinión')
    error.status = res.status
    error.errores = data.errores ?? {}
    throw error
  }
  return data
}

export const adminTestimonios = {
  listar: (filtro = 'todos') => {
    const q = filtro === 'todos' ? '' : `?aprobado=${filtro === 'aprobados' ? 'true' : 'false'}`
    return adminFetch(`/admin/testimonios${q}`)
  },
  aprobar: (id, aprobado) =>
    adminFetch(`/admin/testimonios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ aprobado }),
    }),
  eliminar: (id) => adminFetch(`/admin/testimonios/${id}`, { method: 'DELETE' }),
}

// --- Mensajes y configuración (Zona 9) ---
export const adminMensajes = {
  listar: (filtro = 'todos') => {
    const q = filtro === 'todos' ? '' : `?atendido=${filtro === 'atendidos' ? 'true' : 'false'}`
    return adminFetch(`/admin/mensajes${q}`)
  },
  marcar: (id, atendido) =>
    adminFetch(`/admin/mensajes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ atendido }),
    }),
}

export const adminConfig = {
  obtener: () => adminFetch('/admin/configuracion'),
  guardar: (datos) =>
    adminFetch('/admin/configuracion', { method: 'PATCH', body: JSON.stringify(datos) }),
}
