import fs from 'fs';
import { getFileStream } from '../services/storageService.js';
import dayjs from 'dayjs';
import { getOrCreateProgress, getAllStageTemplateUrls, isStageUnlocked, getStageStatus } from '../services/researcherProgress.service.js';
import { runFormatCheck } from '../services/formatChecker.service.js';
import { STAGE_ORDER } from '../constants/stages.js';
import { stageUploadMiddleware, createStageSubmission, listStageSubmissions, reviewSubmission, getSubmissionById, listStageSubmissionsForCoordinator } from '../services/stageSubmissions.service.js';

function serializeSubmission(doc) {
  return {
    id: doc._id,
    stage: STAGE_ORDER[doc.stage_index],
    stageIndex: doc.stage_index,
    title: doc.title,
    notes: doc.notes,
    status: doc.status,
    submittedAt: doc.submitted_at || doc.created_at,
    reviewedAt: doc.reviewed_at,
    version: doc.version,
    file: {
      filename: doc.file?.filename,
      size: doc.file?.size,
      mimetype: doc.file?.mimetype,
    },
    analysis: doc.analysis ? {
      status: doc.analysis.status,
      progress: doc.analysis.progress,
      score: doc.analysis.score,
      updatedAt: doc.analysis.updated_at,
    } : undefined,
    format: doc.format_check ? {
      status: doc.format_check.status,
      overallPass: doc.format_check.overall_pass,
      score: doc.format_check.score,
      policyName: doc.format_check.policy_name,
      policyVersion: doc.format_check.policy_version,
      checkedAt: doc.format_check.checked_at,
      findings: doc.format_check.findings,
      error: doc.format_check.error,
    } : undefined,
  };
}

export const researcherStagesController = {
  progress: async (req, res) => {
    try {
      const progress = await getOrCreateProgress(req.user.id);
      const templateUrls = await getAllStageTemplateUrls();
      res.json({
        researcherId: req.user.id,
        currentStageIndex: progress.current_stage_index,
        resubmitUntil: progress.resubmit_until,
        templateUrls,
        stages: STAGE_ORDER.map((name, index) => {
          const statusInfo = getStageStatus(progress, index);
          const status = typeof statusInfo === 'string' ? statusInfo : statusInfo.state;
          const daysLeft = typeof statusInfo === 'object' ? statusInfo.daysLeft : null;
          return {
            name,
            index,
            unlocked: isStageUnlocked(progress, index),
            status,
            daysLeft,
          };
        }),
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  template: async (req, res) => {
    try {
      const progress = await getOrCreateProgress(req.user.id);
      const templateUrls = await getAllStageTemplateUrls();
      res.json(templateUrls);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  listSubmissions: async (req, res) => {
    try {
      const submissions = await listStageSubmissions({ userId: req.user.id, stage: req.query.stage });
      res.json({ items: submissions.map(serializeSubmission) });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  createSubmission: [
    stageUploadMiddleware,
    async (req, res) => {
      try {
        const submission = await createStageSubmission({
          userId: req.user.id,
          title: req.body.title,
          notes: req.body.notes,
          stageName: req.body.documentType,
          acknowledged: req.body.acknowledged === 'true' || req.body.acknowledged === true,
          file: req.file,
        });
        res.status(201).json(serializeSubmission(submission));
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    },
  ],

  reviewSubmission: async (req, res) => {
    try {
      const roleName = (req.user?.role || '').toLowerCase();
      const allowed = roleName.includes('coordinator') || roleName.includes('supervisor') || roleName.includes('advisor');
      if (!allowed) return res.status(403).json({ error: 'Not authorized' });
      const submission = await reviewSubmission({
        submissionId: req.params.id,
        reviewerId: req.user.id,
        reviewerRole: req.user.role,
        decision: req.body.decision,
        notes: req.body.notes,
      });
      res.json(serializeSubmission(submission));
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  coordinatorList: async (req, res) => {
    try {
      const roleName = (req.user?.role || '').toLowerCase();
      const allowed = roleName.includes('coordinator') || roleName.includes('supervisor') || roleName.includes('advisor');
      if (!allowed) return res.status(403).json({ error: 'Not authorized' });
      const submissions = await listStageSubmissionsForCoordinator({ stage: req.query.stage, reviewerId: req.user.id, role: req.user.role });
      res.json({ items: submissions.map((doc) => ({
        ...serializeSubmission(doc),
        researcher: doc.researcher,
      })) });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  analyze: async (req, res) => {
    try {
      const submission = await getSubmissionById(req.params.id, null);
      // Simulate AI/NLP job: complete immediately with pseudo score
      submission.analysis = {
        status: 'completed',
        progress: Math.floor(Math.random() * 80) + 20,
        score: Math.floor(Math.random() * 80) + 20,
        updated_at: new Date(),
      };
      await submission.save();
      res.json(serializeSubmission(submission));
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  analysis: async (req, res) => {
    try {
      const submission = await getSubmissionById(req.params.id, null);
      const s = serializeSubmission(submission);
      res.json(s.analysis || { status: 'idle', progress: 0 });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  download: async (req, res) => {
    try {
      const isCoordinator = req.user?.role && req.user.role.toLowerCase().includes('coordinator');
      const submission = await getSubmissionById(req.params.id, isCoordinator ? null : req.user.id);
      res.setHeader('Content-Type', submission.file?.mimetype || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${submission.file?.filename || 'submission'}"`);
      const stream = getFileStream(submission.file.path);
      stream.on('error', (err) => {
        console.warn('Download stream error', { id: req.params.id, path: submission.file?.path, err: String(err && err.message || err) });
        if (!res.headersSent) res.status(404).json({ error: 'File not found' });
      });
      stream.pipe(res);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // Formatting compliance endpoints
  formatCheck: async (req, res) => {
    try {
      const submission = await getSubmissionById(req.params.id, null);
      submission.format_check = { ...(submission.format_check || {}), status: 'running', error: '' };
      await submission.save();
      const report = await runFormatCheck({ submission, userId: submission.researcher });
      submission.format_check = report;
      await submission.save();
      res.json(serializeSubmission(submission).format);
    } catch (err) {
      try {
        const s = await getSubmissionById(req.params.id, null);
        s.format_check = { ...(s.format_check || {}), status: 'failed', error: err.message || 'failed', checked_at: new Date() };
        await s.save();
      } catch {}
      res.status(400).json({ error: err.message });
    }
  },
  formatReport: async (req, res) => {
    try {
      const submission = await getSubmissionById(req.params.id, null);
      const s = serializeSubmission(submission);
      res.json(s.format || { status: 'idle' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  formatReportDownload: async (req, res) => {
    try {
      const submission = await getSubmissionById(req.params.id, null);
      const s = serializeSubmission(submission);
      const report = s.format || { status: 'idle' };
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=\"format-report-${submission._id}.json\"`);
      res.send(JSON.stringify(report, null, 2));
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};

