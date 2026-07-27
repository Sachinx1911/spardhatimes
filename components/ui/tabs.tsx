"use client";

import React, { createContext, useContext, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

interface TabsContextProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextProps | undefined>(undefined);

// --- URL hash as the source of truth (opt-in via syncWithHash) -------------
// The hash is used rather than a ?query= param on purpose: switching tabs must
// not re-run the page's server render. The dashboard fetches every tab's data
// up front, and the database is ~170ms away, so a round trip per tab would
// turn an instant switch into a visible wait on mobile.
function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function readHash() {
  return window.location.hash.replace(/^#/, "");
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  syncWithHash = false,
  children,
  className,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  /**
   * Mirror the active tab in the URL hash, so links elsewhere (the navbar
   * menu) can open a specific tab, a reload keeps it, and the browser — or the
   * Android hardware back button — steps back through tabs.
   */
  syncWithHash?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [localTab, setLocalTab] = useState(defaultValue || "");

  // useSyncExternalStore rather than an effect: the hash lives outside React,
  // and this keeps the first client render correct without a setState-in-effect.
  // The server snapshot is "" since there is no hash server-side.
  const hashTab = useSyncExternalStore(
    subscribeToHash,
    readHash,
    () => ""
  );

  const activeTab =
    value !== undefined
      ? value
      : syncWithHash && hashTab
        ? hashTab
        : localTab;

  const setActiveTab = (newTab: string) => {
    if (value === undefined) {
      setLocalTab(newTab);
      // Pushes a history entry, so Back returns to the previous tab.
      if (syncWithHash && typeof window !== "undefined") {
        window.location.hash = newTab;
      }
    }
    if (onValueChange) {
      onValueChange(newTab);
    }
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 dark:bg-slate-800 text-muted-foreground",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used inside Tabs");

  const isActive = context.activeTab === value;

  return (
    <button
      type="button"
      onClick={() => context.setActiveTab(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
        isActive
          ? "bg-white dark:bg-slate-900 text-foreground shadow-sm font-semibold"
          : "hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used inside Tabs");

  if (context.activeTab !== value) return null;

  return (
    <div className={cn("mt-4 focus-visible:outline-none", className)}>
      {children}
    </div>
  );
}
