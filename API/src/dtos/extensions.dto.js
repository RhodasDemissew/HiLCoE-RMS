import { z } from 'zod';

export const CreateExtensionDto = z.object({
  milestoneId: z.string().min(1),
  reason: z.string().min(1),
  new_due_at: z.string().datetime().optional()
});

export const DecideParams = z.object({ id: z.string().min(1) });
export const DecideDto = z.object({ decision: z.enum(['approved','rejected']) });

