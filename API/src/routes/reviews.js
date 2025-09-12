import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { CreateReviewDto } from '../dtos/reviews.dto.js';
import { reviewsController } from '../controllers/reviews.controller.js';

const router = express.Router();

router.post('/', authRequired, requireRole('Advisor','Examiner','Coordinator'), validate({ body: CreateReviewDto }), reviewsController.create);

router.get('/', authRequired, reviewsController.list);

export default router;
