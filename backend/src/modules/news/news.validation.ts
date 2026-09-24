import { z } from "zod";

export const createNewsSchema = z.object({
  title: z.string().min(3).max(255),
  summary: z.string().max(500).optional(),
  content: z.string().min(1, "Content is required"),
});

export const updateNewsSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  summary: z.string().max(500).optional(),
  content: z.string().min(1).optional(),
});

export const changeStatusSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export const listNewsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  search: z.string().max(255).optional(),
});

export const publicListNewsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const slugParamSchema = z.object({
  slug: z.string().min(1),
});