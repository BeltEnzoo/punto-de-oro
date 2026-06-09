import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { getAll, getById, create, update, marcarPagada, remove } from './cuotas.controller.js';

const router = Router();

router.use(authenticate);
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.patch('/:id/pagar', marcarPagada);
router.delete('/:id', remove);

export default router;
