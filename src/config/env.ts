import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
});

function resolveEnvFile(cwd: string) {
  const envPath = resolve(cwd, '.env');
  if (existsSync(envPath)) {
    return envPath;
  }

  const envExamplePath = resolve(cwd, '.env.example');
  if (existsSync(envExamplePath)) {
    return envExamplePath;
  }

  return undefined;
}

export function loadEnv(
  rawEnv: NodeJS.ProcessEnv = process.env,
  cwd = process.cwd(),
) {
  const envFile = resolveEnvFile(cwd);
  const fileEnv = envFile ? config({ path: envFile }).parsed ?? {} : {};

  return envSchema.parse({
    ...fileEnv,
    ...rawEnv,
  });
}

export const env = loadEnv();