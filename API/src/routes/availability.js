import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { DefenseAvailabilityQuery } from '../dtos/defense.dto.js';
import { defenseController } from '../controllers/defense.controller.js';

const router = express.Router();

router.use(authRequired);

router.get('/', validate({ query: DefenseAvailabilityQuery }), defenseController.availability);

export default router;

