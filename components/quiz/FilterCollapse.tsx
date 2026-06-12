"use client";

import React, { useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

/**
 * Wraps the quiz-listing filter panel. On mobile the panel is collapsed by
 * default and the header toggles it; on desktop (lg+) it is always expanded
 * and the header is just a label.
 */
export function FilterCollapse({
  activeCount,
  children,
}: {
  activeCount: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center gap-2 border-b border-border/40 pb-3 mb-0 lg:mb-4 cursor-pointer lg:pointer-events-none"
        aria-expanded={open}
      >
        <SlidersHorizontal className="h-4 w-4 text-primary" />
        <span className="font-bold text-sm text-foreground uppercase tracking-wider">Filter Options</span>
        {activeCount > 0 && (
          <span className="h-5 min-w-5 px-1.5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
            {activeCount}
          </span>
        )}
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground ml-auto transition-transform lg:hidden ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div className={`${open ? "block" : "hidden"} lg:block pt-4 lg:pt-0`}>
        {children}
      </div>
    </div>
  );
}
