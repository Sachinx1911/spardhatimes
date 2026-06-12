"use client";

import React, { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./ThemeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Register the PWA service worker only in production. In development it
    // caches stale CSS/JS across HMR rebuilds, which breaks theming and shows
    // outdated pages — so actively unregister any leftover worker instead.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.unregister());
      });
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
      }
      return;
    }

    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("Service Worker registered successfully:", reg.scope))
        .catch((err) => console.warn("Service Worker registration failed:", err));
    });
  }, []);

  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
