import Router from '@koa/router';
import type { Context } from 'koa';
import { createUserRouter } from '../modules/user/user.routes.js';
import { success } from '../utils/api-response.js';

export function createRootRouter() {
  const router = new Router();

  router.get('/health', (ctx: Context) => {
    const requestId = String(ctx.state.requestId ?? 'unknown');
    ctx.body = success({ status: 'ok' }, requestId);
  });

  const userRouter = createUserRouter();
  router.use(userRouter.routes(), userRouter.allowedMethods());

  return router;
}
