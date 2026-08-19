// Centralized site URL helper.
// Uses NEXT_PUBLIC_SITE_URL when configured; otherwise falls back to the
// production domain. This is safe for use in server components and email
// templates because the value is a public-facing origin, not a secret.
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://axionmarketplace.com";
}
