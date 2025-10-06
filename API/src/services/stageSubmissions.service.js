import dayjs from 'dayjs';
import multer from 'multer';
import { StageSubmission } from '../models/StageSubmission.js';
import { User } from '../models/User.js';
import { Role } from '../models/Role.js';
import { StudentVerification } from '../models/StudentVerification.js';
import { ResearchProgress } from '../models/ResearchProgress.js';
import { Project } from '../models/Project.js';
import { STAGE_ORDER, SUBMISSION_STATUSES, getStageIndex, getStageKey } from '../constants/stages.js';
import { getOrCreateProgress, isStageUnlocked, advanceProgress, markSynopsisRejected } from './researcherProgress.service.js';
import { saveBufferFile } from './storageService.js';
import { notify } from './notificationService.js';
import { messagingService } from './messaging.service.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Unsupported file type. Only PDF and DOCX are allowed.'));
  },
});

export const stageUploadMiddleware = upload.single('file');

function validateStageSelection(progress, stageName) {
  const stageIndex = getStageIndex(stageName);
  if (stageIndex === -1) throw new Error('Invalid document type');
  if (!isStageUnlocked(progress, stageIndex)) {
    if (stageIndex === 0 && progress.resubmit_until && dayjs(progress.resubmit_until).isBefore(dayjs())) {
      throw new Error('Resubmission window expired');
    }
    throw new Error('Stage locked. Complete previous stages first.');
  }
  return stageIndex;
}

export async function createStageSubmission({ userId, title, notes = '', stageName, file, acknowledged }) {
  if (!acknowledged) throw new Error('You must acknowledge before submitting.');
  if (!file) throw new Error('File is required.');
  const progress = await getOrCreateProgress(userId);
  const stageIndex = validateStageSelection(progress, stageName);

  const stageKey = getStageKey(stageName);
  const storageMeta = await saveBufferFile(`researchers/${userId}/${stageKey}`, file.originalname, file.buffer, file.mimetype);

  const version = await StageSubmission.countDocuments({ researcher: userId, stage_index: stageIndex }).then((count) => count + 1);

  const submission = await StageSubmission.create({
    researcher: userId,
    stage_index: stageIndex,
    stage_key: stageKey,
    title,
    notes,
    file: storageMeta,
    status: SUBMISSION_STATUSES.UNDER_REVIEW,
    version,
  });
  // Notify the assigned advisor/supervisor for stages after Synopsis (e.g., Proposal)
  try {
    if (stageIndex > 0) {
      const user = await User.findById(userId).select('name student_verification');
      if (user?.student_verification) {
        const sv = await StudentVerification.findById(user.student_verification).select('assigned_supervisor');
        const advisorId = sv?.assigned_supervisor?.supervisor_id;
        if (advisorId) {
          await notify(advisorId, 'stage_submission_created', {
            submissionId: String(submission._id),
            stage: stageName,
            subject_id: String(userId),
            subject_name: user?.name || '',
          });
        }
      }
    }
  } catch {}
  return submission;
}

export async function listStageSubmissions({ userId, stage }) {
  const filter = { researcher: userId };
  if (stage) {
    const idx = getStageIndex(stage);
    if (idx === -1) throw new Error('Invalid stage');
    filter.stage_index = idx;
  }
  return StageSubmission.find(filter).sort({ created_at: -1 });
}

export async function listStageSubmissionsForCoordinator({ stage, reviewerId, role }) {
  const filter = {};
  if (stage) {
    const idx = getStageIndex(stage);
    if (idx === -1) throw new Error('Invalid stage');
    filter.stage_index = idx;
  }

  // If the requester is a supervisor/advisor (not a coordinator), limit to assigned students
  const roleName = String(role || '').toLowerCase();
  const isCoordinator = roleName.includes('coordinator');
  if (!isCoordinator && reviewerId) {
    const svRecs = await StudentVerification.find({ 'assigned_supervisor.supervisor_id': reviewerId }).select('_id');
    const svIds = svRecs.map((d) => d._id);
    if (svIds.length) {
      const users = await User.find({ student_verification: { $in: svIds } }).select('_id');
      const userIds = users.map((u) => u._id);
      // When there are no assigned users, use an empty $in to match nothing safely
      filter.researcher = { $in: userIds.length ? userIds : [] };
    } else {
      // No student verifications found; ensure query matches nothing without casting errors
      filter.researcher = { $in: [] };
    }
  }

  // Synopsis (index 0) is coordinator-only; hide from supervisors/advisors
  if (!isCoordinator) {
    if (typeof filter.stage_index === 'undefined') filter.stage_index = { $ne: 0 };
    else if (typeof filter.stage_index === 'number') {
      if (filter.stage_index === 0) return [];
    } else if (filter.stage_index && typeof filter.stage_index === 'object') {
      filter.stage_index = { ...filter.stage_index, $ne: 0 };
    }
  }

  return StageSubmission.find(filter).sort({ created_at: -1 }).populate('researcher', 'name email');
}

export async function reviewSubmission({ submissionId, reviewerId, reviewerRole, decision, notes }) {
  const submission = await StageSubmission.findById(submissionId);
  if (!submission) throw new Error('Submission not found');

  const progress = await getOrCreateProgress(submission.researcher);
  const stageName = STAGE_ORDER[submission.stage_index];
  const roleName = String(reviewerRole || '').toLowerCase();
  const isCoordinator = roleName.includes('coordinator');
  const reviewer = await User.findById(reviewerId).select('name');
  const actorName = reviewer?.name || 'Reviewer';

  // Only coordinators can review Synopsis
  if (submission.stage_index === 0 && !isCoordinator) {
    throw new Error('Only coordinators may review synopsis');
  }

  switch (decision) {
    case 'approve':
      if (isCoordinator) {
        submission.status = SUBMISSION_STATUSES.APPROVED;
        submission.reviewed_at = new Date();
        submission.reviewer = reviewerId;
        submission.decision_notes = notes || '';
        await submission.save();
        await advanceProgress(progress, submission.stage_index);
        try { await notify(submission.researcher, 'submission_approved', { submissionId: String(submission._id), stage: stageName, actor_id: reviewerId, actor_name: actorName }); } catch {}
      } else {
        // Advisor/supervisor approval forwards to coordinator for final decision
        submission.status = SUBMISSION_STATUSES.AWAITING_COORDINATOR;
        submission.reviewed_at = new Date();
        submission.reviewer = reviewerId;
        submission.decision_notes = notes || '';
        await submission.save();
        try { await notify(submission.researcher, 'submission_forwarded', { submissionId: String(submission._id), stage: stageName, actor_id: reviewerId, actor_name: actorName }); } catch {}
        // Explicitly notify all coordinators
        try {
          const coordRole = await Role.findOne({ name: /coordinator/i });
          if (coordRole?._id) {
            const coords = await User.find({ role: coordRole._id }).select('_id');
            const researcherUser = await User.findById(submission.researcher).select('name');
            for (const c of coords) {
              try { await notify(c._id, 'submission_needs_final_review', { submissionId: String(submission._id), stage: stageName, actor_id: reviewerId, actor_name: actorName, subject_id: String(submission.researcher), subject_name: researcherUser?.name || '' }); } catch {}
            }
          }
        } catch {}
      }
      break;
    case 'reject':
      submission.status = SUBMISSION_STATUSES.REJECTED;
      submission.reviewed_at = new Date();
      submission.reviewer = reviewerId;
      submission.decision_notes = notes || '';
      await submission.save();
      if (submission.stage_index === 0) {
        await markSynopsisRejected(progress);
      }
      try { await notify(submission.researcher, 'submission_rejected', { submissionId: String(submission._id), stage: stageName, actor_id: reviewerId, actor_name: actorName }); } catch {}
      break;
    case 'needs_changes':
      submission.status = SUBMISSION_STATUSES.NEEDS_CHANGES;
      submission.reviewed_at = new Date();
      submission.reviewer = reviewerId;
      submission.decision_notes = notes || '';
      await submission.save();
      try { await notify(submission.researcher, 'submission_changes_requested', { submissionId: String(submission._id), stage: stageName, actor_id: reviewerId, actor_name: actorName }); } catch {}
      try {
        const project = await Project.findOne({ researcher: submission.researcher }).select('_id title researcher advisor');
        if (project) {
          const body = notes ? `Feedback for ${stageName}: ${notes}` : `Your ${stageName} submission needs changes.`;
          await messagingService.emitSystemMessageForProject(project._id, {
            body,
            meta: {
              submissionId: String(submission._id),
              stage: stageName,
              decision: 'needs_changes',
              reviewerId: String(reviewerId),
            },
            kind: 'feedback',
            actorId: reviewerId,
          });
        }
      } catch (err) {
        console.warn('messaging emit failed', err?.message || err);
      }
      break;
    default:
      throw new Error('Invalid decision');
  }
  return submission;
}

export async function getSubmissionById(id, userId) {
  const submission = await StageSubmission.findById(id);
  if (!submission) throw new Error('Submission not found');
  if (userId && String(submission.researcher) !== String(userId)) {
    throw new Error('Not authorized');
  }
  return submission;
}




