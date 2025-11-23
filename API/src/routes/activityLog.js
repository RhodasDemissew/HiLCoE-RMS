import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { activityLogController } from '../controllers/activityLog.controller.js';

const router = express.Router();

router.use(authRequired);

// Get activity log with pagination and filtering
router.get('/', requireRole('Coordinator', 'Admin', 'Supervisor'), activityLogController.getActivityLog);

// Get recent activity for dashboard
router.get('/recent', requireRole('Coordinator', 'Admin', 'Supervisor'), activityLogController.getRecentActivity);

export default router;
