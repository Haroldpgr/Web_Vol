const nodemailer = require('nodemailer')

let transporter = null

function getTransporter() {
  if (transporter) return transporter
  if (!process.env.SMTP_HOST) return null
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  })
  return transporter
}

// Notificación al dueño (best-effort: si no hay SMTP, solo registra en consola).
async function notificarLead({ destino, lead, volqueta }) {
  const asunto = `Nueva cotización web — ${lead.nombre}`
  const texto = [
    `Nombre: ${lead.nombre}`,
    `Teléfono: ${lead.telefono}`,
    lead.email ? `Email: ${lead.email}` : null,
    volqueta ? `Volqueta: ${volqueta.titulo} (${volqueta.slug})` : 'Volqueta: general',
    '',
    'Mensaje:',
    lead.mensaje,
  ]
    .filter(Boolean)
    .join('\n')

  const tx = getTransporter()
  if (!tx || !destino) {
    console.log(`[lead] SMTP no configurado. Para: ${destino || '(sin correo)'}\n${texto}`)
    return { enviado: false, motivo: 'smtp-no-configurado' }
  }
  try {
    await tx.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: destino,
      subject: asunto,
      text: texto,
    })
    return { enviado: true }
  } catch (err) {
    console.error('[lead] Error enviando correo:', err.message)
    return { enviado: false, motivo: 'error-smtp' }
  }
}

module.exports = { notificarLead }
