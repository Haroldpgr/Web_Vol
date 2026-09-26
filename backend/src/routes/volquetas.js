const express = require('express')
const { prisma } = require('../lib/prisma')
const { extraerContexto, registrarVisita } = require('../lib/visitas')

const router = express.Router()

function parseNumberOrUndefined(value) {
  if (value === undefined || value === null || value === '') return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

// Registro de visita con deduplicación (Zona 6, vía lib/visitas).
// No bloquea ni rompe la respuesta si falla.
function registrarVisitaNoBloqueante(req, volquetaId) {
  const ctx = extraerContexto(req)
  setImmediate(() => {
    registrarVisita(ctx, volquetaId).catch(() => {
      // visitas best-effort: nunca rompen la ficha
    })
  })
}

// GET /volquetas/ciudades — ciudades base con oferta activa (para el filtro)
router.get('/ciudades', async (req, res, next) => {
  try {
    const rows = await prisma.volqueta.findMany({
      where: {
        estado: { in: ['disponible', 'ocupada'] },
        ciudad_base: { not: null },
      },
      select: { ciudad_base: true },
      distinct: ['ciudad_base'],
      orderBy: { ciudad_base: 'asc' },
    })
    res.json({ data: rows.map((r) => r.ciudad_base).filter(Boolean) })
  } catch (err) {
    next(err)
  }
})

// GET /volquetas — catálogo público (Zona 3)
// Solo disponible/ocupada, salvo ?incluir_mantenimiento=true (explícito).
// Filtros: ?ciudad_base=&capacidad_min_m3=&capacidad_max_m3=&q=
// Orden: destacados primero por defecto, salvo ?destacados_primero=false
router.get('/', async (req, res, next) => {
  try {
    const {
      ciudad_base,
      capacidad_min_m3,
      capacidad_max_m3,
      q,
      incluir_mantenimiento,
      destacados_primero,
    } = req.query

    const estados =
      incluir_mantenimiento === 'true'
        ? ['disponible', 'ocupada', 'mantenimiento']
        : ['disponible', 'ocupada']

    const where = { estado: { in: estados } }

    if (typeof ciudad_base === 'string' && ciudad_base.trim() !== '') {
      where.ciudad_base = { contains: ciudad_base.trim(), mode: 'insensitive' }
    }

    const min = parseNumberOrUndefined(capacidad_min_m3)
    const max = parseNumberOrUndefined(capacidad_max_m3)
    if (min !== undefined || max !== undefined) {
      where.capacidad_m3 = {}
      if (min !== undefined) where.capacidad_m3.gte = min
      if (max !== undefined) where.capacidad_m3.lte = max
    }

    if (typeof q === 'string' && q.trim() !== '') {
      const term = q.trim()
      where.OR = [
        { titulo: { contains: term, mode: 'insensitive' } },
        { descripcion: { contains: term, mode: 'insensitive' } },
        { modelo_vehiculo: { contains: term, mode: 'insensitive' } },
      ]
    }

    const orderBy = []
    if (destacados_primero !== 'false') orderBy.push({ destacado: 'desc' })
    orderBy.push({ creado_en: 'desc' })

    const [total, volquetas] = await Promise.all([
      prisma.volqueta.count({ where }),
      prisma.volqueta.findMany({
        where,
        orderBy,
        select: {
          id: true,
          titulo: true,
          slug: true,
          capacidad_m3: true,
          capacidad_toneladas: true,
          precio_estimado_viaje: true,
          moneda: true,
          modelo_vehiculo: true,
          ciudad_base: true,
          departamento_base: true,
          estado: true,
          destacado: true,
          fotos: { orderBy: { orden: 'asc' } },
        },
      }),
    ])

    const data = volquetas.map((v) => {
      const { fotos, ...resto } = v
      const portada = fotos.find((f) => f.es_portada) ?? fotos[0] ?? null
      return {
        ...resto,
        foto_portada: portada ? portada.url_imagen : null,
        total_fotos: fotos.length,
      }
    })

    res.json({ data, total })
  } catch (err) {
    next(err)
  }
})

// GET /volquetas/:slug — ficha completa (Zona 4) + registra la visita
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params
    const volqueta = await prisma.volqueta.findUnique({
      where: { slug },
      include: {
        fotos: { orderBy: { orden: 'asc' } },
        caracteristicas: { orderBy: { id: 'asc' } },
      },
    })
    if (!volqueta) {
      return res.status(404).json({ error: 'Volqueta no encontrada' })
    }
    registrarVisitaNoBloqueante(req, volqueta.id)
    res.json({ data: volqueta })
  } catch (err) {
    next(err)
  }
})

module.exports = router
