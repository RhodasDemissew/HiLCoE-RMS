import { z } from 'zod';

const MilestoneTypeEnum = z.enum(['registration','synopsis','proposal','progress1','progress2','thesis_precheck','defense','thesis_postdefense','journal']);

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

export const ProjectMilestoneParams = z.object({
  id: z.string().min(1)
});

export const ProjectMilestoneScheduleParams = z.object({
  id: z.string().min(1),
  type: MilestoneTypeEnum
});

const nullableDateString = z.union([z.string().datetime(), z.null()]);

export const ProjectMilestoneScheduleDto = z.object({
  window_start: nullableDateString.optional(),
  window_end: nullableDateString.optional(),
  due_at: nullableDateString.optional(),
  notes: z.string().max(500).optional()
});
