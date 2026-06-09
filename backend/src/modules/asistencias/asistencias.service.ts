import { prisma } from '../../lib/prisma.js';
import { parseBody, asistenciaSchema } from '../../lib/validators.js';

export class AsistenciasService {
  async findAll(fecha?: string, horarioId?: string) {
    const where: { fecha?: Date; horarioId?: string } = {};
    if (fecha) {
      const d = new Date(fecha);
      d.setHours(0, 0, 0, 0);
      where.fecha = d;
    }
    if (horarioId) where.horarioId = horarioId;

    return prisma.asistencia.findMany({
      where,
      include: {
        alumno: true,
        horario: true,
      },
      orderBy: [{ fecha: 'desc' }, { horaIngreso: 'asc' }],
    });
  }

  async registrar(data: unknown) {
    const parsed = parseBody(asistenciaSchema, data);
    const fecha = new Date(parsed.fecha);
    fecha.setHours(0, 0, 0, 0);

    const inscripcion = await prisma.alumnoHorario.findUnique({
      where: {
        alumnoId_horarioId: {
          alumnoId: parsed.alumnoId,
          horarioId: parsed.horarioId,
        },
      },
    });
    if (!inscripcion) {
      throw new Error('El alumno no está inscripto en este horario');
    }

    return prisma.asistencia.create({
      data: {
        alumnoId: parsed.alumnoId,
        horarioId: parsed.horarioId,
        fecha,
        horaIngreso: parsed.horaIngreso,
      },
      include: { alumno: true, horario: true },
    });
  }

  async delete(id: string) {
    const asistencia = await prisma.asistencia.findUnique({ where: { id } });
    if (!asistencia) throw new Error('Asistencia no encontrada');
    await prisma.asistencia.delete({ where: { id } });
    return { message: 'Asistencia eliminada' };
  }
}

export const asistenciasService = new AsistenciasService();
