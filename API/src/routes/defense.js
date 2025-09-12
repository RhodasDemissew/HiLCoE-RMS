import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { AssignExaminerParams, AssignExaminerDto, ScheduleDefenseParams, ScheduleDefenseDto, GradeParams, GradeDto } from '../dtos/defense.dto.js';
import { defenseController } from '../controllers/defense.controller.js';

const router = express.Router();

router.post('/:projectId/assign-examiner', authRequired, requireRole('Coordinator','Admin'), validate({ params: AssignExaminerParams, body: AssignExaminerDto }), defenseController.assignExaminer);

router.post('/:projectId/schedule-defense', authRequired, requireRole('Coordinator','Admin'), validate({ params: ScheduleDefenseParams, body: ScheduleDefenseDto }), defenseController.schedule);

router.post('/:projectId/grades', authRequired, requireRole('Examiner','Coordinator','Admin'), validate({ params: GradeParams, body: GradeDto }), defenseController.grade);

export default router;
