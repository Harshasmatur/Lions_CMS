import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/api";
import { MediaManager } from "@/components/common/MediaManager";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { fetchNewsById, createNews, updateNews } from "../services/newsService";
import type { ContentStatus } from "../types/news.types";

const QUILL_MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "link"],
    ["clean"],
  ],
};

export default function NewsEditorPage() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<ContentStatus>("DRAFT");
  const [entityId, setEntityId] = useState<number | null>(isNew ? null : Number(id));
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    fetchNewsById(Number(id))
      .then((news) => {
        setTitle(news.title);
        setSummary(news.summary ?? "");
        setContent(news.content);
        setStatus(news.status);
      })
      .catch((err) => toast({ title: "Failed to load article", description: getErrorMessage(err), variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  async function handleInitialSave() {
    if (!title.trim() || !content.trim()) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      if (entityId) {
        await updateNews(entityId, { title, summary, content });
        toast({ title: "Article saved", variant: "success" });
      } else {
        const created = await createNews({ title, summary, content });
        setEntityId(created.id);
        toast({ title: "Article saved", variant: "success" });
      }
    } catch (err) {
      toast({ title: "Save failed", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleFinalSave() {
    if (!title.trim() || !content.trim()) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      if (entityId) {
        await updateNews(entityId, { title, summary, content, status });
      } else {
        const created = await createNews({ title, summary, content, status });
        setEntityId(created.id);
      }
      toast({ title: status === "PUBLISHED" ? "Article published" : "Article saved", variant: "success" });
      navigate("/news", { replace: true });
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
          <Link to="/news" className="hover:text-navy-700">News</Link>
          <span>/</span>
          <span className="font-medium text-navy-700">{isNew ? "New article" : "Edit article"}</span>
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
          <CardTitle>{isNew ? "New news article" : "Edit news article"}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Annual Sports Meet 2026" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="summary">Summary (optional)</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="A short description shown in listing pages"
              rows={2}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Content</Label>
            <ReactQuill theme="snow" value={content} onChange={setContent} modules={QUILL_MODULES} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => navigate("/news")}>
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
          <MediaManager entityType="NEWS" entityId={entityId} />
        </CardContent>
      </Card>
    </div>
  );
}
