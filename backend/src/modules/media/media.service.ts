import fs from "fs";
import { prisma } from "../../config/database";
import { AppError } from "../../common/errors";
import { resolveVideoEmbed } from "../../common/utils/videoEmbed";
import { publicUrlForUpload, absoluteUploadPath } from "./media.upload";
import { logAudit } from "../../common/services/audit.service";
import { AUDIT_ACTIONS, ENTITY_TYPES, MEDIA_SOURCE_TYPE, MEDIA_TYPE } from "../../common/constants";
import type { EntityType } from "./media.types";

async function assertEntityExists(entityType: EntityType, entityId: number) {
  if (entityType === "NEWS") {
    const news = await prisma.news.findFirst({ where: { id: entityId, deletedAt: null } });
    if (!news) throw AppError.notFound("News article not found");
  } else {
    const event = await prisma.event.findFirst({ where: { id: entityId, deletedAt: null } });
    if (!event) throw AppError.notFound("Event not found");
  }
}

function entityFkColumn(entityType: EntityType) {
  return entityType === "NEWS" ? { newsId: true } : { eventId: true };
}

async function nextSortOrder(entityType: EntityType, entityId: number): Promise<number> {
  const where = entityType === "NEWS" ? { newsId: entityId } : { eventId: entityId };
  const last = await prisma.media.findFirst({ where, orderBy: { sortOrder: "desc" } });
  return (last?.sortOrder ?? -1) + 1;
}

export async function listMedia(entityType: EntityType, entityId: number) {
  const where = entityType === "NEWS" ? { newsId: entityId } : { eventId: entityId };
  return prisma.media.findMany({ where, orderBy: { sortOrder: "asc" } });
}

export async function addExternalMedia(
  userId: number,
  params: { entityType: EntityType; entityId: number; url: string; altText?: string }
) {
  await assertEntityExists(params.entityType, params.entityId);

  const embed = resolveVideoEmbed(params.url);

  const data = embed
    ? {
        mediaType: MEDIA_TYPE.VIDEO,
        sourceType: embed.provider === "YOUTUBE" ? MEDIA_SOURCE_TYPE.YOUTUBE : MEDIA_SOURCE_TYPE.VIMEO,
        url: embed.embedUrl,
        thumbnailUrl: embed.thumbnailUrl,
      }
    : {
        // Not a recognized video provider — treat as an external image URL.
        mediaType: MEDIA_TYPE.IMAGE,
        sourceType: MEDIA_SOURCE_TYPE.EXTERNAL_URL,
        url: params.url,
        thumbnailUrl: null,
      };

  const sortOrder = await nextSortOrder(params.entityType, params.entityId);

  const media = await prisma.media.create({
    data: {
      ...data,
      altText: params.altText,
      sortOrder,
      newsId: params.entityType === "NEWS" ? params.entityId : null,
      eventId: params.entityType === "EVENT" ? params.entityId : null,
    },
  });

  await logAudit({
    userId,
    action: AUDIT_ACTIONS.MEDIA_ADD,
    entityType: ENTITY_TYPES.MEDIA,
    entityId: media.id,
    metadata: { forEntity: params.entityType, forEntityId: params.entityId, sourceType: data.sourceType },
  });

  return media;
}

export async function addUploadedMedia(
  userId: number,
  params: {
    entityType: EntityType;
    entityId: number;
    filename: string;
    mimetype: string;
    altText?: string;
  }
) {
  await assertEntityExists(params.entityType, params.entityId);

  const sortOrder = await nextSortOrder(params.entityType, params.entityId);
  const mediaType = params.mimetype.startsWith("video/") ? MEDIA_TYPE.VIDEO : MEDIA_TYPE.IMAGE;

  const media = await prisma.media.create({
    data: {
      mediaType,
      sourceType: MEDIA_SOURCE_TYPE.UPLOAD,
      url: publicUrlForUpload(params.filename),
      altText: params.altText,
      sortOrder,
      newsId: params.entityType === "NEWS" ? params.entityId : null,
      eventId: params.entityType === "EVENT" ? params.entityId : null,
    },
  });

  await logAudit({
    userId,
    action: AUDIT_ACTIONS.MEDIA_ADD,
    entityType: ENTITY_TYPES.MEDIA,
    entityId: media.id,
    metadata: { forEntity: params.entityType, forEntityId: params.entityId, sourceType: "UPLOAD" },
  });

  return media;
}

export async function deleteMedia(userId: number, mediaId: number) {
  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media) throw AppError.notFound("Media not found");

  await prisma.media.delete({ where: { id: mediaId } });

  if (media.sourceType === MEDIA_SOURCE_TYPE.UPLOAD) {
    const filename = media.url.split("/uploads/").pop();
    if (filename) {
      const filePath = absoluteUploadPath(filename);
      fs.promises.unlink(filePath).catch(() => {
        /* file may already be gone — non-fatal */
      });
    }
  }

  await logAudit({
    userId,
    action: AUDIT_ACTIONS.MEDIA_REMOVE,
    entityType: ENTITY_TYPES.MEDIA,
    entityId: mediaId,
    metadata: { forEntity: media.newsId ? "NEWS" : "EVENT" },
  });
}

export async function reorderMedia(
  userId: number,
  params: { entityType: EntityType; entityId: number; orderedIds: number[] }
) {
  await assertEntityExists(params.entityType, params.entityId);

  const fkWhere = params.entityType === "NEWS" ? { newsId: params.entityId } : { eventId: params.entityId };
  const existing = await prisma.media.findMany({ where: fkWhere, select: { id: true } });
  const existingIds = new Set(existing.map((m) => m.id));

  const allBelong = params.orderedIds.every((id) => existingIds.has(id));
  if (!allBelong || params.orderedIds.length !== existingIds.size) {
    throw AppError.badRequest("orderedIds must match exactly the media items belonging to this entity");
  }

  await prisma.$transaction(
    params.orderedIds.map((id, index) =>
      prisma.media.update({ where: { id }, data: { sortOrder: index } })
    )
  );

  await logAudit({
    userId,
    action: AUDIT_ACTIONS.MEDIA_REORDER,
    entityType: ENTITY_TYPES.MEDIA,
    entityId: params.entityId,
    metadata: { forEntity: params.entityType, orderedIds: params.orderedIds },
  });
}
