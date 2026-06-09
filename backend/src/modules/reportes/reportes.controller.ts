import { Response } from 'express';
import { AuthRequest, asyncHandler } from '../../middleware/auth.js';
import { reportesService } from './reportes.service.js';

export const alumnosPorHorario = asyncHandler(async (req: AuthRequest, res: Response) => {
  const horarioId = req.query.horarioId as string | undefined;
  const reporte = await reportesService.alumnosPorHorario(horarioId);
  res.json(reporte);
});

export const asistenciasPorPeriodo = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reporte = await reportesService.asistenciasPorPeriodo(req.query);
  res.json(reporte);
});

export const cuotasVencidas = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const reporte = await reportesService.cuotasVencidas();
  res.json(reporte);
});
