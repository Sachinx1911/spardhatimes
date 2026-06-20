import { Loader2 } from "lucide-react";

// Shown automatically by the App Router during any navigation/data-fetch that
// suspends, so clicking a link/button always gives instant "loading" feedback.
export default function Loading() {
  return (
    <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-950">
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
      <p className="text-sm font-semibold text-muted-foreground">Loading…</p>
    </div>
  );
}
