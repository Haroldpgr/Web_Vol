const express = require('express')
const { prisma } = require('../lib/prisma')

const router = express.Router()

// GET /configuracion — datos públicos de contacto (Zona 4) + contenidos (home).
// Solo campos seguros para el sitio público (nada de admin).
router.get('/', async (req, res, next) => {
  try {
    const [config, contenidos] = await Promise.all([
      prisma.configuracion_sitio.findFirst({
        select: {
          nombre_empresa: true,
          telefono_contacto: true,
          whatsapp: true,
          correo_contacto: true,
          redes_sociales: true,
        },
      }),
      prisma.contenido_sitio.findMany({ select: { clave: true, valor: true } }),
    ])
    const dict = {}
    for (const c of contenidos) dict[c.clave] = c.valor
    res.json({ data: { ...(config ?? {}), contenidos: dict } })
  } catch (err) {
    next(err)
  }
})

module.exports = router
