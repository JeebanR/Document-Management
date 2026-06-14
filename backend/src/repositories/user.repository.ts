import { Op } from 'sequelize';
import User, { UserAttributes, UserRole } from '../models/user.model';

interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

interface FindUsersOptions {
  page: number;
  limit: number;
  role?: UserRole;
  search?: string;
}

export class UserRepository {
  async create(data: CreateUserDto): Promise<User> {
    return User.create({ ...data, role: data.role ?? 'EMPLOYEE' });
  }

  async findById(id: string): Promise<User | null> {
    return User.findByPk(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }

  async findAll(options: FindUsersOptions): Promise<{ rows: User[]; count: number }> {
    const { page, limit, role, search } = options;
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or as unknown as string] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    return User.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] },
    });
  }

  async update(id: string, data: Partial<UserAttributes>): Promise<User | null> {
    const user = await User.findByPk(id);
    if (!user) return null;
    return user.update(data);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await User.destroy({ where: { id } });
    return deleted > 0;
  }
}
