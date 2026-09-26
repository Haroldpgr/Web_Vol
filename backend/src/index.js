require('dotenv').config()
const cors = require('cors')
const express = require('express')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

const configuracionRouter = require('./routes/configuracion')
const contactoRouter = require('./routes/contacto')
const seoRouter = require('./routes/seo')
const authRouter = require('./routes/auth')
const adminConfigRouter = require('./routes/adminConfig')
const adminFotosRouter = require('./routes/adminFotos')
const adminMensajesRouter = require('./routes/adminMensajes')
const adminVolquetasRouter = require('./routes/adminVolquetas')
const estadisticasRouter = require('./routes/estadisticas')
const visitasRouter = require('./routes/visitas')
const volquetasRouter = require('./routes/volquetas')
const { adminAuth } = require('./middleware/adminAuth')
const path = require('path')
const fs = require('fs')

// Zona 2: solo base. Endpoints reales en Zonas 3-9.
app.get('/health', (req, res) => {
  res.json({ ok: true, zona: 10, mensaje: 'Backend volquetas funcionando' })
})

// Zona 10: sitemap y robots (rutas exactas, antes de los 404)
app.use('/', seoRouter)

// Zona 3: catálogo público
app.use('/volquetas', volquetasRouter)

// Zona 4: configuración pública de contacto (para el botón de WhatsApp)
app.use('/configuracion', configuracionRouter)

// Zona 5: cotización escrita (canal secundario)
app.use('/contacto', contactoRouter)

// Zona 6: visitas (público) y estadísticas (protegido, login en Zona 7)
app.use('/visitas', visitasRouter)
app.use('/admin/estadisticas', adminAuth, estadisticasRouter)

// Zona 7: autenticación del panel. Login/logout públicos;
// TODO lo demás bajo /admin/* exige JWT válido.
app.use('/admin/auth', authRouter)

// Zona 8: gestión de volquetas y fotos (protegido)
app.use('/admin/volquetas', adminAuth, adminVolquetasRouter)
app.use('/admin/fotos', adminAuth, adminFotosRouter)

// Zona 9: mensajes y configuración (protegido)
app.use('/admin/mensajes', adminAuth, adminMensajesRouter)
app.use('/admin/configuracion', adminAuth, adminConfigRouter)
app.use('/admin', adminAuth, (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

// Fotos locales (cuando no hay Cloudinary configurado)
fs.mkdirSync(path.join(__dirname, '..', 'uploads', 'volquetas'), { recursive: true })
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// 404 + manejo de errores JSON
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

const multer = require('multer')

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ ok: false, error: 'Cada foto debe pesar máximo 15 MB.' })
    }
    return res.status(400).json({ ok: false, error: 'Error al subir la imagen.' })
  }
  if (err.message === 'Solo se permiten imágenes JPG o PNG.') {
    return res.status(400).json({ ok: false, error: err.message })
  }
  res.status(500).json({ error: 'Error interno del servidor' })
})

app.listen(PORT, () => {
  console.log(`Backend volquetas escuchando en http://localhost:${PORT}`)
})
