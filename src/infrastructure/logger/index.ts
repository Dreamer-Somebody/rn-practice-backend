import pino from 'pino';

const nodeEnv = process.env.NODE_ENV ?? 'development';

export const logger = pino({
  level: nodeEnv === 'test' ? 'silent' : nodeEnv === 'production' ? 'info' : 'debug',
  transport:
    nodeEnv === 'production' || nodeEnv === 'test'
      ? undefined
      : {
          target: 'pino-pretty',
          options: { colorize: true },
        },
});
