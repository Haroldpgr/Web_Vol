const jwt = require('jsonwebtoken')

function secreto() {
  return process.env.ADMIN_JWT_SECRET || 'dev-secret-cambiar-en-produccion'
}

// Protege endpoints /admin/* exigiendo JWT de sesión (login en Zona 7).
function adminAuth(req, res, next) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'No autorizado. Inicia sesión.' })
  }
  try {
    req.admin = jwt.verify(token, secreto())
    return next()
  } catch {
    return res.status(401).json({ error: 'Sesión inválida o vencida.' })
  }
}

module.exports = { adminAuth, secreto }
