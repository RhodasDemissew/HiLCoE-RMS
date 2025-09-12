import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { LoginDto, InviteDto, ActivateDto } from '../dtos/auth.dto.js';
import { authController } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/login', validate({ body: LoginDto }), authController.login);

router.get('/me', authRequired, authController.me);

// Admin invites a user -> generates activation token
router.post('/invite', authRequired, requireRole('Admin'), validate({ body: InviteDto }), authController.invite);

// User activates account with token and sets password
router.post('/activate', validate({ body: ActivateDto }), authController.activate);

export default router;
