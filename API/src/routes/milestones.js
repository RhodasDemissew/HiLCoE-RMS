import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { CreateMilestoneDto, TransitionParams, TransitionDto } from '../dtos/milestones.dto.js';
import { milestonesController } from '../controllers/milestones.controller.js';

const router = express.Router();

router.post('/', authRequired, validate({ body: CreateMilestoneDto }), milestonesController.create);

router.get('/', authRequired, milestonesController.list);

router.post('/:id/transition', authRequired, validate({ params: TransitionParams, body: TransitionDto }), milestonesController.transition);

export default router;
