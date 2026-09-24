import { api, ApiSuccess } from "@/lib/api";
import { EventItem, EventListParams, ContentStatus } from "../types/events.types";

export async function fetchEventsList(params: EventListParams) {
  const { data } = await api.get<ApiSuccess<EventItem[]>>("/events", { params });
  return { items: data.data, meta: data.meta! };
}

export async function fetchEventById(id: number) {
  const { data } = await api.get<ApiSuccess<EventItem>>(`/events/${id}`);
  return data.data;
}

export async function createEvent(input: {
  title: string;
  description: string;
  eventDate: string;
  location?: string;
  status?: ContentStatus;
}) {
  const { data } = await api.post<ApiSuccess<EventItem>>("/events", input);
  return data.data;
}

export async function updateEvent(
  id: number,
  input: { title?: string; description?: string; eventDate?: string; location?: string; status?: ContentStatus }
) {
  const { data } = await api.put<ApiSuccess<EventItem>>(`/events/${id}`, input);
  return data.data;
}

export async function changeEventStatus(id: number, status: ContentStatus) {
  const { data } = await api.patch<ApiSuccess<EventItem>>(`/events/${id}/status`, { status });
  return data.data;
}

export async function deleteEvent(id: number) {
  await api.delete(`/events/${id}`);
}
