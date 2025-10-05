import { z } from 'zod';

export const CreateTemplateDto = z.object({
  type: z.string().min(1),
  version: z.string().default('1.0'),
  url: z.string().url()
});

export const UpdateTemplateDto = z.object({
  type: z.string().min(1).optional(),
  version: z.string().optional(),
  url: z.string().url().optional()
});

export const TemplateIdParams = z.object({ id: z.string().min(1) });

