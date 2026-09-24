import { Response } from "express";

interface Meta {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  [key: string]: unknown;
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, meta?: Meta) {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
) {
  return res.status(statusCode).json({
    success: false,
    error: { code, message, ...(details ? { details } : {}) },
  });
}
