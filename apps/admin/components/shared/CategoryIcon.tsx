import React from "react";
import {
  Brain,
  Globe,
  BookOpen,
  Map,
  Atom,
  Percent,
  GitBranch,
  PenTool,
  Languages,
  Laptop,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<any>> = {
  Brain,
  Globe,
  BookOpen,
  Map,
  Atom,
  Percent,
  GitBranch,
  PenTool,
  Languages,
  Laptop,
};

/**
 * Renders a category icon: an uploaded image when the icon value is a URL
 * (starts with "/" or "http"), otherwise the matching lucide icon by name.
 */
export function CategoryIcon({ icon, className = "h-6 w-6" }: { icon: string | null; className?: string }) {
  const value = icon || "Brain";
  if (value.startsWith("/") || value.startsWith("http")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={value} alt="" className={`${className} rounded object-cover`} />;
  }
  const LucideIcon = iconMap[value] || Brain;
  return <LucideIcon className={className} />;
}
