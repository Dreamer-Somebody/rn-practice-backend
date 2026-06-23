# Koa 后端基础工程 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建一个可运行的 `Koa + TypeScript + REST + Prisma + Redis` 后端基础工程，并提供一个 `user` 示例模块、基础测试与容器化开发支持。

**Architecture:** 项目采用模块化单体结构，按 `request -> middleware -> route -> controller -> service -> repository -> Prisma` 组织请求链路。Redis 作为共享基础设施接入，第一阶段只完成连接、生命周期管理和后续缓存扩展预留，不强行设计复杂缓存策略。

**Tech Stack:** Node.js, TypeScript, Koa, @koa/router, zod, Prisma, PostgreSQL, Redis, ioredis, pino, Vitest, Supertest, Docker Compose

---

## 文件结构映射

### 应用入口与装配
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `src/app/index.ts`
- Create: `src/app/server.ts`
- Create: `src/app/router.ts`

职责：定义依赖、脚本、TypeScript 编译配置、Koa 应用实例、服务启动入口和根路由组合。

### 配置与基础设施
- Create: `src/config/env.ts`
- Create: `src/infrastructure/logger/index.ts`
- Create: `src/infrastructure/prisma/client.ts`
- Create: `src/infrastructure/redis/client.ts`
- Create: `src/utils/api-response.ts`
- Create: `src/utils/http-error.ts`
- Create: `src/middlewares/error-handler.ts`
- Create: `src/middlewares/request-id.ts`
- Create: `src/middlewares/logger.ts`

职责：管理环境变量、结构化日志、Prisma/Redis 生命周期、统一响应和错误处理。

### 用户模块
- Create: `src/modules/user/user.types.ts`
- Create: `src/modules/user/user.schema.ts`
- Create: `src/modules/user/user.repository.ts`
- Create: `src/modules/user/user.service.ts`
- Create: `src/modules/user/user.controller.ts`
- Create: `src/modules/user/user.routes.ts`

职责：提供 `user` 示例模块，演示参数校验、数据库访问、业务分层和 REST 接口组织方式。

### 数据与本地环境
- Create: `prisma/schema.prisma`
- Create: `.env.example`
- Create: `Dockerfile`
- Create: `docker-compose.yml`

职责：定义数据库 schema、本地环境变量样例和本地开发容器。

### 测试与工具链
- Create: `vitest.config.ts`
- Create: `tests/helpers/test-app.ts`
- Create: `tests/integration/health.test.ts`
- Create: `tests/integration/user.test.ts`
- Create: `eslint.config.js`
- Create: `.prettierrc.json`

职责：提供集成测试入口、测试配置和基础格式化/检查能力。

### 文档与计划跟踪
- Modify: `openspec/changes/init-koa-backend/tasks.md`
- Create: `README.md`

职责：同步任务状态，记录本地运行方式与工程说明。

### 关键约束
- 默认包管理器使用 `pnpm`
- 测试优先覆盖集成链路，不在第一版引入过多单元测试
- 首版 `User` 模型只包含 `id`、`email`、`name`、`createdAt`、`updatedAt`
- 响应 envelope 统一为 `success / code / message / data / requestId`
- 所有 Markdown 文档以 UTF-8 编码保存

### Task 1: 初始化 Node.js、TypeScript 和基础脚本

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`

- [ ] **Step 1: 写基础工程定义文件**

```json
{
  "name": "rn-practice-backend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/app/index.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/app/index.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint .",
    "format": "prettier --write .",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  },
  "dependencies": {
    "@koa/router": "^13.1.0",
    "dotenv": "^16.6.1",
    "ioredis": "^5.8.1",
    "koa": "^3.0.1",
    "pino": "^9.9.0",
    "pino-pretty": "^13.1.1",
    "prisma": "^6.10.1",
    "zod": "^3.25.67"
  },
  "devDependencies": {
    "@eslint/js": "^9.30.1",
    "@types/node": "^24.0.10",
    "@types/supertest": "^6.0.3",
    "@types/uuid": "^10.0.0",
    "eslint": "^9.30.1",
    "globals": "^16.3.0",
    "prettier": "^3.6.2",
    "supertest": "^7.1.1",
    "tsx": "^4.20.3",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.35.1",
    "vitest": "^3.2.4"
  }
}
```

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "types": ["node", "vitest/globals"]
  },
  "include": ["src", "tests", "vitest.config.ts"]
}
```

```gitignore
node_modules
dist
.env
coverage
.prisma
```

- [ ] **Step 2: 安装依赖**

Run: `pnpm install`
Expected: 成功生成或更新 `pnpm-lock.yaml`，无 `ERR` 级别安装失败。

- [ ] **Step 3: 验证 TypeScript 构建脚本已连通**

Run: `pnpm run build`
Expected: 失败，提示缺少 `src/app/index.ts`，说明脚本已生效但代码尚未创建。

- [ ] **Step 4: 提交初始化工具链**

```bash
git add package.json pnpm-lock.yaml tsconfig.json .gitignore
git commit -m "chore: initialize node and typescript toolchain"
```

### Task 2: 先写失败测试，定义健康检查接口和应用装配边界

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/helpers/test-app.ts`
- Create: `tests/integration/health.test.ts`
- Create: `src/app/server.ts`
- Create: `src/app/router.ts`
- Create: `src/app/index.ts`

- [ ] **Step 1: 写健康检查失败测试**

```ts
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app/server';

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
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test -- tests/integration/health.test.ts`
Expected: FAIL，报错 `Cannot find module '../../src/app/server'` 或 `createApp` 未定义。

- [ ] **Step 3: 写最小应用装配代码让测试通过**

```ts
// src/utils/api-response.ts
export function success(data: unknown, requestId: string, message = 'Success') {
  return {
    success: true,
    code: 'OK',
    message,
    data,
    requestId,
  };
}
```

```ts
// src/app/router.ts
import Router from '@koa/router';
import { success } from '../utils/api-response.js';

export function createRootRouter() {
  const router = new Router();

  router.get('/health', (ctx) => {
    const requestId = String(ctx.state.requestId ?? 'unknown');
    ctx.body = success({ status: 'ok' }, requestId);
  });

  return router;
}
```

```ts
// src/app/server.ts
import Koa from 'koa';
import { createRootRouter } from './router.js';

export function createApp() {
  const app = new Koa();

  app.use(async (ctx, next) => {
    ctx.state.requestId = crypto.randomUUID();
    await next();
  });

  const router = createRootRouter();
  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
}
```

```ts
// src/app/index.ts
import { createApp } from './server.js';

const port = 3000;
const app = createApp();
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
```

- [ ] **Step 4: 跑健康检查测试**

Run: `pnpm test -- tests/integration/health.test.ts`
Expected: PASS。

- [ ] **Step 5: 提交健康检查最小链路**

```bash
git add vitest.config.ts tests/integration/health.test.ts src/app/index.ts src/app/server.ts src/app/router.ts src/utils/api-response.ts
git commit -m "feat: add health endpoint skeleton"
```

### Task 3: 完成环境变量、日志、请求 ID 和统一错误处理中间件

**Files:**
- Create: `src/config/env.ts`
- Create: `src/infrastructure/logger/index.ts`
- Create: `src/utils/http-error.ts`
- Create: `src/middlewares/request-id.ts`
- Create: `src/middlewares/logger.ts`
- Create: `src/middlewares/error-handler.ts`
- Modify: `src/app/server.ts`
- Modify: `src/app/index.ts`
- Create: `.env.example`

- [ ] **Step 1: 写中间件与配置失败测试**

```ts
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app/server';

describe('middleware envelope', () => {
  it('adds request id header and body field', async () => {
    const app = createApp();
    const response = await request(app.callback()).get('/health');

    expect(response.headers['x-request-id']).toBeTruthy();
    expect(response.body.requestId).toBe(response.headers['x-request-id']);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test -- tests/integration/health.test.ts`
Expected: FAIL，提示缺少 `x-request-id` 头或响应字段不一致。

- [ ] **Step 3: 实现配置、日志和中间件**

```ts
// src/config/env.ts
import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
});

export const env = envSchema.parse(process.env);
```

```ts
// src/infrastructure/logger/index.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    process.env.NODE_ENV === 'production'
      ? undefined
      : { target: 'pino-pretty', options: { colorize: true } },
});
```

```ts
// src/utils/http-error.ts
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
```

```ts
// src/middlewares/request-id.ts
import type { Middleware } from 'koa';

export const requestIdMiddleware: Middleware = async (ctx, next) => {
  const requestId = crypto.randomUUID();
  ctx.state.requestId = requestId;
  ctx.set('x-request-id', requestId);
  await next();
};
```

```ts
// src/middlewares/error-handler.ts
import type { Middleware } from 'koa';
import { HttpError } from '../utils/http-error.js';

export const errorHandlerMiddleware: Middleware = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    const requestId = String(ctx.state.requestId ?? 'unknown');
    if (error instanceof HttpError) {
      ctx.status = error.status;
      ctx.body = {
        success: false,
        code: error.code,
        message: error.message,
        data: null,
        requestId,
      };
      return;
    }

    ctx.status = 500;
    ctx.body = {
      success: false,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
      data: null,
      requestId,
    };
  }
};
```

```ts
// src/middlewares/logger.ts
import type { Middleware } from 'koa';
import { logger } from '../infrastructure/logger/index.js';

export const loggerMiddleware: Middleware = async (ctx, next) => {
  const start = Date.now();
  await next();
  logger.info({
    requestId: ctx.state.requestId,
    method: ctx.method,
    path: ctx.path,
    statusCode: ctx.status,
    durationMs: Date.now() - start,
  });
};
```

```ts
// src/app/server.ts
import Koa from 'koa';
import { createRootRouter } from './router.js';
import { errorHandlerMiddleware } from '../middlewares/error-handler.js';
import { loggerMiddleware } from '../middlewares/logger.js';
import { requestIdMiddleware } from '../middlewares/request-id.js';

export function createApp() {
  const app = new Koa();
  app.use(errorHandlerMiddleware);
  app.use(requestIdMiddleware);
  app.use(loggerMiddleware);

  const router = createRootRouter();
  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
}
```

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rn_practice_backend?schema=public
REDIS_URL=redis://localhost:6379
```

- [ ] **Step 4: 跑健康检查测试**

Run: `pnpm test -- tests/integration/health.test.ts`
Expected: PASS。

- [ ] **Step 5: 提交中间件和配置层**

```bash
git add src/config/env.ts src/infrastructure/logger/index.ts src/utils/http-error.ts src/middlewares/error-handler.ts src/middlewares/logger.ts src/middlewares/request-id.ts src/app/server.ts src/app/index.ts .env.example
git commit -m "feat: add env config and middleware foundation"
```

### Task 4: 接入 Prisma 和 Redis 基础设施

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/infrastructure/prisma/client.ts`
- Create: `src/infrastructure/redis/client.ts`
- Modify: `package.json`

- [ ] **Step 1: 写基础设施存在性测试**

```ts
import { describe, expect, it } from 'vitest';
import { prisma } from '../../src/infrastructure/prisma/client';
import { redis } from '../../src/infrastructure/redis/client';

describe('infrastructure clients', () => {
  it('exports prisma and redis clients', () => {
    expect(prisma).toBeTruthy();
    expect(redis).toBeTruthy();
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test -- tests/integration/infra.test.ts`
Expected: FAIL，提示模块不存在。

- [ ] **Step 3: 实现 Prisma schema 和客户端**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

```ts
// src/infrastructure/prisma/client.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

```ts
// src/infrastructure/redis/client.ts
import Redis from 'ioredis';
import { env } from '../../config/env.js';

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
});
```

- [ ] **Step 4: 补充依赖并生成 Prisma Client**

在 `package.json` 的 `dependencies` 中加入：

```json
"@prisma/client": "^6.10.1"
```

Run: `pnpm install`
Expected: 成功安装 `@prisma/client`。

Run: `pnpm run prisma:generate`
Expected: 输出 `Generated Prisma Client`。

- [ ] **Step 5: 跑基础设施测试**

Run: `pnpm test -- tests/integration/infra.test.ts`
Expected: PASS。

- [ ] **Step 6: 提交数据库和 Redis 基础设施**

```bash
git add prisma/schema.prisma package.json pnpm-lock.yaml src/infrastructure/prisma/client.ts src/infrastructure/redis/client.ts tests/integration/infra.test.ts
git commit -m "feat: add prisma and redis infrastructure"
```

### Task 5: 先写失败测试，再实现 user 模块最小读写链路

**Files:**
- Create: `src/modules/user/user.types.ts`
- Create: `src/modules/user/user.schema.ts`
- Create: `src/modules/user/user.repository.ts`
- Create: `src/modules/user/user.service.ts`
- Create: `src/modules/user/user.controller.ts`
- Create: `src/modules/user/user.routes.ts`
- Modify: `src/app/router.ts`
- Create: `tests/integration/user.test.ts`

- [ ] **Step 1: 写用户接口失败测试**

```ts
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../src/app/server';

vi.mock('../../src/infrastructure/prisma/client', () => {
  const user = {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
  };

  return {
    prisma: { user },
  };
});

describe('user routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a user', async () => {
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
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test -- tests/integration/user.test.ts`
Expected: FAIL，提示没有 `/users` 路由。

- [ ] **Step 3: 实现 `user` 模块**

```ts
// src/modules/user/user.schema.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(50),
});

export const userIdSchema = z.object({
  id: z.string().min(1),
});
```

```ts
// src/modules/user/user.repository.ts
import { prisma } from '../../infrastructure/prisma/client.js';

export const userRepository = {
  create(data: { email: string; name: string }) {
    return prisma.user.create({ data });
  },
  findMany() {
    return prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  },
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },
};
```

```ts
// src/modules/user/user.service.ts
import { HttpError } from '../../utils/http-error.js';
import { userRepository } from './user.repository.js';

export const userService = {
  async createUser(input: { email: string; name: string }) {
    return userRepository.create(input);
  },
  async listUsers() {
    return userRepository.findMany();
  },
  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new HttpError(404, 'USER_NOT_FOUND', 'User not found');
    }
    return user;
  },
};
```

```ts
// src/modules/user/user.controller.ts
import type { Context } from 'koa';
import { success } from '../../utils/api-response.js';
import { HttpError } from '../../utils/http-error.js';
import { createUserSchema, userIdSchema } from './user.schema.js';
import { userService } from './user.service.js';

export const userController = {
  async create(ctx: Context) {
    const parsed = createUserSchema.safeParse(ctx.request.body);
    if (!parsed.success) {
      throw new HttpError(400, 'VALIDATION_ERROR', parsed.error.issues[0]?.message ?? 'Invalid request payload');
    }

    const user = await userService.createUser(parsed.data);
    ctx.status = 201;
    ctx.body = success(user, String(ctx.state.requestId), 'User created');
  },

  async list(ctx: Context) {
    const users = await userService.listUsers();
    ctx.body = success(users, String(ctx.state.requestId));
  },

  async getById(ctx: Context) {
    const parsed = userIdSchema.safeParse(ctx.params);
    if (!parsed.success) {
      throw new HttpError(400, 'VALIDATION_ERROR', 'Invalid user id');
    }

    const user = await userService.getUserById(parsed.data.id);
    ctx.body = success(user, String(ctx.state.requestId));
  },
};
```

```ts
// src/modules/user/user.routes.ts
import Router from '@koa/router';
import { userController } from './user.controller.js';

export function createUserRouter() {
  const router = new Router();
  router.get('/users', userController.list);
  router.get('/users/:id', userController.getById);
  router.post('/users', userController.create);
  return router;
}
```

```ts
// src/app/router.ts
import Router from '@koa/router';
import { success } from '../utils/api-response.js';
import { createUserRouter } from '../modules/user/user.routes.js';

export function createRootRouter() {
  const router = new Router();
  router.get('/health', (ctx) => {
    ctx.body = success({ status: 'ok' }, String(ctx.state.requestId));
  });

  const userRouter = createUserRouter();
  router.use(userRouter.routes(), userRouter.allowedMethods());
  return router;
}
```

- [ ] **Step 4: 为 POST body 解析补上 Koa 中间件**

在 `package.json` `dependencies` 中加入：

```json
"koa-bodyparser": "^4.4.1"
```

并在 `src/app/server.ts` 中加入：

```ts
import bodyParser from 'koa-bodyparser';

app.use(bodyParser());
```

Run: `pnpm install`
Expected: 成功安装 `koa-bodyparser`。

- [ ] **Step 5: 跑用户接口测试**

Run: `pnpm test -- tests/integration/user.test.ts`
Expected: PASS。

- [ ] **Step 6: 提交 user 示例模块**

```bash
git add src/modules/user src/app/router.ts src/app/server.ts package.json pnpm-lock.yaml tests/integration/user.test.ts
git commit -m "feat: add user module example"
```

### Task 6: 增加 user 查询与数据库连接验证

**Files:**
- Modify: `tests/integration/user.test.ts`
- Modify: `src/modules/user/user.controller.ts`
- Modify: `src/modules/user/user.service.ts`
- Modify: `src/modules/user/user.repository.ts`

- [ ] **Step 1: 扩展失败测试覆盖 GET /users 和 GET /users/:id**

```ts
it('lists users', async () => {
  const app = createApp();
  const response = await request(app.callback()).get('/users');

  expect(response.status).toBe(200);
  expect(Array.isArray(response.body.data)).toBe(true);
});

it('returns 404 when user does not exist', async () => {
  const app = createApp();
  const response = await request(app.callback()).get('/users/not-found');

  expect(response.status).toBe(404);
  expect(response.body.code).toBe('USER_NOT_FOUND');
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test -- tests/integration/user.test.ts`
Expected: 若前一任务只实现了创建接口，则这里会因 `GET` 路由或 404 响应不完整而失败。

- [ ] **Step 3: 补全读取路径实现**

确保下列代码存在并连通：

```ts
// src/modules/user/user.repository.ts
findMany() {
  return prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
},
findById(id: string) {
  return prisma.user.findUnique({ where: { id } });
},
```

```ts
// src/modules/user/user.service.ts
async listUsers() {
  return userRepository.findMany();
},
async getUserById(id: string) {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new HttpError(404, 'USER_NOT_FOUND', 'User not found');
  }
  return user;
},
```

```ts
// src/modules/user/user.controller.ts
async list(ctx: Context) {
  const users = await userService.listUsers();
  ctx.body = success(users, String(ctx.state.requestId));
},
async getById(ctx: Context) {
  const parsed = userIdSchema.safeParse(ctx.params);
  if (!parsed.success) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Invalid user id');
  }
  const user = await userService.getUserById(parsed.data.id);
  ctx.body = success(user, String(ctx.state.requestId));
},
```

- [ ] **Step 4: 运行用户接口测试**

Run: `pnpm test -- tests/integration/user.test.ts`
Expected: PASS。

- [ ] **Step 5: 提交读取链路完善**

```bash
git add src/modules/user/user.controller.ts src/modules/user/user.service.ts src/modules/user/user.repository.ts tests/integration/user.test.ts
git commit -m "feat: add user query endpoints"
```

### Task 7: 增加 ESLint、Prettier、README 和 Docker 本地环境

**Files:**
- Create: `eslint.config.js`
- Create: `.prettierrc.json`
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `README.md`

- [ ] **Step 1: 写格式与运行文档文件**

```js
// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
```

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all"
}
```

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run prisma:generate
EXPOSE 3000
CMD ["pnpm", "run", "dev"]
```

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: rn_practice_backend
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

volumes:
  postgres_data:
```

```md
# rn-practice-backend

## Development

1. `cp .env.example .env`
2. `docker compose up -d`
3. `pnpm install`
4. `pnpm run prisma:generate`
5. `pnpm run prisma:migrate`
6. `pnpm run dev`

## Test

- `pnpm test`
- `pnpm run lint`
- `pnpm run build`
```

- [ ] **Step 2: 跑静态检查和构建**

Run: `pnpm run lint`
Expected: PASS。

Run: `pnpm run build`
Expected: PASS。

- [ ] **Step 3: 验证容器编排文件语法**

Run: `docker compose config`
Expected: 输出合并后的 compose 配置，无 YAML 语法错误。

- [ ] **Step 4: 提交文档和运行环境**

```bash
git add eslint.config.js .prettierrc.json Dockerfile docker-compose.yml README.md
git commit -m "chore: add tooling and local runtime docs"
```

### Task 8: 收尾验证并同步 OpenSpec 任务状态

**Files:**
- Modify: `openspec/changes/init-koa-backend/tasks.md`
- Modify: `README.md`

- [ ] **Step 1: 执行完整验证命令**

Run: `pnpm test`
Expected: PASS。

Run: `pnpm run lint`
Expected: PASS。

Run: `pnpm run build`
Expected: PASS。

- [ ] **Step 2: 同步 `openspec` 任务状态**

将 `openspec/changes/init-koa-backend/tasks.md` 中已完成项改为：

```md
- [x] 初始化 `package.json` 和 TypeScript 工具链
- [x] 添加 Koa 服务启动入口与应用装配代码
- [x] 添加根路由和 `GET /health` 接口
- [x] 添加环境变量加载与校验
- [x] 添加 request id、请求日志和全局错误中间件
- [x] 添加统一 API 响应封装与 HTTP 错误工具
- [x] 添加基于 `zod` 的请求校验基础设施
- [x] 配置 Prisma 并创建初始 schema
- [x] 添加 Prisma Client 生命周期管理
- [x] 添加 Redis Client 生命周期管理
- [x] 添加日志基础设施
- [x] 创建 `user` 模块结构
- [x] 添加 user 请求参数校验
- [x] 添加 user controller、service、repository
- [x] 添加 user 示例 REST 接口
- [x] 添加 lint 和 format 配置
- [x] 添加测试运行器和第一批集成测试
- [x] 添加 `.env.example`
- [x] 添加 `Dockerfile`
- [x] 添加 PostgreSQL 与 Redis 的本地容器编排文件
- [x] 在 `openspec/specs/` 下补充稳定项目约定
```

- [ ] **Step 3: 做最终提交**

```bash
git add openspec/changes/init-koa-backend/tasks.md README.md
git commit -m "docs: finalize init koa backend change record"
```

## 自检

### Spec 覆盖检查
- Koa + TypeScript 服务基础：Task 1, Task 2, Task 3
- REST 结构与统一响应：Task 2, Task 3, Task 5, Task 6
- Prisma 与 Redis：Task 4
- `user` 示例模块：Task 5, Task 6
- Docker、本地开发、测试：Task 7, Task 8
- `openspec` 同步：Task 8

### 占位词检查
- 计划中没有 `TODO`、`TBD` 或“后续再补”式占位。
- 每个实现任务都给了文件路径、命令和最小代码骨架。

### 一致性检查
- 响应结构统一使用 `success / code / message / data / requestId`
- 校验库统一为 `zod`
- 示例业务统一为 `user`
- 本地容器编排统一为 `docker-compose.yml`