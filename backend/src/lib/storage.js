const fs = require('fs')
const path = require('path')

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'volquetas')

function cloudinaryConfigurado() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  )
}

function asegurarCarpeta() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

// Guarda un buffer de imagen y devuelve { url, almacenamiento }.
// Cloudinary si está configurado; si no, disco local servido en /uploads.
async function guardarImagen({ buffer, nombreOriginal }) {
  const ext = (path.extname(nombreOriginal || '').toLowerCase() || '.jpg').slice(0, 5)
  const base = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`

  if (cloudinaryConfigurado()) {
    const cloudinary = require('cloudinary').v2
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
    const resultado = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'volquetas', resource_type: 'image' },
        (err, res) => (err ? reject(err) : resolve(res)),
      )
      stream.end(buffer)
    })
    return { url: resultado.secure_url, almacenamiento: 'cloudinary' }
  }

  asegurarCarpeta()
  const ruta = path.join(UPLOAD_DIR, base)
  await fs.promises.writeFile(ruta, buffer)
  return { url: `/uploads/volquetas/${base}`, almacenamiento: 'local' }
}

// Borra el archivo local de una URL /uploads/... (Cloudinary se gestiona aparte).
async function borrarImagenLocal(url) {
  if (!url || !url.startsWith('/uploads/')) return
  try {
    const ruta = path.join(__dirname, '..', '..', decodeURIComponent(url))
    await fs.promises.unlink(ruta)
  } catch {
    // best-effort
  }
}

module.exports = { guardarImagen, borrarImagenLocal, cloudinaryConfigurado }
