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

export const SUBMISSION_STATUS_META = {
  under_review: { label: 'Under Review', tone: 'info' },
  needs_changes: { label: 'Needs Changes', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
};

export function getStageIndex(stage) {
  return STAGE_ORDER.indexOf(stage);
}
