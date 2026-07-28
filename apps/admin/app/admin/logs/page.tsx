import React from "react";
import { db } from "@mahatest/db";
import { Card } from "@/components/ui/card";
import { ScrollText } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export const revalidate = 0;

// Color-code log actions by domain for quick scanning.
function actionBadgeClass(action: string) {
  if (action.startsWith("user.")) {
    return "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  }
  if (action.startsWith("quiz.")) {
    return "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400";
  }
  if (action.startsWith("question.")) {
    return "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400";
  }
  if (action.startsWith("settings.")) {
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  }
  return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
}

export default async function AdminLogsPage() {
  let logs: any[] = [];
  try {
    logs = await db.adminLog.findMany({
      include: { admin: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  } catch (err) {
    console.error("Error loading admin logs:", err);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-primary" /> Admin Activity Logs
        </h2>
        <p className="text-xs text-muted-foreground">
          Audit trail of administrative actions — content changes, user management, and imports (latest 200).
        </p>
      </div>

      <Card>
        {logs.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No admin activity recorded yet. Actions like creating quizzes or blocking users will appear here.
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {logs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide shrink-0 ${actionBadgeClass(log.action)}`}>
                    {log.action}
                  </span>
                  <p className="text-foreground truncate">{log.details || "—"}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-foreground">{log.admin?.name || log.admin?.email}</p>
                  <p className="text-[10px] text-muted-foreground">{formatDateTime(log.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
