"use client";

import React, { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./ThemeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("Service Worker registered successfully:", reg.scope))
          .catch((err) => console.warn("Service Worker registration failed:", err));
      });
    }
  }, []);

  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
