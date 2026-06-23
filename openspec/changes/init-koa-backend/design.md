# 设计：初始化 Koa 后端基础工程

## 概览

本次变更将创建一个分层的 Node.js 后端基础工程，技术选型如下：

- Koa 作为 HTTP 服务与中间件管线
- TypeScript 提供可维护性和类型安全
- REST 作为初始 API 形态
- Prisma 作为数据库访问层
- Redis 作为后续缓存或会话能力的基础设施

项目整体采用模块化单体架构。首个示例领域使用 `user` 模块，用来演示标准请求流和代码组织方式。

## 架构

应用请求链路如下：

`request -> Koa middleware -> route -> controller -> service -> repository -> Prisma`

各层职责如下：

- `app/`
  - 应用启动、服务创建、根路由组合
- `config/`
  - 环境变量加载与校验
- `infrastructure/`
  - Prisma、Redis、日志等共享技术客户端
- `middlewares/`
  - 错误处理、请求 ID、请求日志等横切逻辑
- `modules/`
  - 业务模块目录，每个模块自行拥有 routes、controller、service、repository、validation schema
- `utils/`
  - 通用工具，例如 API 响应封装和 HTTP 错误类型

## 建议目录结构

```text
src/
  app/
    index.ts
    server.ts
    router.ts
  config/
    env.ts
  infrastructure/
    logger/
    prisma/
    redis/
  middlewares/
    error-handler.ts
    logger.ts
    request-id.ts
  modules/
    user/
      user.controller.ts
      user.repository.ts
      user.routes.ts
      user.schema.ts
      user.service.ts
      user.types.ts
  utils/
    api-response.ts
    http-error.ts

prisma/
  schema.prisma
  migrations/

tests/
  integration/
```

## API 风格

初始 API 采用 REST，原因如下：

- 与 Koa 的组合最自然
- 初始调试成本低，接口路径直观
- 在业务范围尚未明确前，避免过早引入 GraphQL 的复杂度

第一批接口保持最小集合：

- `GET /health`
- `GET /users`
- `GET /users/:id`
- `POST /users`

如果实现时为了补全示例模块需要增加更新或删除接口，可以加，但不是第一阶段硬性要求。

## 错误处理

服务端使用全局 Koa 错误中间件作为最外层兜底。

错误类型至少区分：

- 参数校验错误
- 业务领域错误
- 基础设施或未知系统错误

API 响应结构保持统一，例如：

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Invalid request payload",
  "data": null,
  "requestId": "..."
}
```

成功响应也使用同样的 envelope 结构，避免前端接入时接口风格不一致。

## 参数校验

请求参数校验必须发生在业务逻辑之前。示例模块需要显式定义路由参数和请求体 schema，避免在 controller 中手动解析和拼装数据。

校验库固定使用 `zod`。整体约束如下：

- 在 HTTP 边界完成参数校验
- 校验错误统一归一化输出
- 业务规则判断不隐藏在路由层里

## 数据库访问

Prisma 作为主要数据库抽象层，负责：

- 定义 schema 和 migration
- 生成类型化 Prisma Client
- 在 repository 层统一管理数据库访问

第一版数据库模型刻意保持简单，只需要一个足以支撑示例接口的 `User` 模型。业务逻辑必须放在 service 层，不能散落在 controller 或 Prisma 调用里。

## Redis 接入

Redis 作为共享基础设施客户端接入，并具备完整生命周期管理。

本次变更中，Redis 的职责是先建立：

- 基于环境变量的配置方式
- 可复用的客户端初始化逻辑
- 干净的关闭释放流程
- 后续缓存或会话能力的最小接入点

本次不提前设计复杂缓存策略。Redis 要接进来，但不在没有明确业务场景时过度使用。

## 日志与请求追踪

每个请求都应该拥有 request id，便于排查问题。请求日志至少记录：

- method
- path
- status code
- duration
- request id

优先采用结构化日志，避免后续做观测性时还要重写日志体系。

## 配置与环境变量

环境变量在启动阶段加载，并在服务真正开始监听前完成校验。

最低配置项包括：

- `PORT`
- `NODE_ENV`
- `DATABASE_URL`
- `REDIS_URL`

仓库中应提供 `.env.example`，用于说明必填配置项。

## 测试策略

第一层测试优先做集成测试，因为当前目标是证明 HTTP 服务、Middleware、参数校验和 Prisma 驱动的示例模块已经串通。

第一批测试至少覆盖：

- health 接口
- user 创建成功路径
- user 查询成功路径
- 非法请求体触发的参数校验错误

后续如果业务逻辑变复杂，可以再增加单元测试，但这不是当前初始化阶段的优先目标。

## Docker 与本地开发

项目需要同时支持：

- 直接通过 `pnpm run dev` 本地开发
- 通过容器拉起依赖服务

第一版容器方案应便于运行：

- application
- PostgreSQL
- Redis

仓库使用 `docker-compose.yml` 作为本地编排入口，保证本地基础设施可以通过统一命令拉起。

## OpenSpec 使用方式

本仓库使用 `openspec/` 作为项目内需求、设计和长期约定的唯一文档真源。

规则如下：

- `openspec/specs/` 存放跨多个变更都成立的稳定约定
- `openspec/changes/<change-id>/` 存放单次变更的 proposal、design、tasks，例如 `openspec/changes/init-koa-backend/`
- 后续新增功能，例如 auth、posts、orders，应分别创建新的 change 目录
- 所有 spec 文档默认使用中文编写，后续新增或修改也保持中文

这样可以保留 spec-driven 的工作方式，同时避免维护多套重复文档目录。

## 风险与取舍

- Prisma 和 Redis 一开始就接入，会提高初始化复杂度，但能减少后续重构底座的成本
- Redis 第一阶段只保留轻量接入边界，可以避免过早设计
- 当前明确选择模块化单体，而不是微服务，因为业务尚未成型，过早拆分服务会增加不必要复杂度

## 验收标准

满足以下条件即可认为本次变更完成：

- Koa 服务可以在 TypeScript 下正常运行
- 仓库具备本文定义的分层目录结构
- Prisma 已配置完成，示例模块可以正常使用
- Redis 已通过共享基础设施代码接入
- `user` 示例模块完整演示标准请求链路
- API 响应与错误格式保持统一
- 本地开发与容器化启动方式已提供并可运行
- 测试覆盖核心示例链路
- `openspec/` 中包含稳定 spec 和本次变更记录
