const multer = require('multer')
const express = require('express')
const { prisma } = require('../lib/prisma')
const { borrarImagenLocal, guardarImagen } = require('../lib/storage')

const router = express.Router()

const ESTADOS = ['disponible', 'ocupada', 'mantenimiento']

function slugify(texto) {
  const base = String(texto || '')
    .normalize('NFD')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return base || 'volqueta'
}

async function slugUnico(base, excluirId = null) {
  let slug = base
  let i = 2
  for (;;) {
    const existe = await prisma.volqueta.findUnique({ where: { slug }, select: { id: true } })
    if (!existe || (excluirId !== null && existe.id === excluirId)) return slug
    slug = `${base}-${i}`
    i += 1
  }
}

function numONull(v) {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined // undefined = inválido
}

function extraerCampos(body) {
  const errores = {}
  const datos = {}

  const texto = (k) => {
    if (body[k] === undefined) return undefined
    if (body[k] === null) return null
    return String(body[k]).slice(0, 500)
  }

  if (body.titulo !== undefined) {
    const t = String(body.titulo).trim()
    if (t === '') errores.titulo = 'El título es obligatorio.'
    else datos.titulo = t.slice(0, 160)
  }
  if (body.descripcion !== undefined) {
    datos.descripcion =
      body.descripcion === null || body.descripcion === '' ? null : String(body.descripcion).slice(0, 5000)
  }
  for (const k of ['capacidad_m3', 'capacidad_toneladas', 'precio_estimado_viaje']) {
    if (body[k] !== undefined) {
      const n = numONull(body[k])
      if (n === undefined) errores[k] = 'Debe ser un número válido.'
      else datos[k] = n
    }
  }
  for (const k of ['moneda', 'placa', 'modelo_vehiculo', 'ciudad_base', 'departamento_base']) {
    const t = texto(k)
    if (t !== undefined) datos[k] = t === '' ? null : t
  }
  for (const k of ['latitud', 'longitud']) {
    if (body[k] !== undefined) {
      if (body[k] === null || body[k] === '') datos[k] = null
      else {
        const n = Number(body[k])
        if (!Number.isFinite(n)) errores[k] = 'Coordenada inválida.'
        else datos[k] = n
      }
    }
  }
  if (body.estado !== undefined) {
    if (!ESTADOS.includes(body.estado)) errores.estado = 'Estado inválido.'
    else datos.estado = body.estado
  }
  if (body.destacado !== undefined) {
    datos.destacado = body.destacado === true || body.destacado === 'true'
  }
  return { datos, errores }
}

const incluirFicha = {
  fotos: { orderBy: { orden: 'asc' } },
  caracteristicas: { orderBy: { id: 'asc' } },
}

// GET /admin/volquetas — todas, incluso mantenimiento
router.get('/', async (req, res, next) => {
  try {
    const volquetas = await prisma.volqueta.findMany({
      orderBy: { actualizado_en: 'desc' },
      include: {
        fotos: { orderBy: { orden: 'asc' } },
        _count: { select: { leads: true } },
      },
    })
    const data = volquetas.map((v) => {
      const portada = v.fotos.find((f) => f.es_portada) ?? v.fotos[0] ?? null
      return {
        ...v,
        foto_portada: portada ? portada.url_imagen : null,
        total_fotos: v.fotos.length,
      }
    })
    res.json({ data })
  } catch (err) {
    next(err)
  }
})

// POST /admin/volquetas — crear (slug automático único)
router.post('/', async (req, res, next) => {
  try {
    const { datos, errores } = extraerCampos(req.body ?? {})
    if (!datos.titulo) errores.titulo = 'El título es obligatorio.'
    if (Object.keys(errores).length > 0) {
      return res.status(400).json({ ok: false, errores })
    }
    const slug = await slugUnico(slugify(datos.titulo))
    const { caracteristicas } = req.body ?? {}
    const creados = Array.isArray(caracteristicas)
      ? caracteristicas
          .filter((c) => c && (c.nombre || c.valor))
          .map((c) => ({ nombre: String(c.nombre || '').slice(0, 120), valor: String(c.valor || '').slice(0, 500) }))
      : undefined
    const volqueta = await prisma.volqueta.create({
      data: {
        ...datos,
        slug,
        usuario_admin_id: req.admin?.id ?? null,
        ...(creados ? { caracteristicas: { create: creados } } : {}),
      },
      include: incluirFicha,
    })
    return res.status(201).json({ ok: true, data: volqueta })
  } catch (err) {
    return next(err)
  }
})

// GET /admin/volquetas/:id — ficha completa
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'ID inválido.' })
    const volqueta = await prisma.volqueta.findUnique({ where: { id }, include: incluirFicha })
    if (!volqueta) return res.status(404).json({ error: 'Volqueta no encontrada.' })
    return res.json({ data: volqueta })
  } catch (err) {
    return next(err)
  }
})

// PATCH /admin/volquetas/:id — editar (regenera slug si cambió el título)
router.patch('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ ok: false, error: 'ID inválido.' })
    const actual = await prisma.volqueta.findUnique({ where: { id } })
    if (!actual) return res.status(404).json({ ok: false, error: 'Volqueta no encontrada.' })

    const { datos, errores } = extraerCampos(req.body ?? {})
    if (Object.keys(errores).length > 0) {
      return res.status(400).json({ ok: false, errores })
    }
    if (datos.titulo && datos.titulo !== actual.titulo) {
      datos.slug = await slugUnico(slugify(datos.titulo), id)
    }
    const { caracteristicas } = req.body ?? {}
    if (caracteristicas !== undefined) {
      await prisma.caracteristica_volqueta.deleteMany({ where: { volqueta_id: id } })
      if (Array.isArray(caracteristicas) && caracteristicas.length > 0) {
        await prisma.caracteristica_volqueta.createMany({
          data: caracteristicas
            .filter((c) => c && (c.nombre || c.valor))
            .map((c) => ({
              volqueta_id: id,
              nombre: String(c.nombre || '').slice(0, 120),
              valor: String(c.valor || '').slice(0, 500),
            })),
        })
      }
    }
    const volqueta = await prisma.volqueta.update({
      where: { id },
      data: datos,
      include: incluirFicha,
    })
    return res.json({ ok: true, data: volqueta })
  } catch (err) {
    return next(err)
  }
})

// DELETE /admin/volquetas/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ ok: false, error: 'ID inválido.' })
    const actual = await prisma.volqueta.findUnique({
      where: { id },
      include: { fotos: true },
    })
    if (!actual) return res.status(404).json({ ok: false, error: 'Volqueta no encontrada.' })
    await prisma.volqueta.delete({ where: { id } })
    for (const f of actual.fotos) {
      await borrarImagenLocal(f.url_imagen)
    }
    return res.json({ ok: true })
  } catch (err) {
    return next(err)
  }
})

const subir = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Solo se permiten imágenes JPG o PNG.'))
  },
})

// POST /admin/volquetas/:id/fotos — subida (multipart, campo `fotos`)
router.post('/:id/fotos', subir.array('fotos', 10), async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ ok: false, error: 'ID inválido.' })
    const volqueta = await prisma.volqueta.findUnique({
      where: { id },
      include: { fotos: true },
    })
    if (!volqueta) return res.status(404).json({ ok: false, error: 'Volqueta no encontrada.' })
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ ok: false, error: 'Adjunta al menos una imagen.' })
    }
    const base = volqueta.fotos.length > 0 ? Math.max(...volqueta.fotos.map((f) => f.orden)) + 1 : 0
    const hayPortada = volqueta.fotos.some((f) => f.es_portada)
    const creadas = []
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i]
      const { url } = await guardarImagen({
        buffer: file.buffer,
        nombreOriginal: file.originalname,
        mimetype: file.mimetype,
      })
      creadas.push(
        await prisma.foto_volqueta.create({
          data: {
            volqueta_id: id,
            url_imagen: url,
            orden: base + i,
            es_portada: !hayPortada && i === 0,
          },
        }),
      )
    }
    return res.status(201).json({ ok: true, data: creadas })
  } catch (err) {
    return next(err)
  }
})

module.exports = router
