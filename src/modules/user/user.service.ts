import { HttpError } from '../../utils/http-error.js';
import { userRepository } from './user.repository.js';
import type { CreateUserInput } from './user.types.js';

export const userService = {
  createUser(input: CreateUserInput) {
    return userRepository.create(input);
  },

  listUsers() {
    return userRepository.findMany();
  },

  async getUserById(id: string) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new HttpError(404, 'USER_NOT_FOUND', 'User not found');
    }

    return user;
  },
};
