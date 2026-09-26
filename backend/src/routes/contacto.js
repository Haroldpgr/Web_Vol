const express = require('express')
const { prisma } = require('../lib/prisma')
const { notificarLead } = require('../lib/mailer')

const router = express.Router()

function esEmailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// POST /contacto — cotización escrita, canal secundario (Zona 5).
// Body: { nombre, telefono, email?, mensaje, volqueta_id?, empresa? }
// `empresa` es el honeypot: si viene lleno, se acepta en silencio sin guardar.
router.post('/', async (req, res, next) => {
  try {
    const { nombre, telefono, email, mensaje, volqueta_id, empresa } = req.body ?? {}

    // Honeypot: bots lo llenan; se descarta en silencio con éxito aparente.
    if (typeof empresa === 'string' && empresa.trim() !== '') {
      return res.json({ ok: true })
    }

    const errores = {}
    if (!nombre || String(nombre).trim() === '') errores.nombre = 'El nombre es obligatorio.'
    if (!telefono || String(telefono).trim().length < 7)
      errores.telefono = 'Un teléfono válido es obligatorio (mín. 7 dígitos).'
    if (!mensaje || String(mensaje).trim() === '') errores.mensaje = 'Cuéntanos qué necesitas.'
    if (email && String(email).trim() !== '' && !esEmailValido(String(email).trim())) {
      errores.email = 'El correo no parece válido.'
    }

    let volqueta = null
    let volquetaId = null
    if (volqueta_id !== undefined && volqueta_id !== null && volqueta_id !== '') {
      volquetaId = Number(volqueta_id)
      if (!Number.isInteger(volquetaId)) {
        errores.volqueta_id = 'Volqueta inválida.'
      } else {
        volqueta = await prisma.volqueta.findUnique({ where: { id: volquetaId } })
        if (!volqueta) errores.volqueta_id = 'La volqueta indicada no existe.'
      }
    }

    if (Object.keys(errores).length > 0) {
      return res.status(400).json({ ok: false, errores })
    }

    const lead = await prisma.contacto_lead.create({
      data: {
        volqueta_id: volquetaId,
        nombre: String(nombre).trim().slice(0, 120),
        telefono: String(telefono).trim().slice(0, 40),
        email: email && String(email).trim() !== '' ? String(email).trim().slice(0, 160) : null,
        mensaje: String(mensaje).trim().slice(0, 2000),
      },
    })

    // Notificación al dueño (no bloquea la respuesta).
    const config = await prisma.configuracion_sitio.findFirst({
      select: { correo_contacto: true },
    })
    setImmediate(() => {
      notificarLead({ destino: config?.correo_contacto, lead, volqueta }).catch(() => {})
    })

    return res.status(201).json({ ok: true, id: lead.id })
  } catch (err) {
    return next(err)
  }
})

module.exports = router
