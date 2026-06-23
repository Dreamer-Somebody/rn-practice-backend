import { describe, expect, it } from 'vitest';

describe('infrastructure clients', () => {
  it('exports prisma and redis clients', async () => {
    process.env.DATABASE_URL ??=
      'postgresql://postgres:postgres@localhost:5432/rn_practice_backend?schema=public';
    process.env.REDIS_URL ??= 'redis://localhost:6379';

    const { prisma } = await import('../../src/infrastructure/prisma/client.js');
    const { redis } = await import('../../src/infrastructure/redis/client.js');

    expect(prisma).toBeTruthy();
    expect(redis).toBeTruthy();
  });
});
