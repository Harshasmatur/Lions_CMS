import { useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowDown, Trash2, Upload, Link as LinkIcon, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/api";
import {
  Media,
  EntityType,
  listMedia,
  uploadMedia,
  addExternalMedia,
  deleteMedia,
  reorderMedia,
} from "@/lib/mediaService";

interface MediaManagerProps {
  entityType: EntityType;
  entityId: number | null;
}

// Shared between News and Events editors — handles upload, external URLs
// (including YouTube/Vimeo), reordering and deletion for one entity's media.
export function MediaManager({ entityType, entityId }: MediaManagerProps) {
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [externalUrl, setExternalUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!entityId) return;
    setLoading(true);
    listMedia(entityType, entityId)
      .then(setItems)
      .catch((err) => toast({ title: "Failed to load media", description: getErrorMessage(err), variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [entityType, entityId]);

  if (!entityId) {
    return (
      <p className="rounded-md border border-dashed border-navy-200 p-4 text-sm text-navy-500">
        Save this item first to attach images or videos.
      </p>
    );
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const media = await uploadMedia(entityType, entityId!, file);
      setItems((prev) => [...prev, media]);
      toast({ title: "Media uploaded", variant: "success" });
    } catch (err) {
      toast({ title: "Upload failed", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleAddExternal() {
    if (!externalUrl.trim()) return;
    setBusy(true);
    try {
      const media = await addExternalMedia(entityType, entityId!, externalUrl.trim());
      setItems((prev) => [...prev, media]);
      setExternalUrl("");
      toast({ title: "Media added", variant: "success" });
    } catch (err) {
      toast({ title: "Could not add media", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number) {
    const previous = items;
    setItems((prev) => prev.filter((m) => m.id !== id));
    try {
      await deleteMedia(id);
    } catch (err) {
      setItems(previous);
      toast({ title: "Delete failed", description: getErrorMessage(err), variant: "destructive" });
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    try {
      await reorderMedia(entityType, entityId!, next.map((m) => m.id));
    } catch (err) {
      toast({ title: "Reorder failed", description: getErrorMessage(err), variant: "destructive" });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={busy}>
          <Upload className="h-4 w-4" /> Upload image / video
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*,video/mp4,video/webm" hidden onChange={handleFileChange} />

        <div className="flex flex-1 min-w-[220px] items-center gap-2">
          <Input
            placeholder="Paste an image URL, YouTube or Vimeo link"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
          />
          <Button type="button" variant="outline" size="sm" onClick={handleAddExternal} disabled={busy}>
            <LinkIcon className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <p className="text-sm text-navy-400">No media attached yet.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((media, index) => (
            <li key={media.id} className="group relative overflow-hidden rounded-md border border-navy-100">
              {media.mediaType === "IMAGE" ? (
                <img src={media.url} alt={media.altText ?? ""} className="h-28 w-full object-cover" />
              ) : (
                <div className="flex h-28 w-full flex-col items-center justify-center gap-1 bg-navy-800 text-white">
                  <PlayCircle className="h-6 w-6" />
                  <span className="text-[10px] uppercase tracking-wide">{media.sourceType}</span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/50 px-1.5 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(index, -1)} className="text-white/90 hover:text-white">
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => move(index, 1)} className="text-white/90 hover:text-white">
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button type="button" onClick={() => handleDelete(media.id)} className="text-white/90 hover:text-red-300">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
