import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../common/errors";
import { sendError } from "../common/responses/ApiResponse";
import { env } from "../config/env";

export function notFoundHandler(req: Request, res: Response) {
  sendError(res, 404, "NOT_FOUND", `Route not found: ${req.method} ${req.originalUrl}`);
}

// Centralized error handler — every thrown error in the app ends up here.
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  if (err instanceof ZodError) {
    sendError(res, 400, "VALIDATION_ERROR", "Request validation failed", err.flatten());
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      sendError(res, 409, "CONFLICT", "A record with this value already exists", {
        target: err.meta?.target,
      });
      return;
    }
    if (err.code === "P2025") {
      sendError(res, 404, "NOT_FOUND", "Record not found");
      return;
    }
    if (err.code === "P2003") {
      sendError(res, 409, "CONFLICT", "This action violates a foreign key constraint");
      return;
    }
  }

  // eslint-disable-next-line no-console
  console.error(`[${req.requestId ?? "no-request-id"}]`, err);

  sendError(
    res,
    500,
    "INTERNAL_ERROR",
    env.isProduction ? "Something went wrong" : String((err as Error)?.message ?? err)
  );
}
