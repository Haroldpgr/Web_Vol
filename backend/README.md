# Backend — Sistema Web de Volquetas (Zona 2)

Base: Node.js + Express + Prisma + PostgreSQL. **Sin endpoints ni autenticación todavía**
(esas van en Zonas 3–9). Solo modelo de datos + servidor base con `/health`.

## Tablas (nombres exactos del SRS)

- `usuario_admin` (rol: `administrador` / `editor`)
- `volqueta` (estado: `disponible` / `ocupada` / `mantenimiento`)
- `foto_volqueta`, `caracteristica_volqueta`
- `contacto_lead`, `visita_evento`, `contador_visitas`
- `configuracion_sitio`

Ver `prisma/schema.prisma` y `prisma/migrations/`.

## Base de datos local (estado actual)

Hay una instancia **temporal** de PostgreSQL 17.11 corriendo en esta máquina:

- Host/puerto: `localhost:5433`, usuario `postgres`, sin contraseña, DB `volquetas`
- Binarios: `C:\Users\harol\AppData\Local\Temp\opencode\pg-dist\bin`
- Datos: `C:\Users\harol\AppData\Local\Temp\opencode\pg-data`
- El `.env` actual apunta a esa instancia.

Reiniciarla tras reiniciar el equipo:

```powershell
C:\Users\harol\AppData\Local\Temp\opencode\pg-dist\bin\pg_ctl.exe -D C:\Users\harol\AppData\Local\Temp\opencode\pg-data -l C:\Users\harol\AppData\Local\Temp\opencode\pg.log "-o" "-p 5433" start
```

> OJO: vive en `Temp` y puede desaparecer con limpiezas de disco. Para uso
> permanente instala PostgreSQL 17 (ver abajo) y cambia el puerto a `5432`.

## Instalación permanente (opción recomendada)

1. Con Docker: `docker compose up -d` (usa `5432`, clave `postgres`).
2. O instala PostgreSQL 17 con el instalador oficial y crea la DB `volquetas`.
3. Ajusta `backend/.env` (guíate por `.env.example`):

```ini
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/volquetas?schema=public"
```

## Comandos

```powershell
cd backend
npm install
npx prisma migrate dev   # crea/aplica migraciones
node prisma/seed.js      # carga admin + 3 volquetas + config
npx prisma studio        # ver tablas y relaciones en el navegador
node src/index.js        # servidor base (GET /health)
```

Los comandos de Prisma tardan 1–3 min en arrancar en este equipo, ten paciencia.

## Endpoints (Zona 3)

- `GET /volquetas` — catálogo público. Solo `disponible`/`ocupada`, salvo
  `?incluir_mantenimiento=true`. Filtros: `?ciudad_base=`,
  `?capacidad_min_m3=`, `?capacidad_max_m3=`, `?q=` (título, descripción,
  modelo). Destacadas primero por defecto, salvo `?destacados_primero=false`.
  Responde `{ data, total }` con `foto_portada` y `total_fotos` por volqueta.
- `GET /volquetas/ciudades` — ciudades base con oferta activa (para el filtro).
- `GET /volquetas/:slug` — ficha completa (fotos ordenadas, características,
  GPS) y registra la visita (contador básico; deduplicación en Zona 6).
  `404` si el slug no existe.
- `GET /configuracion` — datos públicos de contacto (WhatsApp, teléfono,
  correo) para el sitio público.
- `POST /contacto` — cotización escrita. Valida obligatorios, guarda en
  `contacto_lead` y notifica al correo del dueño (SMTP por env; sin SMTP solo
  registra en consola). Honeypot `empresa`: si viene lleno, responde éxito sin
  guardar nada.
- `POST /visitas` — registra visita general o de una volqueta (`volqueta_id`
  opcional), con deduplicación de 30 min por IP. Responde si se registró o fue
  duplicada.
- `GET /admin/estadisticas/visitas` — **protegido con JWT** (login en Zona 7):
  total del sitio + top 5 volquetas más vistas.

## Gestión admin (Zona 8, todo protegido con JWT)

- `GET/POST /admin/volquetas` — listar (todas, con portada) y crear (slug
  automático único desde el título).
- `GET/PATCH/DELETE /admin/volquetas/:id` — ficha, editar (si cambia el título
  regenera el slug) y eliminar.
- `POST /admin/volquetas/:id/fotos` — subida multipart (campo `fotos`, solo
  imágenes 5 MB). A disco local `/uploads` o Cloudinary si hay env.
- `DELETE /admin/fotos/:id`, `PATCH /admin/fotos/:id/orden`,
  `PATCH /admin/fotos/:id/portada`.

## Mensajes y configuración (Zona 9, protegido)

- `GET /admin/mensajes?atendido=true|false` — nuevas primero, con volqueta y
  `totalSinAtender`.
- `PATCH /admin/mensajes/:id` — `{ atendido: boolean }`.
- `GET/PATCH /admin/configuracion` — datos generales (el WhatsApp se refleja
  en el sitio público al instante).
- Contenidos del inicio (`contenido_sitio`: hero, imagen, cintas): se leen en
  `GET /configuracion` (campo `contenidos`) y se editan con
  `PATCH /admin/configuracion` (`{ contenidos: { clave: valor } }`).

## SEO (Zona 10)

- `GET /sitemap.xml` — home, catálogo, contacto y fichas activas (sin
  mantenimiento ni `/admin`). Define `SITE_URL` con tu dominio en producción.
- `GET /robots.txt` — bloquea `/admin` y anuncia el sitemap.

## Autenticación (Zona 7)

- `POST /admin/auth/login` — `{ email, password }` → `{ token, admin }` (JWT 8 h).
  5 fallos por IP+email en 15 min = bloqueo temporal (`429`). Mensaje genérico
  para no revelar usuarios.
- `POST /admin/auth/logout` — confirma cierre (el cliente descarta el token).
- Todo lo demás bajo `/admin/*` exige `Authorization: Bearer <token>`.
- `ADMIN_JWT_SECRET` en `.env` (cambiar en producción).

## Datos de prueba (seed)

Flota real: solo **Aguazul, Casanare**.

- Admin: `admin@volquetas.co` / `Admin123*` (rol `administrador`)
- Volquetas: `volqueta-doble-troque-aguazul` (14 m³, disponible),
  `volqueta-sencilla-aguazul` (7 m³, disponible),
  `volqueta-10m3-aguazul` (10 m³, ocupada),
  `volqueta-12m3-aguazul-taller` (12 m³, mantenimiento, **sin GPS** para probar
  el ocultamiento del mapa)
- 5 fotos, 9 características, contadores en 0 y `configuracion_sitio` inicial.

Siguiente: Zona 3 — endpoints del catálogo público.
