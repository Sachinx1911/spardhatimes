import React from "react";
import { db } from "@mahatest/db";
import { BannerManager } from "@/components/admin/BannerManager";

export const revalidate = 0; // Dynamic administration CRUD

export default async function AdminBannersPage() {
  let banners: any[] = [];
  try {
    const rows = await db.banner.findMany({
      orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
    });
    // Dates ISO म्हणून पाठवतो — client component ला Date object देता येत नाही.
    banners = rows.map((b) => ({
      ...b,
      startsAt: b.startsAt?.toISOString() ?? null,
      endsAt: b.endsAt?.toISOString() ?? null,
    }));
  } catch (err) {
    console.error("Error fetching banners for admin:", err);
  }

  return <BannerManager initialBanners={banners as any} />;
}
