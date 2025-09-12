import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { notificationsController } from '../controllers/notifications.controller.js';

const router = express.Router();

router.get('/', authRequired, notificationsController.list);
router.patch('/:id/read', authRequired, notificationsController.markRead);

export default router;
