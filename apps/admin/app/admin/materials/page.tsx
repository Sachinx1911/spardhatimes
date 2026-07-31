import React from "react";
import { db } from "@mahatest/db";
import { MaterialManager } from "@/components/admin/MaterialManager";

export const revalidate = 0; // Dynamic administration CRUD

export default async function AdminMaterialsPage() {
  let materials: any[] = [];
  let subjects: any[] = [];
  let exams: any[] = [];
  try {
    [materials, subjects, exams] = await Promise.all([
      db.studyMaterial.findMany({
        orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          url: true,
          thumbnailUrl: true,
          subjectId: true,
          examId: true,
          durationSeconds: true,
          pageCount: true,
          orderIndex: true,
          published: true,
        },
      }),
      db.subject.findMany({
        orderBy: [{ orderIndex: "asc" }, { name: "asc" }],
        select: { id: true, name: true },
      }),
      db.exam.findMany({ orderBy: { orderIndex: "asc" }, select: { id: true, name: true } }),
    ]);
  } catch (err) {
    console.error("Error fetching study material for admin:", err);
  }

  return (
    <MaterialManager
      initialMaterials={materials as any}
      subjects={subjects as any}
      exams={exams as any}
    />
  );
}
