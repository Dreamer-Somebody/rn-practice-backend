import type { Middleware } from 'koa';

export const requestIdMiddleware: Middleware = async (ctx, next) => {
  const requestId = crypto.randomUUID();
  ctx.state.requestId = requestId;
  ctx.set('x-request-id', requestId);
  await next();
};
