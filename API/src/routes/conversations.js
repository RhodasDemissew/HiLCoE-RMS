import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { conversationsController } from '../controllers/conversations.controller.js';

const router = express.Router();

router.get('/', authRequired, conversationsController.list);
router.post('/', authRequired, conversationsController.create);
router.get('/:id', authRequired, conversationsController.get);
router.get('/:id/messages', authRequired, conversationsController.messages);
router.post('/:id/messages', authRequired, conversationsController.sendMessage);
router.post('/:id/read', authRequired, conversationsController.markRead);
router.post('/projects/:projectId/ensure', authRequired, conversationsController.ensureProject);

export default router;
