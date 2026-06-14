import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Reads validation results from express-validator chains and short-circuits
 * with a 400 if any errors are present.
 */
export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg)
      .join(', ');
    res.status(400).json({ success: false, message });
    return;
  }
  next();
}
