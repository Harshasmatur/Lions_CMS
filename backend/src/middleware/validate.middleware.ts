import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

interface ValidationSchemas {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}

// Validates and REPLACES req.body/query/params with the parsed (typed, coerced) result.
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.query) req.query = schemas.query.parse(req.query) as any;
    if (schemas.params) req.params = schemas.params.parse(req.params) as any;
    next();
  };
}
