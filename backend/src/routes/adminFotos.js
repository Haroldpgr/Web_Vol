const express = require('express')
const { prisma } = require('../lib/prisma')
const { borrarImagenLocal } = require('../lib/storage')

const router = express.Router()

async function normalizarOrden(volquetaId) {
  const fotos = await prisma.foto_volqueta.findMany({
    where: { volqueta_id: volquetaId },
    orderBy: [{ orden: 'asc' }, { id: 'asc' }],
  })
  for (let i = 0; i < fotos.length; i++) {
    if (fotos[i].orden !== i) {
      await prisma.foto_volqueta.update({ where: { id: fotos[i].id }, data: { orden: i } })
    }
  }
}

// DELETE /admin/fotos/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ ok: false, error: 'ID inválido.' })
    const foto = await prisma.foto_volqueta.findUnique({ where: { id } })
    if (!foto) return res.status(404).json({ ok: false, error: 'Foto no encontrada.' })
    await prisma.foto_volqueta.delete({ where: { id } })
    await borrarImagenLocal(foto.url_imagen)
    if (foto.es_portada) {
      const siguiente = await prisma.foto_volqueta.findFirst({
        where: { volqueta_id: foto.volqueta_id },
        orderBy: { orden: 'asc' },
      })
      if (siguiente) {
        await prisma.foto_volqueta.update({
          where: { id: siguiente.id },
          data: { es_portada: true },
        })
      }
    }
    await normalizarOrden(foto.volqueta_id)
    return res.json({ ok: true })
  } catch (err) {
    return next(err)
  }
})

// PATCH /admin/fotos/:id/orden — { orden: number } y se renumeran las hermanas
router.patch('/:id/orden', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const { orden } = req.body ?? {}
    if (!Number.isInteger(id) || !Number.isInteger(orden)) {
      return res.status(400).json({ ok: false, error: 'ID u orden inválidos.' })
    }
    const foto = await prisma.foto_volqueta.findUnique({ where: { id } })
    if (!foto) return res.status(404).json({ ok: false, error: 'Foto no encontrada.' })
    await prisma.foto_volqueta.update({ where: { id }, data: { orden } })
    await normalizarOrden(foto.volqueta_id)
    const fotos = await prisma.foto_volqueta.findMany({
      where: { volqueta_id: foto.volqueta_id },
      orderBy: { orden: 'asc' },
    })
    return res.json({ ok: true, data: fotos })
  } catch (err) {
    return next(err)
  }
})

// PATCH /admin/fotos/:id/portada — la marca como portada única
router.patch('/:id/portada', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ ok: false, error: 'ID inválido.' })
    const foto = await prisma.foto_volqueta.findUnique({ where: { id } })
    if (!foto) return res.status(404).json({ ok: false, error: 'Foto no encontrada.' })
    await prisma.$transaction([
      prisma.foto_volqueta.updateMany({
        where: { volqueta_id: foto.volqueta_id },
        data: { es_portada: false },
      }),
      prisma.foto_volqueta.update({ where: { id }, data: { es_portada: true } }),
    ])
    return res.json({ ok: true })
  } catch (err) {
    return next(err)
  }
})

module.exports = router
