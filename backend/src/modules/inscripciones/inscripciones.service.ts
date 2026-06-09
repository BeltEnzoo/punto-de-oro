import { prisma } from '../../lib/prisma.js';
import { parseBody, inscripcionSchema } from '../../lib/validators.js';

export class InscripcionesService {
  async inscribir(data: unknown) {
    const { alumnoId, horarioId } = parseBody(inscripcionSchema, data);

    const [alumno, horario] = await Promise.all([
      prisma.alumno.findUnique({ where: { id: alumnoId } }),
      prisma.horario.findUnique({
        where: { id: horarioId },
        include: { _count: { select: { alumnos: true } } },
      }),
    ]);

    if (!alumno) throw new Error('Alumno no encontrado');
    if (!horario) throw new Error('Horario no encontrado');

    const existing = await prisma.alumnoHorario.findUnique({
      where: { alumnoId_horarioId: { alumnoId, horarioId } },
    });
    if (existing) throw new Error('El alumno ya está inscripto en este horario');

    if (horario._count.alumnos >= horario.cupoMaximo) {
      throw new Error(`Cupo máximo alcanzado (${horario.cupoMaximo} alumnos)`);
    }

    return prisma.alumnoHorario.create({
      data: { alumnoId, horarioId },
      include: {
        alumno: true,
        horario: true,
      },
    });
  }

  async desinscribir(alumnoId: string, horarioId: string) {
    const inscripcion = await prisma.alumnoHorario.findUnique({
      where: { alumnoId_horarioId: { alumnoId, horarioId } },
    });
    if (!inscripcion) throw new Error('Inscripción no encontrada');

    await prisma.alumnoHorario.delete({
      where: { alumnoId_horarioId: { alumnoId, horarioId } },
    });
    return { message: 'Inscripción eliminada' };
  }

  async getByAlumno(alumnoId: string) {
    return prisma.alumnoHorario.findMany({
      where: { alumnoId },
      include: { horario: true },
    });
  }
}

export const inscripcionesService = new InscripcionesService();
