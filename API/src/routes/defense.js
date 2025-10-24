import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import {
  DefenseCreateDto,
  DefenseUpdateDto,
  DefenseDuplicateDto,
  DefenseRespondDto,
  DefenseListQuery,
  DefenseAvailabilityQuery,
  DefenseIdParams,
} from '../dtos/defense.dto.js';
import { defenseController } from '../controllers/defense.controller.js';

const router = express.Router();

router.use(authRequired);

router.get('/', validate({ query: DefenseListQuery }), defenseController.list);
router.get('/availability', validate({ query: DefenseAvailabilityQuery }), defenseController.availability);
router.post('/', requireRole('Coordinator', 'Admin'), validate({ body: DefenseCreateDto }), defenseController.create);
router.patch('/:id', requireRole('Coordinator', 'Admin'), validate({ params: DefenseIdParams, body: DefenseUpdateDto }), defenseController.update);
router.delete('/:id', requireRole('Coordinator', 'Admin'), validate({ params: DefenseIdParams }), defenseController.cancel);
router.post('/:id/duplicate', requireRole('Coordinator', 'Admin'), validate({ params: DefenseIdParams, body: DefenseDuplicateDto }), defenseController.duplicate);
router.post('/:id/respond', validate({ params: DefenseIdParams, body: DefenseRespondDto }), defenseController.respond);

export default router;
