const express = require('express')
const { prisma } = require('../lib/prisma')

const router = express.Router()

function baseSitio() {
  return (process.env.SITE_URL || 'http://localhost:5173').replace(/\/$/, '')
}

// GET /sitemap.xml — URLs públicas activas (Zona 10). Sin /admin ni mantenimiento.
router.get('/sitemap.xml', async (req, res, next) => {
  try {
    const base = baseSitio()
    const volquetas = await prisma.volqueta.findMany({
      where: { estado: { in: ['disponible', 'ocupada'] } },
      select: { slug: true, actualizado_en: true, destacado: true },
      orderBy: { actualizado_en: 'desc' },
    })
    const urls = [
      { loc: `${base}/`, changefreq: 'daily', priority: '1.0' },
      { loc: `${base}/volquetas`, changefreq: 'daily', priority: '0.9' },
      { loc: `${base}/contacto`, changefreq: 'monthly', priority: '0.5' },
      ...volquetas.map((v) => ({
        loc: `${base}/volquetas/${v.slug}`,
        lastmod: v.actualizado_en.toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: v.destacado ? '0.8' : '0.7',
      })),
    ]
    const cuerpo = urls
      .map(
        (u) =>
          `  <url>\n    <loc>${u.loc}</loc>\n` +
          (u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : '') +
          `    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>\n`,
      )
      .join('')
    res.header('Content-Type', 'application/xml')
    res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${cuerpo}</urlset>`)
  } catch (err) {
    next(err)
  }
})

// GET /robots.txt — bloquea /admin y anuncia el sitemap (Zona 10).
router.get('/robots.txt', (req, res) => {
  res.header('Content-Type', 'text/plain')
  res.send(
    `User-agent: *\nDisallow: /admin\nDisallow: /admin/\nAllow: /\n\nSitemap: ${baseSitio()}/sitemap.xml\n`,
  )
})

module.exports = router
