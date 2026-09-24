import { ContentStatus } from "@prisma/client";
import { AppError } from "../../common/errors";
import { generateUniqueSlug } from "../../common/utils/slug";
import { sanitizeRichText } from "../../common/utils/sanitize";
import { logAudit } from "../../common/services/audit.service";
import { AUDIT_ACTIONS, ENTITY_TYPES } from "../../common/constants";
import * as eventsRepo from "./events.repository";
import { CreateEventInput, ListEventsQuery, UpdateEventInput } from "./events.types";

export async function listEvents(query: ListEventsQuery) {
  const { items, total } = await eventsRepo.findMany(query);
  return { items, total };
}

export async function listPublishedEvents(page: number, pageSize: number, upcomingOnly: boolean) {
  const { items, total } = await eventsRepo.findMany({
    page,
    pageSize,
    onlyPublished: true,
    upcomingOnly,
  });
  return { items, total };
}

export async function getEventById(id: number) {
  const event = await eventsRepo.findById(id);
  if (!event) throw AppError.notFound("Event not found");
  return event;
}

export async function getPublishedEventBySlug(slug: string) {
  const event = await eventsRepo.findBySlug(slug, true);
  if (!event) throw AppError.notFound("Event not found");
  return event;
}

export async function createEvent(userId: number, input: CreateEventInput) {
  const slug = await generateUniqueSlug("event", input.title);

  const event = await eventsRepo.create({
    title: input.title,
    slug,
    description: sanitizeRichText(input.description),
    eventDate: new Date(input.eventDate),
    location: input.location,
    status: input.status ?? ContentStatus.DRAFT,
    createdBy: userId,
  });

  await logAudit({
    userId,
    action: AUDIT_ACTIONS.CREATE,
    entityType: ENTITY_TYPES.EVENT,
    entityId: event.id,
    metadata: { title: event.title },
  });

  return event;
}

export async function updateEvent(userId: number, id: number, input: UpdateEventInput) {
  const existing = await eventsRepo.findById(id);
  if (!existing) throw AppError.notFound("Event not found");

  const data: Record<string, unknown> = {};

  if (input.title && input.title !== existing.title) {
    data.title = input.title;
    data.slug = await generateUniqueSlug("event", input.title, id);
  }
  if (input.description !== undefined) data.description = sanitizeRichText(input.description);
  if (input.eventDate !== undefined) data.eventDate = new Date(input.eventDate);
  if (input.location !== undefined) data.location = input.location;
  if (input.status !== undefined) data.status = input.status;

  const updated = await eventsRepo.update(id, data);

  await logAudit({
    userId,
    action: AUDIT_ACTIONS.UPDATE,
    entityType: ENTITY_TYPES.EVENT,
    entityId: id,
    metadata: { changedFields: Object.keys(data) },
  });

  return updated;
}

export async function changeEventStatus(userId: number, id: number, status: ContentStatus) {
  const existing = await eventsRepo.findById(id);
  if (!existing) throw AppError.notFound("Event not found");

  const data: { status: ContentStatus; publishedAt?: Date } = { status };
  if (status === ContentStatus.PUBLISHED && !existing.publishedAt) {
    data.publishedAt = new Date();
  }

  const updated = await eventsRepo.update(id, data);

  const action =
    status === ContentStatus.PUBLISHED
      ? AUDIT_ACTIONS.PUBLISH
      : status === ContentStatus.ARCHIVED
      ? AUDIT_ACTIONS.ARCHIVE
      : AUDIT_ACTIONS.UPDATE;

  await logAudit({
    userId,
    action,
    entityType: ENTITY_TYPES.EVENT,
    entityId: id,
    metadata: { oldStatus: existing.status, newStatus: status },
  });

  return updated;
}

export async function deleteEvent(userId: number, id: number) {
  const existing = await eventsRepo.findById(id);
  if (!existing) throw AppError.notFound("Event not found");

  await eventsRepo.softDelete(id);

  await logAudit({
    userId,
    action: AUDIT_ACTIONS.DELETE,
    entityType: ENTITY_TYPES.EVENT,
    entityId: id,
    metadata: { title: existing.title },
  });
}
