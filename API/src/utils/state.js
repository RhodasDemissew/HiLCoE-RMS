export const MilestoneTypes = ['registration','synopsis','proposal','progress1','progress2','thesis_precheck','thesis_postdefense','defense','journal'];

export const Status = ['draft','submitted','under_review','changes_requested','approved','scheduled','graded','archived'];

const REVIEW_ROLES = new Set(['Advisor','Coordinator','Examiner']);
const APPROVE_ROLES = new Set(['Advisor','Examiner']);
const SCHEDULE_ROLES = new Set(['Coordinator']);
const GRADE_ROLES = new Set(['Examiner','Coordinator']);

const DEFENSE_TYPES = new Set(['defense']);

export function canTransition(role, type, from, to) {
  const idx = (s) => Status.indexOf(s);
  if (idx(from) === -1 || idx(to) === -1) return false;
  if (idx(to) < idx(from)) return false;

  if (from === 'draft' && to === 'submitted') {
    return role === 'Researcher';
  }

  if (to === 'under_review') {
    return REVIEW_ROLES.has(role);
  }

  if (to === 'approved' || to === 'changes_requested') {
    if (type === 'defense' && role === 'Coordinator') return true;
    return APPROVE_ROLES.has(role);
  }

  if (to === 'scheduled') {
    if (!DEFENSE_TYPES.has(type)) return false;
    return SCHEDULE_ROLES.has(role);
  }

  if (to === 'graded') {
    if (!DEFENSE_TYPES.has(type)) return false;
    return GRADE_ROLES.has(role);
  }

  return true;
}
