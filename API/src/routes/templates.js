import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { CreateTemplateDto, UpdateTemplateDto, TemplateIdParams } from '../dtos/templates.dto.js';
import { templatesController } from '../controllers/templates.controller.js';

const router = express.Router();

router.get('/', authRequired, templatesController.list);

router.post('/', authRequired, requireRole('Coordinator','Admin'), validate({ body: CreateTemplateDto }), templatesController.create);

router.patch('/:id', authRequired, requireRole('Coordinator','Admin'), validate({ params: TemplateIdParams, body: UpdateTemplateDto }), templatesController.update);
router.delete('/:id', authRequired, requireRole('Coordinator','Admin'), validate({ params: TemplateIdParams }), templatesController.remove);

export default router;
