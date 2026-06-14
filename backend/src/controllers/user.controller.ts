import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { sendSuccess, paginationMeta } from '../utils/response';
import { AuthenticationError } from '../utils/errors';

const userService = new UserService();

export class UserController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { rows, count, page, limit } = await userService.list({
        page: req.query.page as string,
        limit: req.query.limit as string,
        role: req.query.role as string,
        search: req.query.search as string,
      });

      sendSuccess(res, rows, 200, paginationMeta(page, limit, count));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getById(req.params.id);
      sendSuccess(res, user, 200);
    } catch (error) {
      next(error);
    }
  }

  async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.updateRole(req.params.id, req.body.role);
      sendSuccess(res, user, 200);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AuthenticationError();
      await userService.delete(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'User deleted successfully' }, 200);
    } catch (error) {
      next(error);
    }
  }
}
