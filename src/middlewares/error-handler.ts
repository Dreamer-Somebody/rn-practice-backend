import type { Middleware } from 'koa';
import { logger } from '../infrastructure/logger/index.js';
import { HttpError } from '../utils/http-error.js';

function isDatabaseUnavailableError(error: unknown) {
  return (
    error instanceof Error &&
    error.name === 'PrismaClientInitializationError'
  );
}

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

    if (isDatabaseUnavailableError(error)) {
      logger.error({ err: error, requestId }, 'Database is unavailable');
      ctx.status = 503;
      ctx.body = {
        success: false,
        code: 'DATABASE_UNAVAILABLE',
        message: 'Database is unavailable',
        data: null,
        requestId,
      };
      return;
    }

    logger.error({ err: error, requestId }, 'Unhandled request error');
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