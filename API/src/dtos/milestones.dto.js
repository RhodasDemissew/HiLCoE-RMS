import { z } from 'zod';

export const CreateMilestoneDto = z.object({
  projectId: z.string().min(1),
  type: z.enum(['registration','synopsis','proposal','progress1','progress2','thesis_precheck','thesis_postdefense','defense','journal']),
  due_at: z.string().datetime().optional()
});

export const TransitionParams = z.object({ id: z.string().min(1) });
export const TransitionDto = z.object({
  to: z.enum(['draft','submitted','under_review','changes_requested','approved','scheduled','graded','archived'])
});


