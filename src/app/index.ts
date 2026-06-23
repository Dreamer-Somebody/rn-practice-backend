import { env } from '../config/env.js';
import { logger } from '../infrastructure/logger/index.js';
import { createApp } from './server.js';

const app = createApp();

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'Server listening');
});
