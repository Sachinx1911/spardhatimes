import React from "react";

// Minimal footer — no navigation links. The platform is login-gated and
// distraction-free; students only ever see their dashboard and tests.
export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-5 w-5 rounded bg-primary flex items-center justify-center text-white font-bold text-[10px]">
              S
            </span>
            <span className="font-bold text-xs tracking-tight text-white">
              Spardha<span className="text-primary">Times</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-500">
            &copy; {new Date().getFullYear()} Spardha Times
          </p>
        </div>
      </div>
    </footer>
  );
}
