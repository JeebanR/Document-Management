import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, AuthenticationError } from '../utils/errors';
import { UserRole } from '../models/user.model';

/**
 * authorize(...roles) — checks that the authenticated user has one of the allowed roles.
 * Must be used AFTER authenticate() middleware.
 *
 * Usage: router.delete('/:id', authenticate, authorize('ADMIN'), handler)
 */
export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError('Not authenticated'));
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return next(
        new ForbiddenError(
          `Role '${req.user.role}' is not authorized. Required: ${roles.join(' or ')}`,
        ),
      );
    }

    next();
  };
}
