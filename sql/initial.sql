-- Punto de Oro Gym - SQL inicial
-- Ejecutar después de prisma migrate o como referencia del esquema

CREATE TYPE "Rol" AS ENUM ('ADMIN', 'PROFESOR');
CREATE TYPE "EstadoAlumno" AS ENUM ('ACTIVO', 'INACTIVO');
CREATE TYPE "EstadoCuota" AS ENUM ('PAGADA', 'PENDIENTE', 'VENCIDA');

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'PROFESOR',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "alumnos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "telefono" TEXT,
    "direccion" TEXT,
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
    "fecha_inscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoAlumno" NOT NULL DEFAULT 'ACTIVO',
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "alumnos_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "alumnos_dni_key" ON "alumnos"("dni");

CREATE TABLE "horarios" (
    "id" TEXT NOT NULL,
    "nombre_horario" TEXT NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,
    "cupo_maximo" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "horarios_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "alumno_horario" (
    "id" TEXT NOT NULL,
    "alumno_id" TEXT NOT NULL,
    "horario_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "alumno_horario_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "alumno_horario_alumno_id_horario_id_key" ON "alumno_horario"("alumno_id", "horario_id");

CREATE TABLE "asistencias" (
    "id" TEXT NOT NULL,
    "alumno_id" TEXT NOT NULL,
    "horario_id" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "hora_ingreso" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "asistencias_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "asistencias_alumno_id_horario_id_fecha_key" ON "asistencias"("alumno_id", "horario_id", "fecha");

CREATE TABLE "cuotas" (
    "id" TEXT NOT NULL,
    "alumno_id" TEXT NOT NULL,
    "fecha_vencimiento" DATE NOT NULL,
    "importe" DECIMAL(10,2) NOT NULL,
    "estado" "EstadoCuota" NOT NULL DEFAULT 'PENDIENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cuotas_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "alumno_horario" ADD CONSTRAINT "alumno_horario_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "alumno_horario" ADD CONSTRAINT "alumno_horario_horario_id_fkey" FOREIGN KEY ("horario_id") REFERENCES "horarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_horario_id_fkey" FOREIGN KEY ("horario_id") REFERENCES "horarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cuotas" ADD CONSTRAINT "cuotas_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
