import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../src/app/server.js';
import { prisma } from '../../src/infrastructure/prisma/client.js';

vi.mock('../../src/infrastructure/prisma/client.js', () => {
  const user = {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
  };

  return {
    prisma: { user },
  };
});

const mockedPrisma = vi.mocked(prisma, true);

describe('user routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a user', async () => {
    mockedPrisma.user.create.mockResolvedValue({
      id: 'user_1',
      email: 'ming@example.com',
      name: 'Ming',
      createdAt: new Date('2026-06-23T00:00:00.000Z'),
      updatedAt: new Date('2026-06-23T00:00:00.000Z'),
    });

    const app = createApp();
    const response = await request(app.callback()).post('/users').send({
      email: 'ming@example.com',
      name: 'Ming',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('ming@example.com');
  });

  it('rejects invalid payload', async () => {
    const app = createApp();
    const response = await request(app.callback()).post('/users').send({
      email: 'bad-email',
      name: '',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.message).toBe('Email format is invalid');
  });

  it('lists users', async () => {
    mockedPrisma.user.findMany.mockResolvedValue([
      {
        id: 'user_1',
        email: 'ming@example.com',
        name: 'Ming',
        createdAt: new Date('2026-06-23T00:00:00.000Z'),
        updatedAt: new Date('2026-06-23T00:00:00.000Z'),
      },
    ]);

    const app = createApp();
    const response = await request(app.callback()).get('/users');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data[0]?.email).toBe('ming@example.com');
  });

  it('returns 404 when user does not exist', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null);

    const app = createApp();
    const response = await request(app.callback()).get('/users/not-found');

    expect(response.status).toBe(404);
    expect(response.body.code).toBe('USER_NOT_FOUND');
  });

  it('returns 503 when database is unavailable and keeps the server responsive', async () => {
    const dbUnavailableError = Object.assign(
      new Error('Can\'t reach database server at `localhost:5432`'),
      {
        name: 'PrismaClientInitializationError',
      },
    );

    mockedPrisma.user.findMany.mockRejectedValue(dbUnavailableError);

    const app = createApp();
    const usersResponse = await request(app.callback()).get('/users');
    const healthResponse = await request(app.callback()).get('/health');

    expect(usersResponse.status).toBe(503);
    expect(usersResponse.body.success).toBe(false);
    expect(usersResponse.body.code).toBe('DATABASE_UNAVAILABLE');
    expect(usersResponse.body.message).toBe('Database is unavailable');

    expect(healthResponse.status).toBe(200);
    expect(healthResponse.body.success).toBe(true);
  });
});