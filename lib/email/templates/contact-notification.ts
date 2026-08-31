import type { EmailMessage } from "../types";
import { getSiteUrl } from "@/lib/site";
import { readEnv } from "@/lib/env";

export function contactNotificationEmail(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): EmailMessage {
  const siteUrl = getSiteUrl();
  const to = readEnv("EMAIL_FROM_ADDRESS");

  if (!to) {
    throw new Error("EMAIL_FROM_ADDRESS is not configured.");
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>New contact submission — ${escapeHtml(input.subject)}</title>
    </head>
    <body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#ffffff;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td align="center" style="padding:40px 16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;max-width:560px;width:100%;">
              <tr>
                <td style="padding:32px;border-radius:24px;background-color:#111111;border:1px solid #2a2a2a;">
                  <p style="margin:0 0 8px 0;font-size:14px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#3b82f6;">AXION Marketplace</p>
                  <h1 style="margin:16px 0 12px 0;font-size:24px;font-weight:600;color:#ffffff;line-height:1.2;">New contact submission</h1>
                  <p style="margin:0 0 24px 0;font-size:15px;color:#a1a1aa;line-height:1.6;">You received a new message from the contact form.</p>

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 24px 0;">
                    <tr>
                      <td style="padding:16px;border-radius:12px;background-color:#0a0a0a;border:1px solid #2a2a2a;">
                        <p style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.16em;color:#a1a1aa;">From</p>
                        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#ffffff;">${escapeHtml(input.name)} &lt;${escapeHtml(input.email)}&gt;</p>
                        <p style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.16em;color:#a1a1aa;">Subject</p>
                        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#ffffff;">${escapeHtml(input.subject)}</p>
                        <p style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.16em;color:#a1a1aa;">Message</p>
                        <p style="margin:0;font-size:14px;color:#e4e4e7;line-height:1.6;white-space:pre-wrap;">${escapeHtml(input.message)}</p>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0;font-size:12px;color:#71717a;line-height:1.6;">
                    This message was submitted through the contact form at ${siteUrl}.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
New contact submission — ${input.subject}

From: ${input.name} <${input.email}>
Subject: ${input.subject}

Message:
${input.message}

---
Submitted at: ${siteUrl}/contact
  `.trim();

  return {
    to,
    subject: `New contact submission: ${input.subject}`,
    html,
    text,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
