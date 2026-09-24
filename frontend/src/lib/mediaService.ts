import { api, ApiSuccess } from "@/lib/api";

export type EntityType = "NEWS" | "EVENT";

export interface Media {
  id: number;
  mediaType: "IMAGE" | "VIDEO";
  sourceType: "UPLOAD" | "EXTERNAL_URL" | "YOUTUBE" | "VIMEO";
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
  sortOrder: number;
}

export async function listMedia(entityType: EntityType, entityId: number) {
  const { data } = await api.get<ApiSuccess<Media[]>>("/media", { params: { entityType, entityId } });
  return data.data;
}

export async function uploadMedia(entityType: EntityType, entityId: number, file: File, altText?: string) {
  const form = new FormData();
  form.append("file", file);
  form.append("entityType", entityType);
  form.append("entityId", String(entityId));
  if (altText) form.append("altText", altText);

  const { data } = await api.post<ApiSuccess<Media>>("/media/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function addExternalMedia(
  entityType: EntityType,
  entityId: number,
  url: string,
  altText?: string
) {
  const { data } = await api.post<ApiSuccess<Media>>("/media/external", {
    entityType,
    entityId,
    url,
    altText,
  });
  return data.data;
}

export async function deleteMedia(id: number) {
  await api.delete(`/media/${id}`);
}

export async function reorderMedia(entityType: EntityType, entityId: number, orderedIds: number[]) {
  await api.patch("/media/reorder", { entityType, entityId, orderedIds });
}
