import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(1, "Description is required"),
  eventDate: z.coerce.date(),
  location: z.string().max(255).optional(),
});

export const updateEventSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().min(1).optional(),
  eventDate: z.coerce.date().optional(),
  location: z.string().max(255).optional(),
});

export const changeStatusSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export const listEventsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  search: z.string().max(255).optional(),
});

export const publicListEventsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  // z.coerce.boolean() would coerce the STRING "false" to `true` (any
  // non-empty string is truthy), so upcomingOnly=false from a query string
  // silently did nothing. Match against the literal strings instead.
  upcomingOnly: z
    .enum(["true", "false"])
    .optional()
    .default("true")
    .transform((v) => v === "true"),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const slugParamSchema = z.object({
  slug: z.string().min(1),
});