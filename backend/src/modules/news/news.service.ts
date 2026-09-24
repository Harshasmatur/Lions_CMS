import { ContentStatus } from "@prisma/client";
import { AppError } from "../../common/errors";
import { generateUniqueSlug } from "../../common/utils/slug";
import { sanitizeRichText } from "../../common/utils/sanitize";
import { logAudit } from "../../common/services/audit.service";
import { AUDIT_ACTIONS, ENTITY_TYPES } from "../../common/constants";
import * as newsRepo from "./news.repository";
import { CreateNewsInput, ListNewsQuery, UpdateNewsInput } from "./news.types";

export async function listNews(query: ListNewsQuery) {
  const { items, total } = await newsRepo.findMany(query);
  return { items, total };
}

export async function listPublishedNews(page: number, pageSize: number) {
  const { items, total } = await newsRepo.findMany({ page, pageSize, onlyPublished: true });
  return { items, total };
}

export async function getNewsById(id: number) {
  const news = await newsRepo.findById(id);
  if (!news) throw AppError.notFound("News article not found");
  return news;
}

export async function getPublishedNewsBySlug(slug: string) {
  const news = await newsRepo.findBySlug(slug, true);
  if (!news) throw AppError.notFound("News article not found");
  return news;
}

export async function createNews(userId: number, input: CreateNewsInput) {
  const slug = await generateUniqueSlug("news", input.title);

  const news = await newsRepo.create({
    title: input.title,
    slug,
    summary: input.summary,
    content: sanitizeRichText(input.content),
    status: input.status ?? ContentStatus.DRAFT,
    createdBy: userId,
  });

  await logAudit({
    userId,
    action: AUDIT_ACTIONS.CREATE,
    entityType: ENTITY_TYPES.NEWS,
    entityId: news.id,
    metadata: { title: news.title },
  });

  return news;
}

export async function updateNews(userId: number, id: number, input: UpdateNewsInput) {
  const existing = await newsRepo.findById(id);
  if (!existing) throw AppError.notFound("News article not found");

  const data: Record<string, unknown> = {};

  if (input.title && input.title !== existing.title) {
    data.title = input.title;
    data.slug = await generateUniqueSlug("news", input.title, id);
  }
  if (input.summary !== undefined) data.summary = input.summary;
  if (input.content !== undefined) data.content = sanitizeRichText(input.content);
  if (input.status !== undefined) data.status = input.status;

  const updated = await newsRepo.update(id, data);

  await logAudit({
    userId,
    action: AUDIT_ACTIONS.UPDATE,
    entityType: ENTITY_TYPES.NEWS,
    entityId: id,
    metadata: { changedFields: Object.keys(data) },
  });

  return updated;
}

export async function changeNewsStatus(userId: number, id: number, status: ContentStatus) {
  const existing = await newsRepo.findById(id);
  if (!existing) throw AppError.notFound("News article not found");

  const data: { status: ContentStatus; publishedAt?: Date } = { status };
  if (status === ContentStatus.PUBLISHED && !existing.publishedAt) {
    data.publishedAt = new Date();
  }

  const updated = await newsRepo.update(id, data);

  const action =
    status === ContentStatus.PUBLISHED
      ? AUDIT_ACTIONS.PUBLISH
      : status === ContentStatus.ARCHIVED
      ? AUDIT_ACTIONS.ARCHIVE
      : AUDIT_ACTIONS.UPDATE;

  await logAudit({
    userId,
    action,
    entityType: ENTITY_TYPES.NEWS,
    entityId: id,
    metadata: { oldStatus: existing.status, newStatus: status },
  });

  return updated;
}

export async function deleteNews(userId: number, id: number) {
  const existing = await newsRepo.findById(id);
  if (!existing) throw AppError.notFound("News article not found");

  await newsRepo.softDelete(id);

  await logAudit({
    userId,
    action: AUDIT_ACTIONS.DELETE,
    entityType: ENTITY_TYPES.NEWS,
    entityId: id,
    metadata: { title: existing.title },
  });
}
