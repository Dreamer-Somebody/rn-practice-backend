import Router from '@koa/router';
import { userController } from './user.controller.js';

export function createUserRouter() {
  const router = new Router();

  router.get('/users', userController.list);
  router.get('/users/:id', userController.getById);
  router.post('/users', userController.create);

  return router;
}
