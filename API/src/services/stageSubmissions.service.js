import dayjs from 'dayjs';
import multer from 'multer';
import { StageSubmission } from '../models/StageSubmission.js';
import { User } from '../models/User.js';
import { StudentVerification } from '../models/StudentVerification.js';
import { ResearchProgress } from '../models/ResearchProgress.js';
import { STAGE_ORDER, SUBMISSION_STATUSES, getStageIndex, getStageKey } from '../constants/stages.js';
import { getOrCreateProgress, isStageUnlocked, advanceProgress, markSynopsisRejected } from './researcherProgress.service.js';
import { saveBufferFile } from './storageService.js';

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
      if (userIds.length) filter.researcher = { $in: userIds };
      else filter.researcher = '__none__';
    } else {
      filter.researcher = '__none__';
    }
  }

  return StageSubmission.find(filter).sort({ created_at: -1 }).populate('researcher', 'name email');
}

export async function reviewSubmission({ submissionId, reviewerId, decision, notes }) {
  const submission = await StageSubmission.findById(submissionId);
  if (!submission) throw new Error('Submission not found');

  const progress = await getOrCreateProgress(submission.researcher);
  const stageName = STAGE_ORDER[submission.stage_index];

  switch (decision) {
    case 'approve':
      submission.status = SUBMISSION_STATUSES.APPROVED;
      submission.reviewed_at = new Date();
      submission.reviewer = reviewerId;
      submission.decision_notes = notes || '';
      await submission.save();
      await advanceProgress(progress, submission.stage_index);
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
      break;
    case 'needs_changes':
      submission.status = SUBMISSION_STATUSES.NEEDS_CHANGES;
      submission.reviewed_at = new Date();
      submission.reviewer = reviewerId;
      submission.decision_notes = notes || '';
      await submission.save();
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
