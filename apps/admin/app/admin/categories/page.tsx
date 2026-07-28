import React from "react";
import { db } from "@mahatest/db";
import { CategoryManager } from "@/components/admin/CategoryManager";

export const revalidate = 0; // Dynamic administration CRUD

export default async function AdminCategoriesPage() {
  let categories: any[] = [];
  try {
    categories = await db.category.findMany({
      orderBy: { name: "asc" }
    });
  } catch (err) {
    console.error("Error fetching categories for admin:", err);
  }

  return <CategoryManager initialCategories={categories as any} />;
}
