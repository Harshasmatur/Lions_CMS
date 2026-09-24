import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { getErrorMessage } from "@/lib/api";
import { fetchNewsList, deleteNews, changeNewsStatus } from "../services/newsService";
import { NewsItem, ContentStatus } from "../types/news.types";

export default function NewsListPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ContentStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  async function load() {
    setLoading(true);
    try {
      const { items, meta } = await fetchNewsList({
        page,
        pageSize: 10,
        search: search || undefined,
        status: status === "ALL" ? undefined : status,
      });
      setItems(items);
      setTotalPages(meta.totalPages);
    } catch (err) {
      toast({ title: "Failed to load news", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  async function handleDelete(id: number) {
    if (!confirm("Delete this news article? This can be reversed only by an administrator.")) return;
    try {
      await deleteNews(id);
      toast({ title: "News article deleted", variant: "success" });
      load();
    } catch (err) {
      toast({ title: "Delete failed", description: getErrorMessage(err), variant: "destructive" });
    }
  }

  async function handleStatusChange(id: number, next: ContentStatus) {
    try {
      await changeNewsStatus(id, next);
      toast({ title: `Marked as ${next}`, variant: "success" });
      load();
    } catch (err) {
      toast({ title: "Status update failed", description: getErrorMessage(err), variant: "destructive" });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <nav className="flex items-center gap-2 text-sm text-navy-500">
        <Link to="/" className="hover:text-navy-700">Dashboard</Link>
        <span>/</span>
        <span className="font-medium text-navy-700">News</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 min-w-[260px] items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
            <Input
              placeholder="Search news..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
            />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as ContentStatus | "ALL")}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Link to="/news/new">
          <Button>
            <Plus className="h-4 w-4" /> New article
          </Button>
        </Link>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center p-10">
            <Spinner />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-navy-900">{item.title}</TableCell>
                  <TableCell>
                    <Select value={item.status} onValueChange={(v) => handleStatusChange(item.id, v as ContentStatus)}>
                      <SelectTrigger className="h-8 w-32 border-none bg-transparent p-0">
                        <SelectValue asChild>
                          <StatusBadge status={item.status} />
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-navy-600">
                    {item.publishedAt ? formatDate(item.publishedAt) : "—"}
                  </TableCell>
                  <TableCell className="text-navy-600">{formatDate(item.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link to={`/news/${item.id}`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-navy-400 py-10">
                    No news articles found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="flex items-center px-2 text-sm text-navy-500">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
