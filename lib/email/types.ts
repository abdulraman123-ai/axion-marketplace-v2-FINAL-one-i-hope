// Minimal email provider abstraction.
// Implementations live in lib/email/provider.ts; this file only defines
// the contract so the rest of the app never couples to a specific vendor.

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailProvider {
  sendEmail(message: EmailMessage): Promise<void>;
}
