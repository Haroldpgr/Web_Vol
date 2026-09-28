const express = require('express')
const { prisma } = require('../lib/prisma')
const { parsearDispositivo } = require('../lib/dispositivo')

const router = express.Router()

// GET /admin/estadisticas/visitas — total + top 5 + últimas visitas con dispositivo.
router.get('/visitas', async (req, res, next) => {
  try {
    const [global, top, recientes] = await Promise.all([
      prisma.contador_visitas.findFirst({ where: { volqueta_id: null } }),
      prisma.contador_visitas.findMany({
        where: { volqueta_id: { not: null } },
        orderBy: { total_visitas: 'desc' },
        take: 5,
        include: {
          volqueta: { select: { id: true, titulo: true, slug: true, estado: true } },
        },
      }),
      prisma.visita_evento.findMany({
        orderBy: { creado_en: 'desc' },
        take: 10,
        include: { volqueta: { select: { titulo: true, slug: true } } },
      }),
    ])
    res.json({
      data: {
        total_sitio: global?.total_visitas ?? 0,
        top: top.map((t) => ({
          volqueta_id: t.volqueta_id,
          total_visitas: t.total_visitas,
          volqueta: t.volqueta,
        })),
        recientes: recientes.map((r) => ({
          id: r.id,
          creado_en: r.creado_en,
          dispositivo: parsearDispositivo(r.user_agent),
          pagina: r.volqueta ? `/volquetas/${r.volqueta.slug}` : '/',
          titulo: r.volqueta?.titulo ?? 'Portada',
        })),
      },
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
