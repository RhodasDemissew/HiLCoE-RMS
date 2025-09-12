import { z } from 'zod';

export const AssignExaminerParams = z.object({ projectId: z.string().min(1) });
export const AssignExaminerDto = z.object({ examinerId: z.string().min(1), due_at: z.string().datetime().optional() });

export const ScheduleDefenseParams = z.object({ projectId: z.string().min(1) });
export const ScheduleDefenseDto = z.object({
  start_at: z.string().datetime(),
  end_at: z.string().datetime().optional(),
  location: z.string().optional(),
  virtual_link: z.string().url().optional()
});

export const GradeParams = z.object({ projectId: z.string().min(1) });
export const GradeDto = z.object({
  components: z.record(z.number()).default({}),
  total: z.number().default(0),
  finalized: z.boolean().default(false)
});

