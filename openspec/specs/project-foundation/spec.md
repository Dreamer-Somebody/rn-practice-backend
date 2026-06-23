# 规范：项目基础架构

## 状态

Accepted

## 决策

本仓库使用模块化单体后端架构，基础技术栈如下：

- Koa
- TypeScript
- REST
- Prisma
- Redis

## 规则

- HTTP 相关职责放在 Koa middleware、router 和 controller 中
- 业务逻辑放在 service 中
- 数据库访问放在基于 Prisma 的 repository 中
- 共享技术客户端放在 infrastructure 中
- 新增后端功能应遵循示例模块采用的模块组织方式
- 所有 `openspec` 文档默认使用中文编写，并以 UTF-8 编码保存

## 模块边界

每个业务模块应自行拥有：

- routes
- controller
- service
- repository
- validation schema

跨模块工具应保持轻量，不应演化成第二套隐式业务层。