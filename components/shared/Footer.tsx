import React from "react";
import Link from "next/link";
import { Laptop } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-base shadow-lg shadow-primary/20">
                Q
              </span>
              <span className="font-extrabold text-lg tracking-tight text-white">
                Quiz<span className="text-primary">Platform</span>
              </span>
            </div>
            <p className="text-sm text-slate-400">
              A premium, high-performance mock testing and quiz platform for educational institutions, coaching classes, and competitive exam preparation.
            </p>
          </div>

          {/* Links: Platform */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/quizzes" className="hover:text-primary transition-colors">
                  Explore Tests
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-primary transition-colors">
                  All Categories
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-primary transition-colors">
                  Global Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Links: Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="hover:text-primary transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Links: Account */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="hover:text-primary transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-primary transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  My Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} QuizPlatform. All rights reserved. Made for competitive excellence.
          </p>
          <div className="flex space-x-6 text-xs text-slate-500">
            <span>Powered by Next.js & Prisma</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
