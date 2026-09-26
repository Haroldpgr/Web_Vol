const bcrypt = require('bcryptjs')
const express = require('express')
const jwt = require('jsonwebtoken')
const { secreto } = require('../middleware/adminAuth')
const { prisma } = require('../lib/prisma')
const { extraerIp } = require('../lib/visitas')

const router = express.Router()

// Límite de intentos fallidos (en memoria; en producción usar Redis/DB).
const INTENTOS_MAX = 5
const VENTANA_MS = 15 * 60 * 1000
const BLOQUEO_MS = 15 * 60 * 1000
const intentos = new Map() // clave -> { fallos, primero, bloqueadoHasta }

function claveIntento(req, email) {
  return `${extraerIp(req)}|${String(email || '').toLowerCase().trim()}`
}

function obtenerEstado(key) {
  const ahora = Date.now()
  const actual = intentos.get(key)
  if (!actual) return { fallos: 0, primero: ahora, bloqueadoHasta: 0 }
  if (ahora - actual.primero > VENTANA_MS) {
    return { fallos: 0, primero: ahora, bloqueadoHasta: 0 }
  }
  return actual
}

function registrarFallo(key) {
  const estado = obtenerEstado(key)
  estado.fallos += 1
  if (estado.fallos >= INTENTOS_MAX) {
    estado.bloqueadoHasta = Date.now() + BLOQUEO_MS
  }
  intentos.set(key, estado)
  return estado
}

// POST /admin/auth/login — sesión del panel (Zona 7)
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {}
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Email y contraseña son obligatorios.' })
    }

    const key = claveIntento(req, email)
    const estado = obtenerEstado(key)
    if (estado.bloqueadoHasta > Date.now()) {
      const minutos = Math.ceil((estado.bloqueadoHasta - Date.now()) / 60000)
      return res.status(429).json({
        ok: false,
        error: `Demasiados intentos fallidos. Reintenta en ${minutos} min.`,
      })
    }

    const admin = await prisma.usuario_admin.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    })
    // Hash válido de relleno para comparar cuando el email no existe
    // (mismo tiempo de respuesta, no revela usuarios).
    const DUMMY_HASH = '$2b$10$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    const valida = await bcrypt.compare(String(password), admin?.password_hash ?? DUMMY_HASH)

    if (!admin || !valida) {
      registrarFallo(key)
      return res.status(401).json({ ok: false, error: 'Credenciales inválidas.' })
    }

    intentos.delete(key)
    const token = jwt.sign(
      { id: admin.id, email: admin.email, rol: admin.rol, nombre: admin.nombre },
      secreto(),
      { expiresIn: '8h' },
    )
    return res.json({
      ok: true,
      token,
      admin: { id: admin.id, nombre: admin.nombre, email: admin.email, rol: admin.rol },
    })
  } catch (err) {
    return next(err)
  }
})

// POST /admin/auth/logout — JWT sin estado: el cliente descarta el token.
router.post('/logout', (req, res) => {
  return res.json({ ok: true })
})

module.exports = router
