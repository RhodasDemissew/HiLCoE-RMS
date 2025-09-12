import { z } from 'zod';

export const CreateTemplateDto = z.object({
  type: z.string().min(1),
  version: z.string().default('1.0'),
  url: z.string().url()
});

