import express from 'express';
import mongoose from 'mongoose';
import { buildQueryOptions } from '../utils/paginate.js';

// Import whitelisted models
import { Role } from '../models/Role.js';
import { User } from '../models/User.js';
import { Feedback } from '../models/Feedback.js';
import { Advisor } from '../models/Advisor.js';
import { AuditLog } from '../models/AuditLog.js';
import { Coordinator } from '../models/Coordinator.js';
import { Defense } from '../models/Defense.js';
import { DocumentTemplate } from '../models/DocumentTemplate.js';
import { ExaminerAssignment } from '../models/ExaminerAssignment.js';
import { Examiner } from '../models/Examiner.js';
import { ExtensionRequest } from '../models/ExtensionRequest.js';
import { Grade } from '../models/Grade.js';
import { Notification } from '../models/Notification.js';
import { Project } from '../models/Project.js';
import { Researcher } from '../models/Researcher.js';
import { Schedule } from '../models/Schedule.js';
import { Submission } from '../models/Submission.js';

const router = express.Router();

const registry = {
  roles: Role,
  users: User,
  feedback: Feedback,
  advisors: Advisor,
  audit_logs: AuditLog,
  coordinators: Coordinator,
  defenses: Defense,
  document_templates: DocumentTemplate,
  examiner_assignments: ExaminerAssignment,
  examiners: Examiner,
  extension_requests: ExtensionRequest,
  grades: Grade,
  notifications: Notification,
  projects: Project,
  researchers: Researcher,
  schedules: Schedule,
  submissions: Submission,
};

function resolveModel(collection) {
  const model = registry[collection];
  if (!model) throw new Error(`Collection not allowed: ${collection}`);
  return model;
}

// LIST
router.get('/:collection', async (req, res) => {
  try {
    const Model = resolveModel(req.params.collection);
    const { skip, limit, sort, page } = buildQueryOptions(req.query);
    const filter = {}; // simple for now; extend as needed
    const [items, total] = await Promise.all([
      Model.find(filter).skip(skip).limit(limit).sort(sort),
      Model.countDocuments(filter)
    ]);
    res.json({ page, limit, total, items });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET by id
router.get('/:collection/:id', async (req, res) => {
  try {
    const Model = resolveModel(req.params.collection);
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const doc = await Model.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// CREATE
router.post('/:collection', async (req, res) => {
  try {
    const Model = resolveModel(req.params.collection);
    const doc = await Model.create(req.body);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE partial
router.patch('/:collection/:id', async (req, res) => {
  try {
    const Model = resolveModel(req.params.collection);
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete('/:collection/:id', async (req, res) => {
  try {
    const Model = resolveModel(req.params.collection);
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;