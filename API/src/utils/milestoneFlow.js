export const DEFAULT_SEQUENCES = {
  registration: 10,
  synopsis: 20,
  proposal: 30,
  progress1: 40,
  progress2: 50,
  thesis_precheck: 60,
  defense: 70,
  thesis_postdefense: 80,
  journal: 90,
};

const ASSIGNMENT_REQUIRED_DEFAULTS = {
  registration: false,
};

const REVIEWER_ROLE_DEFAULTS = {
  registration: ['Coordinator','Admin'],
  synopsis: ['Advisor','Coordinator'],
  proposal: ['Advisor','Coordinator'],
  progress1: ['Advisor','Coordinator'],
  progress2: ['Advisor','Coordinator'],
  thesis_precheck: ['Advisor','Coordinator'],
  defense: ['Coordinator','Examiner'],
  thesis_postdefense: ['Advisor','Coordinator'],
  journal: ['Advisor','Coordinator'],
};

const STAGE_ORDER = ['registration','synopsis','proposal','progress1','progress2','thesis_precheck','defense','thesis_postdefense','journal'];

const PREVIOUS_REQUIREMENTS = {
  proposal: { type: 'synopsis', statuses: ['approved'] },
  progress1: { type: 'proposal', statuses: ['approved'] },
  progress2: { type: 'progress1', statuses: ['approved'] },
  thesis_precheck: { type: 'progress2', statuses: ['approved'] },
  defense: { type: 'thesis_precheck', statuses: ['approved'] },
  thesis_postdefense: { type: 'defense', statuses: ['graded'] },
  journal: { type: 'thesis_postdefense', statuses: ['approved'] },
};

export function getPreviousRequirement(type) {
  return PREVIOUS_REQUIREMENTS[type] || null;
}

export function getNextStage(type) {
  const idx = STAGE_ORDER.indexOf(type);
  if (idx === -1) return null;
  if (idx === STAGE_ORDER.length - 1) return 'completed';
  return STAGE_ORDER[idx + 1];
}

export function requiresAdvisorForApproval(type) {
  return type !== 'registration';
}

export function defaultAssignmentRequired(type) {
  if (type in ASSIGNMENT_REQUIRED_DEFAULTS) return ASSIGNMENT_REQUIRED_DEFAULTS[type];
  return true;
}

export function defaultReviewerRoles(type) {
  return REVIEWER_ROLE_DEFAULTS[type] || ['Advisor','Coordinator'];
}
