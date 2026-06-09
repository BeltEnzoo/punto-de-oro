import { Response } from 'express';
import { AuthRequest, asyncHandler } from '../../middleware/auth.js';
import { paramId } from '../../lib/params.js';
import { horariosService } from './horarios.service.js';

export const getAll = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const horarios = await horariosService.findAll();
  res.json(horarios);
});

export const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const horario = await horariosService.findById(paramId(req.params.id));
  res.json(horario);
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const horario = await horariosService.create(req.body);
  res.status(201).json(horario);
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const horario = await horariosService.update(paramId(req.params.id), req.body);
  res.json(horario);
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await horariosService.delete(paramId(req.params.id));
  res.json(result);
});
