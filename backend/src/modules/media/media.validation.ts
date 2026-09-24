import { z } from "zod";

const entityTypeSchema = z.enum(["NEWS", "EVENT"]);

export const addExternalMediaSchema = z.object({
  entityType: entityTypeSchema,
  entityId: z.coerce.number().int().positive(),
  url: z.string().url("A valid URL is required"),
  altText: z.string().max(255).optional(),
});

export const uploadMediaBodySchema = z.object({
  entityType: entityTypeSchema,
  entityId: z.coerce.number().int().positive(),
  altText: z.string().max(255).optional(),
});

export const reorderMediaSchema = z.object({
  entityType: entityTypeSchema,
  entityId: z.coerce.number().int().positive(),
  orderedIds: z.array(z.number().int().positive()).min(1),
});

export const mediaIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
