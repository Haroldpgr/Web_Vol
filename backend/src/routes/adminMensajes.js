const express = require('express')
const { prisma } = require('../lib/prisma')

const router = express.Router()

// GET /admin/mensajes — cotizaciones, nuevas primero.
// ?atendido=true|false (por defecto todas).
router.get('/', async (req, res, next) => {
  try {
    const { atendido } = req.query
    const where = {}
    if (atendido === 'true') where.atendido = true
    else if (atendido === 'false') where.atendido = false

    const [totalSinAtender, mensajes] = await Promise.all([
      prisma.contacto_lead.count({ where: { atendido: false } }),
      prisma.contacto_lead.findMany({
        where,
        orderBy: { creado_en: 'desc' },
        include: {
          volqueta: { select: { id: true, titulo: true, slug: true } },
        },
      }),
    ])
    res.json({ data: mensajes, totalSinAtender })
  } catch (err) {
    next(err)
  }
})

// PATCH /admin/mensajes/:id — { atendido: boolean }
router.patch('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ ok: false, error: 'ID inválido.' })
    const { atendido } = req.body ?? {}
    if (typeof atendido !== 'boolean') {
      return res.status(400).json({ ok: false, error: 'Envía { atendido: true|false }.' })
    }
    const mensaje = await prisma.contacto_lead.findUnique({ where: { id } })
    if (!mensaje) return res.status(404).json({ ok: false, error: 'Mensaje no encontrado.' })
    const actualizado = await prisma.contacto_lead.update({
      where: { id },
      data: { atendido },
      include: { volqueta: { select: { id: true, titulo: true, slug: true } } },
    })
    return res.json({ ok: true, data: actualizado })
  } catch (err) {
    return next(err)
  }
})

module.exports = router
