import { UserRepository } from '../repositories/user.repository';
import { NotFoundError, ValidationError } from '../utils/errors';
import { UserRole } from '../models/user.model';

const userRepository = new UserRepository();

export class UserService {
  async list(query: { page?: string; limit?: string; role?: string; search?: string }) {
    const page = Math.max(parseInt(query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(query.limit || '10', 10), 1), 100);

    const validRoles: UserRole[] = ['ADMIN', 'MANAGER', 'EMPLOYEE'];
    const role = query.role && validRoles.includes(query.role as UserRole)
      ? (query.role as UserRole)
      : undefined;

    const { rows, count } = await userRepository.findAll({
      page,
      limit,
      role,
      search: query.search,
    });

    return { rows, count, page, limit };
  }

  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError('User');
    return user;
  }

  async updateRole(id: string, role: UserRole) {
    const validRoles: UserRole[] = ['ADMIN', 'MANAGER', 'EMPLOYEE'];
    if (!validRoles.includes(role)) {
      throw new ValidationError(`Role must be one of: ${validRoles.join(', ')}`);
    }

    const user = await userRepository.update(id, { role });
    if (!user) throw new NotFoundError('User');
    return user;
  }

  async delete(id: string, requesterId: string) {
    if (id === requesterId) {
      throw new ValidationError('You cannot delete your own account');
    }

    const deleted = await userRepository.delete(id);
    if (!deleted) throw new NotFoundError('User');
  }
}
