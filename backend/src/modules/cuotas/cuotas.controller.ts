import { Response } from 'express';
import { EstadoCuota } from '@prisma/client';
import { AuthRequest, asyncHandler } from '../../middleware/auth.js';
import { paramId } from '../../lib/params.js';
import { cuotasService } from './cuotas.service.js';

export const getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
  const estado = req.query.estado as EstadoCuota | undefined;
  const alumnoId = req.query.alumnoId as string | undefined;
  const cuotas = await cuotasService.findAll(estado, alumnoId);
  res.json(cuotas);
});

export const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cuota = await cuotasService.findById(paramId(req.params.id));
  res.json(cuota);
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cuota = await cuotasService.create(req.body);
  res.status(201).json(cuota);
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cuota = await cuotasService.update(paramId(req.params.id), req.body);
  res.json(cuota);
});

export const marcarPagada = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cuota = await cuotasService.marcarPagada(paramId(req.params.id));
  res.json(cuota);
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await cuotasService.delete(paramId(req.params.id));
  res.json(result);
});
