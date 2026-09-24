import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

export function requestId(req: Request, res: Response, next: NextFunction) {
  const incoming = req.header("x-request-id");
  req.requestId = incoming || uuidv4();
  res.setHeader("x-request-id", req.requestId);
  next();
}
