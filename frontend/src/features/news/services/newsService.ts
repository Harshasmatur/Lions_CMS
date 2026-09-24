import { api, ApiSuccess } from "@/lib/api";
import { NewsItem, NewsListParams, ContentStatus } from "../types/news.types";

export async function fetchNewsList(params: NewsListParams) {
  const { data } = await api.get<ApiSuccess<NewsItem[]>>("/news", { params });
  return { items: data.data, meta: data.meta! };
}

export async function fetchNewsById(id: number) {
  const { data } = await api.get<ApiSuccess<NewsItem>>(`/news/${id}`);
  return data.data;
}

export async function createNews(input: { title: string; summary?: string; content: string; status?: ContentStatus }) {
  const { data } = await api.post<ApiSuccess<NewsItem>>("/news", input);
  return data.data;
}

export async function updateNews(id: number, input: { title?: string; summary?: string; content?: string; status?: ContentStatus }) {
  const { data } = await api.put<ApiSuccess<NewsItem>>(`/news/${id}`, input);
  return data.data;
}

export async function changeNewsStatus(id: number, status: ContentStatus) {
  const { data } = await api.patch<ApiSuccess<NewsItem>>(`/news/${id}/status`, { status });
  return data.data;
}

export async function deleteNews(id: number) {
  await api.delete(`/news/${id}`);
}
