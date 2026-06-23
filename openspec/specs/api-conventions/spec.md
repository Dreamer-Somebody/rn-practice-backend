# 规范：API 约定

## 状态

Accepted

## API 风格

后端默认使用 REST 作为 API 风格。

## 响应结构

所有接口应返回统一 JSON envelope：

```json
{
  "success": true,
  "code": "OK",
  "message": "Success",
  "data": {},
  "requestId": "..."
}
```

错误响应也使用同样结构，只是 `success` 为 `false`。

## 错误分类

API 至少区分：

- 参数校验错误
- 业务错误
- 服务端未知错误

## 运行规则

- 所有请求都应分配 request id
- 参数校验发生在 HTTP 边界
- controller 中不直接执行数据库查询
- 错误响应格式统一由中间件处理
- 所有 spec 和接口约定文档默认使用中文维护，并以 UTF-8 编码保存