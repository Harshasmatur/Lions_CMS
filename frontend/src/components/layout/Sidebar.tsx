import { NavLink } from "react-router-dom";
import { Newspaper, CalendarDays, LayoutDashboard, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/news", label: "News", icon: Newspaper },
  { to: "/events", label: "Events", icon: CalendarDays },
];

export function Sidebar() {
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-[#0d2343] text-white shadow-lg shadow-slate-900/20">
      <div className="flex items-center justify-center border-b border-white/10 bg-[#0a1c38] px-4 py-4">
        <img
          src="/lions-pu-college-logo.svg"
          alt="Lions PU College"
          className="h-10 w-auto max-w-[210px] object-contain"
        />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-100 transition-colors duration-200 hover:bg-white/10",
                  isActive && "bg-[#f4b63f] text-[#0f2343] shadow-sm hover:bg-[#f4b63f]"
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="border-t border-white/10 bg-[#0d2343] p-3">
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
