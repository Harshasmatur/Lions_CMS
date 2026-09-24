import { create } from "zustand";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Toast {
  id: number;
  title: string;
  description?: string;
  variant?: "default" | "success" | "destructive";
}

interface ToastState {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
}

let counter = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) =>
    set((state) => {
      const id = ++counter;
      setTimeout(() => {
        useToastStore.getState().dismiss(id);
      }, 4000);
      return { toasts: [...state.toasts, { ...toast, id }] };
    }),
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function toast(input: Omit<Toast, "id">) {
  useToastStore.getState().push(input);
}

export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-start gap-2 rounded-lg border bg-white p-4 shadow-lg",
            t.variant === "success" && "border-emerald-200",
            t.variant === "destructive" && "border-red-200"
          )}
        >
          {t.variant === "success" && <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />}
          {t.variant === "destructive" && <AlertCircle className="mt-0.5 h-4 w-4 text-red-600" />}
          <div className="flex-1">
            <p className="text-sm font-medium text-navy-900">{t.title}</p>
            {t.description && <p className="text-xs text-navy-600">{t.description}</p>}
          </div>
          <button onClick={() => dismiss(t.id)} className="text-navy-400 hover:text-navy-700">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
