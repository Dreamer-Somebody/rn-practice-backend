# 任务：初始化 Koa 后端基础工程

## Foundation

- [x] 初始化 `package.json` 和 TypeScript 工具链
- [x] 添加 Koa 服务启动入口与应用装配代码
- [x] 添加根路由和 `GET /health` 接口
- [x] 添加环境变量加载与校验
- [x] 添加 request id、请求日志和全局错误中间件
- [x] 添加统一 API 响应封装与 HTTP 错误工具
- [x] 添加基于 `zod` 的请求校验基础设施

## Infrastructure

- [x] 配置 Prisma 并创建初始 schema
- [x] 添加 Prisma Client 生命周期管理
- [x] 添加 Redis Client 生命周期管理
- [x] 添加日志基础设施

## Sample Module

- [x] 创建 `user` 模块结构
- [x] 添加 user 请求参数校验
- [x] 添加 user controller、service、repository
- [x] 添加 user 示例 REST 接口

## Tooling and Quality

- [x] 添加 lint 和 format 配置
- [x] 添加测试运行器和第一批集成测试
- [x] 添加 `.env.example`
- [x] 添加 `Dockerfile`
- [x] 添加 PostgreSQL 与 Redis 的本地容器编排文件

## OpenSpec

- [x] 在 `openspec/specs/` 下补充稳定项目约定
- [x] 如果实现范围变化，及时更新本次 change 文档
