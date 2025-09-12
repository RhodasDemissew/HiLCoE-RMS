import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { verificationsController } from '../controllers/verifications.controller.js';

const router = express.Router();

router.get('/:submissionId', authRequired, verificationsController.list);
router.post('/:submissionId/queue', authRequired, verificationsController.queue);

export default router;
