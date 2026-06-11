import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Deterministic date formatting with a pinned locale. Client components that
// render dates during SSR must not use bare toLocaleDateString(): the Node
// server locale and the browser locale can differ, causing hydration errors.
export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date) {
  const d = new Date(date);
  return `${formatDate(d)} ${d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}`;
}
