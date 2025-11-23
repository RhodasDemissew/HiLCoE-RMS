import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { conversationsController } from '../controllers/conversations.controller.js';

const router = express.Router();

router.get('/', authRequired, conversationsController.list);
router.post('/', authRequired, conversationsController.create);
router.get('/researchers', authRequired, conversationsController.listResearchers);
router.post('/users/:userId/ensure', authRequired, conversationsController.ensureDirect);
router.post('/projects/:projectId/ensure', authRequired, conversationsController.ensureProject);
router.post('/cleanup', authRequired, conversationsController.cleanup);
router.delete('/all', authRequired, conversationsController.deleteAll);
router.get('/:id', authRequired, conversationsController.get);
router.get('/:id/messages', authRequired, conversationsController.messages);
router.post('/:id/messages', authRequired, conversationsController.sendMessage);
router.post('/:id/read', authRequired, conversationsController.markRead);

export default router;
