"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "./ThemeContext";
import { Menu, X, Sun, Moon, LogIn, LogOut, User, LayoutDashboard, Shield, Award } from "lucide-react";
import { Button } from "../ui/button";
import { NotificationBell } from "./NotificationBell";

// Dev-mode auth bypass: when NEXT_PUBLIC_DEV_BYPASS_AUTH=true the navbar
// pretends an admin is signed in so protected links are reachable without
// the login module. Remove the flag from .env to restore real sessions.
const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true";

export function Navbar() {
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isLoggedIn = DEV_BYPASS || status === "authenticated";
  const user = (DEV_BYPASS && !session?.user)
    ? { name: "Dev Mode", role: process.env.NEXT_PUBLIC_DEV_BYPASS_ROLE === "STUDENT" ? "STUDENT" : "SUPERADMIN" }
    : (session?.user as any);
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

  // Logo / brand points straight at the right destination so there is no
  // intermediate "/" page load + redirect flash: signed-out -> login,
  // admin -> admin dashboard, student -> their dashboard.
  const homeHref = !isLoggedIn ? "/login" : isAdmin ? "/admin/dashboard" : "/dashboard";

  // Sign out without letting NextAuth compute the redirect URL. On hosts where
  // NEXTAUTH_URL is misconfigured (e.g. left as localhost) the server-built
  // redirect would send the user to localhost; doing the redirect ourselves
  // keeps them on the current domain regardless of env.
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href={homeHref} className="flex items-center space-x-2">
              <span className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg shadow-md shadow-primary/30">
                Q
              </span>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                Quiz<span className="text-primary">Platform</span>
              </span>
            </Link>
          </div>


          {/* Actions & Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {isLoggedIn ? (
              <div className="flex items-center space-x-3">
                <NotificationBell />
                {isAdmin ? (
                  <Link href="/admin/dashboard">
                    <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
                      <Shield className="h-4 w-4" /> Admin Panel
                    </Button>
                  </Link>
                ) : (
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                      <LayoutDashboard className="h-4 w-4" /> My Dashboard
                    </Button>
                  </Link>
                )}
                <div className="h-8 w-px bg-border/80" />
                <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                  <User className="h-4 w-4 text-primary" /> {user?.name || "User"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 text-danger hover:text-danger hover:bg-danger/5"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button size="sm" className="flex items-center gap-1.5 shadow-md">
                    <LogIn className="h-4 w-4" /> Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center md:hidden space-x-2">
            {isLoggedIn && <NotificationBell />}
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-white dark:bg-slate-900 px-4 py-4 space-y-3 shadow-lg animate-fade-in">
          <div>
            {isLoggedIn ? (
              <div className="space-y-2">
                <div className="px-3 py-1.5 text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <User className="h-4 w-4 text-primary" /> {user?.name || "User"}
                </div>
                {isAdmin ? (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium bg-slate-100 dark:bg-slate-800 text-foreground"
                  >
                    Admin Control Panel
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium bg-slate-100 dark:bg-slate-800 text-foreground"
                  >
                    My Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-danger hover:bg-danger/5"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="w-full">
                  <Button className="w-full flex items-center justify-center gap-1.5">
                    <LogIn className="h-4 w-4" /> Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
