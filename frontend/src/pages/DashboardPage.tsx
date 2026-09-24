import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Newspaper, CalendarDays, FileEdit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fetchNewsList } from "@/features/news/services/newsService";
import { fetchEventsList } from "@/features/events/services/eventsService";

export default function DashboardPage() {
  const [counts, setCounts] = useState({ news: 0, events: 0, drafts: 0 });

  useEffect(() => {
    Promise.all([
      fetchNewsList({ page: 1, pageSize: 1 }),
      fetchEventsList({ page: 1, pageSize: 1 }),
      fetchNewsList({ page: 1, pageSize: 1, status: "DRAFT" }),
    ])
      .then(([news, events, drafts]) => {
        setCounts({ news: news.meta.total, events: events.meta.total, drafts: drafts.meta.total });
      })
      .catch(() => {
        /* dashboard stats are best-effort */
      });
  }, []);

  const cards = [
    { label: "Total news articles", value: counts.news, icon: Newspaper, to: "/news" },
    { label: "Total events", value: counts.events, icon: CalendarDays, to: "/events" },
    { label: "News drafts", value: counts.drafts, icon: FileEdit, to: "/news" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link to={c.to} key={c.label}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-50 text-navy-700">
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-navy-900">{c.value}</p>
                  <p className="text-sm text-navy-500">{c.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="p-6 text-sm text-navy-600">
          Welcome to the Lions PU College News & Events CMS. Use the sidebar to manage news articles
          and events. Published content becomes available to the public website automatically via
          the read-only public API.
        </CardContent>
      </Card>
    </div>
  );
}
