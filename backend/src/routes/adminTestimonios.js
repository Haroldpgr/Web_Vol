const express = require('express')
const { prisma } = require('../lib/prisma')

const router = express.Router()

// GET /admin/testimonios — ?aprobado=true|false (por defecto pendientes primero todas)
router.get('/', async (req, res, next) => {
  try {
    const { aprobado } = req.query
    const where = {}
    if (aprobado === 'true') where.aprobado = true
    else if (aprobado === 'false') where.aprobado = false
    const [pendientes, testimonios] = await Promise.all([
      prisma.testimonio.count({ where: { aprobado: false } }),
      prisma.testimonio.findMany({
        where,
        orderBy: [{ aprobado: 'asc' }, { creado_en: 'desc' }],
      }),
    ])
    res.json({ data: testimonios, pendientes })
  } catch (err) {
    next(err)
  }
})

// PATCH /admin/testimonios/:id — { aprobado: boolean }
router.patch('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ ok: false, error: 'ID inválido.' })
    const { aprobado } = req.body ?? {}
    if (typeof aprobado !== 'boolean') {
      return res.status(400).json({ ok: false, error: 'Envía { aprobado: true|false }.' })
    }
    const existe = await prisma.testimonio.findUnique({ where: { id } })
    if (!existe) return res.status(404).json({ ok: false, error: 'No encontrado.' })
    const t = await prisma.testimonio.update({ where: { id }, data: { aprobado } })
    return res.json({ ok: true, data: t })
  } catch (err) {
    return next(err)
  }
})

// DELETE /admin/testimonios/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ ok: false, error: 'ID inválido.' })
    await prisma.testimonio.delete({ where: { id } }).catch(() => null)
    return res.json({ ok: true })
  } catch (err) {
    return next(err)
  }
})

module.exports = router
