import { Response } from 'express';
import { EstadoAlumno } from '@prisma/client';
import { AuthRequest, asyncHandler } from '../../middleware/auth.js';
import { paramId } from '../../lib/params.js';
import { alumnosService } from './alumnos.service.js';

export const getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
  const search = req.query.search as string | undefined;
  const estado = req.query.estado as EstadoAlumno | undefined;
  const alumnos = await alumnosService.findAll(search, estado);
  res.json(alumnos);
});

export const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const alumno = await alumnosService.findById(paramId(req.params.id));
  res.json(alumno);
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const alumno = await alumnosService.create(req.body);
  res.status(201).json(alumno);
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const alumno = await alumnosService.update(paramId(req.params.id), req.body);
  res.json(alumno);
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await alumnosService.delete(paramId(req.params.id));
  res.json(result);
});
