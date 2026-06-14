import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import { AuthenticationError } from '../utils/errors';

// Extend Express Request with authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      next(error);
    } else {
      next(new AuthenticationError('Invalid or expired token'));
    }
  }
}

// Optional auth — doesn't fail if no token, just skips setting req.user
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      req.user = verifyAccessToken(token);
    }
  } catch {
    // Silently ignore — user simply won't be set
  }
  next();
}
