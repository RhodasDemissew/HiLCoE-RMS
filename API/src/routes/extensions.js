import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { CreateExtensionDto, DecideParams, DecideDto } from '../dtos/extensions.dto.js';
import { extensionsController } from '../controllers/extensions.controller.js';

const router = express.Router();

router.post('/', authRequired, validate({ body: CreateExtensionDto }), extensionsController.create);

router.patch('/:id/decision', authRequired, requireRole('Advisor','Coordinator','Admin'), validate({ params: DecideParams, body: DecideDto }), extensionsController.decide);

export default router;
