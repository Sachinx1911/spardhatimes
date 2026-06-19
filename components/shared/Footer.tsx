import React from "react";

// Minimal footer — no navigation links. The platform is login-gated and
// distraction-free; students only ever see their dashboard and tests.
export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-base shadow-lg shadow-primary/20">
              Q
            </span>
            <span className="font-extrabold text-lg tracking-tight text-white">
              Quiz<span className="text-primary">Platform</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 text-center">
            &copy; {new Date().getFullYear()} QuizPlatform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
