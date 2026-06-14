import { Response } from 'express';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: PaginationMeta,
): Response {
  const response: Record<string, unknown> = { success: true, data };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
}

export function sendError(res: Response, message: string, statusCode = 500): Response {
  return res.status(statusCode).json({ success: false, message });
}

export function paginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
