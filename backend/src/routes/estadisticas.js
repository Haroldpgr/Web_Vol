const express = require('express')
const { prisma } = require('../lib/prisma')

const router = express.Router()

// GET /admin/estadisticas/visitas — total del sitio + top 5 (Zona 6, protegido).
router.get('/visitas', async (req, res, next) => {
  try {
    const global = await prisma.contador_visitas.findFirst({ where: { volqueta_id: null } })
    const top = await prisma.contador_visitas.findMany({
      where: { volqueta_id: { not: null } },
      orderBy: { total_visitas: 'desc' },
      take: 5,
      include: {
        volqueta: { select: { id: true, titulo: true, slug: true, estado: true } },
      },
    })
    res.json({
      data: {
        total_sitio: global?.total_visitas ?? 0,
        top: top.map((t) => ({
          volqueta_id: t.volqueta_id,
          total_visitas: t.total_visitas,
          volqueta: t.volqueta,
        })),
      },
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
