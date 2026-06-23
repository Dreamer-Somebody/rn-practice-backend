import type { Middleware } from 'koa';
import { logger } from '../infrastructure/logger/index.js';
import { HttpError } from '../utils/http-error.js';

function getStatusCode(error: unknown) {
  if (error instanceof HttpError) {
    return error.status;
  }

  if (error instanceof Error && error.name === 'PrismaClientInitializationError') {
    return 503;
  }

  return 500;
}

export const loggerMiddleware: Middleware = async (ctx, next) => {
  const start = Date.now();

  try {
    await next();
    logger.info({
      requestId: ctx.state.requestId,
      method: ctx.method,
      path: ctx.path,
      statusCode: ctx.status,
      durationMs: Date.now() - start,
    });
  } catch (error) {
    logger.info({
      requestId: ctx.state.requestId,
      method: ctx.method,
      path: ctx.path,
      statusCode: getStatusCode(error),
      durationMs: Date.now() - start,
    });
    throw error;
  }
};