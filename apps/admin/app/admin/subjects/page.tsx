import React from "react";
import { db } from "@mahatest/db";
import { SubjectManager } from "@/components/admin/SubjectManager";

export const revalidate = 0; // Dynamic administration CRUD

export default async function AdminSubjectsPage() {
  let subjects: any[] = [];
  try {
    const rows = await db.subject.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        orderIndex: true,
        _count: { select: { questions: true } },
      },
      // प्रश्नांच्या संख्येने उतरत्या क्रमाने — एक-दोन प्रश्नांचे तुकडे तळाशी
      // दिसतात, आणि तेच बहुतेक वेळा एकत्र करायचे असतात.
      orderBy: [{ orderIndex: "asc" }, { name: "asc" }],
    });
    subjects = rows.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      orderIndex: s.orderIndex,
      questionCount: s._count.questions,
    }));
  } catch (err) {
    console.error("Error fetching subjects for admin:", err);
  }

  return <SubjectManager initialSubjects={subjects as any} />;
}
