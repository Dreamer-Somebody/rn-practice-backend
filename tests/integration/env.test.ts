import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { loadEnv } from '../../src/config/env.js';

const tempDirs: string[] = [];

function createTempProject() {
  const dir = mkdtempSync(join(tmpdir(), 'rn-backend-env-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe('loadEnv', () => {
  it('falls back to .env.example when .env is missing', () => {
    const dir = createTempProject();
    writeFileSync(
      join(dir, '.env.example'),
      [
        'NODE_ENV=development',
        'PORT=3010',
        'DATABASE_URL=postgresql://example',
        'REDIS_URL=redis://example',
      ].join('\n'),
    );

    const env = loadEnv({}, dir);

    expect(env.PORT).toBe(3010);
    expect(env.DATABASE_URL).toBe('postgresql://example');
    expect(env.REDIS_URL).toBe('redis://example');
  });

  it('prefers .env over .env.example when both exist', () => {
    const dir = createTempProject();
    writeFileSync(
      join(dir, '.env.example'),
      [
        'NODE_ENV=development',
        'PORT=3010',
        'DATABASE_URL=postgresql://from-example',
        'REDIS_URL=redis://from-example',
      ].join('\n'),
    );
    writeFileSync(
      join(dir, '.env'),
      [
        'NODE_ENV=production',
        'PORT=3020',
        'DATABASE_URL=postgresql://from-env',
        'REDIS_URL=redis://from-env',
      ].join('\n'),
    );

    const env = loadEnv({}, dir);

    expect(env.NODE_ENV).toBe('production');
    expect(env.PORT).toBe(3020);
    expect(env.DATABASE_URL).toBe('postgresql://from-env');
    expect(env.REDIS_URL).toBe('redis://from-env');
  });
});