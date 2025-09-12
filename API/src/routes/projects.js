import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { CreateProjectDto, AssignAdvisorParams, AssignAdvisorDto } from '../dtos/projects.dto.js';
import { projectsController } from '../controllers/projects.controller.js';

const router = express.Router();

// Create a project (Researcher)
router.post('/', authRequired, requireRole('Researcher','Admin','Coordinator'), validate({ body: CreateProjectDto }), projectsController.create);

router.get('/', authRequired, projectsController.list);

// Assign advisor (Coordinator/Admin)
router.post('/:id/assign-advisor', authRequired, requireRole('Coordinator','Admin'), validate({ params: AssignAdvisorParams, body: AssignAdvisorDto }), projectsController.assignAdvisor);

export default router;
