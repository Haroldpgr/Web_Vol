const express = require('express')
const { prisma } = require('../lib/prisma')

const router = express.Router()

async function leerOCrear() {
  let config = await prisma.configuracion_sitio.findFirst()
  if (!config) {
    config = await prisma.configuracion_sitio.create({
      data: { nombre_empresa: 'Volquetas Aguazul' },
    })
  }
  return config
}

// GET /admin/configuracion — datos generales del sitio + contenidos
router.get('/', async (req, res, next) => {
  try {
    const [config, contenidos] = await Promise.all([
      leerOCrear(),
      prisma.contenido_sitio.findMany({ select: { clave: true, valor: true } }),
    ])
    const dict = {}
    for (const c of contenidos) dict[c.clave] = c.valor
    res.json({ data: { ...config, contenidos: dict } })
  } catch (err) {
    next(err)
  }
})

const CLAVES_CONTENIDO = [
  'hero_titulo',
  'hero_resaltado',
  'hero_subtitulo',
  'hero_imagen',
  'marquesina',
  'cinta2',
]

// PATCH /admin/configuracion — editar sin tocar código
router.patch('/', async (req, res, next) => {
  try {
    const {
      nombre_empresa,
      telefono_contacto,
      whatsapp,
      correo_contacto,
      redes_sociales,
      meta_descripcion_default,
      nombre_contacto,
      nombre_contacto_2,
      whatsapp_2,
      contenidos,
    } = req.body ?? {}

    const errores = {}
    const validaWa = (v, campo) => {
      if (v !== undefined && v !== null && v !== '') {
        if (String(v).replace(/\D/g, '').length < 10) errores[campo] = 'Debe tener al menos 10 dígitos.'
      }
    }
    validaWa(whatsapp, 'whatsapp')
    validaWa(whatsapp_2, 'whatsapp_2')
    if (correo_contacto !== undefined && correo_contacto !== null && correo_contacto !== '') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(correo_contacto))) {
        errores.correo_contacto = 'Correo inválido.'
      }
    }
    if (Object.keys(errores).length > 0) {
      return res.status(400).json({ ok: false, errores })
    }

    const actual = await leerOCrear()
    const datos = {}
    if (nombre_empresa !== undefined) datos.nombre_empresa = nombre_empresa || null
    if (telefono_contacto !== undefined) datos.telefono_contacto = telefono_contacto || null
    if (whatsapp !== undefined) {
      datos.whatsapp = whatsapp ? String(whatsapp).replace(/\D/g, '') : null
    }
    if (correo_contacto !== undefined) datos.correo_contacto = correo_contacto || null
    if (redes_sociales !== undefined) {
      datos.redes_sociales =
        redes_sociales && typeof redes_sociales === 'object' ? redes_sociales : null
    }
    if (meta_descripcion_default !== undefined) {
      datos.meta_descripcion_default = meta_descripcion_default || null
    }
    if (nombre_contacto !== undefined) datos.nombre_contacto = nombre_contacto || null
    if (nombre_contacto_2 !== undefined) datos.nombre_contacto_2 = nombre_contacto_2 || null
    if (whatsapp_2 !== undefined) {
      datos.whatsapp_2 = whatsapp_2 ? String(whatsapp_2).replace(/\D/g, '') : null
    }

    const config = await prisma.configuracion_sitio.update({
      where: { id: actual.id },
      data: datos,
    })

    // Contenidos del home (solo claves permitidas, máx. 2000 caracteres).
    if (contenidos !== undefined && contenidos !== null && typeof contenidos === 'object') {
      for (const clave of CLAVES_CONTENIDO) {
        if (contenidos[clave] !== undefined) {
          const valor = String(contenidos[clave] ?? '').slice(0, 2000)
          await prisma.contenido_sitio.upsert({
            where: { clave },
            update: { valor },
            create: { clave, valor },
          })
        }
      }
    }

    return res.json({ ok: true, data: config })
  } catch (err) {
    return next(err)
  }
})

module.exports = router
