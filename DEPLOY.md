# Despliegue a producción — Volquetas Aguazul (Zona 11)

Arquitectura: frontend estático (Vercel o Netlify) + API Node (Railway o Render)
+ PostgreSQL gestionado. HTTPS y dominio propio incluidos.

## 1. Variables de entorno

### Backend (`backend/.env` en el proveedor)

| Variable | Obligatoria | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Sí | `postgresql://user:pass@host:5432/volquetas?schema=public` |
| `ADMIN_JWT_SECRET` | Sí | cadena larga aleatoria (32+ caracteres) |
| `SITE_URL` | Sí | `https://volquetasaguazul.com` |
| `PORT` | No | la da el proveedor (Railway/Render la inyectan) |
| `SMTP_HOST/PORT/USER/PASS/FROM` | Opcional | notifica cotizaciones por correo |
| `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` | Recomendado | fotos persistentes (sin esto van a disco efímero) |
| `SEED_ON_BOOT` | No | `true` solo la primera vez, para cargar flota demo |

> Genera el secreto así: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Frontend (variables del proyecto en Vercel/Netlify)

| Variable | Valor |
|---|---|
| `VITE_API_URL` | URL pública de la API, ej. `https://volquetas-api.up.railway.app` |
| `VITE_SITE_URL` | Dominio final, ej. `https://volquetasaguazul.com` |

## 2. Backend + PostgreSQL

### Opción A — Railway (recomendada)

1. Crea proyecto → **New PostgreSQL** (copia `DATABASE_URL`).
2. **New Service → GitHub Repo**, carpeta raíz `backend`, builder Dockerfile.
3. Define las variables de la tabla (Railway puede referenciar la DB con `${{Postgres.DATABASE_URL}}`).
4. Deploy. Verifica `https://tu-api.up.railway.app/health`.
5. Solo la primera vez: ejecuta el seed (Railway → servicio → terminal):
   `npm run seed` (crea admin `admin@volquetas.co` / `Admin123*`; **cámbiala** luego).

### Opción B — Render (Blueprint incluido)

1. `backend/render.yaml` ya describe API + DB.
2. Render → **New → Blueprint**, conecta el repo y aplica.
3. Completa `SITE_URL`, SMTP y Cloudinary en Environment.
4. Verifica `/health`. Seed igual que arriba (Shell de Render).

> El arranque corre `prisma migrate deploy` solo (ver `start:prod`); las fotos
> deben ir a Cloudinary porque el disco de estos servicios es efímero.

## 3. Frontend

### Vercel

1. **Add New → Project**, importa el repo (raíz del proyecto).
2. Framework: Vite. Variables `VITE_API_URL` y `VITE_SITE_URL`.
3. Deploy. `vercel.json` ya trae el rewrite SPA (`/*` → `/index.html`).

### Netlify (alternativa)

1. **Add new site → Import**, mismo repo.
2. Build `npm run build`, publish `dist`, mismas variables.
3. `netlify.toml` ya trae redirects y caché de `/assets/*`.

## 4. Dominio propio + HTTPS

1. Compra el dominio (ej. `volquetasaguazul.com`) en tu registrador.
2. En Vercel/Netlify: **Settings → Domains → Add**, sigue la verificación.
3. Apunta los DNS según te indique el panel:
   - `A @ → 76.76.21.21` (Vercel) o los que dé Netlify, y
   - `CNAME www → cname.vercel-dns.com` (o equivalente).
4. El certificado SSL/TLS se emite solo en minutos: verifica el candado y que
   `http://` redirija a `https://`.
5. Actualiza `SITE_URL` (backend) y `VITE_SITE_URL` (frontend) al dominio final y
   redespliega. Revisa `index.html` (canónica y `og:url` de ejemplo).

## 5. Visibilidad real (manual)

1. **Google Search Console**: agrega la propiedad del dominio, verifica por DNS y
   envía `https://tudominio.com/sitemap.xml` (servido por la API; si el front y
   la API van en dominios distintos, usa el del front y ajusta `SITE_URL`).
2. **Google Business Profile**: crea el perfil "Volquetas Aguazul" en Aguazul,
   Casanare, con WhatsApp, horario y las fotos de la flota.
3. Comparte una ficha por WhatsApp y confirma la vista previa (Zona 10).
4. Cambia la clave del admin y guarda `/admin/login` en tus marcadores (no se
   enlaza desde el sitio).

## 6. Checklist post-despliegue

- [ ] `/health` responde en la API
- [ ] El catálogo carga desde el dominio final
- [ ] Login admin + cambio de clave
- [ ] WhatsApp de una ficha abre el chat correcto
- [ ] `/robots.txt` bloquea `/admin` y `/sitemap.xml` lista las fichas
- [ ] HTTPS activo y `http` redirige
