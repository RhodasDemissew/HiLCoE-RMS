import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { studentVerificationsService } from '../services/studentVerifications.service.js';

const router = express.Router();

router.use(authRequired);

router.get('/', async (req, res) => {
  try {
    const { page, limit, total, items } = await studentVerificationsService.list(req.query);
    res.json({ page, limit, total, items });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const doc = await studentVerificationsService.create(req.body);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const doc = await studentVerificationsService.update(req.params.id, req.body);
    res.json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await studentVerificationsService.remove(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/import', async (req, res) => {
  try {
    const summary = await studentVerificationsService.bulkImport(req.body?.entries || []);
    res.status(201).json(summary);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
