import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/api";
import { MediaManager } from "@/components/common/MediaManager";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { fetchEventById, createEvent, updateEvent } from "../services/eventsService";
import type { ContentStatus } from "../types/events.types";

const QUILL_MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "link"],
    ["clean"],
  ],
};

function toDateTimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventEditorPage() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<ContentStatus>("DRAFT");
  const [entityId, setEntityId] = useState<number | null>(isNew ? null : Number(id));
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    fetchEventById(Number(id))
      .then((event) => {
        setTitle(event.title);
        setDescription(event.description);
        setEventDate(toDateTimeLocal(event.eventDate));
        setLocation(event.location ?? "");
        setStatus(event.status);
      })
      .catch((err) => toast({ title: "Failed to load event", description: getErrorMessage(err), variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  async function handleInitialSave() {
    if (!title.trim() || !description.trim() || !eventDate) {
      toast({ title: "Title, description and date are required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const eventDateIso = new Date(eventDate).toISOString();
      if (entityId) {
        await updateEvent(entityId, { title, description, eventDate: eventDateIso, location });
        toast({ title: "Event saved", variant: "success" });
      } else {
        const created = await createEvent({ title, description, eventDate: eventDateIso, location });
        setEntityId(created.id);
        toast({ title: "Event saved", variant: "success" });
      }
    } catch (err) {
      toast({ title: "Save failed", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleFinalSave() {
    if (!title.trim() || !description.trim() || !eventDate) {
      toast({ title: "Title, description and date are required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const eventDateIso = new Date(eventDate).toISOString();
      if (entityId) {
        await updateEvent(entityId, { title, description, eventDate: eventDateIso, location, status });
      } else {
        const created = await createEvent({ title, description, eventDate: eventDateIso, location, status });
        setEntityId(created.id);
      }
      toast({ title: status === "PUBLISHED" ? "Event published" : "Event saved", variant: "success" });
      navigate("/events", { replace: true });
    } catch (err) {
      toast({ title: "Save failed", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex items-center gap-2 text-sm text-navy-500">
          <Link to="/" className="hover:text-navy-700">Dashboard</Link>
          <span>/</span>
          <Link to="/events" className="hover:text-navy-700">Events</Link>
          <span>/</span>
          <span className="font-medium text-navy-700">{isNew ? "New event" : "Edit event"}</span>
        </nav>

        <div className="flex items-center gap-2">
          <div className="w-40">
            <Select value={status} onValueChange={(value) => setStatus(value as ContentStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleFinalSave} disabled={saving}>
            {saving && <Spinner className="text-white" />}
            Final save
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isNew ? "New event" : "Edit event"}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Annual Cultural Fest" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="eventDate">Date & time</Label>
              <Input
                id="eventDate"
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="College Auditorium"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Description</Label>
            <ReactQuill theme="snow" value={description} onChange={setDescription} modules={QUILL_MODULES} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => navigate("/events")}>
              Cancel
            </Button>
            <Button onClick={handleInitialSave} disabled={saving}>
              {saving && <Spinner className="text-white" />}
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Media</CardTitle>
        </CardHeader>
        <CardContent>
          <MediaManager entityType="EVENT" entityId={entityId} />
        </CardContent>
      </Card>
    </div>
  );
}
