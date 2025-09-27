import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { CreateProjectDto, AssignAdvisorParams, AssignAdvisorDto, ProjectMilestoneParams, ProjectMilestoneScheduleParams, ProjectMilestoneScheduleDto } from '../dtos/projects.dto.js';
import { projectsController } from '../controllers/projects.controller.js';

const router = express.Router();

// Create a project (Researcher)
router.post('/', authRequired, requireRole('Researcher','Admin','Coordinator'), validate({ body: CreateProjectDto }), projectsController.create);

router.get('/', authRequired, projectsController.list);

// Project milestone listing
router.get('/:id/milestones', authRequired, validate({ params: ProjectMilestoneParams }), projectsController.milestones);

// Update milestone schedule (Coordinator/Admin)
router.put('/:id/milestones/:type/schedule', authRequired, requireRole('Coordinator','Admin'), validate({ params: ProjectMilestoneScheduleParams, body: ProjectMilestoneScheduleDto }), projectsController.updateSchedule);

// Assign advisor (Coordinator/Admin)
router.post('/:id/assign-advisor', authRequired, requireRole('Coordinator','Admin'), validate({ params: AssignAdvisorParams, body: AssignAdvisorDto }), projectsController.assignAdvisor);

export default router;
