import fs from 'fs';
import mongoose from 'mongoose';
import dayjs from 'dayjs';
import { getFileStream } from '../services/storageService.js';
import { getOrCreateProgress, getAllStageTemplateUrls, isStageUnlocked, getStageStatus } from '../services/researcherProgress.service.js';
import { runFormatCheck } from '../services/formatChecker.service.js';
import { STAGE_ORDER, SUBMISSION_STATUSES } from '../constants/stages.js';
import { StageSubmission } from '../models/StageSubmission.js';
import { Defense } from '../models/Defense.js';
import {
  stageUploadMiddleware,
  createStageSubmission,
  listStageSubmissions,
  reviewSubmission,
  getSubmissionById,
  listStageSubmissionsForCoordinator,
} from '../services/stageSubmissions.service.js';

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

async function generateChartData(researcherId) {
  try {
    // Get submissions from the last 6 months
    const sixMonthsAgo = dayjs().subtract(6, 'month').toDate();
    
    const submissions = await StageSubmission.find({
      researcher: researcherId,
      submitted_at: { $gte: sixMonthsAgo }
    }).sort({ submitted_at: 1 });

    // Group by month
    const monthlyData = {};
    const months = [];
    
    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = dayjs().subtract(i, 'month');
      const monthKey = month.format('MMM YYYY');
      months.push(monthKey);
      monthlyData[monthKey] = { submissions: 0, approvals: 0 };
    }

    // Count submissions and approvals by month
    submissions.forEach(submission => {
      const month = dayjs(submission.submitted_at).format('MMM YYYY');
      if (monthlyData[month]) {
        monthlyData[month].submissions++;
        if (submission.status === SUBMISSION_STATUSES.APPROVED) {
          monthlyData[month].approvals++;
        }
      }
    });

    return {
      labels: months,
      series: [
        {
          name: 'Submissions',
          data: months.map(month => monthlyData[month]?.submissions || 0)
        },
        {
          name: 'Approvals', 
          data: months.map(month => monthlyData[month]?.approvals || 0)
        }
      ]
    };
  } catch (error) {
    console.error('Error generating chart data:', error);
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      series: [
        { name: 'Submissions', data: [0, 0, 0, 0, 0, 0] },
        { name: 'Approvals', data: [0, 0, 0, 0, 0, 0] }
      ]
    };
  }
}

export const researcherStagesController = {
  dashboardOverview: async (req, res) => {
    try {
      const researcherId = req.user?.id;
      if (!researcherId) throw new Error('User context missing');
      if (!mongoose.Types.ObjectId.isValid(researcherId)) throw new Error('Invalid researcher identifier');

      const objectId = new mongoose.Types.ObjectId(researcherId);
      const statusBuckets = await StageSubmission.aggregate([
        { $match: { researcher: objectId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);

      const pendingStatuses = [
        SUBMISSION_STATUSES.UNDER_REVIEW,
        SUBMISSION_STATUSES.AWAITING_COORDINATOR,
      ];
      const attentionStatuses = [
        SUBMISSION_STATUSES.NEEDS_CHANGES,
        SUBMISSION_STATUSES.REJECTED,
      ];

      const kpis = {
        totalSubmissions: 0,
        pendingReviews: 0,
        approved: 0,
        needsAttention: 0,
      };

      statusBuckets.forEach((bucket) => {
        const status = bucket?._id;
        const count = bucket?.count || 0;
        if (!status || !count) return;
        kpis.totalSubmissions += count;
        if (pendingStatuses.includes(status)) {
          kpis.pendingReviews += count;
        }
        if (status === SUBMISSION_STATUSES.APPROVED) {
          kpis.approved += count;
        }
        if (attentionStatuses.includes(status)) {
          kpis.needsAttention += count;
        }
      });

      const progress = await getOrCreateProgress(researcherId);
      const totalStages = STAGE_ORDER.length || 1;
      const milestones = STAGE_ORDER.map((name, index) => {
        const statusInfo = getStageStatus(progress, index);
        let statusLabel = 'Pending';
        let percent = 0;
        let daysLeft = null;

        if (statusInfo === 'completed' || index < progress.current_stage_index) {
          statusLabel = 'Completed';
          percent = 100;
        } else if (statusInfo === 'current') {
          statusLabel = 'In Progress';
          percent = Math.max(10, Math.round((index / totalStages) * 100));
        } else if (typeof statusInfo === 'object' && statusInfo) {
          if (statusInfo.state === 'resubmit') {
            statusLabel = statusInfo.daysLeft != null
              ? `Resubmit (${statusInfo.daysLeft}d left)`
              : 'Resubmit';
            daysLeft = statusInfo.daysLeft ?? null;
          } else {
            statusLabel = 'In Progress';
          }
          percent = Math.max(10, Math.round((index / totalStages) * 100));
        } else {
          statusLabel = 'Pending';
          percent = 0;
        }

        const safePercent = Math.max(0, Math.min(100, percent));

        return {
          label: name,
          index,
          status: statusLabel,
          percent: safePercent,
          daysLeft,
        };
      });

      const now = new Date();

      const defenses = await Defense.find({
        candidate: objectId,
        status: { $ne: 'cancelled' },
        start_at: { $gte: now },
      })
        .sort({ start_at: 1 })
        .limit(3)
        .select('title start_at end_at venue meeting_link modality status buffer_mins');

      const synopsis = await StageSubmission.findOne({
        researcher: objectId,
        stage_index: 0,
        scheduled_at: { $gte: now },
      })
        .sort({ scheduled_at: 1 })
        .select('title scheduled_at scheduled_end_at scheduled_venue scheduled_meeting_link status');

      const upcoming = [];

      if (synopsis?.scheduled_at) {
        upcoming.push({
          id: `synopsis:${synopsis._id}`,
          type: 'synopsis',
          title: synopsis.title || 'Synopsis Review',
          startAt: synopsis.scheduled_at,
          endAt: synopsis.scheduled_end_at,
          venue: synopsis.scheduled_venue || '',
          link: synopsis.scheduled_meeting_link || '',
          status: synopsis.status || '',
        });
      }

      defenses.forEach((defense) => {
        upcoming.push({
          id: `defense:${defense._id}`,
          type: 'defense',
          title: defense.title,
          startAt: defense.start_at,
          endAt: defense.end_at,
          venue: defense.venue || '',
          link: defense.meeting_link || '',
          modality: defense.modality || '',
          status: defense.status || '',
          bufferMins: defense.buffer_mins,
        });
      });

      upcoming.sort((a, b) => {
        const aTime = a?.startAt ? new Date(a.startAt).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b?.startAt ? new Date(b.startAt).getTime() : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      });

      // Generate chart data for submissions and approvals over time
      const chartData = await generateChartData(objectId);
      
      res.json({
        kpis,
        milestones,
        upcoming,
        chartLabels: chartData.labels,
        chartSeries: chartData.series,
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
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

