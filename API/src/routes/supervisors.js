import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { supervisorsService } from '../services/supervisors.service.js';

const router = express.Router();

router.use(authRequired);

// List supervisors (optional search + pagination)
router.get('/', async (req, res) => {
  try {
    const { search = '', page = 1, limit = 25 } = req.query;
    const result = await supervisorsService.listSupervisors({ search, page, limit });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/available', async (_req, res) => {
  try {
    const supervisors = await supervisorsService.listForAssignment();
    res.json({ items: supervisors });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/specializations', async (_req, res) => {
  try {
    res.json({ items: await supervisorsService.listSpecializations() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/add', async (req, res) => {
  try {
    const supervisor = await supervisorsService.createSupervisor(req.body || {});
    res.status(201).json({ ok: true, supervisor });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/import', async (req, res) => {
  try {
    const mode = typeof req.query.mode === 'string' ? req.query.mode : 'strict';
    const summary = await supervisorsService.importSupervisors(req.body?.entries || [], { mode });
    res.status(201).json(summary);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const supervisor = await supervisorsService.updateSupervisor(req.params.id, req.body || {});
    res.json(supervisor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/assign', async (req, res) => {
  try {
    const student = await supervisorsService.assign(req.body || {});
    res.status(200).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/unassign', async (req, res) => {
  try {
    const student = await supervisorsService.unassign(req.body || {});
    res.status(200).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await supervisorsService.deleteSupervisor(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
