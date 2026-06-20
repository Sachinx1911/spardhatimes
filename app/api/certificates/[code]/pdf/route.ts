import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getSession } from "@/lib/session";

interface RouteParams {
  params: Promise<{ code: string }>;
}

// Serves a printable certificate of completion. We render styled HTML with an
// auto-print trigger so the browser's native "Save as PDF" produces the file —
// this avoids shipping a heavyweight server-side PDF dependency.
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { code } = await params;

  const certificate = await db.certificate.findUnique({
    where: { certificateCode: code },
    include: {
      user: { select: { id: true, name: true, email: true } },
      quiz: { select: { title: true, passingMarks: true, marks: true } },
    },
  });

  if (!certificate) {
    return new NextResponse("Certificate not found.", { status: 404 });
  }

  // Only the owner or an admin may download. Verification (read-only view) is
  // still possible by code, but the printable copy requires the owner session.
  const session = await getSession();
  const role = (session?.user as any)?.role;
  const isOwner = session?.user?.id === certificate.userId;
  const isAdmin = role === "ADMIN" || role === "SUPERADMIN";

  if (!isOwner && !isAdmin) {
    return new NextResponse("Unauthorized.", { status: 403 });
  }

  // Best score this user achieved on the quiz, for display on the certificate.
  const bestAttempt = await db.quizAttempt.findFirst({
    where: { userId: certificate.userId, quizId: certificate.quizId, status: "COMPLETED" },
    orderBy: { score: "desc" },
    select: { score: true, percentage: true },
  });

  const studentName = certificate.user.name || certificate.user.email;
  const issued = new Date(certificate.issueDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const scoreLine = bestAttempt
    ? `Score: ${bestAttempt.score} / ${certificate.quiz.marks} (${bestAttempt.percentage}%)`
    : "";

  const esc = (s: string) =>
    s.replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
    );

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Certificate - ${esc(certificate.quiz.title)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Georgia, "Times New Roman", serif;
      background: #f1f5f9;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; padding: 24px;
    }
    .certificate {
      width: 960px; max-width: 100%; background: #ffffff;
      border: 14px solid #2563EB; border-radius: 4px; padding: 56px 64px;
      position: relative; text-align: center;
      box-shadow: 0 20px 60px rgba(15, 23, 42, 0.18);
    }
    .certificate::after {
      content: ""; position: absolute; inset: 16px;
      border: 2px solid #cbd5e1; border-radius: 2px; pointer-events: none;
    }
    .brand { color: #2563EB; font-size: 14px; letter-spacing: 4px; text-transform: uppercase; font-weight: bold; }
    .title { font-size: 44px; color: #0F172A; margin: 18px 0 6px; letter-spacing: 1px; }
    .subtitle { color: #64748b; font-size: 15px; margin-bottom: 36px; }
    .awarded { color: #475569; font-size: 16px; }
    .name { font-size: 38px; color: #0F172A; margin: 10px 0 8px; border-bottom: 2px solid #e2e8f0; display: inline-block; padding: 0 24px 8px; }
    .course { color: #475569; font-size: 17px; margin: 24px auto 8px; max-width: 640px; line-height: 1.6; }
    .course strong { color: #2563EB; }
    .score { color: #10B981; font-weight: bold; font-size: 15px; margin-top: 4px; }
    .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 56px; }
    .footer .block { text-align: center; flex: 1; }
    .footer .line { border-top: 1.5px solid #94a3b8; margin: 0 12px 6px; padding-top: 6px; font-size: 13px; color: #334155; }
    .footer .label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
    .code { position: absolute; bottom: 22px; right: 32px; font-family: monospace; font-size: 11px; color: #94a3b8; }
    .seal {
      position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%);
      width: 84px; height: 84px; border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, #3b82f6, #1d4ed8);
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: bold; letter-spacing: 1px; text-align: center;
      box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
    }
    .print-bar { position: fixed; top: 16px; right: 16px; }
    .print-bar button {
      font-family: system-ui, sans-serif; background: #2563EB; color: #fff;
      border: 0; padding: 10px 18px; border-radius: 8px; font-weight: 600;
      cursor: pointer; box-shadow: 0 4px 12px rgba(37,99,235,.35);
    }
    @media print {
      body { background: #fff; padding: 0; }
      .certificate { box-shadow: none; border-width: 12px; }
      .print-bar { display: none !important; }
      @page { size: landscape; margin: 0; }
    }
  </style>
</head>
<body>
  <div class="print-bar"><button onclick="window.print()">Download / Print PDF</button></div>
  <div class="certificate">
    <div class="brand">QuizPlatform Pro</div>
    <h1 class="title">Certificate of Achievement</h1>
    <p class="subtitle">This certificate is proudly presented to</p>
    <p class="awarded">This is to certify that</p>
    <div class="name">${esc(studentName)}</div>
    <p class="course">
      has successfully completed and passed the examination
      <strong>${esc(certificate.quiz.title)}</strong>,
      demonstrating proficiency and meeting the required passing standard.
    </p>
    ${scoreLine ? `<p class="score">${esc(scoreLine)}</p>` : ""}
    <div class="footer">
      <div class="block"><div class="line">${esc(issued)}</div><div class="label">Date Issued</div></div>
      <div class="block"><div class="line">QuizPlatform Pro</div><div class="label">Authorized Platform</div></div>
    </div>
    <div class="seal">VERIFIED<br/>SEAL</div>
    <div class="code">Certificate ID: ${esc(certificate.certificateCode)}</div>
  </div>
  <script>
    // Auto-open the print dialog shortly after load for one-click PDF saving.
    window.addEventListener("load", function () { setTimeout(function () { window.print(); }, 400); });
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
