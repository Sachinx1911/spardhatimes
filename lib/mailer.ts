// Minimal email sender. Uses the Resend HTTP API when RESEND_API_KEY is set
// (no SDK needed); otherwise falls back to logging the message server-side so
// the flow remains fully testable in development without an email provider.

interface SendMailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: SendMailInput): Promise<{ sent: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "QuizPlatform <onboarding@resend.dev>";

  if (!apiKey) {
    console.log(`[mailer] RESEND_API_KEY not set — email to ${to} not sent.\nSubject: ${subject}\n${html}`);
    return { sent: false };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) {
      console.error("[mailer] Resend API error:", res.status, await res.text());
      return { sent: false };
    }
    return { sent: true };
  } catch (err) {
    console.error("[mailer] Failed to send email:", err);
    return { sent: false };
  }
}
