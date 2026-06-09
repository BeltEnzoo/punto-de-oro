import { prisma } from '../../lib/prisma.js';
import { parseBody, horarioSchema } from '../../lib/validators.js';

export class HorariosService {
  async findAll() {
    return prisma.horario.findMany({
      include: {
        _count: { select: { alumnos: true } },
      },
      orderBy: { horaInicio: 'asc' },
    });
  }

  async findById(id: string) {
    const horario = await prisma.horario.findUnique({
      where: { id },
      include: {
        alumnos: {
          include: {
            alumno: true,
          },
        },
        _count: { select: { alumnos: true } },
      },
    });
    if (!horario) throw new Error('Horario no encontrado');
    return horario;
  }

  async create(data: unknown) {
    const parsed = parseBody(horarioSchema, data);
    return prisma.horario.create({ data: parsed });
  }

  async update(id: string, data: unknown) {
    await this.findById(id);
    const parsed = parseBody(horarioSchema.partial(), data);
    return prisma.horario.update({ where: { id }, data: parsed });
  }

  async delete(id: string) {
    await this.findById(id);
    await prisma.horario.delete({ where: { id } });
    return { message: 'Horario eliminado' };
  }
}

export const horariosService = new HorariosService();
