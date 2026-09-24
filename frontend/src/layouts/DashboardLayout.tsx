import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/news": "News",
  "/events": "Events",
};

function resolveTitle(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith("/news")) return "News";
  if (pathname.startsWith("/events")) return "Events";
  return "Lions CMS";
}

export function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar title={resolveTitle(location.pathname)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
