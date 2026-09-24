import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../common/errors";
import { AuthUser } from "../common/types";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization");

  if (!header || !header.startsWith("Bearer ")) {
    throw AppError.unauthorized("Missing or malformed Authorization header");
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthUser;
    req.user = { id: payload.id, email: payload.email, role: payload.role };
    next();
  } catch {
    throw AppError.unauthorized("Invalid or expired token");
  }
}

// Placeholder for future roles beyond ADMIN (EDITOR, CONTENT_MANAGER, ...).
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw AppError.unauthorized();
    if (!roles.includes(req.user.role)) {
      throw AppError.forbidden("You do not have permission to perform this action");
    }
    next();
  };
}
