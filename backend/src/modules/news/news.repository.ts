import { ContentStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/database";

interface FindManyParams {
  page: number;
  pageSize: number;
  status?: ContentStatus;
  search?: string;
  onlyPublished?: boolean;
}

function buildWhere(params: FindManyParams): Prisma.NewsWhereInput {
  const where: Prisma.NewsWhereInput = { deletedAt: null };

  if (params.onlyPublished) {
    where.status = ContentStatus.PUBLISHED;
  } else if (params.status) {
    where.status = params.status;
  }

  if (params.search) {
    where.OR = [
      { title: { contains: params.search } },
      { summary: { contains: params.search } },
    ];
  }

  return where;
}

export async function findMany(params: FindManyParams) {
  const where = buildWhere(params);

  const [items, total] = await prisma.$transaction([
    prisma.news.findMany({
      where,
      orderBy: params.onlyPublished ? { publishedAt: "desc" } : { updatedAt: "desc" },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      include: { media: { orderBy: { sortOrder: "asc" } }, author: { select: { id: true, name: true } } },
    }),
    prisma.news.count({ where }),
  ]);

  return { items, total };
}

export function findById(id: number) {
  return prisma.news.findFirst({
    where: { id, deletedAt: null },
    include: { media: { orderBy: { sortOrder: "asc" } }, author: { select: { id: true, name: true } } },
  });
}

export function findBySlug(slug: string, onlyPublished = false) {
  return prisma.news.findFirst({
    where: { slug, deletedAt: null, ...(onlyPublished ? { status: ContentStatus.PUBLISHED } : {}) },
    include: { media: { orderBy: { sortOrder: "asc" } }, author: { select: { id: true, name: true } } },
  });
}

export function create(data: Prisma.NewsUncheckedCreateInput) {
  return prisma.news.create({ data });
}

export function update(id: number, data: Prisma.NewsUpdateInput) {
  return prisma.news.update({ where: { id }, data });
}

export function softDelete(id: number) {
  return prisma.news.update({ where: { id }, data: { deletedAt: new Date() } });
}
