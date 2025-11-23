import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { calendarController } from '../controllers/calendar.controller.js';

const router = express.Router();

router.use(authRequired);

router.get('/', calendarController.list);

export default router;

