// SEO dinámico para la SPA (Zona 10).
// Actualiza título, descripción, Open Graph/Twitter y JSON-LD por página.
// Nota: los crawlers sin JavaScript (vista previa de WhatsApp incluida) ven
// los valores estáticos de index.html; esto mejora navegadores y redes con JS.

function upsertMeta(attr, key, content) {
  if (!content) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function siteUrl() {
  const env = import.meta.env.VITE_SITE_URL
  if (env) return env.replace(/\/$/, '')
  if (typeof window !== 'undefined') return window.location.origin
  return 'https://volquetasaguazul.com'
}

export function setSeo({ title, description, image, url, type = 'website' }) {
  if (title) {
    document.title = title
    upsertMeta('property', 'og:title', title)
    upsertMeta('name', 'twitter:title', title)
  }
  if (description) {
    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:description', description)
    upsertMeta('name', 'twitter:description', description)
  }
  if (image) {
    upsertMeta('property', 'og:image', image)
    upsertMeta('name', 'twitter:image', image)
  }
  if (url) {
    upsertMeta('property', 'og:url', url)
    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)
  }
  if (type) upsertMeta('property', 'og:type', type)
}

export function setJsonLd(id, data) {
  document.getElementById(id)?.remove()
  if (!data) return
  const s = document.createElement('script')
  s.type = 'application/ld+json'
  s.id = id
  s.textContent = JSON.stringify(data)
  document.head.appendChild(s)
}

export function removeJsonLd(id) {
  document.getElementById(id)?.remove()
}

export function schemaFichaVolqueta({ volqueta, foto, telefono, url }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Alquiler de ${volqueta.titulo}`,
    description: volqueta.descripcion || `Volqueta de ${volqueta.capacidad_m3 ?? ''} m³ en ${volqueta.ciudad_base}.`,
    url,
    image: foto || undefined,
    areaServed: {
      '@type': 'City',
      name: `${volqueta.ciudad_base}, ${volqueta.departamento_base}, Colombia`,
    },
    provider: {
      '@type': 'LocalBusiness',
      name: 'Volquetas Aguazul',
      address: {
        '@type': 'PostalAddress',
        addressLocality: volqueta.ciudad_base,
        addressRegion: volqueta.departamento_base,
        addressCountry: 'CO',
      },
      ...(telefono ? { telephone: telefono } : {}),
    },
  }
}
