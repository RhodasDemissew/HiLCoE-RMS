import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { CreateUserDto } from '../dtos/users.dto.js';
import { usersController } from '../controllers/users.controller.js';

const router = express.Router();

router.get('/', authRequired, requireRole('Admin','Coordinator'), usersController.list);
router.post('/', authRequired, requireRole('Admin'), validate({ body: CreateUserDto }), usersController.create);

export default router;
