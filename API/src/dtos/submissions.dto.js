import { z } from 'zod';

const FileUpload = z.object({
  filename: z.string().min(1),
  mimetype: z.string().optional(),
  content: z.string().min(1)
});

export const CreateSubmissionDto = z.object({
  milestoneId: z.string().min(1),
  notes: z.string().optional(),
  files: z.array(FileUpload).default([])
});

export const FileParams = z.object({ id: z.string().min(1), index: z.string().regex(/^\d+$/) });

