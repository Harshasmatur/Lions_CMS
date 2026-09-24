import { ContentStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/database";

interface FindManyParams {
  page: number;
  pageSize: number;
  status?: ContentStatus;
  search?: string;
  onlyPublished?: boolean;
  upcomingOnly?: boolean;
}

function buildWhere(params: FindManyParams): Prisma.EventWhereInput {
  const where: Prisma.EventWhereInput = { deletedAt: null };

  if (params.onlyPublished) {
    where.status = ContentStatus.PUBLISHED;
  } else if (params.status) {
    where.status = params.status;
  }

  if (params.upcomingOnly) {
    where.eventDate = { gte: new Date() };
  }

  if (params.search) {
    where.OR = [
      { title: { contains: params.search } },
      { location: { contains: params.search } },
    ];
  }

  return where;
}

export async function findMany(params: FindManyParams) {
  const where = buildWhere(params);

  const [items, total] = await prisma.$transaction([
    prisma.event.findMany({
      where,
      orderBy: params.onlyPublished ? { eventDate: "asc" } : { updatedAt: "desc" },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      include: { media: { orderBy: { sortOrder: "asc" } }, author: { select: { id: true, name: true } } },
    }),
    prisma.event.count({ where }),
  ]);

  return { items, total };
}

export function findById(id: number) {
  return prisma.event.findFirst({
    where: { id, deletedAt: null },
    include: { media: { orderBy: { sortOrder: "asc" } }, author: { select: { id: true, name: true } } },
  });
}

export function findBySlug(slug: string, onlyPublished = false) {
  return prisma.event.findFirst({
    where: { slug, deletedAt: null, ...(onlyPublished ? { status: ContentStatus.PUBLISHED } : {}) },
    include: { media: { orderBy: { sortOrder: "asc" } }, author: { select: { id: true, name: true } } },
  });
}

export function create(data: Prisma.EventUncheckedCreateInput) {
  return prisma.event.create({ data });
}

export function update(id: number, data: Prisma.EventUpdateInput) {
  return prisma.event.update({ where: { id }, data });
}

export function softDelete(id: number) {
  return prisma.event.update({ where: { id }, data: { deletedAt: new Date() } });
}
