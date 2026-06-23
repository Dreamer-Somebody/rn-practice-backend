import bodyParser from 'koa-bodyparser';
import Koa from 'koa';
import { errorHandlerMiddleware } from '../middlewares/error-handler.js';
import { loggerMiddleware } from '../middlewares/logger.js';
import { requestIdMiddleware } from '../middlewares/request-id.js';
import { createRootRouter } from './router.js';

export function createApp() {
  const app = new Koa();

  app.use(errorHandlerMiddleware);
  app.use(requestIdMiddleware);
  app.use(loggerMiddleware);
  app.use(bodyParser());

  const router = createRootRouter();
  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
}
