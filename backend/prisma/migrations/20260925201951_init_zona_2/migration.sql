-- CreateEnum
CREATE TYPE "rol_admin" AS ENUM ('administrador', 'editor');

-- CreateEnum
CREATE TYPE "estado_volqueta" AS ENUM ('disponible', 'ocupada', 'mantenimiento');

-- CreateTable
CREATE TABLE "usuario_admin" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" "rol_admin" NOT NULL DEFAULT 'editor',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volqueta" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT,
    "capacidad_m3" DOUBLE PRECISION,
    "capacidad_toneladas" DOUBLE PRECISION,
    "precio_estimado_viaje" DOUBLE PRECISION,
    "moneda" TEXT NOT NULL DEFAULT 'COP',
    "placa" TEXT,
    "modelo_vehiculo" TEXT,
    "ciudad_base" TEXT,
    "departamento_base" TEXT,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "estado" "estado_volqueta" NOT NULL DEFAULT 'disponible',
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "usuario_admin_id" INTEGER,

    CONSTRAINT "volqueta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foto_volqueta" (
    "id" SERIAL NOT NULL,
    "volqueta_id" INTEGER NOT NULL,
    "url_imagen" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "es_portada" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "foto_volqueta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caracteristica_volqueta" (
    "id" SERIAL NOT NULL,
    "volqueta_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "caracteristica_volqueta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacto_lead" (
    "id" SERIAL NOT NULL,
    "volqueta_id" INTEGER,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "mensaje" TEXT NOT NULL,
    "atendido" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacto_lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visita_evento" (
    "id" SERIAL NOT NULL,
    "volqueta_id" INTEGER,
    "ip_hash" TEXT NOT NULL,
    "user_agent" TEXT,
    "referer" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visita_evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contador_visitas" (
    "id" SERIAL NOT NULL,
    "volqueta_id" INTEGER,
    "total_visitas" INTEGER NOT NULL DEFAULT 0,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contador_visitas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_sitio" (
    "id" SERIAL NOT NULL,
    "nombre_empresa" TEXT,
    "telefono_contacto" TEXT,
    "whatsapp" TEXT,
    "correo_contacto" TEXT,
    "redes_sociales" JSONB,
    "meta_descripcion_default" TEXT,

    CONSTRAINT "configuracion_sitio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_admin_email_key" ON "usuario_admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "volqueta_slug_key" ON "volqueta"("slug");

-- CreateIndex
CREATE INDEX "foto_volqueta_volqueta_id_idx" ON "foto_volqueta"("volqueta_id");

-- CreateIndex
CREATE INDEX "caracteristica_volqueta_volqueta_id_idx" ON "caracteristica_volqueta"("volqueta_id");

-- CreateIndex
CREATE INDEX "contacto_lead_volqueta_id_idx" ON "contacto_lead"("volqueta_id");

-- CreateIndex
CREATE INDEX "visita_evento_volqueta_id_idx" ON "visita_evento"("volqueta_id");

-- CreateIndex
CREATE INDEX "visita_evento_ip_hash_idx" ON "visita_evento"("ip_hash");

-- CreateIndex
CREATE UNIQUE INDEX "contador_visitas_volqueta_id_key" ON "contador_visitas"("volqueta_id");

-- AddForeignKey
ALTER TABLE "volqueta" ADD CONSTRAINT "volqueta_usuario_admin_id_fkey" FOREIGN KEY ("usuario_admin_id") REFERENCES "usuario_admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foto_volqueta" ADD CONSTRAINT "foto_volqueta_volqueta_id_fkey" FOREIGN KEY ("volqueta_id") REFERENCES "volqueta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caracteristica_volqueta" ADD CONSTRAINT "caracteristica_volqueta_volqueta_id_fkey" FOREIGN KEY ("volqueta_id") REFERENCES "volqueta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacto_lead" ADD CONSTRAINT "contacto_lead_volqueta_id_fkey" FOREIGN KEY ("volqueta_id") REFERENCES "volqueta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visita_evento" ADD CONSTRAINT "visita_evento_volqueta_id_fkey" FOREIGN KEY ("volqueta_id") REFERENCES "volqueta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contador_visitas" ADD CONSTRAINT "contador_visitas_volqueta_id_fkey" FOREIGN KEY ("volqueta_id") REFERENCES "volqueta"("id") ON DELETE CASCADE ON UPDATE CASCADE;
