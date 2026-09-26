const crypto = require('crypto')
const { prisma } = require('./prisma')

// Ventana anti-inflado: mismo visitante + mismo objetivo no cuenta dos veces.
const VENTANA_MINUTOS = 30

function hashIp(ip) {
  return crypto.createHash('sha256').update(ip || 'unknown').digest('hex')
}

function extraerIp(req) {
  const fwd = req.headers['x-forwarded-for']
  const raw =
    typeof fwd === 'string' && fwd.length > 0 ? fwd.split(',')[0] : req.socket.remoteAddress
  return (raw || 'unknown').trim()
}

function extraerContexto(req) {
  return {
    ip: extraerIp(req),
    userAgent: (req.headers['user-agent'] || '').slice(0, 300) || null,
    referer: (req.headers.referer || req.headers.referrer || '').slice(0, 300) || null,
  }
}

// Registra una visita con deduplicación de 30 min y recalcula el contador.
// volquetaId null = visita general del sitio (portada).
async function registrarVisita({ ip, userAgent, referer }, volquetaId = null) {
  const objetivo = volquetaId ?? null
  const desde = new Date(Date.now() - VENTANA_MINUTOS * 60 * 1000)

  const reciente = await prisma.visita_evento.findFirst({
    where: {
      volqueta_id: objetivo,
      ip_hash: hashIp(ip),
      creado_en: { gt: desde },
    },
    select: { id: true },
  })
  if (reciente) return { registrada: false, motivo: 'duplicada-30min' }

  await prisma.visita_evento.create({
    data: {
      volqueta_id: objetivo,
      ip_hash: hashIp(ip),
      user_agent: userAgent ?? null,
      referer: referer ?? null,
    },
  })
  const total = await recalcularContador(objetivo)
  return { registrada: true, total }
}

async function recalcularContador(volquetaId = null) {
  const objetivo = volquetaId ?? null
  const total = await prisma.visita_evento.count({ where: { volqueta_id: objetivo } })
  if (objetivo === null) {
    const global = await prisma.contador_visitas.findFirst({ where: { volqueta_id: null } })
    if (global) {
      await prisma.contador_visitas.update({
        where: { id: global.id },
        data: { total_visitas: total },
      })
    } else {
      await prisma.contador_visitas.create({ data: { total_visitas: total } })
    }
  } else {
    await prisma.contador_visitas.upsert({
      where: { volqueta_id: objetivo },
      update: { total_visitas: total },
      create: { volqueta_id: objetivo, total_visitas: total },
    })
  }
  return total
}

module.exports = {
  VENTANA_MINUTOS,
  hashIp,
  extraerIp,
  extraerContexto,
  registrarVisita,
  recalcularContador,
}
