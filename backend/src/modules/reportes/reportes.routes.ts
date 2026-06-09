import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { alumnosPorHorario, asistenciasPorPeriodo, cuotasVencidas } from './reportes.controller.js';

const router = Router();

router.use(authenticate);
router.get('/alumnos-por-horario', alumnosPorHorario);
router.get('/asistencias', asistenciasPorPeriodo);
router.get('/cuotas-vencidas', cuotasVencidas);

export default router;
