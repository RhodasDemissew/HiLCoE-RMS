import { z } from 'zod';

export const CreateProjectDto = z.object({
  title: z.string().min(1),
  area: z.string().optional(),
  semester: z.string().optional()
});

export const AssignAdvisorParams = z.object({
  id: z.string().min(1)
});

export const AssignAdvisorDto = z.object({
  advisorId: z.string().min(1)
});

