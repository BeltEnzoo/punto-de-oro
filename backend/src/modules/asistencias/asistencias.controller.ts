import { Response } from 'express';
import { AuthRequest, asyncHandler } from '../../middleware/auth.js';
import { paramId } from '../../lib/params.js';
import { asistenciasService } from './asistencias.service.js';

export const getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
  const fecha = req.query.fecha as string | undefined;
  const horarioId = req.query.horarioId as string | undefined;
  const asistencias = await asistenciasService.findAll(fecha, horarioId);
  res.json(asistencias);
});

export const registrar = asyncHandler(async (req: AuthRequest, res: Response) => {
  const asistencia = await asistenciasService.registrar(req.body);
  res.status(201).json(asistencia);
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await asistenciasService.delete(paramId(req.params.id));
  res.json(result);
});
