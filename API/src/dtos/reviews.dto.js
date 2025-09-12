import { z } from 'zod';

export const CreateReviewDto = z.object({
  milestoneId: z.string().min(1),
  decision: z.enum(['approved','changes_requested','under_review']),
  comments: z.string().optional()
});

