import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/session";

interface RouteParams {
  params: Promise<{ quizId: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN" && role !== "SUPERADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { quizId } = await params;

  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    select: {
      title: true,
      description: true,
      marks: true,
      _count: { select: { questions: true } },
    },
  });

  if (!quiz) {
    return new NextResponse("Quiz not found", { status: 404 });
  }

  const attempts = await db.quizAttempt.findMany({
    where: { quizId, status: "COMPLETED", userId: { not: null } },
    select: {
      score: true,
      percentage: true,
      user: { select: { name: true, email: true } },
    },
    orderBy: { score: "desc" },
  });

  const rows = attempts.map((a, i) => ({
    rank: i + 1,
    name: a.user?.name || "Unknown",
    score: Math.round(a.score * 100) / 100,
    pct: Math.round(a.percentage * 100) / 100,
  }));

  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const rankCell = (r: number) => {
    if (r === 1)
      return `<td style="padding:10px 12px;font-size:18px;color:#BA7517;">&#9733;</td>`;
    if (r === 2)
      return `<td style="padding:10px 12px;font-size:18px;color:#888;">&#9733;</td>`;
    if (r === 3)
      return `<td style="padding:10px 12px;font-size:18px;color:#D85A30;">&#9733;</td>`;
    return `<td style="padding:10px 12px;font-size:13px;font-weight:600;color:#666;">${r}</td>`;
  };

  const pctBadge = (p: number) => {
    const bg = p >= 80 ? "#dcfce7" : p >= 50 ? "#fef9c3" : "#fee2e2";
    const color = p >= 80 ? "#166534" : p >= 50 ? "#854d0e" : "#991b1b";
    return `<span style="display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;background:${bg};color:${color};">${p}%</span>`;
  };

  const tableRows = rows
    .map(
      (r) => `
    <tr style="border-bottom:1px solid #e5e7eb;${r.rank <= 3 ? "background:#fffbeb;" : ""}">
      ${rankCell(r.rank)}
      <td style="padding:10px 12px;font-size:13px;font-weight:500;">${r.name}</td>
      <td style="padding:10px 12px;font-size:13px;font-weight:600;text-align:center;">${r.score}</td>
      <td style="padding:10px 12px;text-align:center;">${pctBadge(r.pct)}</td>
    </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>${quiz.title} - Report</title>
<style>
  @page { size: A4; margin: 20mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; background: #fff; padding: 40px; }
  .header { text-align: center; padding-bottom: 16px; border-bottom: 3px solid #2563eb; margin-bottom: 24px; }
  .brand { font-size: 22px; font-weight: 700; color: #2563eb; }
  .subtitle { font-size: 12px; color: #94a3b8; margin-top: 4px; }
  .test-name { font-size: 20px; font-weight: 700; margin-bottom: 6px; }
  .test-desc { font-size: 13px; color: #64748b; line-height: 1.6; margin-bottom: 16px; }
  .info-grid { display: flex; gap: 16px; margin-bottom: 24px; }
  .info-box { flex: 1; background: #f8fafc; border-radius: 8px; padding: 12px 16px; }
  .info-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 600; }
  .info-value { font-size: 22px; font-weight: 700; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
  thead tr { background: #f8fafc; border-bottom: 1px solid #e5e7eb; }
  th { padding: 10px 12px; font-size: 11px; color: #94a3b8; font-weight: 600; text-align: left; text-transform: uppercase; }
  th:nth-child(3), th:nth-child(4) { text-align: center; }
  .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; }
  .print-bar { position: fixed; top: 0; left: 0; right: 0; background: #f1f5f9; padding: 12px 24px; display: flex; justify-content: center; gap: 12px; z-index: 100; border-bottom: 1px solid #e2e8f0; }
  .print-bar button { padding: 8px 20px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid #cbd5e1; background: #fff; }
  .print-bar button.primary { background: #2563eb; color: #fff; border-color: #2563eb; }
  @media print { .print-bar { display: none !important; } body { padding: 0; } }
</style>
</head>
<body>
  <div class="print-bar">
    <button class="primary" onclick="window.print()">Save as PDF / Print</button>
    <button onclick="window.close()">Close</button>
  </div>

  <div style="margin-top:60px;">
    <div class="header">
      <div class="brand">Spardha Times</div>
      <div class="subtitle">Test performance report</div>
    </div>

    <div class="test-name">${quiz.title}</div>
    ${quiz.description ? `<div class="test-desc">${quiz.description}</div>` : ""}

    <div class="info-grid">
      <div class="info-box">
        <div class="info-label">Total questions</div>
        <div class="info-value">${quiz._count.questions}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Total marks</div>
        <div class="info-value">${quiz.marks}</div>
      </div>
    </div>

    ${
      rows.length === 0
        ? '<p style="text-align:center;color:#94a3b8;padding:24px;">No attempts yet.</p>'
        : `<table>
      <thead><tr>
        <th style="width:40px;">#</th>
        <th>Student name</th>
        <th style="text-align:center;">Score</th>
        <th style="text-align:center;">%</th>
      </tr></thead>
      <tbody>${tableRows}</tbody>
    </table>`
    }

    <div class="footer">
      <span>Generated on ${today}</span>
      <span>spardhatimes.com</span>
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
