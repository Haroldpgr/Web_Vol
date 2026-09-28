-- CreateTable
CREATE TABLE "testimonio" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "calificacion" INTEGER NOT NULL DEFAULT 5,
    "aprobado" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "testimonio_pkey" PRIMARY KEY ("id")
);
