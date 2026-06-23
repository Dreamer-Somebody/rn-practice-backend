import type { Prisma } from '@prisma/client';
import type { z } from 'zod';
import type { createUserSchema, userIdSchema } from './user.schema.js';

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UserIdParams = z.infer<typeof userIdSchema>;
export type UserRecord = Prisma.UserGetPayload<Record<string, never>>;
