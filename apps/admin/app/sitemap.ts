import { MetadataRoute } from "next";

export const revalidate = 3600; // Cache sitemap for 1 hour

// This is a closed, admin-assigned test-series platform. Only public,
// non-gated pages are listed; quiz/category/leaderboard browsing is disabled
// and student tests live behind login.
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXTAUTH_URL || "https://spardhatimes.com";

  return ["", "/login", "/faq", "/terms", "/privacy"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.6,
  }));
}
