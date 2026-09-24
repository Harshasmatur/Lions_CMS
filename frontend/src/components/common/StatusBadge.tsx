import { Badge } from "@/components/ui/badge";

const VARIANT_MAP = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

export function StatusBadge({ status }: { status: "DRAFT" | "PUBLISHED" | "ARCHIVED" }) {
  return <Badge variant={VARIANT_MAP[status]}>{status}</Badge>;
}
