import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { getAll, registrar, remove } from './asistencias.controller.js';

const router = Router();

router.use(authenticate);
router.get('/', getAll);
router.post('/', registrar);
router.delete('/:id', remove);

export default router;
