// Etiqueta legible del visitante a partir del user agent. Sin dependencias.
function parsearDispositivo(ua) {
  const u = String(ua || '')
  if (!u) return 'Dispositivo desconocido'

  let dispositivo = 'Otro dispositivo'
  if (/iPhone/i.test(u)) dispositivo = 'iPhone'
  else if (/iPad/i.test(u)) dispositivo = 'iPad'
  else if (/Android/i.test(u)) {
    const m = u.match(/;\s*([^;()]+?)\s*Build\//i)
    dispositivo = m ? `Android (${m[1].trim().slice(0, 24)})` : 'Android'
  } else if (/Windows/i.test(u)) dispositivo = 'PC Windows'
  else if (/Macintosh|Mac OS/i.test(u)) dispositivo = 'Mac'
  else if (/Linux/i.test(u)) dispositivo = 'PC Linux'

  let navegador = 'Navegador'
  if (/WhatsApp\//i.test(u)) navegador = 'WhatsApp'
  else if (/FBAV\//i.test(u)) navegador = 'Facebook'
  else if (/Edg\//i.test(u)) navegador = 'Edge'
  else if (/OPR\//i.test(u)) navegador = 'Opera'
  else if (/SamsungBrowser\//i.test(u)) navegador = 'Samsung Internet'
  else if (/Chrome\//i.test(u)) navegador = 'Chrome'
  else if (/Firefox\//i.test(u)) navegador = 'Firefox'
  else if (/Safari\//i.test(u)) navegador = 'Safari'

  return `${navegador} en ${dispositivo}`
}

module.exports = { parsearDispositivo }
