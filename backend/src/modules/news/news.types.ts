import { ContentStatus } from "@prisma/client";

export interface CreateNewsInput {
  title: string;
  summary?: string;
  content: string;
  status?: ContentStatus;
}

export interface UpdateNewsInput {
  title?: string;
  summary?: string;
  content?: string;
  status?: ContentStatus;
}

export interface ListNewsQuery {
  page: number;
  pageSize: number;
  status?: ContentStatus;
  search?: string;
}
