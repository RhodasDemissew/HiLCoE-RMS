import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { studentVerificationsService } from '../services/studentVerifications.service.js';

const router = express.Router();

router.use(authRequired);

router.delete('/:id', async (req, res) => {
  try {
    const result = await studentVerificationsService.remove(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
