import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { dashboardController } from '../controllers/dashboard.controller.js';

const router = express.Router();

router.use(authRequired);

// Get dashboard statistics (Coordinator/Admin only)
router.get('/statistics', requireRole('Coordinator', 'Admin'), dashboardController.getStatistics);

export default router;
