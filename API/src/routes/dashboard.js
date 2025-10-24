import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { dashboardController } from '../controllers/dashboard.controller.js';

const router = express.Router();

router.use(authRequired);

// Get dashboard statistics (Coordinator/Admin only)
router.get('/statistics', requireRole('Coordinator', 'Admin'), dashboardController.getStatistics);

// Get submissions by stage (Coordinator/Admin only)
router.get('/submissions-by-stage', requireRole('Coordinator', 'Admin'), dashboardController.getSubmissionsByStage);

// Get recent messages for dashboard (All roles)
router.get('/recent-messages', dashboardController.getRecentMessages);

// Get upcoming events for dashboard (Coordinator/Admin only)
router.get('/upcoming-events', requireRole('Coordinator', 'Admin'), dashboardController.getUpcomingEvents);

export default router;
