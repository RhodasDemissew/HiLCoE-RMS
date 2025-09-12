export const MilestoneTypes = ['registration','synopsis','proposal','progress','thesis','defense','journal'];

export const Status = ['draft','submitted','under_review','changes_requested','approved','scheduled','graded','archived'];

// Minimal transition rules; enforce advisor approval before external review
export function canTransition(role, type, from, to) {
  const idx = (s) => Status.indexOf(s);
  if (idx(from) === -1 || idx(to) === -1) return false;
  // Allow forward-only by default
  if (idx(to) < idx(from)) return false;
  // Special rule: proposal must be approved by Advisor before moving to scheduled/graded
  if (type === 'proposal' && (to === 'scheduled' || to === 'graded')) return false;
  // Role-based basic checks
  if (from === 'draft' && to === 'submitted') return role === 'Researcher';
  if (to === 'under_review') return role === 'Advisor' || role === 'Coordinator' || role === 'Examiner';
  if (to === 'approved' || to === 'changes_requested') return role === 'Advisor' || role === 'Examiner';
  if (to === 'scheduled') return role === 'Coordinator';
  if (to === 'graded') return role === 'Examiner' || role === 'Coordinator';
  return true;
}

