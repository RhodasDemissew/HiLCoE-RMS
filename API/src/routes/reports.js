import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { reportsController } from '../controllers/reports.controller.js';

const router = express.Router();

router.get('/milestones', authRequired, reportsController.milestones);
router.get('/plagiarism', authRequired, reportsController.plagiarism);

export default router;
