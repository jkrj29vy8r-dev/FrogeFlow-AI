import { getResend, FROM_EMAIL } from "./client";

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  try {
    const resend = getResend();
    const displayName = name || to.split("@")[0];
    await resend.emails.send({
      from: FROM_EMAIL(),
      to,
      subject: "Welcome to BookForge AI 🎉",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Welcome to BookForge AI</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
      <tr>
        <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">BookForge AI</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">AI-powered digital product creation</p>
        </td>
      </tr>
      <tr>
        <td style="padding:40px;">
          <h2 style="margin:0 0 16px;color:#1e293b;font-size:22px;font-weight:700;">Welcome, ${displayName}! 👋</h2>
          <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6;">
            Your account is ready. You can now create professional eBooks, guides, cover designs, landing pages, and complete digital business packages — all powered by AI.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
            <tr>
              <td style="background:#f1f5f9;border-radius:12px;padding:20px;">
                <p style="margin:0 0 12px;color:#1e293b;font-weight:700;font-size:14px;">Get started in 3 steps:</p>
                <p style="margin:0 0 8px;color:#475569;font-size:14px;">① Go to your <strong>Dashboard</strong></p>
                <p style="margin:0 0 8px;color:#475569;font-size:14px;">② Click <strong>Generate Business</strong> for a full digital product suite</p>
                <p style="margin:0;color:#475569;font-size:14px;">③ Export to PDF or share your landing page</p>
              </td>
            </tr>
          </table>
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:#6366f1;border-radius:10px;padding:14px 28px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;">Open Dashboard →</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 40px 40px;border-top:1px solid #f1f5f9;">
          <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
            If you have questions, reply to this email or visit <a href="${process.env.NEXT_PUBLIC_APP_URL}/contact" style="color:#6366f1;text-decoration:none;">our contact page</a>.<br/>
            © ${new Date().getFullYear()} BookForge AI · <a href="${process.env.NEXT_PUBLIC_APP_URL}/privacy" style="color:#94a3b8;">Privacy</a> · <a href="${process.env.NEXT_PUBLIC_APP_URL}/terms" style="color:#94a3b8;">Terms</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    });
  } catch {
    // Never block auth flow on email failure
  }
}
