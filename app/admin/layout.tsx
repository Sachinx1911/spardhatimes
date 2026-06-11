import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { 
  ShieldCheck, 
  BarChart3, 
  Layers, 
  FileText, 
  Users, 
  FileSpreadsheet, 
  Home 
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // 1. Enforce Admin Session
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "SUPERADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-100 dark:bg-slate-950">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-lg shadow max-w-md text-center border border-border">
          <div className="text-danger text-4xl mb-4 font-bold">⚠️</div>
          <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
          <p className="text-sm text-muted-foreground mt-2">
            You do not have the administration privileges required to view this panel.
          </p>
          <Link href="/" className="inline-block mt-6">
            <span className="px-4 py-2 bg-primary text-white rounded font-semibold text-sm hover:bg-primary/90">
              Return Home
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-border shrink-0 md:sticky md:top-16 md:h-[calc(100vh-64px)] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="h-5 w-5" />
            <span className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white">Admin Panel</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Manage content, users, and imports</p>
        </div>

        <nav className="px-4 pb-6 space-y-1">
          <Link 
            href="/admin/dashboard" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <BarChart3 className="h-4 w-4 text-primary" /> Dashboard Stats
          </Link>
          <Link 
            href="/admin/categories" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Layers className="h-4 w-4 text-primary" /> Categories
          </Link>
          <Link 
            href="/admin/quizzes" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <FileText className="h-4 w-4 text-primary" /> Quizzes & Tests
          </Link>
          <Link 
            href="/admin/users" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Users className="h-4 w-4 text-primary" /> User Directory
          </Link>
          <Link 
            href="/admin/questions/import" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-primary" /> Excel Import
          </Link>
          <div className="h-px bg-border/40 my-4" />
          <Link 
            href="/" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Home className="h-4 w-4" /> Public Website
          </Link>
        </nav>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
