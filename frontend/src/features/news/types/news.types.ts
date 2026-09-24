export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  status: ContentStatus;
  publishedAt: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  author?: { id: number; name: string };
}

export interface NewsListParams {
  page: number;
  pageSize: number;
  status?: ContentStatus;
  search?: string;
}
