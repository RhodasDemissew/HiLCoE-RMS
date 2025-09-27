import { z } from 'zod';

export const LoginDto = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const VerifyStudentDto = z.object({
  first_name: z.string().min(1),
  middle_name: z.string().optional(),
  last_name: z.string().min(1),
  student_id: z.string().min(1)
});

export const RegisterDto = z.object({
  verification_token: z.string().min(10),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8)
});

export const ResetRequestDto = z.object({
  email: z.string().email(),
});

export const ResetConfirmDto = z.object({
  token: z.string().min(16).max(128),
  password: z.string().min(8),
});
