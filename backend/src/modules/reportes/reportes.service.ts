import { EstadoCuota } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { parseBody, reporteAsistenciasSchema } from '../../lib/validators.js';

export class ReportesService {
  async alumnosPorHorario(horarioId?: string) {
    const horarios = await prisma.horario.findMany({
      where: horarioId ? { id: horarioId } : undefined,
      include: {
        alumnos: {
          include: {
            alumno: true,
          },
        },
        _count: { select: { alumnos: true } },
      },
      orderBy: { nombreHorario: 'asc' },
    });

    return horarios.map((h) => ({
      horario: {
        id: h.id,
        nombreHorario: h.nombreHorario,
        horaInicio: h.horaInicio,
        horaFin: h.horaFin,
        cupoMaximo: h.cupoMaximo,
        totalInscriptos: h._count.alumnos,
      },
      alumnos: h.alumnos.map((ah) => ah.alumno),
    }));
  }

  async asistenciasPorPeriodo(data: unknown) {
    const { fechaDesde, fechaHasta, horarioId } = parseBody(reporteAsistenciasSchema, data);

    const desde = new Date(fechaDesde);
    desde.setHours(0, 0, 0, 0);
    const hasta = new Date(fechaHasta);
    hasta.setHours(23, 59, 59, 999);

    const asistencias = await prisma.asistencia.findMany({
      where: {
        fecha: { gte: desde, lte: hasta },
        ...(horarioId && { horarioId }),
      },
      include: { alumno: true, horario: true },
      orderBy: [{ fecha: 'asc' }, { horaIngreso: 'asc' }],
    });

    const porFecha = asistencias.reduce<Record<string, typeof asistencias>>((acc, a) => {
      const key = a.fecha.toISOString().split('T')[0];
      if (!acc[key]) acc[key] = [];
      acc[key].push(a);
      return acc;
    }, {});

    return {
      total: asistencias.length,
      periodo: { desde: fechaDesde, hasta: fechaHasta },
      porFecha,
      detalle: asistencias,
    };
  }

  async cuotasVencidas() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    await prisma.cuota.updateMany({
      where: {
        estado: EstadoCuota.PENDIENTE,
        fechaVencimiento: { lt: hoy },
      },
      data: { estado: EstadoCuota.VENCIDA },
    });

    const cuotas = await prisma.cuota.findMany({
      where: { estado: EstadoCuota.VENCIDA },
      include: { alumno: true },
      orderBy: { fechaVencimiento: 'asc' },
    });

    const totalImporte = cuotas.reduce((sum, c) => sum + Number(c.importe), 0);

    return { total: cuotas.length, totalImporte, cuotas };
  }
}

export const reportesService = new ReportesService();
