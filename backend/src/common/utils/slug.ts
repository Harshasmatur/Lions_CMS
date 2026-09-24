import slugify from "slugify";
import { prisma } from "../../config/database";

export function slugifyTitle(title: string): string {
  return slugify(title, { lower: true, strict: true, trim: true }).slice(0, 240);
}

// Ensures a slug is unique within the given table by appending -2, -3, ...
export async function generateUniqueSlug(
  entity: "news" | "event",
  title: string,
  excludeId?: number
): Promise<string> {
  const base = slugifyTitle(title) || "untitled";
  let candidate = base;
  let suffix = 2;

  const model = entity === "news" ? prisma.news : prisma.event;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await (model as any).findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) return candidate;

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}
