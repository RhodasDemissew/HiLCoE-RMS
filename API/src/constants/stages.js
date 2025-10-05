export const STAGE_ORDER = [
  'Synopsis',
  'Proposal',
  'Progress Report 1',
  'Progress Report 2',
  'Thesis Report',
  'Final Draft (Pre-Defense)',
  'Final Draft (Post-Defense)',
  'Journal Article',
];

export const SUBMISSION_STATUSES = {
  UNDER_REVIEW: 'under_review',
  AWAITING_COORDINATOR: 'awaiting_coordinator',
  NEEDS_CHANGES: 'needs_changes',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export function getStageIndex(stageName) {
  return STAGE_ORDER.indexOf(stageName);
}

export function getStageKey(stageName) {
  return stageName
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[()]/g, '')
    .replace(/__/g, '_');
}
