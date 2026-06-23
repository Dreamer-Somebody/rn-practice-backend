# rn-practice-backend

Koa + TypeScript + REST + Prisma + Redis 后端基础工程。当前仓库保持模块化单体结构，示例模块为 `user`，响应 envelope 统一为 `success / code / message / data / requestId`。

## 环境要求

- Node.js 22+
- pnpm 10+
- Docker Desktop（用于本地 PostgreSQL / Redis）

## 本地开发

1. 复制环境变量文件：`Copy-Item .env.example .env`
2. 启动本地依赖容器：`docker compose up -d`
3. 安装依赖：`pnpm install`
4. 生成 Prisma Client：`pnpm run prisma:generate`
5. 执行数据库迁移：`pnpm run prisma:migrate`
6. 启动开发服务：`pnpm run dev`

服务默认监听 `http://localhost:3000`，健康检查接口为 `GET /health`。

## 常用命令

- `pnpm test`
- `pnpm run lint`
- `pnpm run build`
- `pnpm run format`
- `pnpm run prisma:studio`

## 本地容器说明

- `docker-compose.yml` 提供 PostgreSQL 16 和 Redis 7 的本地运行环境
- `Dockerfile` 通过 `corepack + pnpm-lock.yaml` 构建 Node 22 Alpine 镜像，可用于容器内安装依赖与生成 Prisma Client

## 工程约定

- 业务链路按 `middleware -> route -> controller -> service -> repository -> Prisma` 组织
- 请求参数校验统一使用 `zod`
- OpenSpec 与 README 文档继续使用中文维护，并以 UTF-8 保存
