import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { Rol } from '@prisma/client';
import { getAll, getById, create, update, remove } from './horarios.controller.js';

const router = Router();

router.use(authenticate);
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', authorize(Rol.ADMIN), remove);

export default router;
