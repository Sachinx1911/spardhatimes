import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://spardhatimes.com";
  
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/dashboard/",
        "/api/",
        "/quiz/*/attempt", // protect quiz taker screen from indexing
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
