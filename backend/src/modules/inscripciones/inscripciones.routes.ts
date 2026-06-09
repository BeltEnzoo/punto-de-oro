import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { inscribir, desinscribir, getByAlumno } from './inscripciones.controller.js';

const router = Router();

router.use(authenticate);
router.post('/', inscribir);
router.get('/alumno/:alumnoId', getByAlumno);
router.delete('/:alumnoId/:horarioId', desinscribir);

export default router;
