import type { Context } from 'koa';
import { success } from '../../utils/api-response.js';
import { userIdSchema, createUserSchema } from './user.schema.js';
import { userService } from './user.service.js';
import { validateOrThrow } from '../../utils/validation.js';

function getRequestBody(ctx: Context): unknown {
  return (ctx.request as typeof ctx.request & { body?: unknown }).body;
}

const userFieldLabels = {
  email: 'Email',
  name: 'Name',
};

export const userController = {
  async create(ctx: Context) {
    const input = validateOrThrow(
      createUserSchema,
      getRequestBody(ctx),
      userFieldLabels,
    );

    const user = await userService.createUser(input);
    ctx.status = 201;
    ctx.body = success(user, String(ctx.state.requestId), 'User created');
  },

  async list(ctx: Context) {
    const users = await userService.listUsers();
    ctx.body = success(users, String(ctx.state.requestId));
  },

  async getById(ctx: Context) {
    const params = validateOrThrow(userIdSchema, ctx.params, { id: 'User id' });
    const user = await userService.getUserById(params.id);
    ctx.body = success(user, String(ctx.state.requestId));
  },
};