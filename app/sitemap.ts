import { MetadataRoute } from "next";
import db from "@/lib/db";

export const revalidate = 3600; // Cache sitemap for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "https://quizplatform.com";

  // Static routes
  const routes = [
    "",
    "/categories",
    "/quizzes",
    "/leaderboard",
    "/login",
    "/register",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Dynamic Quizzes
  let quizUrls: any[] = [];
  try {
    const quizzes = await db.quiz.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true }
    });
    quizUrls = quizzes.map((q) => ({
      url: `${baseUrl}/quiz/${q.slug}/attempt`,
      lastModified: q.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (err) {
    console.error("Error generating sitemap quizzes:", err);
  }

  // Dynamic Categories
  let categoryUrls: any[] = [];
  try {
    const categories = await db.category.findMany({
      select: { slug: true, updatedAt: true }
    });
    categoryUrls = categories.map((c) => ({
      url: `${baseUrl}/quizzes?category=${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (err) {
    console.error("Error generating sitemap categories:", err);
  }

  return [...routes, ...quizUrls, ...categoryUrls];
}
