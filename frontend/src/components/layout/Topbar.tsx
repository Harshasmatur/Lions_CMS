import { useAuthStore } from "@/lib/auth";

export function Topbar({ title }: { title: string }) {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur-sm sm:px-5 lg:px-6">
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-lg font-semibold text-slate-900 sm:text-xl">{title}</h1>
      </div>

      {user && (
        <div className="ml-4 flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-900">{user.name}</p>
            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{user.role}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0d2343] text-sm font-semibold text-white ring-2 ring-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
    </header>
  );
}
