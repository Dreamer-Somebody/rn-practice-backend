import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(1).max(50),
});

export const userIdSchema = z.object({
  id: z.string().min(1),
});
