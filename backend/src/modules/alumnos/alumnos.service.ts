import { EstadoAlumno, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { parseBody, alumnoSchema } from '../../lib/validators.js';

export class AlumnosService {
  async findAll(search?: string, estado?: EstadoAlumno) {
    const where: Prisma.AlumnoWhereInput = {};
    if (estado) where.estado = estado;
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido: { contains: search, mode: 'insensitive' } },
        { dni: { contains: search } },
      ];
    }

    return prisma.alumno.findMany({
      where,
      include: {
        horarios: { include: { horario: true } },
        _count: { select: { cuotas: true, asistencias: true } },
      },
      orderBy: { apellido: 'asc' },
    });
  }

  async findById(id: string) {
    const alumno = await prisma.alumno.findUnique({
      where: { id },
      include: {
        horarios: { include: { horario: true } },
        cuotas: { orderBy: { fechaVencimiento: 'desc' }, take: 12 },
      },
    });
    if (!alumno) throw new Error('Alumno no encontrado');
    return alumno;
  }

  async create(data: unknown) {
    const parsed = parseBody(alumnoSchema, data);
    const existing = await prisma.alumno.findUnique({ where: { dni: parsed.dni } });
    if (existing) throw new Error('Ya existe un alumno con ese DNI');

    return prisma.alumno.create({
      data: {
        ...parsed,
        fechaNacimiento: new Date(parsed.fechaNacimiento),
        fechaInscripcion: parsed.fechaInscripcion ? new Date(parsed.fechaInscripcion) : undefined,
        telefono: parsed.telefono ?? null,
        direccion: parsed.direccion ?? null,
        observaciones: parsed.observaciones ?? null,
      },
    });
  }

  async update(id: string, data: unknown) {
    await this.findById(id);
    const parsed = parseBody(alumnoSchema.partial(), data);

    if (parsed.dni) {
      const existing = await prisma.alumno.findFirst({
        where: { dni: parsed.dni, NOT: { id } },
      });
      if (existing) throw new Error('Ya existe un alumno con ese DNI');
    }

    return prisma.alumno.update({
      where: { id },
      data: {
        ...parsed,
        fechaNacimiento: parsed.fechaNacimiento ? new Date(parsed.fechaNacimiento) : undefined,
        fechaInscripcion: parsed.fechaInscripcion ? new Date(parsed.fechaInscripcion) : undefined,
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await prisma.alumno.delete({ where: { id } });
    return { message: 'Alumno eliminado' };
  }
}

export const alumnosService = new AlumnosService();
