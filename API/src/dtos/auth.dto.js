import { z } from 'zod';

export const LoginDto = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const InviteDto = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  roleName: z.enum(['Admin','Coordinator','Advisor','Examiner','Researcher'])
});

export const ActivateDto = z.object({
  token: z.string().min(1),
  password: z.string().min(6)
});

export const RegisterDto = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  student_id: z.string().max(40).optional(),
});

export const ResetRequestDto = z.object({
  email: z.string().email(),
});

export const ResetConfirmDto = z.object({
  token: z.string().min(16).max(128),
  password: z.string().min(8),
});
