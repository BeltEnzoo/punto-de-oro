import { EstadoCuota } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { parseBody, cuotaSchema } from '../../lib/validators.js';

function calcularEstado(fechaVencimiento: Date, estado?: EstadoCuota): EstadoCuota {
  if (estado === EstadoCuota.PAGADA) return EstadoCuota.PAGADA;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const venc = new Date(fechaVencimiento);
  venc.setHours(0, 0, 0, 0);
  if (venc < hoy) return EstadoCuota.VENCIDA;
  return EstadoCuota.PENDIENTE;
}

export class CuotasService {
  async findAll(estado?: EstadoCuota, alumnoId?: string) {
    await this.actualizarVencidas();

    return prisma.cuota.findMany({
      where: {
        ...(estado && { estado }),
        ...(alumnoId && { alumnoId }),
      },
      include: { alumno: true },
      orderBy: { fechaVencimiento: 'asc' },
    });
  }

  async findById(id: string) {
    const cuota = await prisma.cuota.findUnique({
      where: { id },
      include: { alumno: true },
    });
    if (!cuota) throw new Error('Cuota no encontrada');
    return cuota;
  }

  async create(data: unknown) {
    const parsed = parseBody(cuotaSchema, data);
    const fechaVencimiento = new Date(parsed.fechaVencimiento);
    const estado = calcularEstado(fechaVencimiento, parsed.estado);

    return prisma.cuota.create({
      data: {
        alumnoId: parsed.alumnoId,
        fechaVencimiento,
        importe: parsed.importe,
        estado,
      },
      include: { alumno: true },
    });
  }

  async update(id: string, data: unknown) {
    await this.findById(id);
    const parsed = parseBody(cuotaSchema.partial(), data);

    const updateData: {
      alumnoId?: string;
      fechaVencimiento?: Date;
      importe?: number;
      estado?: EstadoCuota;
    } = {};

    if (parsed.alumnoId) updateData.alumnoId = parsed.alumnoId;
    if (parsed.importe) updateData.importe = parsed.importe;
    if (parsed.fechaVencimiento) {
      updateData.fechaVencimiento = new Date(parsed.fechaVencimiento);
    }
    if (parsed.estado) updateData.estado = parsed.estado;
    else if (updateData.fechaVencimiento) {
      updateData.estado = calcularEstado(updateData.fechaVencimiento);
    }

    return prisma.cuota.update({
      where: { id },
      data: updateData,
      include: { alumno: true },
    });
  }

  async marcarPagada(id: string) {
    return prisma.cuota.update({
      where: { id },
      data: { estado: EstadoCuota.PAGADA },
      include: { alumno: true },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await prisma.cuota.delete({ where: { id } });
    return { message: 'Cuota eliminada' };
  }

  async actualizarVencidas() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    await prisma.cuota.updateMany({
      where: {
        estado: EstadoCuota.PENDIENTE,
        fechaVencimiento: { lt: hoy },
      },
      data: { estado: EstadoCuota.VENCIDA },
    });
  }
}

export const cuotasService = new CuotasService();
