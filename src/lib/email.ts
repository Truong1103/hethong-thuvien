type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

/** Gửi qua Resend (https://resend.com). Cần RESEND_API_KEY + RESEND_FROM (vd: Thư viện <onboarding@resend.dev>). */
export async function sendEmailResend(input: SendEmailInput): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    return { ok: false, error: "Thiếu RESEND_API_KEY hoặc RESEND_FROM" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    return { ok: false, error: t.slice(0, 200) };
  }
  return { ok: true };
}
