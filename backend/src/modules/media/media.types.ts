export type EntityType = "NEWS" | "EVENT";

export interface AddExternalMediaBody {
  entityType: EntityType;
  entityId: number;
  url: string;
  altText?: string;
}

export interface ReorderMediaBody {
  entityType: EntityType;
  entityId: number;
  orderedIds: number[];
}
