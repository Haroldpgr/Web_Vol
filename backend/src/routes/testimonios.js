const express = require('express')
const { prisma } = require('../lib/prisma')

const router = express.Router()

// GET /testimonios — opiniones aprobadas, recientes primero
router.get('/', async (req, res, next) => {
  try {
    const testimonios = await prisma.testimonio.findMany({
      where: { aprobado: true },
      orderBy: { creado_en: 'desc' },
      take: 12,
    })
    res.json({ data: testimonios })
  } catch (err) {
    next(err)
  }
})

// POST /testimonios — dejar opinión (queda pendiente de aprobación).
// Honeypot `empresa`: lleno = bot, éxito silencioso.
router.post('/', async (req, res, next) => {
  try {
    const { nombre, mensaje, calificacion, empresa } = req.body ?? {}
    if (typeof empresa === 'string' && empresa.trim() !== '') {
      return res.json({ ok: true })
    }
    const errores = {}
    if (!nombre || String(nombre).trim() === '') errores.nombre = 'Tu nombre es obligatorio.'
    if (!mensaje || String(mensaje).trim().length < 10) {
      errores.mensaje = 'Cuéntanos tu experiencia (mín. 10 caracteres).'
    }
    let calif = 5
    if (calificacion !== undefined && calificacion !== null && calificacion !== '') {
      calif = Number(calificacion)
      if (!Number.isInteger(calif) || calif < 1 || calif > 5) {
        errores.calificacion = 'Calificación de 1 a 5.'
      }
    }
    if (Object.keys(errores).length > 0) {
      return res.status(400).json({ ok: false, errores })
    }
    const t = await prisma.testimonio.create({
      data: {
        nombre: String(nombre).trim().slice(0, 80),
        mensaje: String(mensaje).trim().slice(0, 600),
        calificacion: calif,
      },
    })
    return res.status(201).json({ ok: true, id: t.id })
  } catch (err) {
    return next(err)
  }
})

module.exports = router
