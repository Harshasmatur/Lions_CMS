import { ContentStatus } from "@prisma/client";

export interface CreateEventInput {
  title: string;
  description: string;
  eventDate: string;
  location?: string;
  status?: ContentStatus;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  eventDate?: string;
  location?: string;
  status?: ContentStatus;
}

export interface ListEventsQuery {
  page: number;
  pageSize: number;
  status?: ContentStatus;
  search?: string;
  upcomingOnly?: boolean;
}
