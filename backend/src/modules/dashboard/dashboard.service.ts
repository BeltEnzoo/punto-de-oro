import { EstadoAlumno, EstadoCuota } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';

export class DashboardService {
  async getStats() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const [alumnosActivos, presentesHoy, cuotasVencidas, horariosConAlumnos] = await Promise.all([
      prisma.alumno.count({ where: { estado: EstadoAlumno.ACTIVO } }),
      prisma.asistencia.count({
        where: { fecha: { gte: hoy, lt: manana } },
      }),
      prisma.cuota.count({ where: { estado: EstadoCuota.VENCIDA } }),
      prisma.horario.findMany({
        include: {
          _count: { select: { alumnos: true } },
        },
        orderBy: { alumnos: { _count: 'desc' } },
        take: 5,
      }),
    ]);

    return {
      alumnosActivos,
      presentesHoy,
      cuotasVencidas,
      horariosPopulares: horariosConAlumnos.map((h) => ({
        id: h.id,
        nombreHorario: h.nombreHorario,
        horaInicio: h.horaInicio,
        horaFin: h.horaFin,
        totalAlumnos: h._count.alumnos,
        cupoMaximo: h.cupoMaximo,
      })),
    };
  }
}

export const dashboardService = new DashboardService();
