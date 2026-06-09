import { Response } from 'express';
import { AuthRequest, asyncHandler } from '../../middleware/auth.js';
import { paramId } from '../../lib/params.js';
import { inscripcionesService } from './inscripciones.service.js';

export const inscribir = asyncHandler(async (req: AuthRequest, res: Response) => {
  const inscripcion = await inscripcionesService.inscribir(req.body);
  res.status(201).json(inscripcion);
});

export const desinscribir = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await inscripcionesService.desinscribir(
    paramId(req.params.alumnoId),
    paramId(req.params.horarioId)
  );
  res.json(result);
});

export const getByAlumno = asyncHandler(async (req: AuthRequest, res: Response) => {
  const inscripciones = await inscripcionesService.getByAlumno(paramId(req.params.alumnoId));
  res.json(inscripciones);
});
