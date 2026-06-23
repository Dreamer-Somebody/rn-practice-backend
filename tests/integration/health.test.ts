import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app/server.js';

describe('GET /health', () => {
  it('returns service health payload', async () => {
    const app = createApp();
    const response = await request(app.callback()).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.code).toBe('OK');
    expect(response.body.data.status).toBe('ok');
    expect(response.body.requestId).toBeTypeOf('string');
  });

  it('adds request id header and body field', async () => {
    const app = createApp();
    const response = await request(app.callback()).get('/health');

    expect(response.headers['x-request-id']).toBeTruthy();
    expect(response.body.requestId).toBe(response.headers['x-request-id']);
  });
});
