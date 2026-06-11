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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center space-x-2">
              <span className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg shadow-md shadow-primary/30">
                Q
              </span>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                Quiz<span className="text-primary">Platform</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/categories" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Categories
            </Link>
            <Link href="/quizzes" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Quizzes
            </Link>
            <Link href="/leaderboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Leaderboard
            </Link>
          </nav>

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
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-1.5 text-danger hover:text-danger hover:bg-danger/5"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
                    <LogIn className="h-4 w-4" /> Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="shadow-md">
                    Sign Up
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
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Home
          </Link>
          <Link
            href="/categories"
            onClick={() => setIsMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Categories
          </Link>
          <Link
            href="/quizzes"
            onClick={() => setIsMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Quizzes
          </Link>
          <Link
            href="/leaderboard"
            onClick={() => setIsMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Leaderboard
          </Link>

          <div className="border-t border-border/40 pt-4 mt-2">
            {isLoggedIn ? (
              <div className="space-y-2">
                <div className="px-3 py-1.5 text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <User className="h-4 w-4 text-primary" /> {user?.name || "User"} ({user?.role})
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
                    My Student Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    signOut({ callbackUrl: "/" });
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-danger hover:bg-danger/5"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="w-full">
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsMenuOpen(false)} className="w-full">
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
