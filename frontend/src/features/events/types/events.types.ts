export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface EventItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  eventDate: string;
  location: string | null;
  status: ContentStatus;
  publishedAt: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  author?: { id: number; name: string };
}

export interface EventListParams {
  page: number;
  pageSize: number;
  status?: ContentStatus;
  search?: string;
}
