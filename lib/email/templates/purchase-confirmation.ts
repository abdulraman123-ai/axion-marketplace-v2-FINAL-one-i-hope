import type { EmailMessage } from "../types";
import { getSiteUrl } from "@/lib/site";

interface PurchaseConfirmationInput {
  customerEmail: string;
  customerName?: string;
  productName: string;
  orderId: string;
  amountCents: number;
  currency: string;
  purchasedAt: string;
  downloadUrl?: string;
}

export function purchaseConfirmationEmail(
  input: PurchaseConfirmationInput
): EmailMessage {
  const siteUrl = getSiteUrl();
  const dashboardUrl = `${siteUrl}/dashboard`;
  const downloadsUrl = `${siteUrl}/dashboard/downloads`;

  const amount = (input.amountCents / 100).toFixed(2);
  const currency = input.currency.toUpperCase();
  const greeting = input.customerName
    ? `Hi ${input.customerName},`
    : "Hi there,";
  const date = new Date(input.purchasedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Purchase confirmed — ${escapeHtml(input.productName)}</title>
    </head>
    <body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#ffffff;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td align="center" style="padding:40px 16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;max-width:560px;width:100%;">
              <tr>
                <td style="padding:32px;border-radius:24px;background-color:#111111;border:1px solid #2a2a2a;">
                  <p style="margin:0 0 8px 0;font-size:14px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#3b82f6;">AXION Marketplace</p>
                  <h1 style="margin:16px 0 12px 0;font-size:24px;font-weight:600;color:#ffffff;line-height:1.2;">Purchase confirmed</h1>
                  <p style="margin:0 0 24px 0;font-size:15px;color:#a1a1aa;line-height:1.6;">${greeting}</p>

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 24px 0;">
                    <tr>
                      <td style="padding:16px;border-radius:12px;background-color:#0a0a0a;border:1px solid #2a2a2a;">
                        <p style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.16em;color:#a1a1aa;">Product</p>
                        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#ffffff;">${escapeHtml(input.productName)}</p>
                        <p style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.16em;color:#a1a1aa;">Order ID</p>
                        <p style="margin:0 0 12px 0;font-size:13px;color:#e4e4e7;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;">${escapeHtml(input.orderId)}</p>
                        <p style="margin:0 0 4px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.16em;color:#a1a1aa;">Amount</p>
                        <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#ffffff;">${currency} ${amount}</p>
                        <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:0.16em;color:#a1a1aa;">Purchased on ${date}</p>
                      </td>
                    </tr>
                  </table>

                  ${input.downloadUrl ? `
                  <p style="margin:0 0 8px 0;font-size:14px;color:#a1a1aa;line-height:1.6;">You can download your files anytime from your account:</p>
                  <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 24px 0;">
                    <tr>
                      <td style="border-radius:12px;background-color:#3b82f6;">
                        <a href="${escapeHtml(input.downloadUrl)}" style="display:inline-block;padding:12px 20px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">Download files</a>
                      </td>
                    </tr>
                  </table>
                  ` : `
                  <p style="margin:0 0 24px 0;font-size:14px;color:#a1a1aa;line-height:1.6;">You can access your purchases anytime from your dashboard.</p>
                  `}

                  <p style="margin:0 0 8px 0;font-size:14px;color:#a1a1aa;line-height:1.6;">Need help? Visit your dashboard for links to documentation and support.</p>

                  <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:24px;">
                    <tr>
                      <td style="border-radius:12px;background-color:#1a1a1a;border:1px solid #2a2a2a;">
                        <a href="${dashboardUrl}" style="display:inline-block;padding:12px 20px;font-size:14px;font-weight:600;color:#e4e4e7;text-decoration:none;">Go to dashboard</a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:24px 0 0 0;font-size:12px;color:#71717a;line-height:1.6;">
                    You received this email because you purchased ${escapeHtml(input.productName)} on ${date}.
                    If you have questions, reply to this email or visit our support page.
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
${greeting}

Thank you for your purchase!

Product: ${input.productName}
Order ID: ${input.orderId}
Amount: ${currency} ${amount}
Purchased on: ${date}

${input.downloadUrl ? `Download your files: ${input.downloadUrl}\n` : ""}Access your purchases anytime:
Dashboard: ${dashboardUrl}
Downloads: ${downloadsUrl}

If you have questions, visit your dashboard for support links.

— Axion Marketplace
  `.trim();

  return {
    to: input.customerEmail,
    subject: `Purchase confirmed: ${input.productName}`,
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
