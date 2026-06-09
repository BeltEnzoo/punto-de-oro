import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña mínimo 6 caracteres'),
});

export const alumnoSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  apellido: z.string().min(1, 'Apellido requerido'),
  dni: z.string().min(7, 'DNI inválido').max(10),
  telefono: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
  fechaNacimiento: z.string().min(1, 'Fecha de nacimiento requerida'),
  fechaInscripcion: z.string().optional(),
  estado: z.enum(['ACTIVO', 'INACTIVO']).optional(),
  observaciones: z.string().optional().nullable(),
});

export const horarioSchema = z.object({
  nombreHorario: z.string().min(1, 'Nombre requerido'),
  horaInicio: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  horaFin: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  cupoMaximo: z.number().int().min(1, 'Cupo mínimo 1'),
});

export const inscripcionSchema = z.object({
  alumnoId: z.string().uuid(),
  horarioId: z.string().uuid(),
});

export const asistenciaSchema = z.object({
  alumnoId: z.string().uuid(),
  horarioId: z.string().uuid(),
  fecha: z.string().min(1),
  horaIngreso: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
});

export const cuotaSchema = z.object({
  alumnoId: z.string().uuid(),
  fechaVencimiento: z.string().min(1),
  importe: z.number().positive('Importe debe ser positivo'),
  estado: z.enum(['PAGADA', 'PENDIENTE', 'VENCIDA']).optional(),
});

export const reporteAsistenciasSchema = z.object({
  fechaDesde: z.string().min(1),
  fechaHasta: z.string().min(1),
  horarioId: z.string().uuid().optional(),
});

export function parseBody<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const msg = result.error.errors.map((e) => e.message).join(', ');
    throw new Error(msg);
  }
  return result.data;
}
