import { Request, Response, NextFunction } from 'express';
import { UniqueConstraintError, ValidationError as SequelizeValidationError } from 'sequelize';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AppError } from '../utils/errors';
import { logger } from '../config/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Log all errors
  logger.error(`[${req.method} ${req.path}] ${err.message}`, {
    stack: err.stack,
    body: req.body,
  });

  // Known operational errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  // Sequelize unique constraint (e.g., duplicate email)
  if (err instanceof UniqueConstraintError) {
    const field = Object.keys(err.fields)[0];
    res.status(409).json({ success: false, message: `${field} already exists` });
    return;
  }

  // Sequelize validation error
  if (err instanceof SequelizeValidationError) {
    const messages = err.errors.map((e) => e.message).join(', ');
    res.status(400).json({ success: false, message: messages });
    return;
  }

  // JWT errors
  if (err instanceof TokenExpiredError) {
    res.status(401).json({ success: false, message: 'Token has expired' });
    return;
  }

  if (err instanceof JsonWebTokenError) {
    res.status(401).json({ success: false, message: 'Invalid token' });
    return;
  }

  // Multer errors
  if (err.message?.includes('Only PDF')) {
    res.status(400).json({ success: false, message: err.message });
    return;
  }

  // Unknown/unhandled errors — don't leak stack traces in production
  const statusCode = 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(statusCode).json({ success: false, message });
}
