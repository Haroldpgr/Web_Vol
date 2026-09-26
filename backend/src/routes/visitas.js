const express = require('express')
const { prisma } = require('../lib/prisma')
const { extraerContexto, registrarVisita } = require('../lib/visitas')

const router = express.Router()

// POST /visitas — registra una visita general (portada) o de una volqueta.
// Body: { volqueta_id?: number|null }. Con deduplicación de 30 min.
router.post('/', async (req, res, next) => {
  try {
    const { volqueta_id } = req.body ?? {}
    let objetivo = null
    if (volqueta_id !== undefined && volqueta_id !== null) {
      const id = Number(volqueta_id)
      if (!Number.isInteger(id)) {
        return res.status(400).json({ ok: false, error: 'volqueta_id inválida.' })
      }
      const existe = await prisma.volqueta.findUnique({ where: { id }, select: { id: true } })
      if (!existe) {
        return res.status(400).json({ ok: false, error: 'La volqueta indicada no existe.' })
      }
      objetivo = id
    }
    const resultado = await registrarVisita(extraerContexto(req), objetivo)
    return res.json({ ok: true, ...resultado })
  } catch (err) {
    return next(err)
  }
})

module.exports = router
