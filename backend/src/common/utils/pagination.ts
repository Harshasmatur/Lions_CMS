import { Request } from "express";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../constants";
import { PaginationParams } from "../types";

export function parsePagination(req: Request): PaginationParams {
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
  const rawPageSize = parseInt(String(req.query.pageSize ?? DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(Math.max(1, rawPageSize), MAX_PAGE_SIZE);
  return { page, pageSize };
}

export function buildMeta(total: number, page: number, pageSize: number) {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
