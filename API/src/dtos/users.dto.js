import { z } from 'zod';

export const CreateUserDto = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  roleName: z.enum(['Admin','Coordinator','Advisor','Examiner','Researcher'])
});

