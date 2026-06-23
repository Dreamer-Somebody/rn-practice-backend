import { prisma } from '../../infrastructure/prisma/client.js';
import type { CreateUserInput } from './user.types.js';

export const userRepository = {
  create(data: CreateUserInput) {
    return prisma.user.create({ data });
  },

  findMany() {
    return prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },
};
