import { readEnv } from "@/lib/env";
import type { EmailProvider } from "./types";

// Server-only: never import into client components.
// Email credentials are intentionally server-only and must NOT use the
// NEXT_PUBLIC_ prefix.

const EMAIL_API_KEY = readEnv("EMAIL_API_KEY");
const EMAIL_FROM_ADDRESS = readEnv("EMAIL_FROM_ADDRESS");
const EMAIL_FROM_NAME = readEnv("EMAIL_FROM_NAME");

export function createEmailProvider(): EmailProvider {
  // If the required environment variables are not configured, return a
  // no-op provider so the rest of the app can call sendEmail safely
  // without guarding every call site.
  if (!EMAIL_API_KEY || !EMAIL_FROM_ADDRESS) {
    return {
      sendEmail: async () => {
        // Silently skip — email delivery requires configuration.
        // The caller should not treat this as a fatal error.
      },
    };
  }

  // When a provider is configured, replace this with the actual vendor
  // implementation (Resend, SendGrid, Postmark, etc.). The rest of the
  // application only depends on the EmailProvider interface, not the
  // specific vendor.
  return {
    sendEmail: async () => {
      // TODO: replace with actual email provider implementation once
      // EMAIL_API_KEY and EMAIL_FROM_ADDRESS are configured.
    },
  };
}

// Singleton provider used by server-side code (webhook route, admin
// actions, etc.). Import this — do not create new providers per call.
export const emailProvider: EmailProvider = createEmailProvider();
